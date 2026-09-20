import { DSH } from './data';

/* Offline teaching simulation. Independent of the other interaction components. */
function randomFromSeed(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface SimulationResult {
  development: number;
  confirmation: number;
}

function simulate(candidates: number, seed: number): SimulationResult {
  const rng = randomFromSeed(seed);
  let dev = 0;
  let fresh = 0;
  const experiments = 300;
  const tasks = 40;
  for (let e = 0; e < experiments; e++) {
    let best = 0;
    for (let c = 0; c < candidates; c++) {
      let wins = 0;
      for (let t = 0; t < tasks; t++) if (rng() < 0.5) wins++;
      best = Math.max(best, wins);
    }
    dev += best / tasks;
    let confirmation = 0;
    for (let k = 0; k < tasks; k++) if (rng() < 0.5) confirmation++;
    fresh += confirmation / tasks;
  }
  return { development: dev / experiments, confirmation: fresh / experiments };
}

export function initResearch(): void {
  const counts = {
    groups: DSH.packageGroups.length,
    packages: DSH.packageGroups.reduce((n, group) => n + group.pkgs.length, 0),
    quiz: DSH.quiz.length,
  };
  document.querySelectorAll<HTMLElement>('[data-count]').forEach(node => {
    const key = node.dataset.count;
    if (key === 'groups' || key === 'packages' || key === 'quiz') {
      node.textContent = String(counts[key]);
    }
  });
  const host = document.getElementById('selectionBiasLab');
  if (!host) return;
  host.innerHTML = '<div class="research-lab-controls">' +
    '<label for="biasCandidates">候选数 <select id="biasCandidates"><option>1</option><option>10</option><option selected>30</option><option>100</option></select></label>' +
    '<label for="biasSeed">随机种子 <input type="number" id="biasSeed" value="17" min="0" max="4294967295" step="1"></label>' +
    '<button type="button" class="btn small primary" id="biasRun">运行合成实验</button></div>' +
    '<p class="small muted">300 次完整搜索 × 每候选 40 个开发观测；每个候选真实成功率恒为 50%。新数据只评被选中的一个候选。</p>' +
    '<div id="biasResult" role="status" aria-live="polite"></div>';
  const seedField = host.querySelector<HTMLInputElement>('#biasSeed');
  const candidateField = host.querySelector<HTMLSelectElement>('#biasCandidates');
  const resultNode = host.querySelector<HTMLDivElement>('#biasResult');
  const runButton = host.querySelector<HTMLButtonElement>('#biasRun');
  if (!seedField || !candidateField || !resultNode || !runButton) {
    throw new Error('Selection bias lab controls are missing');
  }
  const run = (): void => {
    if (!seedField.reportValidity() || seedField.value === '') return;
    const count = Number(candidateField.value);
    const seed = Number(seedField.value);
    const result = simulate(count, seed);
    resultNode.innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>指标</th><th>平均成功率</th></tr></thead><tbody>' +
      '<tr><td>真实能力（预设）</td><td>50.0%</td></tr>' +
      '<tr><td>被选中候选的开发分数</td><td>' + (100 * result.development).toFixed(1) + '%</td></tr>' +
      '<tr><td>同一候选在新数据上的分数</td><td>' + (100 * result.confirmation).toFixed(1) + '%</td></tr></tbody></table></div>' +
      '<p>seed=' + seed + '；候选数=' + count + '。差距来自在噪声上选优；不是能力增长。浏览器与 Python 使用不同随机数算法，同种子不要求跨语言逐数一致。</p>';
  };
  runButton.addEventListener('click', run);
  run();
}
