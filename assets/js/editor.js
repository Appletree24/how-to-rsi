/* 就地编辑：开启后正文段落/标题/表格单元格可直接改，保存时把修改写回 index.html。
   原理：本脚本在所有渲染脚本之前执行，先存一份未渲染的 DOM 快照；进入编辑模式时
   用"结构路径 + outerHTML 全等"把每个可编辑元素绑定到快照里的对应节点——JS 渲染
   出来的内容在快照里不存在，天然不可编辑；保存时把脏元素的 innerHTML 写回快照，
   序列化后用 File System Access API 覆盖原文件（不支持则下载副本）。 */
(function () {
  'use strict';

  var SNAPSHOT = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

  /* 可编辑的元素类型（仅限正文 prose；小组件由 data.js 渲染，快照里没有对应节点） */
  var SEL = 'main h1, main h2, main h3, main h4, main p, main li, main td, main th, main summary';
  var SKIP = 'script, style, pre, code, svg, noscript, .searchbar, .quiz-box, input, button';

  var state = {
    on: false,
    dirty: new Set(),
    bound: new Map(),   // live element -> path array
    handle: null,
  };

  /* 元素相对 <main> 的结构路径：tag + 同名兄弟序号 */
  function pathOf(el) {
    var parts = [];
    for (var n = el; n && n.tagName !== 'MAIN'; n = n.parentElement) {
      var tag = n.tagName, idx = 0, sib = n;
      while ((sib = sib.previousElementSibling)) if (sib.tagName === tag) idx++;
      parts.push(tag + '#' + idx);
    }
    return parts.reverse();
  }
  function resolve(doc, parts) {
    var node = doc.querySelector('main');
    if (!node) return null;
    for (var i = 0; i < parts.length; i++) {
      var seg = parts[i].split('#'), tag = seg[0], idx = +seg[1];
      var kids = node.children, k = -1, found = null;
      for (var j = 0; j < kids.length; j++) {
        if (kids[j].tagName === tag && ++k === idx) { found = kids[j]; break; }
      }
      if (!found) return null;
      node = found;
    }
    return node;
  }
  function isEditable(el) {
    return el.matches(SEL) && !el.closest(SKIP) && !el.isContentEditable;
  }

  /* 进入编辑模式：为每个候选元素在快照里找 outerHTML 全等的源节点；
     已绑定过的元素（含未保存的修改）保留原路径，仍然可改可存 */
  function bindAll() {
    var doc0 = new DOMParser().parseFromString(SNAPSHOT, 'text/html');
    document.querySelectorAll(SEL).forEach(function (el) {
      if (state.bound.has(el)) return;
      if (!isEditable(el)) return;
      var p = pathOf(el), src = resolve(doc0, p);
      if (src && src.outerHTML === el.outerHTML) state.bound.set(el, p);
    });
  }

  var bar, statusEl;
  /* ---------- 入口门槛：只有"本人"能看到编辑按钮 ----------
     静态站点做不了真权限，这里是"隐藏入口"：
     · localhost / 127.x / file:// 直接显示
     · 已授权的浏览器(localStorage)直接显示
     · 其余访客：在页面任意处连按 "edit" 四个字母，授权并显示
     · URL 带 ?edit 也可(分享给本机调试) */
  var KEY = 'rsi-edit-enabled';
  function localHost() {
    var h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '' ||
           /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
  }
  function granted() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function gate() {
    if (granted() || localHost() || /[?&]edit\b/.test(location.search)) return true;
    return false;
  }

  /* 暗号：页面空白处依次敲 e-d-i-t → 授权并显示按钮(再敲一遍撤销) */
  var seq = '';
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key && e.key.length === 1) {
      seq = (seq + e.key.toLowerCase()).slice(-4);
      if (seq === 'edit') {
        var on = !granted();
        try { on ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (err) {}
        var btn = document.querySelector('.edit-toggle');
        if (btn) btn.hidden = !on && !localHost();
        toast(on ? '编辑入口已开启' : '编辑入口已关闭');
        seq = '';
      }
    }
  });

  function buildUI() {
    var toggle = document.createElement('button');
    toggle.id = 'editToggle';
    toggle.className = 'edit-toggle';
    toggle.textContent = '✎ 编辑';
    toggle.title = '就地编辑正文内容（Ctrl+E）';
    toggle.addEventListener('click', function () { state.on ? exit() : enter(); });
    toggle.hidden = !gate();
    document.body.appendChild(toggle);

    bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.innerHTML =
      '<span class="eb-dot"></span><b>编辑模式</b>' +
      '<span class="eb-status" id="ebStatus">可直接点改正文；小组件内容请在 data.js 里改</span>' +
      '<button class="btn small" id="ebCancel">放弃修改</button>' +
      '<button class="btn small primary" id="ebSave">保存到 index.html</button>';
    bar.hidden = true;
    document.body.appendChild(bar);
    statusEl = bar.querySelector('#ebStatus');
    bar.querySelector('#ebSave').addEventListener('click', save);
    bar.querySelector('#ebCancel').addEventListener('click', cancel);
  }

  function setEditable(on) {
    state.bound.forEach(function (p, el) {
      if (on) el.setAttribute('contenteditable', 'true');
      else el.removeAttribute('contenteditable');
      el.classList.toggle('editing', on);
    });
    document.body.classList.toggle('edit-on', on);
  }

  function enter() {
    bindAll();
    if (!state.bound.size) { toast('没有可编辑的静态内容'); return; }
    state.on = true;
    setEditable(true);
    bar.hidden = false;
    document.querySelector('.edit-toggle').textContent = '✕ 退出';
    updStatus();
  }
  function exit() {
    setEditable(false);
    state.on = false;
    bar.hidden = true;
    document.querySelector('.edit-toggle').textContent = '✎ 编辑';
  }
  function cancel() {
    if (state.dirty.size && !confirm('放弃 ' + state.dirty.size + ' 处未保存修改？')) return;
    state.dirty.forEach(function (el) {
      var doc0 = new DOMParser().parseFromString(SNAPSHOT, 'text/html');
      var src = resolve(doc0, state.bound.get(el));
      if (src) el.innerHTML = src.innerHTML;
    });
    state.dirty.clear();
    exit();
  }
  function updStatus(extra) {
    statusEl.textContent = extra || (state.dirty.size
      ? state.dirty.size + ' 处未保存修改'
      : '可直接点改正文；小组件内容请在 data.js 里改');
  }

  /* 编辑期间阻止链接跳转 */
  document.addEventListener('click', function (e) {
    if (state.on && e.target.closest('a') && e.target.closest('.editing')) e.preventDefault();
  }, true);
  document.addEventListener('input', function (e) {
    if (!state.on) return;
    var t = e.target;
    while (t && t.nodeType === 1 && !state.bound.has(t)) t = t.parentElement;
    if (t && state.bound.has(t)) { state.dirty.add(t); updStatus(); }
  });
  /* 粘贴一律转纯文本，避免把外部样式/脚本带进正文 */
  document.addEventListener('paste', function (e) {
    if (!state.on) return;
    var host = e.target.closest && e.target.closest('[contenteditable]');
    if (!host) return;
    e.preventDefault();
    var txt = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, txt);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') { if (!gate()) return; e.preventDefault(); state.on ? exit() : enter(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && state.on) { e.preventDefault(); save(); }
  });
  window.addEventListener('beforeunload', function (e) {
    if (state.dirty.size) { e.preventDefault(); e.returnValue = ''; }
  });

  function serialize() {
    var doc0 = new DOMParser().parseFromString(SNAPSHOT, 'text/html');
    doc0.documentElement.classList.remove('js');
    var n = 0;
    state.dirty.forEach(function (el) {
      var src = resolve(doc0, state.bound.get(el));
      if (src) { src.innerHTML = el.innerHTML; n++; }
    });
    return { html: '<!DOCTYPE html>\n' + doc0.documentElement.outerHTML + '\n', n: n };
  }

  async function save() {
    if (!state.dirty.size) { updStatus('没有改动'); return; }
    var out = serialize();
    try {
      if (window.showSaveFilePicker) {
        if (!state.handle) {
          state.handle = await showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }],
          });
        }
        var w = await state.handle.createWritable();
        await w.write(out.html); await w.close();
        state.dirty.clear();
        updStatus('已保存 ' + out.n + ' 处 → ' + state.handle.name);
      } else {
        var blob = new Blob([out.html], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'index.html'; a.click();
        URL.revokeObjectURL(a.href);
        state.dirty.clear();
        updStatus('已下载 index.html（含 ' + out.n + ' 处修改），替换原文件即可');
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;   // 用户取消了文件选择
      updStatus('保存失败：' + (err && err.message || err));
    }
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'edit-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else buildUI();
})();
