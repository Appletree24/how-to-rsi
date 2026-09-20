"""Deterministic retrieval/context fault injection; no model, network, or dependencies.

Run: python projects/repoops/retrieval_failure_lab.py
Budget units are whitespace-separated fixture words, NOT model tokens.
"""

from dataclasses import dataclass
import json


@dataclass(frozen=True)
class Chunk:
    id: str
    kind: str
    revision: str
    readers: frozenset[str]
    text: str

    @property
    def cost(self):
        return len(self.text.split())


PUBLIC = frozenset({"operator", "security"})
INCIDENT = Chunk("incident@1", "incident", "v2", PUBLIC,
                 "checkout E_CONN_POOL runtime=v2 incident")
OLD = Chunk("runbook@1", "rule", "v1", PUBLIC,
            "checkout E_CONN_POOL action=rollback revision=v1")
CURRENT = Chunk("runbook@2", "rule", "v2", PUBLIC,
                "checkout E_CONN_POOL action=expand_pool revision=v2")
NOISE = Chunk("latency@1", "note", "v2", PUBLIC,
              "checkout latency investigate other")
PRIVATE = Chunk("restricted@1", "rule", "v2", frozenset({"security"}),
                "checkout E_CONN_POOL action=restricted_action PRIVATE_SENTINEL")
# A deliberately bad ranking fixture, not BM25, embedding, or reranker scores.
# The private hit would rank first if authorization were postponed until after k.
INDEX_ORDER = (PRIVATE, INCIDENT, OLD, CURRENT, NOISE)
GOLD = frozenset({INCIDENT.id, CURRENT.id})
BUDGET = 8


def retrieve(index, role, runtime, k, enforce_version=False):
    """The trusted retrieval boundary filters BEFORE top-k and any text export."""
    allowed = (chunk for chunk in index if role in chunk.readers)
    if enforce_version:
        allowed = (chunk for chunk in allowed
                   if chunk.kind != "rule" or chunk.revision == runtime)
    return tuple(allowed)[:k]


def pack(chunks, budget):
    """Keep whole evidence units in order; skip units that do not fit."""
    selected, dropped = [], []
    remaining = budget
    for chunk in chunks:
        if chunk.cost <= remaining:
            selected.append(chunk)
            remaining -= chunk.cost
        else:
            dropped.append(chunk.id)
    return tuple(selected), dropped


def rule_reader(context):
    """Intentionally version-blind first-rule reader, NOT an LLM simulator.

    It needs an incident and a rule. Keeping this consumer unchanged lets the
    experiment isolate upstream context changes, not claim model improvements.
    """
    incident = next((chunk for chunk in context if chunk.kind == "incident"), None)
    rule = next((chunk for chunk in context if chunk.kind == "rule"), None)
    if incident is None or rule is None:
        return {"action": "abstain", "citations": []}
    action = next(word.split("=", 1)[1] for word in rule.text.split()
                  if word.startswith("action="))
    return {"action": action, "citations": [incident.id, rule.id]}


def run_case(name, candidates, *, ranked=None, oracle_context=None):
    ranking = tuple(candidates if ranked is None else ranked)
    if {chunk.id for chunk in ranking} != {chunk.id for chunk in candidates}:
        raise ValueError("rank intervention must preserve the candidate pool")
    context, dropped = pack(ranking, BUDGET)
    if oracle_context is not None:
        # Deliberately bypass packing; leave candidates/ranking unchanged.
        context = tuple(oracle_context)
        dropped = [chunk.id for chunk in ranking if chunk not in context]
    candidate_ids = {chunk.id for chunk in candidates}
    context_ids = {chunk.id for chunk in context}
    answer = rule_reader(context)
    return {
        "case": name,
        "candidates": [chunk.id for chunk in candidates],
        "ranking": [chunk.id for chunk in ranking],
        "context": [chunk.id for chunk in context],
        "budget_dropped": dropped,
        "context_units": sum(chunk.cost for chunk in context),
        "candidate_recall": len(candidate_ids & GOLD) / len(GOLD),
        "context_coverage": len(context_ids & GOLD) / len(GOLD),
        "answer": answer,
        "answer_correct": answer["action"] == "expand_pool",
        "citations_complete": set(answer["citations"]) == GOLD,
    }


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def main():
    small = retrieve(INDEX_ORDER, "operator", "v2", 2)
    expanded = retrieve(INDEX_ORDER, "operator", "v2", 4)
    fixed = retrieve(INDEX_ORDER, "operator", "v2", 4, enforce_version=True)
    # Gold labels are used only by these diagnosis interventions and scoring.
    oracle_ranking = tuple(sorted(expanded, key=lambda chunk: chunk.id not in GOLD))
    cases = [
        run_case("small_k2", small),
        run_case("expanded_k4", expanded),
        run_case("rank_oracle", expanded, ranked=oracle_ranking),
        run_case("context_oracle", expanded, oracle_context=(INCIDENT, CURRENT)),
        run_case("version_filtered", fixed),
    ]
    before, after = cases[1], cases[-1]
    require(before["candidate_recall"] == 1 and before["context_coverage"] == 0.5,
            "fault must occur after recall, during budgeted context selection")
    require(before["answer"]["action"] == "rollback" and not before["answer_correct"],
            "the failure must be visible in the returned answer")
    for row in cases[2:]:
        require(row["answer_correct"] and row["citations_complete"],
                "oracle/fix must return the current action with both citations")
    for row in cases:
        require(row["context_units"] <= BUDGET, "context exceeded its budget")
    require(cases[0]["candidate_recall"] < before["candidate_recall"],
            "increasing k must improve recall in this fixture")

    # Authorization is an observable boundary: compare complete operator-visible
    # traces/answers with and without a higher-ranked inaccessible document.
    public_only = tuple(chunk for chunk in INDEX_ORDER if "operator" in chunk.readers)
    without_private = run_case("version_filtered", retrieve(
        public_only, "operator", "v2", 4, enforce_version=True))
    require(after == without_private, "private content changed an operator response")
    baseline_without_private = run_case("expanded_k4", retrieve(
        public_only, "operator", "v2", 4))
    require(before == baseline_without_private, "private hit consumed a top-k slot")
    serialized = json.dumps(cases)
    require(PRIVATE.id not in serialized and "PRIVATE_SENTINEL" not in serialized
            and "restricted_action" not in serialized,
            "unauthorized metadata or content crossed the output boundary")
    security_view = retrieve(INDEX_ORDER, "security", "v2", 1, enforce_version=True)
    require(security_view == (PRIVATE,), "fixture must distinguish authorized roles")
    revoked = retrieve(INDEX_ORDER, "revoked", "v2", 4, enforce_version=True)
    require(not revoked and rule_reader(revoked)["action"] == "abstain",
            "a revoked role must receive neither documents nor a derived answer")

    print(json.dumps({
        "experiment": "synthetic_retrieval_context_failure",
        "model_calls": 0,
        "query": {"service": "checkout", "error": "E_CONN_POOL",
                  "runtime": "v2", "role": "operator"},
        "budget": {"units": BUDGET, "unit": "whitespace_word_not_model_token"},
        "gold_evidence": sorted(GOLD),
        "cases": cases,
        "security_checks": {"private_document_observational_equivalence": True,
                            "authorized_role_can_read_private": True,
                            "revoked_role_abstains": True},
        "self_check": "passed",
        "limits": ["fixed synthetic candidate order", "deterministic rule reader",
                   "no ANN, reranker, tokenizer, cache, or LLM",
                   "no production security or quality claim"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
