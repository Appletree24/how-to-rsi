/* ============================================================
   DSH 互动学堂 — 应用逻辑(无依赖、经典脚本、支持 file:// 直接打开)
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
  function icon(name, size) {
    var s = size || 18;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + (DSH.icons[name] || DSH.icons.info) + '"/></svg>';
  }
  var CHECK_SVG = '<svg class="nav-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 持久化进度 ---------- */
  var store = { done: {}, theme: 'dark', best: -1 };
  try {
    var raw = localStorage.getItem('dsh-learn-v1');
    if (raw) { var parsed = JSON.parse(raw); if (parsed && typeof parsed === 'object') { store.done = parsed.done || {}; store.theme = parsed.theme || 'dark'; store.best = (typeof parsed.best === 'number') ? parsed.best : -1; } }
  } catch (e) { /* storageDenied: file:// 隐私模式下可能禁用,降级为不持久 */ }
  function save() {
    try { localStorage.setItem('dsh-learn-v1', JSON.stringify(store)); }
    catch (e) { /* storageDenied: 同上,忽略写入失败 */ }
  }

  var LEARN_IDS = DSH.chapters.filter(function (c) { return c.id !== 'home'; }).map(function (c) { return c.id; });

  /* ---------- 主题 ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', store.theme);
    var btn = $('#themeBtn');
    if (btn) btn.innerHTML = store.theme === 'dark'
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 14.2A8.5 8.5 0 1 1 9.8 3.6a7 7 0 1 0 10.6 10.6Z"/></svg>';
  }

  /* ---------- 导航与路由 ---------- */
  var currentId = 'home';
  function buildNav() {
    var nav = $('#navList');
    nav.innerHTML = '<h4>课程目录</h4>';
    DSH.chapters.forEach(function (c) {
      var a = el('a', 'nav-item', '');
      a.href = '#/' + c.id;
      a.dataset.ch = c.id;
      a.innerHTML = '<span class="nav-num">' + c.num + '</span><span class="nav-title">' + c.title + '</span>' + CHECK_SVG;
      nav.appendChild(a);
    });
  }
  function refreshNav() {
    $$('#navList .nav-item').forEach(function (a) {
      a.classList.toggle('active', a.dataset.ch === currentId);
      a.classList.toggle('done', !!store.done[a.dataset.ch]);
    });
    var doneCount = LEARN_IDS.filter(function (id) { return store.done[id]; }).length;
    var pct = Math.round(doneCount / LEARN_IDS.length * 100);
    var fg = $('#progressRingFg');
    if (fg) {
      var C = 2 * Math.PI * 10;
      fg.setAttribute('stroke-dasharray', C.toFixed(2));
      fg.setAttribute('stroke-dashoffset', (C * (1 - pct / 100)).toFixed(2));
    }
    var t = $('#progressPct'); if (t) t.textContent = pct + '%';
    $$('.pathcard').forEach(function (p) { p.classList.toggle('done2', !!store.done[p.dataset.ch]); });
    $$('.done-btn').forEach(function (b) {
      var on = !!store.done[b.dataset.ch];
      b.classList.toggle('is-done', on);
      b.innerHTML = on ? '✓ 已完成本章(点击撤销)' : '✓ 标记本章完成';
    });
  }
  function go(id) { location.hash = '#/' + id; }
  function route() {
    var id = (location.hash || '#/home').replace(/^#\//, '') || 'home';
    if (!DSH.chapters.some(function (c) { return c.id === id; })) id = 'home';
    currentId = id;
    $$('.chapter').forEach(function (s) { s.classList.toggle('active', s.id === 'ch-' + id); });
    document.title = (id === 'home' ? 'DSH 互动学堂' : DSH.chapters.find(function (c) { return c.id === id; }).title + ' · DSH 互动学堂');
    window.scrollTo(0, 0);
    closeSidebar();
    refreshNav();
    requestAnimationFrame(observeReveals);
  }

  /* ---------- 章节页脚(上一章/下一章/完成) ---------- */
  function buildFooters() {
    DSH.chapters.forEach(function (c, i) {
      var sec = $('#ch-' + c.id);
      if (!sec) return;
      var f = el('div', 'chapter-footer');
      if (i > 0) {
        var prev = el('a', 'btn small', '← ' + DSH.chapters[i - 1].short);
        prev.href = '#/' + DSH.chapters[i - 1].id;
        f.appendChild(prev);
      }
      f.appendChild(el('div', 'cf-spacer'));
      if (c.id !== 'home') {
        var doneBtn = el('button', 'btn small done-btn', '✓ 标记本章完成');
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

  /* ---------- 揭示动画 ---------- */
  var revealObserver = null;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(function (n) { n.classList.add('in'); }); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); } });
      }, { threshold: 0.08 });
    }
    $$('#ch-' + currentId + ' .reveal:not(.in)').forEach(function (n) { revealObserver.observe(n); });
  }

  /* ---------- 首页：统计、路径、轨道、打字机 ---------- */
  function buildHome() {
    var pkgTotal = DSH.packageGroups.reduce(function (a, g) { return a + g.pkgs.length; }, 0);
    var stats = [
      { n: DSH.chapters.length - 1, l: '互动章节', suf: '' },
      { n: DSH.packageGroups.length, l: '包分组', suf: '' },
      { n: pkgTotal, l: '工作区包', suf: '+' },
      { n: 72, l: '模型工具 schema', suf: '' },
    ];
    var row = $('#statsRow');
    stats.forEach(function (s, i) {
      var c = el('div', 'card statcard reveal d' + (i + 1));
      c.innerHTML = '<div class="bignum" data-target="' + s.n + '" data-suf="' + s.suf + '">0</div><div class="lbl">' + s.l + '</div>';
      row.appendChild(c);
    });
    // 数字滚动
    var counted = false;
    var io = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) {
        if (en.isIntersecting && !counted) {
          counted = true;
          $$('.bignum').forEach(function (b) {
            var target = parseInt(b.dataset.target, 10), suf = b.dataset.suf || '';
            if (reducedMotion) { b.textContent = target + suf; return; }
            var t0 = performance.now();
            (function tick(t) {
              var k = Math.min(1, (t - t0) / 1100);
              b.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suf;
              if (k < 1) requestAnimationFrame(tick);
            })(t0);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(row);

    var grid = $('#pathGrid');
    DSH.chapters.slice(1).forEach(function (c, i) {
      var card = el('div', 'card pathcard reveal d' + (i % 4 + 1));
      card.dataset.ch = c.id;
      card.innerHTML = '<div class="nv">' + c.num + '</div><div><h3>' + c.title + '</h3><p>' + c.blurb + '</p></div>';
      card.addEventListener('click', function () { go(c.id); });
      grid.appendChild(card);
    });

    // 轨道芯片
    var r1 = ['ctx.llm', 'ctx.tools', 'ctx.sessions', 'ctx.agents'];
    var r2 = ['ctx.fs', 'ctx.shell', 'ctx.sandbox', 'ctx.jobs', 'ctx.commands', 'ctx.webhookRuntime'];
    function fill(ringSel, names) {
      var ring = $(ringSel);
      if (!ring) return;
      names.forEach(function (nm, i) {
        var a = (360 / names.length) * i - 90;
        var rad = a * Math.PI / 180;
        var node = el('span', 'orbit-node', '<i></i>' + nm);
        node.style.left = (50 + 50 * Math.cos(rad)) + '%';
        node.style.top = (50 + 50 * Math.sin(rad)) + '%';
        node.style.marginLeft = '-40px';
        node.style.marginTop = '-13px';
        ring.appendChild(node);
      });
    }
    fill('#orbitR1', r1);
    fill('#orbitR2', r2);

    // 英雄区打字机
    var lines = [
      { t: '$ npx @deepseek-ai/dsh web', c: 't-blue' },
      { t: '  ➜ Web UI: http://127.0.0.1:3080', c: 't-dim' },
      { t: '$ pnpm dsh --profile headless "修复 CI 上失败的两个测试"', c: 't-blue' },
      { t: '  ✔ tool/result × 6 · assistant/message · turn/end', c: 't-green' },
      { t: '  会话已落盘：session.v3.jsonl — 可重放、可 fork、可导出', c: 't-y' },
    ];
    var pre = $('#heroTerm');
    if (pre) {
      if (reducedMotion) {
        pre.innerHTML = lines.map(function (l) { return '<span class="' + l.c + '">' + esc(l.t) + '</span>'; }).join('\n');
      } else {
        var li = 0, ci = 0, out = '';
        (function type() {
          if (li >= lines.length) {
            setTimeout(function () { li = 0; ci = 0; out = ''; type(); }, 6000);
            return;
          }
          var line = lines[li];
          ci++;
          var cur = out + '<span class="' + line.c + '">' + esc(line.t.slice(0, ci)) + '</span>';
          pre.innerHTML = cur + '<span class="cursor"></span>';
          if (ci >= line.t.length) {
            out = cur + '\n';
            li++; ci = 0;
            setTimeout(type, li === 2 ? 700 : 350);
          } else {
            setTimeout(type, line.t.charCodeAt(ci) > 255 ? 46 : 22);
          }
        })();
      }
    }
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
    var swEl = $('#simShort');
    swEl.addEventListener('click', function () { shortC = !shortC; swEl.classList.toggle('on2', shortC); });
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
      var card = el('div', 'loop-step');
      card.innerHTML = '<div class="ls-head"><span class="ls-num">' + (i + 1) + '</span><span class="ls-title">' + esc(s.name) + '</span><span class="badge ' + badgeCls + '" style="margin-left:auto">' + badgeTxt + '</span></div>' +
        '<div class="ls-desc"><b>' + s.title + '</b> — ' + s.desc + '</div>';
      card.addEventListener('click', function () { idx = i; stopPlay(); render(); });
      stepsBox.appendChild(card);
    });
    function render() {
      $$('#loopDots .loop-dot').forEach(function (d, i) {
        d.className = 'loop-dot' + (i < idx ? ' past' : i === idx ? ' now' : '');
      });
      $$('#loopSteps .loop-step').forEach(function (c, i) {
        c.className = 'loop-step' + (i < idx ? ' past2' : i === idx ? ' now2' : '');
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

  /* ---------- 包版图探索器 ---------- */
  function buildPkgExplorer() {
    var host = $('#pkgExplorer');
    if (!host) return;
    var bucket = 'all', query = '', expanded = {};
    host.innerHTML =
      '<div class="chips" id="pkgBuckets"></div>' +
      '<div class="searchbar">' + icon('boxes', 16) +
        '<input id="pkgSearch" type="text" placeholder="搜索包名或分组,如 agent-loop、session、tool-…" autocomplete="off">' +
        '<span class="cnt" id="pkgCount"></span>' +
      '</div>' +
      '<div id="pkgGroups"></div>';
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
        var head = el('div', 'pg-head',
          '<span class="pg-name">packages/' + g.id + '/</span>' +
          '<span class="pg-role">' + g.role + '</span>' +
          '<span class="pg-cnt">' + g.pkgs.length + ' 包</span>');
        card.appendChild(head);
        var list = el('div', 'pkg-list');
        var limit = (expanded[g.id] || query) ? shown.length : Math.min(shown.length, 10);
        shown.slice(0, limit).forEach(function (p) {
          var pill = el('span', 'pkg-pill' + (query && p.toLowerCase().indexOf(query) >= 0 ? ' hit' : ''), esc(p));
          pill.title = 'packages/' + g.id + '/' + p;
          list.appendChild(pill);
        });
        if (limit < shown.length) {
          var more = el('span', 'pkg-pill more', '+' + (shown.length - limit) + ' 更多…');
          more.addEventListener('click', function () { expanded[g.id] = true; render(); });
          list.appendChild(more);
        } else if (!query && g.pkgs.length > 10 && expanded[g.id]) {
          var less = el('span', 'pkg-pill more', '收起');
          less.addEventListener('click', function () { delete expanded[g.id]; render(); });
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
        '<input id="toolSearch" type="text" placeholder="搜索工具名或包名,如 bash、terminal、web_search…" autocomplete="off">' +
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
    window.__glossFilter = function (q) { if (input) { input.value = q; } render(q); };
  }

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
      if (score >= 10) confetti();
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
      ix.push({ type: '章节', label: c.title, sub: c.blurb, act: function () { go(c.id); } });
    });
    DSH.glossary.forEach(function (g) {
      ix.push({ type: '术语', label: g.t + ' (' + g.en + ')', sub: g.d.slice(0, 40) + '…', act: function () { go('glossary'); setTimeout(function () { if (window.__glossFilter) window.__glossFilter(g.en.split(' ')[0]); }, 60); } });
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
    mask.innerHTML = '<div class="palette"><div class="p-in">' + icon('book', 16) +
      '<input id="paletteInput" type="text" placeholder="搜索章节、术语、包、工具、命令…" autocomplete="off">' +
      '<span class="kbd">Esc</span></div><div class="p-results" id="paletteResults"></div></div>';
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
    items.forEach(function (n, i) { n.classList.toggle('sel', i === palette.sel); });
    var s = items[palette.sel];
    if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
  }
  function renderPalette(q) {
    var box = $('#paletteResults');
    var needle = q.trim().toLowerCase();
    var hits = [];
    for (var i = 0; i < palette.items.length && hits.length < 60; i++) {
      var it = palette.items[i];
      var hay = (it.label + ' ' + it.sub + ' ' + it.type).toLowerCase();
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
      var n = el('div', 'p-item' + (i === palette.sel ? ' sel' : ''), '<span class="p-type">' + it.type + '</span><span>' + esc(it.label) + '</span><span class="p-sub">' + esc(it.sub) + '</span>');
      n.addEventListener('click', function () { closePalette(); it.act(); });
      box.appendChild(n);
    });
  }
  function closePalette() {
    palette.open = false;
    var m = $('#paletteMask');
    if (m) m.remove();
  }

  /* ---------- 彩带 ---------- */
  function confetti() {
    if (reducedMotion) return;
    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99';
    cv.width = innerWidth; cv.height = innerHeight;
    document.body.appendChild(cv);
    var ctx2 = cv.getContext('2d');
    var colors = ['#4d6bfe', '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#fb7185'];
    var parts = [];
    for (var i = 0; i < 160; i++) {
      parts.push({
        x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4,
        vx: (Math.random() - 0.5) * 2.4, vy: 2 + Math.random() * 3.2,
        s: 4 + Math.random() * 6, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.24,
        c: colors[i % colors.length],
      });
    }
    var t0 = performance.now();
    (function frame(t) {
      ctx2.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.r);
        ctx2.fillStyle = p.c; ctx2.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        ctx2.restore();
      });
      if (t - t0 < 3200) requestAnimationFrame(frame);
      else cv.remove();
    })(t0);
  }

  /* ---------- 侧栏(移动端)与滚动进度 ---------- */
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#sideMask').classList.remove('show');
  }
  function bindChrome() {
    $('#menuBtn').addEventListener('click', function () {
      $('#sidebar').classList.toggle('open');
      $('#sideMask').classList.toggle('show');
    });
    $('#sideMask').addEventListener('click', closeSidebar);
    $('#themeBtn').addEventListener('click', function () {
      store.theme = store.theme === 'dark' ? 'light' : 'dark';
      save(); applyTheme();
    });
    $('#searchBtn').addEventListener('click', openPalette);
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      $('#scrollProgress').style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + '%';
    }, { passive: true });
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
    buildFooters();
    buildCodeblocks();
    bindChrome();
    window.addEventListener('hashchange', route);
    route();
  });
})();
