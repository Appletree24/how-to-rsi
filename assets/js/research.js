/* Offline teaching simulation. Independent of the legacy interaction components. */
(function () {
  'use strict';
  function randomFromSeed(seed) {
    var state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function simulate(candidates, seed) {
    var rng = randomFromSeed(seed), dev = 0, fresh = 0;
    var experiments = 300, tasks = 40;
    for (var e = 0; e < experiments; e++) {
      var best = 0;
      for (var c = 0; c < candidates; c++) {
        var wins = 0;
        for (var t = 0; t < tasks; t++) if (rng() < 0.5) wins++;
        best = Math.max(best, wins);
      }
      dev += best / tasks;
      var confirmation = 0;
      for (var k = 0; k < tasks; k++) if (rng() < 0.5) confirmation++;
      fresh += confirmation / tasks;
    }
    return {development: dev / experiments, confirmation: fresh / experiments};
  }
  document.addEventListener('DOMContentLoaded', function () {
    var counts = {
      groups: DSH.packageGroups.length,
      packages: DSH.packageGroups.reduce(function (n, group) { return n + group.pkgs.length; }, 0),
      quiz: DSH.quiz.length
    };
    document.querySelectorAll('[data-count]').forEach(function (node) {
      node.textContent = counts[node.dataset.count];
    });
    var host = document.getElementById('selectionBiasLab');
    if (!host) return;
    host.innerHTML = '<div class="research-lab-controls">' +
      '<label for="biasCandidates">候选数 <select id="biasCandidates"><option>1</option><option>10</option><option selected>30</option><option>100</option></select></label>' +
      '<label for="biasSeed">随机种子 <input type="number" id="biasSeed" value="17" min="0" max="4294967295" step="1"></label>' +
      '<button type="button" class="btn small primary" id="biasRun">运行合成实验</button></div>' +
      '<p class="small muted">300 次完整搜索 × 每候选 40 个开发观测；每个候选真实成功率恒为 50%。新数据只评被选中的一个候选。</p>' +
      '<div id="biasResult" role="status" aria-live="polite"></div>';
    function run() {
      var seedField = document.getElementById('biasSeed');
      if (!seedField.reportValidity() || seedField.value === '') return;
      var count = Number(document.getElementById('biasCandidates').value);
      var seed = Number(seedField.value);
      var result = simulate(count, seed);
      document.getElementById('biasResult').innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>指标</th><th>平均成功率</th></tr></thead><tbody>' +
        '<tr><td>真实能力（预设）</td><td>50.0%</td></tr>' +
        '<tr><td>被选中候选的开发分数</td><td>' + (100 * result.development).toFixed(1) + '%</td></tr>' +
        '<tr><td>同一候选在新数据上的分数</td><td>' + (100 * result.confirmation).toFixed(1) + '%</td></tr></tbody></table></div>' +
        '<p>seed=' + seed + '；候选数=' + count + '。差距来自在噪声上选优；不是能力增长。浏览器与 Python 使用不同随机数算法，同种子不要求跨语言逐数一致。</p>';
    }
    document.getElementById('biasRun').addEventListener('click', run);
    run();
  });
})();
