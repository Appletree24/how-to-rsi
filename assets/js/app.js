/* ============================================================
   How to RSI — 应用逻辑(无依赖、经典脚本、支持 file:// 直接打开)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 小工具 ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // 给非 <button>/<a> 元素补齐按钮语义;返回节点便于继续挂事件
  function buttonize(n, role) {
    n.setAttribute('role', role || 'button');
    n.tabIndex = 0;
    return n;
  }
  // Enter/Space 触发 click(click() 也会走已注册的 addEventListener)
  function keyActivate(n) {
    n.addEventListener('keydown', function (e) {
      if (e.target !== n) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        n.click();
      }
    });
  }
  function icon(name, size) {
    var s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + (DSH.icons[name] || DSH.icons.info) + '"/></svg>';
  }
  var CHECK_SVG = '<svg class="nav-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 持久化进度 ---------- */
  var store = { done: {}, theme: 'light', best: -1 };
  try {
    var raw = localStorage.getItem('dsh-learn-v1');
    if (raw) { var parsed = JSON.parse(raw); if (parsed && typeof parsed === 'object') { store.done = parsed.done || {}; store.theme = parsed.theme || 'light'; store.best = (typeof parsed.best === 'number') ? parsed.best : -1; } }
  } catch (e) { /* storageDenied: file:// 隐私模式下可能禁用,降级为不持久 */ }
  function save() {
    try { localStorage.setItem('dsh-learn-v1', JSON.stringify(store)); }
    catch (e) { /* storageDenied: 同上,忽略写入失败 */ }
  }


  /* ---------- 主题 ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', store.theme);
    var btn = $('#themeBtn');
    if (btn) btn.setAttribute('aria-pressed', store.theme === 'dark' ? 'true' : 'false');
    if (btn) btn.innerHTML = store.theme === 'dark'
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 14.2A8.5 8.5 0 1 1 9.8 3.6a7 7 0 1 0 10.6 10.6Z"/></svg>';
  }

  /* ---------- 导航与路由 ---------- */
  var currentId = 'home';
  function buildNav() {
    var nav = $('#navList');
    nav.innerHTML = '';
    var lastModule = null;
    DSH.chapters.forEach(function (c) {
      if (c.module !== lastModule) {
        lastModule = c.module;
        var m = DSH.modules.find(function (x) { return x.id === c.module; });
        nav.appendChild(el('h4', '', (m ? icon(m.icon, 13) + ' ' : '') + esc(m ? m.name : '')));
      }
      var a = el('a', 'nav-item', '');
      a.href = '#/' + c.id;
      a.dataset.ch = c.id;
      a.title = c.title;
      a.setAttribute('aria-label', c.num + ' ' + c.title);
      a.innerHTML = '<span class="nav-num">' + c.num + '</span><span class="nav-title">' + esc(c.short) + '</span>' + CHECK_SVG;
      nav.appendChild(a);
    });
  }
  function refreshNav() {
    $$('#navList .nav-item').forEach(function (a) {
      a.classList.toggle('active', a.dataset.ch === currentId);
      a.classList.toggle('done', !!store.done[a.dataset.ch]);
    });
    $$('.idx-item').forEach(function (a) {
      a.classList.toggle('done', !!store.done[a.dataset.ch]);
    });
    $$('.done-btn').forEach(function (b) {
      var on = !!store.done[b.dataset.ch];
      b.classList.toggle('is-done', on);
      b.textContent = on ? '✓ 已读' : '标记已读';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.title = on ? '撤销已读标记' : '保存本章阅读进度';
    });
  }
  function go(id) { location.hash = '#/' + id; }
  function route() {
    var id = (location.hash || '#/home').replace(/^#\/?/, '') || 'home';
    // 'lc' 是隐藏页:不在 DSH.chapters 里(不进导航/搜索/翻页链),但要放行路由
    if (id !== 'lc' && !DSH.chapters.some(function (c) { return c.id === id; })) id = 'home';
    currentId = id;
    $$('.chapter').forEach(function (s) { s.classList.toggle('active', s.id === 'ch-' + id); });
    var lc = DSH.chapters.find(function (c) { return c.id === id; });
    document.title = (id === 'home' ? 'How to RSI · 递归自我改进的原理与实验' : (lc ? lc.title : '刷题笔记') + ' · How to RSI');
    window.scrollTo(0, 0);
    closeSidebar();
    refreshNav();
  }

  /* ---------- 章节页脚(上一章/下一章/完成) ---------- */
  function buildFooters() {
    DSH.chapters.forEach(function (c, i) {
      var sec = $('#ch-' + c.id);
      if (!sec || c.id === 'home') return;
      var f = el('div', 'chapter-footer');
      if (i > 0) {
        var prev = el('a', 'btn small', '← ' + DSH.chapters[i - 1].short);
        prev.href = '#/' + DSH.chapters[i - 1].id;
        f.appendChild(prev);
      }
      f.appendChild(el('div', 'cf-spacer'));
      if (c.id !== 'home') {
        var doneBtn = el('button', 'btn small done-btn', '标记已读');
        doneBtn.dataset.ch = c.id;
        doneBtn.addEventListener('click', function () {
          store.done[c.id] = !store.done[c.id];
          if (!store.done[c.id]) delete store.done[c.id];
          save(); refreshNav();
        });
        f.appendChild(doneBtn);
      }
      if (i < DSH.chapters.length - 1) {
        var next = el('a', 'btn small primary', DSH.chapters[i + 1].short + ' →');
        next.href = '#/' + DSH.chapters[i + 1].id;
        f.appendChild(next);
      }
      sec.appendChild(f);
    });
  }

  /* ---------- 首页:目录索引与静态终端 ---------- */
  function buildHome() {
    var host = $('#homeIndex');
    DSH.modules.forEach(function (m) {
      var chs = DSH.chapters.filter(function (c) { return c.module === m.id && c.id !== 'home'; });
      if (!chs.length) return;
      var group = el('details', 'idx-group');
      var summary = el('summary', 'idx-mod', '<span>' + esc(m.name) + '</span><span class="idx-count">' + chs.length + ' 篇</span>');
      group.appendChild(summary);
      chs.forEach(function (c) {
        var a = el('a', 'idx-item', '');
        a.href = '#/' + c.id;
        a.dataset.ch = c.id;
        a.innerHTML = '<span class="idx-num">' + c.num + '</span><span class="idx-copy"><span class="idx-title">' + esc(c.title) + '</span>' +
          '<span class="idx-blurb">' + esc(c.blurb) + '</span></span>' + CHECK_SVG;
        group.appendChild(a);
      });
      host.appendChild(group);
    });
  }

  /* ---------- Cordis 理念卡 ---------- */
  function buildCordis() {
    var grid = $('#ideaGrid');
    if (!grid) return;
    DSH.cordisIdeas.forEach(function (it, i) {
      var c = el('div', 'card reveal d' + (i % 3 + 1));
      c.innerHTML = '<div class="icon">' + icon('puzzle') + '</div><h3>' + (i + 1) + '. ' + it.t + '</h3><p>' + it.d + '</p>';
      grid.appendChild(c);
    });
    var tb = $('#dispatchTable');
    if (tb) {
      DSH.dispatchModes.forEach(function (m) {
        var tr = el('tr', '', '<td><code>' + m.id + '</code></td><td>' + m.awaited + '</td><td>' + m.order + '</td><td>' + m.ret + '</td>');
        tb.appendChild(tr);
      });
    }
  }

  /* ---------- Dispatch 模拟器 ---------- */
  function buildSim() {
    var host = $('#dispatchSim');
    if (!host) return;
    var mode = 'waterfall';
    var shortC = true;
    var timers = [];
    host.innerHTML =
      '<div class="sim-ctl">' +
        '<div class="chips" id="simModes"></div>' +
        '<span class="switch on2" id="simShort"><span class="sw"></span>让 L3 短路 / bail</span>' +
        '<button class="btn small primary" id="simRun">▶ 分发事件</button>' +
        '<span class="sim-result" id="simResult">结果：—</span>' +
      '</div>' +
      '<div class="sim-stage" id="simStage"></div>' +
      '<div class="sim-log" id="simLog">选择一种 dispatch 模式,点击“分发事件”观察监听器的行为。</div>';
    var chipBox = $('#simModes');
    DSH.dispatchModes.forEach(function (m) {
      var ch = el('button', 'chip' + (m.id === mode ? ' on' : ''), m.id);
      ch.addEventListener('click', function () {
        mode = m.id;
        $$('#simModes .chip').forEach(function (x) { x.classList.toggle('on', x.textContent === mode); });
        describe();
      });
      chipBox.appendChild(ch);
    });
    var stage = $('#simStage');
    var names = ['事件源', 'L1', 'L2', 'L3', 'L4'];
    names.forEach(function (n, i) {
      var node = el('div', 'sim-node' + (i === 0 ? ' src' : ''), '<div class="nm">' + n + '</div><div class="rl">' + (i === 0 ? 'dispatch' : '监听器') + '</div>');
      node.id = 'simN' + i;
      stage.appendChild(node);
      if (i < names.length - 1) stage.appendChild(el('span', 'sim-arrow', '➔'));
    });
    var swEl = buttonize($('#simShort'), 'switch');
    swEl.setAttribute('aria-checked', 'true');
    swEl.addEventListener('click', function () {
      shortC = !shortC;
      swEl.classList.toggle('on2', shortC);
      swEl.setAttribute('aria-checked', shortC ? 'true' : 'false');
    });
    keyActivate(swEl);
    function logLine(html) { var lg = $('#simLog'); lg.innerHTML += '<div>» ' + html + '</div>'; lg.scrollTop = lg.scrollHeight; }
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      $('#simLog').innerHTML = '';
      $('#simResult').textContent = '结果：…';
      for (var i = 1; i <= 4; i++) { var n = $('#simN' + i); n.className = 'sim-node'; $('.rl', n).textContent = '监听器'; }
    }
    function at(ms, fn) { timers.push(setTimeout(fn, reducedMotion ? 0 : ms)); }
    function setN(i, cls, role) { var n = $('#simN' + i); n.className = 'sim-node ' + cls; if (role) $('.rl', n).textContent = role; }
    function describe() {
      var m = DSH.dispatchModes.find(function (x) { return x.id === mode; });
      $('#simLog').innerHTML = '<div>» <span class="hl2">' + m.id + '</span>：' + m.desc + '</div>';
      $('#simResult').textContent = '结果：—';
    }
    describe();
    $('#simRun').addEventListener('click', function () {
      reset();
      var m = DSH.dispatchModes.find(function (x) { return x.id === mode; });
      logLine('<span class="hl2">ctx.' + (mode === 'emit' ? 'emit' : mode) + '(\'demo/event\', payload' + (mode === 'waterfall' ? ', next' : '') + ')</span>');
      var step = 620;
      if (mode === 'emit') {
        [1, 2, 3, 4].forEach(function (i, k) {
          at(step * k, function () { setN(i, 'lit', '观察'); logLine('L' + i + ' 观察事件(不等待)'); });
          at(step * k + 420, function () { setN(i, 'done3', '完成'); });
        });
        at(60, function () { $('#simResult').textContent = '结果：无返回值,分发后立即返回'; logLine('<span class="warn2">分发方已继续执行 —— emit 不等待监听器</span>'); });
      } else if (mode === 'waterfall') {
        at(0, function () { setN(1, 'lit', '注释后 next()'); logLine('L1 修饰请求,调用 <span class="ok3">next()</span>'); });
        at(step, function () { setN(1, 'done3'); setN(2, 'lit', '包装后 next()'); logLine('L2 包装结果,调用 <span class="ok3">next()</span>'); });
        at(step * 2, function () {
          setN(2, 'done3');
          if (shortC) {
            setN(3, 'bailed', '不调用 next()');
            setN(4, 'skip', '未观察');
            logLine('<span class="warn2">L3 拥有决定权,直接返回 —— 短路,L4 永远看不到事件</span>');
            $('#simResult').textContent = '结果：L3 的返回值';
          } else {
            setN(3, 'lit', '直接 next()');
            logLine('L3 直接委托 <span class="ok3">next()</span>');
          }
        });
        if (!shortC) {
          at(step * 3, function () { setN(3, 'done3'); setN(4, 'lit', '末端'); logLine('L4 是链尾,产出基础结果'); });
          at(step * 4, function () { setN(4, 'done3'); logLine('值沿 next() 的返回值逐层回传、层层可被替换'); $('#simResult').textContent = '结果：层层包装后的返回值'; });
        }
      } else if (mode === 'parallel') {
        at(0, function () {
          [1, 2, 3, 4].forEach(function (i) { setN(i, 'lit', 'await 中'); });
          logLine('所有监听器同时观察,分发方 <span class="warn2">await 全部完成</span>');
        });
        [3, 1, 4, 2].forEach(function (i, k) {
          at(500 + k * 300, function () { setN(i, 'done3', '完成'); logLine('L' + i + ' 完成'); });
        });
        at(500 + 4 * 300, function () { $('#simResult').textContent = '结果：无返回值(全部完成后 resolve)'; });
      } else if (mode === 'serial') {
        [1, 2, 3, 4].forEach(function (i, k) {
          at(step * k, function () { setN(i, 'lit', 'await 中'); logLine('await L' + i + ' …'); });
          at(step * k + 460, function () { setN(i, 'done3', '完成'); });
        });
        at(step * 4, function () { $('#simResult').textContent = '结果：有返回值,逐个 await'; });
      } else if (mode === 'bail') {
        at(0, function () { setN(1, 'lit', '返回 undefined'); logLine('L1 返回 undefined — 继续'); });
        at(step, function () { setN(1, 'done3'); setN(2, 'lit', '返回 undefined'); logLine('L2 返回 undefined — 继续'); });
        at(step * 2, function () { setN(2, 'done3'); setN(3, 'bailed', '返回了值!'); setN(4, 'skip', '未观察'); logLine('<span class="warn2">L3 返回非空值 —— bail,分发终止</span>'); $('#simResult').textContent = '结果：L3 的返回值'; });
      }
    });
  }

  /* ---------- Agent Loop 播放器 ---------- */
  function buildLoop() {
    var host = $('#loopPlayer');
    if (!host) return;
    var idx = 0, timer = null;
    host.innerHTML =
      '<div class="loop-dots" id="loopDots"></div>' +
      '<div class="loop-body">' +
        '<div class="loop-steps" id="loopSteps"></div>' +
        '<div class="tape" id="loopTape"><div class="tape-title">SESSION LOG · 会话日志 + 活体事件</div></div>' +
      '</div>' +
      '<div class="loop-ctl">' +
        '<button class="btn small" id="loopPrev">← 上一帧</button>' +
        '<button class="btn small primary" id="loopPlay">▶ 自动播放</button>' +
        '<button class="btn small" id="loopNext">下一帧 →</button>' +
        '<button class="btn small" id="loopReset">↺ 重置</button>' +
        '<span class="muted small" style="margin-left:auto">图例：<span class="badge d">● 持久事件</span> <span class="badge l">● 活体扩展点</span> <span class="badge o">● 按需记录</span></span>' +
      '</div>' +
      '<div class="loop-narr" id="loopNarr"></div>';
    var dots = $('#loopDots'), stepsBox = $('#loopSteps');
    DSH.loopSteps.forEach(function (s, i) {
      var d = el('button', 'loop-dot');
      d.title = s.name;
      d.addEventListener('click', function () { idx = i; stopPlay(); render(); });
      dots.appendChild(d);
      var badgeCls = s.badge === 'd' ? 'd' : (s.badge === 'o' ? 'o' : 'l');
      var badgeTxt = s.badge === 'd' ? '持久' : (s.badge === 'o' ? '按需' : '活体');
      var card = buttonize(el('div', 'loop-step'));
      card.setAttribute('aria-label', '第 ' + (i + 1) + ' 帧：' + s.name);
      card.innerHTML = '<div class="ls-head"><span class="ls-num">' + (i + 1) + '</span><span class="ls-title">' + esc(s.name) + '</span><span class="badge ' + badgeCls + '" style="margin-left:auto">' + badgeTxt + '</span></div>' +
        '<div class="ls-desc"><b>' + s.title + '</b> — ' + s.desc + '</div>';
      card.addEventListener('click', function () { idx = i; stopPlay(); render(); });
      keyActivate(card);
      stepsBox.appendChild(card);
    });
    function render() {
      $$('#loopDots .loop-dot').forEach(function (d, i) {
        d.className = 'loop-dot' + (i < idx ? ' past' : i === idx ? ' now' : '');
      });
      $$('#loopSteps .loop-step').forEach(function (c, i) {
        c.className = 'loop-step' + (i < idx ? ' past2' : i === idx ? ' now2' : '');
        if (i === idx) c.setAttribute('aria-current', 'step'); else c.removeAttribute('aria-current');
      });
      var active = $('#loopSteps .loop-step.now2');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
      var tape = $('#loopTape');
      tape.innerHTML = '<div class="tape-title">SESSION LOG · 会话日志 + 活体事件</div>';
      for (var i = 0; i <= idx; i++) {
        DSH.loopSteps[i].log.forEach(function (evt) {
          var cls = evt.t === 'd' ? 'ev-d' : (evt.t === 'o' ? 'ev-o' : 'ev-l');
          var tag = evt.t === 'd' ? '写入日志' : (evt.t === 'o' ? '按需记录' : '活体');
          tape.appendChild(el('div', 'tape-item ' + cls, '<i></i>' + esc(evt.n) + '<span class="tp-tag">' + tag + '</span>'));
        });
      }
      tape.scrollTop = tape.scrollHeight;
      $('#loopNarr').innerHTML = '<b>第 ' + (idx + 1) + '/' + DSH.loopSteps.length + ' 帧 · ' + DSH.loopSteps[idx].title + '</b><br>' + DSH.loopSteps[idx].narr;
    }
    function stopPlay() {
      if (timer) { clearInterval(timer); timer = null; $('#loopPlay').innerHTML = '▶ 自动播放'; }
    }
    $('#loopPrev').addEventListener('click', function () { stopPlay(); idx = Math.max(0, idx - 1); render(); });
    $('#loopNext').addEventListener('click', function () { stopPlay(); idx = Math.min(DSH.loopSteps.length - 1, idx + 1); render(); });
    $('#loopReset').addEventListener('click', function () { stopPlay(); idx = 0; render(); });
    $('#loopPlay').addEventListener('click', function () {
      if (timer) { stopPlay(); return; }
      if (idx >= DSH.loopSteps.length - 1) idx = 0;
      $('#loopPlay').innerHTML = '⏸ 暂停';
      render();
      timer = setInterval(function () {
        if (idx >= DSH.loopSteps.length - 1) { stopPlay(); return; }
        idx++; render();
      }, reducedMotion ? 800 : 2600);
    });
    render();
  }

  /* ---------- 扩展点选择器 ---------- */
  function buildExtPicker() {
    var host = $('#extPicker');
    if (!host) return;
    var sel = el('select', 'sel-input');
    DSH.extGoals.forEach(function (g, i) {
      var o = el('option', '', ''); o.value = i; o.textContent = g.g; sel.appendChild(o);
    });
    var out = el('div', 'picker-out');
    function show() {
      var g = DSH.extGoals[sel.value | 0];
      out.innerHTML = '<div class="small muted">正确机制(不需要改 agent-loop)：</div><div class="po-mech">' + esc(g.m) + '</div>';
    }
    sel.addEventListener('change', show);
    var row = el('div', 'picker-row');
    row.appendChild(el('span', 'muted', '我想…'));
    row.appendChild(sel);
    host.appendChild(row);
    host.appendChild(out);
    show();
  }

  /* ---------- RSI 分级阶梯 ---------- */
  function buildRsiLevels() {
    var host = $('#rsiLevels');
    if (!host) return;
    DSH.rsiLevels.forEach(function (l, i) {
      var row = el('div', 'layer reveal d' + (i % 4 + 1) + (l.cur ? ' lv-cur' : ''));
      row.innerHTML = '<span class="ln">' + l.n + '</span><div><div class="lt">' + esc(l.t) + (l.cur ? ' <span class="lv-tag">今天可达</span>' : '') + '</div><div class="ld">' + esc(l.d) + '</div></div><span class="arrow-down">↓</span>';
      host.appendChild(row);
    });
  }

  /* ---------- 哥德尔机对照表 ---------- */
  function buildGodel() {
    var tb = $('#godelTable');
    if (tb) {
      DSH.godelMachines.forEach(function (m) {
        var tr = el('tr', '',
          '<td><b>' + esc(m.name) + '</b><div class="muted small">' + esc(m.by) + '</div></td>' +
          '<td>' + esc(m.year) + '</td>' +
          '<td>' + esc(m.gate) + '<div class="muted small">' + esc(m.key) + '</div></td>' +
          '<td>' + esc(m.eval) + '</td>' +
          '<td>' + esc(m.status) + '</td>');
        tb.appendChild(tr);
      });
    }
  }

  /* ---------- 开放进化模拟器(贪心 vs 档案) ---------- */
  /* 教学模型:8 个特性位,分数 = 激活数 + (bit7&bit8 同时激活 ? +35 : 单独各罚 12)
     贪心只从当前最优个体继续;开放档案从全部历史个体中均匀取样——后者能走出需要"暂时退步"的突破。 */
  function buildEvoSim() {
    var host = $('#evoSim');
    if (!host) return;
    host.innerHTML =
      '<div class="sim-ctl">' +
        '<button class="btn small primary" id="evoRun">▶ 跑 60 代(开放档案)</button>' +
        '<button class="btn small" id="evoGreedy">▶ 跑 60 代(贪心爬坡)</button>' +
        '<button class="btn small" id="evoReset">↺ 重置</button>' +
        '<span class="sim-result" id="evoResult">选择一个策略开始</span>' +
      '</div>' +
      '<div class="evo-grid" id="evoGrid"></div>' +
      '<div class="sim-log" id="evoLog">每个格子是一个 agent：颜色越深分数越高(金框 = 全局最优)。开放档案可从任意祖先分支；贪心只能改当前最强。</div>';
    var BITS = 8;
    function score(bits) {
      var n = 0; for (var i = 0; i < BITS; i++) n += bits[i];
      var b7 = bits[6], b8 = bits[7];
      if (b7 && b8) n += 35; else n -= (b7 + b8) * 12;
      return n;
    }
    var MAXS = score([1,1,1,1,1,1,1,1]); // 43
    var evoTimer = null;
    var cells = $('#evoGrid');
    var archive = [];
    var cellEls = [];
    for (var c = 0; c < 16; c++) {
      var cell = el('div', 'evo-cell', '<div class="ec-bits"></div><div class="ec-score"></div>');
      cell.title = '点击可把此 agent 设为"当前最优"视角(不影响结果)';
      cells.appendChild(cell); cellEls.push(cell);
    }
    function render() {
      archive.slice(-16).forEach(function (a, i) {
        var cell = cellEls[i];
        cell.className = 'evo-cell' + (a.score >= MAXS ? ' best' : a.score >= 0 ? ' alive' : ' dead');
        var bitsHtml = '';
        for (var b = 0; b < BITS; b++) bitsHtml += '<i class="' + (a.bits[b] ? 'on' : '') + '"></i>';
        cell.innerHTML = '<div class="ec-bits">' + bitsHtml + '</div><div class="ec-score">' + a.score + '</div>';
        cell.title = '后代 of #' + a.parent + ' · 分数 ' + a.score;
      });
      for (var i = archive.length; i < 16; i++) {
        cellEls[i].className = 'evo-cell empty';
        cellEls[i].innerHTML = '<div class="ec-bits"></div><div class="ec-score"></div>';
      }
    }
    function logLine(html) { var lg = $('#evoLog'); lg.innerHTML += '<div>» ' + html + '</div>'; lg.scrollTop = lg.scrollHeight; }
    function mutate(bits) {
      var nb = bits.slice();
      var idx = Math.floor(Math.random() * BITS);
      nb[idx] = nb[idx] ? 0 : 1;
      return nb;
    }
    function best() {
      var b = archive[0];
      archive.forEach(function (a) { if (a.score > b.score) b = a; });
      return b;
    }
    function run(greedy) {
      if (evoTimer) clearInterval(evoTimer);
      archive = [{ bits: [0,0,0,0,0,0,0,0], score: score([0,0,0,0,0,0,0,0]), parent: '-' }];
      $('#evoLog').innerHTML = '';
      logLine('起点：全零 agent(0 分)。' + (greedy ? '<span class="warn2">贪心：每代只变异当前最优</span>' : '<span class="hl2">开放：每代从全部档案均匀取样作父代</span>'));
      var gen = 0;
      evoTimer = setInterval(function () {
        gen++;
        var parent = greedy ? best() : archive[Math.floor(Math.random() * archive.length)];
        var bits = mutate(parent.bits);
        var s = score(bits);
        var child = { bits: bits, score: s, parent: '#' + (archive.indexOf(parent) + 1) };
        if (!greedy || s >= parent.score) archive.push(child);
        if (s > parent.score) logLine('第 ' + gen + ' 代:#' + archive.length + ' 得分 ' + s + '(+' + (s - parent.score) + ')');
        else if (!greedy && Math.random() < 0.3) logLine('第 ' + gen + ' 代:#' + archive.length + ' 得分 ' + s + '(退步,保留作跳板)');
        else if (greedy && Math.random() < 0.15) logLine('第 ' + gen + ' 代:变异体 ' + s + ' 分不如父代 ' + parent.score + ' 分,丢弃');
        if (archive.length > 64) archive.shift();
        render();
        if (gen >= 60) {
          clearInterval(evoTimer); evoTimer = null;
          var b = best();
          var verdict = greedy
            ? (b.score >= MAXS ? '竟然到了 ' + b.score + ' 分——少数几次运气够好' : '卡在 ' + b.score + ' 分,bit7+bit8 的 +35 分永远够不着(单独激活各罚 12)')
            : (b.score >= MAXS ? '达到 ' + b.score + ' 分!开放档案踩出了两步退化后的突破' : '达到 ' + b.score + ' 分——再跑几代通常能到 43');
          $('#evoResult').textContent = '结果：' + verdict;
          logLine('<span class="hl2">最优 ' + b.score + ' 分</span> — ' + verdict);
        }
      }, reducedMotion ? 5 : 55);
    }
    $('#evoRun').addEventListener('click', function () { run(false); });
    $('#evoGreedy').addEventListener('click', function () { run(true); });
    $('#evoReset').addEventListener('click', function () {
      if (evoTimer) { clearInterval(evoTimer); evoTimer = null; }
      archive = []; render();
      $('#evoLog').innerHTML = '每个格子是一个 agent：颜色越深分数越高(金框 = 全局最优)。开放档案可从任意祖先分支；贪心只能改当前最强。';
      $('#evoResult').textContent = '选择一个策略开始';
    });
    render();
  }

  /* ---------- RSI 能力地图 ---------- */
  function buildCapMap() {
    var host = $('#capMapGrid');
    if (!host) return;
    var grid = el('div', 'grid cols2');
    DSH.capMap.forEach(function (c, i) {
      var ready = c.st === 'ready';
      var card = el('div', 'card cap-card reveal d' + (i % 2 + 1));
      var badge = ready ? '<span class="badge d">● 已有</span>' : '<span class="badge o">● 需扩展</span>';
      card.innerHTML =
        '<div class="cc-head"><h3>' + esc(c.t) + '</h3>' + badge + '</div>' +
        '<p>' + esc(c.d) + '</p>' +
        '<div class="cc-refs">' + c.refs.map(function (r) { return '<code>' + esc(r) + '</code>'; }).join(' ') + '</div>' +
        '<div class="cc-q">' + esc(c.q) + '</div>';
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  /* ---------- 载体对比 ---------- */
  function buildCarriers() {
    var tb = $('#carrierTable tbody');
    if (!tb) return;
    DSH.carriers.forEach(function (c) {
      var tr = el('tr', '',
        '<td><b>' + esc(c.name) + '</b><div class="muted small">' + esc(c.note) + '</div></td>' +
        '<td>' + esc(c.mech) + '</td>' +
        '<td>' + esc(c.gran) + '</td>' +
        '<td>' + esc(c.persist) + '</td>' +
        '<td>' + esc(c.approval) + '</td>' +
        '<td>' + esc(c.evidence) + '</td>');
      tb.appendChild(tr);
    });
  }

  /* ---------- 安全护栏清单 ---------- */
  function buildSafety() {
    var host = $('#safetyList');
    if (!host) return;
    DSH.rsiSafety.forEach(function (s, i) {
      var det = el('details', 'acc');
      det.innerHTML = '<summary><span class="safe-num">' + (i + 1) + '</span>' + esc(s.t) + '</summary><div class="acc-body">' + esc(s.d) + '</div>';
      host.appendChild(det);
    });
  }

  /* ---------- 实战关卡 ---------- */
  function buildExperiments() {
    var host = $('#expList');
    if (!host) return;
    DSH.experiments.forEach(function (x, i) {
      var card = el('div', 'card exp-card');
      card.id = 'exp-' + x.id;
      var head = el('div', 'exp-head');
      var cb = el('input');
      cb.type = 'checkbox';
      cb.id = 'expcb-' + x.id;
      cb.setAttribute('aria-label', '标记关卡 ' + x.t + ' 已完成');
      cb.addEventListener('change', function () {
        if (cb.checked) store.done['exp-' + x.id] = true; else delete store.done['exp-' + x.id];
        save(); renderExp();
      });
      head.appendChild(cb);
      head.appendChild(el('div', '', '<span class="exp-lv">' + x.lv + ' · ' + esc(x.t) + '</span><h3>' + esc(x.title) + '</h3>'));
      card.appendChild(head);
      card.appendChild(el('p', 'exp-desc', esc(x.desc)));
      card.appendChild(el('div', 'exp-verify', '验收：' + esc(x.verify)));
      host.appendChild(card);
    });
    renderExp();
  }
  function renderExp() {
    var done = 0;
    DSH.experiments.forEach(function (x) {
      var on = !!store.done['exp-' + x.id];
      if (on) done++;
      var cb = $('#expcb-' + x.id);
      if (cb) cb.checked = on;
      var card = $('#exp-' + x.id);
      if (card) card.classList.toggle('exp-done', on);
    });
    var pct = Math.round(done / DSH.experiments.length * 100);
    var fill = $('#expBarFill'); if (fill) fill.style.width = pct + '%';
    var txt = $('#expBarTxt'); if (txt) txt.textContent = done + ' / ' + DSH.experiments.length + ' 关已通过';
  }

  /* ---------- 评测范式对照表 ---------- */
  function buildEvalTable() {
    var tb = $('#evalTable');
    if (!tb) return;
    DSH.evalParadigms.forEach(function (p) {
      var tr = el('tr', '',
        '<td><b>' + esc(p.name) + '</b></td>' +
        '<td>' + esc(p.who) + '</td>' +
        '<td>' + esc(p.what) + '</td>' +
        '<td>' + esc(p.layer) + '</td>' +
        '<td>' + esc(p.games) + '</td>' +
        '<td><code>' + esc(p.used) + '</code></td>');
      tb.appendChild(tr);
    });
  }

  /* ---------- 常见评测基准表 ---------- */
  function buildEvalBench() {
    var tb = $('#evalBenchTable');
    if (!tb) return;
    DSH.evalBenchmarks.forEach(function (b) {
      var tr = el('tr', '',
        '<td><b>' + esc(b.name) + '</b></td>' +
        '<td>' + esc(b.what) + '</td>' +
        '<td><code>' + esc(b.lvl) + '</code></td>' +
        '<td>' + esc(b.note) + '</td>');
      tb.appendChild(tr);
    });
  }

  /* ---------- 评测门模拟器(keep/rollback + 作弊哨兵) ---------- */
  /* 教学模型:7 个黄金任务,agent 当前能对其中 5 个。注入"自改"会修好坏任务或弄坏好任务;
     作弊模式下 agent 会报告假分数——哨兵能抓出来。 */
  function buildEvalGate() {
    var host = $('#evalGateSim');
    if (!host) return;
    host.innerHTML =
      '<div class="sim-ctl">' +
        '<button class="btn small primary" id="egRun">▶ 注入一次自改并评测</button>' +
        '<button class="btn small" id="egAuto">▶ 连续 5 轮</button>' +
        '<button class="btn small" id="egReset">↺ 重置</button>' +
        '<span class="switch" id="egCheat"><span class="sw"></span>作弊改动</span>' +
        '<span class="switch" id="egSent"><span class="sw"></span>哨兵检测</span>' +
        '<span class="sim-result" id="egResult"></span>' +
      '</div>' +
      '<div class="eg-tasks" id="egTasks"></div>' +
      '<div class="sim-log" id="egLog">当前版本 v0:能对 5/7 任务(基线 5 分)。注入自改后跑评测:报告分 ≥ 基线则保留,否则回滚。</div>';
    var passing = [true, true, true, true, true, false, false];
    var baseline = 5;
    var ver = 0;
    var cheat = true, sentinel = false;
    function score() { var n = 0; passing.forEach(function (p) { if (p) n++; }); return n; }
    function renderTasks() {
      var box = $('#egTasks');
      box.innerHTML = '';
      DSH.evalTasks.forEach(function (t, i) {
        var d = el('details', 'eg-task' + (passing[i] ? ' pass' : ' fail'));
        d.innerHTML = '<summary>' + (passing[i] ? '✓' : '✗') + ' ' + esc(t.q) + '</summary><div class="eg-exp">期望:<code>' + esc(t.expect) + '</code></div>';
        box.appendChild(d);
      });
    }
    function logLine(html) { var lg = $('#egLog'); lg.innerHTML += '<div>» ' + html + '</div>'; lg.scrollTop = lg.scrollHeight; }
    function roll() {
      ver++;
      var before = passing.slice();
      var desc, delta = 0;
      var failIdx = [], passIdx = [];
      passing.forEach(function (p, i) { (p ? passIdx : failIdx).push(i); });
      if (failIdx.length && (Math.random() < 0.65 || !passIdx.length)) {
        var i = failIdx[Math.floor(Math.random() * failIdx.length)];
        passing[i] = true; delta = 1; desc = '修好任务 ' + DSH.evalTasks[i].q;
      } else if (passIdx.length) {
        var j = passIdx[Math.floor(Math.random() * passIdx.length)];
        passing[j] = false; delta = -1; desc = '弄坏任务 ' + DSH.evalTasks[j].q;
      } else { desc = '无可用改动(全对)'; }
      var real = score();
      var reported = real;
      // 作弊模式:弄坏了任务却报告满分
      var faked = cheat && delta < 0 && Math.random() < 0.7;
      if (faked) reported = DSH.evalTasks.length;
      var verdict;
      if (faked && sentinel) {
        passing = before;
        verdict = '<span class="warn2">哨兵拦截:报告 ' + reported + '/7 但轨迹显示没真跑 → 按作弊回滚</span>';
      } else if (reported >= baseline) {
        if (faked) {
          baseline = reported;
          verdict = '<span class="warn2">保留(被骗过):报告 ' + reported + '/7,实测只有 ' + real + '/7——基线被污染成 ' + baseline + ',此后真改动也难达标</span>';
        } else {
          baseline = reported;
          verdict = '<span class="ok3">保留:实测 ' + reported + '/7 ≥ 基线,新基线 ' + baseline + '</span>';
        }
      } else {
        passing = before;
        verdict = '<span class="warn2">回滚:报告 ' + reported + '/7 < 基线 ' + baseline + ',改动撤销</span>';
      }
      logLine('v' + ver + ' 注入自改:{' + desc + '} → 报告 ' + reported + '/7 实测 ' + real + '/7 → ' + verdict);
      renderTasks();
      $('#egResult').textContent = '基线 ' + baseline + '/7';
    }
    $('#egRun').addEventListener('click', roll);
    $('#egAuto').addEventListener('click', function () { var n = 0; var t = setInterval(function () { roll(); if (++n >= 5) clearInterval(t); }, reducedMotion ? 10 : 350); });
    $('#egCheat').addEventListener('click', function () { cheat = !cheat; this.classList.toggle('on2', cheat); this.setAttribute('aria-checked', cheat ? 'true' : 'false'); });
    $('#egSent').addEventListener('click', function () { sentinel = !sentinel; this.classList.toggle('on2', sentinel); this.setAttribute('aria-checked', sentinel ? 'true' : 'false'); });
    var swCheat = buttonize($('#egCheat'), 'switch'); keyActivate(swCheat);
    var swSent = buttonize($('#egSent'), 'switch'); keyActivate(swSent);
    swCheat.classList.add('on2'); swCheat.setAttribute('aria-checked', 'true');
    swSent.setAttribute('aria-checked', 'false');
    $('#egReset').addEventListener('click', function () {
      passing = [true, true, true, true, true, false, false]; baseline = 5; ver = 0;
      $('#egLog').innerHTML = '当前版本 v0:能对 5/7 任务(基线 5 分)。注入自改后跑评测:报告分 ≥ 基线则保留,否则回滚。';
      $('#egResult').textContent = '';
      renderTasks();
    });
    renderTasks();
  }

  /* ---------- 实战项目:自改评测管线 ---------- */
  function buildEvalProject() {
    var host = $('#evalProjectList');
    if (!host) return;
    DSH.evalProject.forEach(function (ph, i) {
      var card = el('div', 'card flat proj-card');
      card.innerHTML =
        '<div class="pj-head"><span class="pj-phase">' + esc(ph.phase) + '</span><span class="pj-icon">' + icon(ph.icon, 16) + '</span><h3>' + esc(ph.t) + '</h3></div>' +
        '<p class="pj-goal">' + esc(ph.goal) + '</p>' +
        '<ol class="pj-steps">' + ph.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<div class="exp-verify">验收:' + esc(ph.check) + '</div>';
      host.appendChild(card);
    });
  }

  /* ---------- 包版图探索器 ---------- */
  function buildPkgExplorer() {
    var host = $('#pkgExplorer');
    if (!host) return;
    var bucket = 'all', query = '', expanded = {};
    host.innerHTML =
      '<div class="chips" id="pkgBuckets"></div>' +
      '<div class="searchbar">' + icon('boxes', 16) +
        '<input id="pkgSearch" type="search" placeholder="搜索包名或分组,如 agent-loop、session、tool-…" autocomplete="off" aria-label="搜索包名或分组">' +
        '<span class="cnt" id="pkgCount"></span>' +
      '</div>' +
      '<div id="pkgGroups"></div>' +
      '<div class="snap-note muted small">' + esc((DSH.meta && DSH.meta.note) || '') + '</div>';
    // 同名包可能出现在不同分组(如 protocol、web)——收集后用于消歧标记
    var nameCnt = {};
    DSH.packageGroups.forEach(function (g) {
      g.pkgs.forEach(function (p) { nameCnt[p] = (nameCnt[p] || 0) + 1; });
    });
    var chipBox = $('#pkgBuckets');
    DSH.buckets.forEach(function (b) {
      var ch = el('button', 'chip' + (b.id === bucket ? ' on' : ''), b.name);
      ch.dataset.b = b.id;
      ch.addEventListener('click', function () {
        bucket = b.id;
        $$('#pkgBuckets .chip').forEach(function (x) { x.classList.toggle('on', x.dataset.b === bucket); });
        render();
      });
      chipBox.appendChild(ch);
    });
    $('#pkgSearch').addEventListener('input', function (e) { query = e.target.value.trim().toLowerCase(); render(); });
    function render() {
      var box = $('#pkgGroups');
      box.innerHTML = '';
      var gCount = 0, pCount = 0;
      DSH.packageGroups.forEach(function (g) {
        if (bucket !== 'all' && g.bucket !== bucket) return;
        var hits = g.pkgs.filter(function (p) { return !query || p.toLowerCase().indexOf(query) >= 0; });
        var groupMatch = !query || g.id.toLowerCase().indexOf(query) >= 0 || g.role.toLowerCase().indexOf(query) >= 0;
        if (query && hits.length === 0 && !groupMatch) return;
        gCount++;
        var shown = query && hits.length > 0 ? hits : g.pkgs;
        pCount += shown.length;
        var card = el('div', 'card flat pkg-group');
        var head = buttonize(el('div', 'pg-head'),
          '<span class="pg-name">packages/' + g.id + '/</span>' +
          '<span class="pg-role">' + g.role + '</span>' +
          '<span class="pg-cnt">' + g.pkgs.length + ' 包</span>');
        head.setAttribute('aria-expanded', expanded[g.id] ? 'true' : 'false');
        head.setAttribute('aria-label', '展开/收起 ' + g.id + ' 分组');
        keyActivate(head);
        card.appendChild(head);
        var list = el('div', 'pkg-list');
        var limit = (expanded[g.id] || query) ? shown.length : Math.min(shown.length, 10);
        shown.slice(0, limit).forEach(function (p) {
          var dup = nameCnt[p] > 1;
          var pill = el('span', 'pkg-pill' + (query && p.toLowerCase().indexOf(query) >= 0 ? ' hit' : '') + (dup ? ' dup' : ''),
            esc(p) + (dup ? '<sup class="dup-n">×' + nameCnt[p] + '</sup>' : ''));
          pill.title = 'packages/' + g.id + '/' + p + (dup ? ' — 同名包存在于多个分组,按路径区分' : '');
          list.appendChild(pill);
        });
        if (limit < shown.length) {
          var more = buttonize(el('span', 'pkg-pill more', '+' + (shown.length - limit) + ' 更多…'));
          more.addEventListener('click', function () { expanded[g.id] = true; render(); });
          keyActivate(more);
          list.appendChild(more);
        } else if (!query && g.pkgs.length > 10 && expanded[g.id]) {
          var less = buttonize(el('span', 'pkg-pill more', '收起'));
          less.addEventListener('click', function () { delete expanded[g.id]; render(); });
          keyActivate(less);
          list.appendChild(less);
        }
        head.addEventListener('click', function () {
          if (expanded[g.id]) delete expanded[g.id]; else expanded[g.id] = true;
          render();
        });
        card.appendChild(list);
        box.appendChild(card);
      });
      $('#pkgCount').textContent = gCount + ' 组 · ' + pCount + ' 包';
      if (!gCount) box.appendChild(el('div', 'p-empty', '没有匹配项 —— 换个关键词试试？'));
    }
    render();
  }

  /* ---------- 工具目录探索器 ---------- */
  function buildToolExplorer() {
    var host = $('#toolExplorer');
    if (!host) return;
    var cat = 'all', query = '';
    host.innerHTML =
      '<div class="chips" id="toolCats"></div>' +
      '<div class="searchbar">' + icon('wrench', 16) +
        '<input id="toolSearch" type="search" placeholder="搜索工具名或包名,如 bash、terminal、web_search…" autocomplete="off" aria-label="搜索工具">' +
        '<span class="cnt" id="toolCount"></span>' +
      '</div>' +
      '<div class="grid cols3" id="toolGrid"></div>';
    var chipBox = $('#toolCats');
    DSH.toolCats.forEach(function (c) {
      var ch = el('button', 'chip' + (c.id === cat ? ' on' : ''), c.name);
      ch.dataset.c = c.id;
      ch.addEventListener('click', function () {
        cat = c.id;
        $$('#toolCats .chip').forEach(function (x) { x.classList.toggle('on', x.dataset.c === cat); });
        render();
      });
      chipBox.appendChild(ch);
    });
    $('#toolSearch').addEventListener('input', function (e) { query = e.target.value.trim().toLowerCase(); render(); });
    function render() {
      var grid = $('#toolGrid');
      grid.innerHTML = '';
      var n = 0;
      DSH.tools.forEach(function (t) {
        if (cat !== 'all' && t.c !== cat) return;
        if (query && (t.n + ' ' + t.p + ' ' + t.d).toLowerCase().indexOf(query) < 0) return;
        n++;
        var card = el('div', 'card toolcard');
        card.innerHTML = '<div class="tc-name">' + esc(t.n) + '</div><div class="tc-pkg">@deepseek-ai/' + esc(t.p) + '</div><p>' + esc(t.d) + '</p>';
        grid.appendChild(card);
      });
      $('#toolCount').textContent = n + ' 项';
      if (!n) grid.appendChild(el('div', 'p-empty', '没有匹配的工具'));
    }
    render();
  }

  /* ---------- 规范卡片与防御模式 ---------- */
  function buildRules() {
    var host = $('#ruleCards');
    if (host) {
      DSH.rules.forEach(function (grp) {
        host.appendChild(el('h3', '', grp.g));
        var grid = el('div', 'grid cols2');
        grp.items.forEach(function (r, i) {
          var c = el('div', 'card rule-card reveal d' + (i % 2 + 1));
          c.innerHTML = '<h3><span class="rc-ic">' + icon('ruler', 15) + '</span>' + r.t + '</h3><p>' + r.d + '</p>';
          grid.appendChild(c);
        });
        host.appendChild(grid);
      });
    }
    var def = $('#defPatterns');
    if (def) {
      DSH.defensive.forEach(function (d) {
        var det = el('details', 'acc');
        det.innerHTML = '<summary>' + d.t + '</summary><div class="acc-body">' + d.d + '</div>';
        def.appendChild(det);
      });
    }
  }

  /* ---------- 命令速查 ---------- */
  function buildCommands() {
    var host = $('#cmdTable');
    if (!host) return;
    var groups = [];
    DSH.commands.forEach(function (c) { if (groups.indexOf(c.g) < 0) groups.push(c.g); });
    groups.forEach(function (g) {
      host.appendChild(el('h3', '', g));
      var wrap = el('div', 'tbl-wrap');
      var tbl = el('table', 'tbl');
      tbl.innerHTML = '<thead><tr><th style="width:44%">命令</th><th>说明</th><th style="width:64px"></th></tr></thead>';
      var tb = el('tbody');
      DSH.commands.filter(function (c) { return c.g === g; }).forEach(function (c) {
        var tr = el('tr', '', '<td><code>' + esc(c.c) + '</code></td><td class="muted">' + esc(c.d) + '</td><td></td>');
        var btn = el('button', 'btn small', '复制');
        btn.addEventListener('click', function () { copyText(c.c, btn); });
        tr.lastChild.appendChild(btn);
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      wrap.appendChild(tbl);
      host.appendChild(wrap);
    });
    var dm = $('#docmapGrid');
    if (dm) {
      DSH.docmap.forEach(function (d, i) {
        var c = el('div', 'card reveal d' + (i % 3 + 1));
        c.innerHTML = '<div class="tc-name" style="font-family:var(--mono);font-size:.86rem;color:var(--cyan)">' + esc(d.f) + '</div><p>' + esc(d.d) + '</p>';
        dm.appendChild(c);
      });
    }
  }

  /* ---------- 术语表 ---------- */
  function buildGlossary() {
    var host = $('#glossaryList');
    if (!host) return;
    function render(q) {
      host.innerHTML = '';
      var n = 0;
      var needle = (q || '').trim().toLowerCase();
      DSH.glossary.forEach(function (g) {
        var hay = (g.t + ' ' + g.en + ' ' + g.d).toLowerCase();
        if (needle && hay.indexOf(needle) < 0) return;
        n++;
        var item = el('div', 'gloss-item');
        function hl(text) {
          var safe = esc(text);
          if (!needle) return safe;
          try {
            var re = new RegExp('(' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
            return safe.replace(re, '<mark>$1</mark>');
          } catch (e) { return safe; }
        }
        item.innerHTML = '<span class="g-term">' + hl(g.t) + '</span><span class="g-en">' + hl(g.en) + '</span>' +
          '<div class="g-def">' + hl(g.d) + '</div><div class="g-src">来源：' + esc(g.src) + '</div>';
        host.appendChild(item);
      });
      var cnt = $('#glossCount');
      if (cnt) cnt.textContent = n + ' 条';
      if (!n) host.appendChild(el('div', 'p-empty', '没有匹配的术语'));
    }
    var input = $('#glossSearch');
    if (input) input.addEventListener('input', function (e) { render(e.target.value); });
    render('');
    glossFilter = function (q) { if (input) { input.value = q; } render(q); };
  }
  // 术语表过滤入口;命令面板跳转后调用
  var glossFilter = function () {};

  /* ---------- 测验 ---------- */
  function buildQuiz() {
    var host = $('#quizBox');
    if (!host) return;
    var i = 0, score = 0, results = [];
    function renderQ() {
      var q = DSH.quiz[i];
      host.innerHTML = '';
      var dots = el('div', 'quiz-progress');
      DSH.quiz.forEach(function (_, k) {
        dots.appendChild(el('div', 'qp-dot' + (k < results.length ? (results[k] ? ' done4' : ' bad') : k === i ? ' cur' : '')));
      });
      host.appendChild(dots);
      host.appendChild(el('div', 'quiz-q', '<span class="qn">Q' + (i + 1) + '/' + DSH.quiz.length + '</span>' + esc(q.q)));
      var opts = el('div', 'quiz-opts');
      var letters = ['A', 'B', 'C', 'D'];
      q.o.forEach(function (o, k) {
        var b = el('button', 'quiz-opt', '<span class="ol">' + letters[k] + '</span><span>' + esc(o) + '</span>');
        b.addEventListener('click', function () { answer(k, opts); });
        opts.appendChild(b);
      });
      host.appendChild(opts);
    }
    function answer(k, opts) {
      var q = DSH.quiz[i];
      var right = k === q.a;
      results.push(right);
      if (right) score++;
      $$('.quiz-opt', opts).forEach(function (b, idx2) {
        b.disabled = true;
        if (idx2 === q.a) b.classList.add('right');
        else if (idx2 === k) b.classList.add('wrong');
        else b.classList.add('dim2');
      });
      var ex = el('div', 'quiz-explain', (right ? '<b style="color:var(--green)">回答正确。</b>' : '<b style="color:var(--rose)">不对。</b>正确答案是 ' + ['A', 'B', 'C', 'D'][q.a] + '。') + ' ' + esc(q.e));
      host.appendChild(ex);
      var nx = el('button', 'btn primary', i < DSH.quiz.length - 1 ? '下一题 →' : '查看成绩 🏁');
      nx.style.marginTop = '16px';
      nx.addEventListener('click', function () {
        var dot = $$('.qp-dot')[i];
        if (dot) dot.className = 'qp-dot ' + (results[i] ? 'done4' : 'bad');
        if (i < DSH.quiz.length - 1) { i++; renderQ(); } else { renderFinal(); }
      });
      host.appendChild(nx);
    }
    function renderFinal() {
      var pct = Math.round(score / DSH.quiz.length * 100);
      var msg =
        score >= 11 ? '完美！你已经把 DSH 的骨架摸透了 —— 去读源码吧。' :
        score >= 9 ? '很棒！核心概念已经牢固,查漏补缺即可。' :
        score >= 6 ? '有模有样。建议回看《Agent Loop》与《会话与持久化》两章。' :
        '万丈高楼平地起 —— 从《Cordis 核心》重新开始,边玩模拟器边记。';
      if (store.best < score) { store.best = score; }
      store.done.quiz = true;
      save(); refreshNav();
      host.innerHTML = '<div class="quiz-final">' +
        '<div class="score">' + score + ' / ' + DSH.quiz.length + '</div>' +
        '<p class="lead" style="margin:6px 0 4px">正确率 ' + pct + '% · 历史最佳 ' + store.best + ' 题</p>' +
        '<p class="muted">' + msg + '</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap">' +
        '<button class="btn primary" id="quizRetry">再来一次</button>' +
        '<a class="btn" href="#/glossary">回顾术语表</a></div></div>';
      $('#quizRetry').addEventListener('click', function () { i = 0; score = 0; results = []; renderQ(); });
    }
    renderQ();
  }

  /* ---------- 剪贴板 ---------- */
  function copyText(text, btn) {
    function ok() {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = '✓ 已复制';
      btn.classList.add('ok2');
      setTimeout(function () { btn.textContent = old; btn.classList.remove('ok2'); }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); }
      catch (err) { /* copyDenied: 浏览器禁止时静默失败 */ }
      document.body.removeChild(ta);
    }
  }
  /* ---------- 隐藏页:刷题笔记(#/lc,口令加密,localStorage 存密文) ---------- */
  // 威胁模型:防"拿到这个 origin 存储/导出的密文"的人——AES-GCM 密文 + PBKDF2 口令派生密钥,不落明文。
  // 防不了"正在用这台已解锁浏览器的人",也防不了改源码的人——静态站没有服务端,这是上限。
  var LC = { key: null, notes: [], sel: null, salt: null };
  var LC_KEY = 'lc-notes-v1';
  var te = new TextEncoder(), td = new TextDecoder();
  // 分块 base64:整包密文可能上百 KB,String.fromCharCode.apply(null, 大数组) 会撞参数上限 RangeError
  function b64e(buf) {
    var u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf), s = '', CH = 0x8000;
    for (var i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    return btoa(s);
  }
  function b64d(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function lcStore() {
    try { return JSON.parse(localStorage.getItem(LC_KEY) || 'null'); } catch (e) { return null; }
  }
  // 落盘形状:{salt, verify, payload};payload = 整个 notes 数组的 AES-GCM 密文,明文只存在内存里
  // 返回 true/false,不吞异常:调用方据它决定能否提示"已保存"——配额满/加密失败必须让上层知道,否则静默丢数据
  async function lcPersist() {
    try {
      var payload = await lcEncrypt(LC.key, JSON.stringify(LC.notes));
      localStorage.setItem(LC_KEY, JSON.stringify({ salt: b64e(LC.salt), verify: LC.verify, payload: payload }));
      return true;
    } catch (e) { return false; }
  }
  function lcMsg(t, isErr) { var m = $('#lcGateMsg'); if (m) { m.textContent = t; m.style.color = isErr ? 'var(--rose)' : 'var(--muted)'; } }
  async function lcDerive(pass, salt) {
    var km = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 250000, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function lcEncrypt(key, plain) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, te.encode(plain));
    return b64e(iv) + '.' + b64e(ct);
  }
  async function lcDecrypt(key, payload) {
    var p = payload.split('.');
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(p[0]) }, key, b64d(p[1]));
    return td.decode(pt);
  }
  // 校验口令并载入:解密 verify 得 'ok' → 口令对;再解密 payload 得 notes。错口令 AES-GCM 直接抛异常。
  async function lcUnlockWith(pass, st) {
    try {
      var key = await lcDerive(pass, b64d(st.salt));
      if ((await lcDecrypt(key, st.verify)) !== 'ok') return null;
      LC.key = key;
      LC.salt = b64d(st.salt);                 // 同步内存 salt:导入新密文包后 persist/export 才用对
      LC.notes = st.payload ? JSON.parse(await lcDecrypt(key, st.payload)) : [];
      return key;
    } catch (e) { return null; }
  }
  function lcShow(main) {
    $('#lcGate').hidden = main;
    $('#lcMain').hidden = !main;
    if (main) renderLcList();
  }
  function lcGateMode(setup) {
    $('#lcPass2').style.display = setup ? '' : 'none';
    $('#lcUnlock').textContent = setup ? '设口令并解锁' : '解锁';
    $('#lcGateInfo').innerHTML = setup
      ? '<span class="t">首次使用:设一个口令</span>口令只存在你脑子里——不落盘、不上传,丢失无法找回。它是加密密钥的源头。数据存本浏览器 localStorage;换浏览器/设备用「导出」搬密文,口令不变即可解开。'
      : '<span class="t">已加密</span>输入口令解锁。内容是 AES-GCM 密文,口令经 PBKDF2 派生密钥。';
  }
  function renderLcList() {
    var q = ($('#lcSearch').value || '').toLowerCase();
    var box = $('#lcList');
    box.innerHTML = '';
    var list = LC.notes.filter(function (n) {
      if (!q) return true;
      return (n.num + ' ' + n.title + ' ' + n.tags + ' ' + n.idea).toLowerCase().indexOf(q) >= 0;
    });
    $('#lcCount').textContent = '共 ' + LC.notes.length + ' 题' + (q ? ' · 命中 ' + list.length : '');
    list.forEach(function (n) {
      var b = el('button', 'lc-item' + (LC.sel === n.id ? ' sel' : ''));
      b.innerHTML = '<span class="li-top"><span class="li-num">' + esc(n.num || '—') + '</span>' +
        '<span class="li-title">' + esc(n.title || '(未命名)') + '</span>' +
        '<span class="li-diff ' + esc(n.diff) + '">' + esc(n.diff) + '</span></span>' +
        (n.tags ? '<span class="li-tags">' + esc(n.tags) + '</span>' : '');
      b.addEventListener('click', function () { LC.sel = n.id; fillLcEditor(n); renderLcList(); });
      box.appendChild(b);
    });
  }
  function fillLcEditor(n) {
    $('#lcEmpty').hidden = true;
    $('#lcEditor').hidden = false;
    $('#lcNum').value = n.num || ''; $('#lcTitle').value = n.title || '';
    $('#lcDiff').value = n.diff || 'Medium'; $('#lcTags').value = n.tags || '';
    $('#lcLink').value = n.link || ''; $('#lcIdea').value = n.idea || '';
    $('#lcCode').value = n.code || ''; $('#lcNote').value = n.note || '';
    $('#lcSavedHint').textContent = '';
  }
  function buildLC() {
    if (!$('#ch-lc')) return;
    // WebCrypto 只在 secure context 可用;file:// 多数浏览器算,但旧内核/个别浏览器不一定 → 明确提示而非静默失败
    if (!window.crypto || !window.crypto.subtle) {
      $('#lcGateInfo').innerHTML = '<span class="t">当前环境不支持加密</span>这个页面需要 WebCrypto(secure context)。请用 <code>python -m http.server</code> 起本地服务后经 http://127.0.0.1 访问,或换新版 Chrome/Firefox/Safari 打开。';
      $('#lcPass').disabled = $('#lcPass2').disabled = $('#lcUnlock').disabled = true;
      return;
    }
    var st = lcStore();
    var setup = !st || !st.payload;          // 无存储或无密文 → 设口令模式;初始化快照,设密成功后即置 false
    if (st && st.salt) { LC.salt = b64d(st.salt); LC.verify = st.verify; }
    lcGateMode(setup);
    lcShow(false);

    $('#lcUnlock').addEventListener('click', async function () {
      var p1 = $('#lcPass').value;
      if (setup) {
        if (p1.length < 10) { lcMsg('口令至少 10 位——它是加密密钥的源头,太短能被离线穷举', true); return; }
        if (p1 !== $('#lcPass2').value) { lcMsg('两遍口令不一致', true); return; }
        LC.salt = crypto.getRandomValues(new Uint8Array(16));
        LC.key = await lcDerive(p1, LC.salt);
        LC.verify = await lcEncrypt(LC.key, 'ok');   // 校验密文:下次验证口令用
        LC.notes = [];
        if (!(await lcPersist())) { lcMsg('写入 localStorage 失败(配额/隐私模式?),未建立存储', true); return; }
        setup = false; lcShow(true); lcMsg('');
      } else {
        // 每次解锁重读最新密文:不用捕获的 st(可能是设密前的空快照),否则丢本次保存
        if (!(await lcUnlockWith(p1, lcStore()))) { lcMsg('口令不对', true); return; }
        lcShow(true); lcMsg('');
      }
    });
    $('#lcPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#lcUnlock').click(); });
    $('#lcPass2').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#lcUnlock').click(); });

    $('#lcNew').addEventListener('click', function () {
      var n = { id: 'n' + Date.now(), num: '', title: '', diff: 'Medium', tags: '', link: '', idea: '', code: '', note: '' };
      LC.notes.unshift(n); LC.sel = n.id; fillLcEditor(n); renderLcList(); $('#lcTitle').focus();
    });
    $('#lcSave').addEventListener('click', async function () {
      var n = LC.notes.find(function (x) { return x.id === LC.sel; });
      if (!n) return;
      n.num = $('#lcNum').value.trim(); n.title = $('#lcTitle').value.trim();
      n.diff = $('#lcDiff').value; n.tags = $('#lcTags').value.trim();
      n.link = $('#lcLink').value.trim(); n.idea = $('#lcIdea').value;
      n.code = $('#lcCode').value; n.note = $('#lcNote').value;
      if (!(await lcPersist())) { $('#lcSavedHint').textContent = '写入失败(存储配额满?),数据未落盘'; return; }
      renderLcList();
      $('#lcSavedHint').textContent = '已保存(密文落盘) ' + new Date().toLocaleTimeString();
    });
    $('#lcDel').addEventListener('click', async function () {
      var i = LC.notes.findIndex(function (x) { return x.id === LC.sel; });
      if (i < 0 || !confirm('删掉这题?密文一并清除,不可恢复。')) return;
      var removed = LC.notes.splice(i, 1)[0];
      if (!(await lcPersist())) {
        // 落盘失败 → 内存里放回原索引、恢复选中,不当成已删;否则 UI 与磁盘不一致
        LC.notes.splice(i, 0, removed); LC.sel = removed.id;
        $('#lcSavedHint').textContent = '写入失败,删除未落盘';
        renderLcList(); return;
      }
      LC.sel = null;
      $('#lcEditor').hidden = true; $('#lcEmpty').hidden = false; renderLcList();
    });
    $('#lcSearch').addEventListener('input', renderLcList);
    $('#lcLock').addEventListener('click', function () {
      LC.key = null; LC.sel = null; LC.notes = []; $('#lcPass').value = ''; $('#lcPass2').value = '';
      lcGateMode(false); lcShow(false);
    });
    // 导出:落的是 {salt, verify, payload}——payload 是整包密文,口令不变即可在别处导入解开
    $('#lcExport').addEventListener('click', async function () {
      var payload = await lcEncrypt(LC.key, JSON.stringify(LC.notes));
      var blob = new Blob([JSON.stringify({ salt: b64e(LC.salt), verify: LC.verify, payload: payload }, null, 2)], { type: 'application/json' });
      var a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'leetcode-notes.enc.json'; a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#lcImport').addEventListener('click', function () { $('#lcImportFile').click(); });
    $('#lcImportFile').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          if (!d.salt || !d.verify || !d.payload) throw new Error('bad');
          // 导入的是密文包:替换本地存储,回到锁定态,用原口令解锁
          localStorage.setItem(LC_KEY, JSON.stringify({ salt: d.salt, verify: d.verify, payload: d.payload }));
          st = d; LC.salt = b64d(d.salt); LC.verify = d.verify; LC.key = null; LC.notes = []; LC.sel = null;
          lcGateMode(false); lcShow(false); lcMsg('已导入密文包,输入原口令解锁。');
        } catch (e) { lcMsg('文件不是有效的导出格式', true); }
      };
      r.readAsText(f); this.value = '';
    });
  }

  function buildCodeblocks() {
    $$('.codeblock').forEach(function (cb) {
      var pre = $('pre', cb);
      if (!pre) return;
      var btn = el('button', 'copybtn', '复制');
      btn.addEventListener('click', function () { copyText(pre.textContent.replace(/\n$/, ''), btn); });
      cb.appendChild(btn);
      highlight(pre);
    });
  }

  /* ---------- 轻量语法高亮(仅适用于本站自带片段) ---------- */
  function highlight(pre) {
    var lang = pre.dataset.lang || '';
    var lines = pre.textContent.split('\n');
    var out = lines.map(function (line) {
      var safe = esc(line);
      if (lang === 'sh') {
        if (/^\s*#/.test(line)) return '<span class="tok-c">' + safe + '</span>';
        safe = safe.replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="tok-s">$1</span>');
        safe = safe.replace(/^(\s*)(pnpm|npx|dsh|git|node|corepack|cd)(\s|$)/, '$1<span class="tok-cmd">$2</span>$3');
        safe = safe.replace(/(\s)(#.*)$/, '$1<span class="tok-c">$2</span>');
        return safe;
      }
      if (lang === 'yaml') {
        if (/^\s*#/.test(line)) return '<span class="tok-c">' + safe + '</span>';
        safe = safe.replace(/^(\s*-?\s*)([\w.-]+)(:)/, '$1<span class="tok-k">$2</span>$3');
        safe = safe.replace(/(!!js)/g, '<span class="tok-n">$1</span>');
        safe = safe.replace(/(\s)(#.*)$/, '$1<span class="tok-c">$2</span>');
        return safe;
      }
      if (lang === 'ts') {
        var m = safe.match(/^(.*?)(\/\/.*)$/);
        var code = m ? m[1] : safe, comment = m ? '<span class="tok-c">' + m[2] + '</span>' : '';
        code = code.replace(/(&#39;.*?&#39;|'.*?')/g, '<span class="tok-s">$1</span>');
        code = code.replace(/\b(export|const|function|return|import|from|interface|async|await|if|new|typeof)\b/g, '<span class="tok-k">$1</span>');
        code = code.replace(/\b(ctx|agent|next)\b/g, '<span class="tok-f">$1</span>');
        return code + comment;
      }
      if (lang === 'log') {
        safe = safe.replace(/^([\w/-]+\/[\w-]+)/, '<span class="tok-cmd">$1</span>');
        safe = safe.replace(/(#.*)$/, '<span class="tok-c">$1</span>');
        return safe;
      }
      return safe;
    }).join('\n');
    pre.innerHTML = out;
  }

  /* ---------- 命令面板(Ctrl/Cmd+K) ---------- */
  var palette = { open: false, items: [], sel: 0 };
  function paletteIndex() {
    var ix = [];
    DSH.chapters.forEach(function (c) {
      ix.push({ type: '章节', label: c.title, sub: c.blurb, body: ($('#ch-' + c.id) || {}).textContent || '', act: function () { go(c.id); } });
    });
    DSH.glossary.forEach(function (g) {
      ix.push({ type: '术语', label: g.t + ' (' + g.en + ')', sub: g.d.slice(0, 40) + '…', act: function () { go('glossary'); setTimeout(function () { glossFilter(g.en.split(' ')[0]); }, 60); } });
    });
    DSH.packageGroups.forEach(function (g) {
      g.pkgs.forEach(function (p) {
        ix.push({ type: '包', label: p, sub: 'packages/' + g.id + '/', act: function () { go('packages'); setTimeout(function () { var s = $('#pkgSearch'); if (s) { s.value = p; s.dispatchEvent(new Event('input')); } }, 60); } });
      });
    });
    DSH.tools.forEach(function (t) {
      ix.push({ type: '工具', label: t.n, sub: t.p, act: function () { go('tools'); setTimeout(function () { var s = $('#toolSearch'); if (s) { s.value = t.n.split(' ')[0]; s.dispatchEvent(new Event('input')); } }, 60); } });
    });
    DSH.commands.forEach(function (c) {
      ix.push({ type: '命令', label: c.c, sub: c.d, act: function () { go('workflow'); } });
    });
    return ix;
  }
  function openPalette() {
    if (palette.open) return;
    palette.open = true;
    palette.items = palette.items.length ? palette.items : paletteIndex();
    var mask = el('div', 'palette-mask');
    mask.id = 'paletteMask';
    mask.innerHTML = '<div class="palette" role="dialog" aria-modal="true" aria-label="全局搜索"><div class="p-in">' + icon('book', 16) +
      '<input id="paletteInput" type="search" placeholder="搜索正文、章节、术语、包、工具、命令…" autocomplete="off" aria-label="全局搜索">' +
      '<span class="kbd">Esc</span></div><div class="p-results" id="paletteResults" role="listbox"></div></div>';
    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) closePalette(); });
    var input = $('#paletteInput');
    input.focus();
    input.addEventListener('input', function () { palette.sel = 0; renderPalette(input.value); });
    input.addEventListener('keydown', function (e) {
      var items = $$('#paletteResults .p-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); palette.sel = Math.min(items.length - 1, palette.sel + 1); updateSel(items); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); palette.sel = Math.max(0, palette.sel - 1); updateSel(items); }
      else if (e.key === 'Enter') { var it = items[palette.sel]; if (it) it.click(); }
    });
    renderPalette('');
  }
  function updateSel(items) {
    items.forEach(function (n, i) {
      n.classList.toggle('sel', i === palette.sel);
      n.setAttribute('aria-selected', i === palette.sel ? 'true' : 'false');
    });
    var s = items[palette.sel];
    if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
  }
  function renderPalette(q) {
    var box = $('#paletteResults');
    var needle = q.trim().toLowerCase();
    var hits = [];
    for (var i = 0; i < palette.items.length && hits.length < 60; i++) {
      var it = palette.items[i];
      var hay = (it.label + ' ' + it.sub + ' ' + it.type + ' ' + (it.body || '')).toLowerCase();
      if (!needle || hay.indexOf(needle) >= 0) hits.push(it);
    }
    hits.sort(function (a, b) {
      if (!needle) return 0;
      var as = a.label.toLowerCase().indexOf(needle) === 0 ? 0 : 1;
      var bs = b.label.toLowerCase().indexOf(needle) === 0 ? 0 : 1;
      return as - bs;
    });
    hits = hits.slice(0, 14);
    box.innerHTML = '';
    if (!hits.length) { box.innerHTML = '<div class="p-empty">没有结果</div>'; return; }
    hits.forEach(function (it, i) {
      var n = buttonize(el('div', 'p-item' + (i === palette.sel ? ' sel' : ''), '<span class="p-type">' + it.type + '</span><span>' + esc(it.label) + '</span><span class="p-sub">' + esc(it.sub) + '</span>'), 'option');
      n.setAttribute('aria-selected', i === palette.sel ? 'true' : 'false');
      n.addEventListener('click', function () { closePalette(); it.act(); });
      keyActivate(n);
      box.appendChild(n);
    });
  }
  function closePalette() {
    palette.open = false;
    var m = $('#paletteMask');
    if (m) m.remove();
  }

  /* ---------- 侧栏(移动端) ---------- */
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#sideMask').classList.remove('show');
    var mb = $('#menuBtn'); if (mb) mb.setAttribute('aria-expanded', 'false');
  }
  function bindChrome() {
    $('#menuBtn').addEventListener('click', function () {
      var open = !$('#sidebar').classList.contains('open');
      $('#sidebar').classList.toggle('open', open);
      $('#sideMask').classList.toggle('show', open);
      $('#menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // 金字塔层在触屏/键盘上可点开说明(hover 之外)
    $$('.pyr-row').forEach(function (r) {
      buttonize(r);
      r.setAttribute('aria-expanded', 'false');
      r.addEventListener('click', function () {
        r.classList.toggle('open');
        r.setAttribute('aria-expanded', r.classList.contains('open') ? 'true' : 'false');
      });
      keyActivate(r);
    });
    $('#sideMask').addEventListener('click', closeSidebar);
    $('#themeBtn').addEventListener('click', function () {
      store.theme = store.theme === 'dark' ? 'light' : 'dark';
      save(); applyTheme();
    });
    $('#searchBtn').addEventListener('click', openPalette);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (palette.open) closePalette(); else openPalette(); return; }
      if (e.key === 'Escape') { closePalette(); return; }
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || palette.open) return;
      var i = DSH.chapters.findIndex(function (c) { return c.id === currentId; });
      if (e.key === 'ArrowRight' && i < DSH.chapters.length - 1) go(DSH.chapters[i + 1].id);
      if (e.key === 'ArrowLeft' && i > 0) go(DSH.chapters[i - 1].id);
    });
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme();
    buildNav();
    buildHome();
    buildRsiLevels();
    buildGodel();
    buildEvoSim();
    buildCapMap();
    buildCordis();
    buildSim();
    buildLoop();
    buildExtPicker();
    buildPkgExplorer();
    buildToolExplorer();
    buildRules();
    buildCommands();
    buildGlossary();
    buildQuiz();
    buildCarriers();
    buildSafety();
    buildExperiments();
    buildEvalTable();
    buildEvalBench();
    buildEvalGate();
    buildEvalProject();
    buildLC();
    buildFooters();
    buildCodeblocks();
    bindChrome();
    window.addEventListener('hashchange', route);
    route();
  });
})();
