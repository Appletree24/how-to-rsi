/* 就地编辑只导出本地 HTML，不会修改部署服务器上的文件。
   必须在其他渲染函数之前初始化，保存未渲染的 DOM 快照；通过结构路径和
   outerHTML 全等绑定静态正文，避免把运行时生成的小组件当作源内容。 */
interface LocalWritableFile {
  write(contents: string): Promise<void>;
  close(): Promise<void>;
}

interface LocalFileHandle {
  readonly name: string;
  createWritable(): Promise<LocalWritableFile>;
}

interface SaveHtmlOptions {
  suggestedName: string;
  types: { description: string; accept: { 'text/html': string[] } }[];
}

type FilePickerWindow = Window & {
  showSaveFilePicker?: (options: SaveHtmlOptions) => Promise<LocalFileHandle>;
};

interface EditorState {
  on: boolean;
  dirty: Set<HTMLElement>;
  bound: Map<HTMLElement, string[]>;
  handle: LocalFileHandle | null;
}

export function initEditor(): void {
  const snapshot = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  const selector = 'main h1, main h2, main h3, main h4, main p, main li, main td, main th, main summary';
  const skip = 'script, style, pre, code, svg, noscript, .searchbar, .quiz-box, input, button';
  const state: EditorState = {
    on: false,
    dirty: new Set<HTMLElement>(),
    bound: new Map<HTMLElement, string[]>(),
    handle: null,
  };

  // 元素相对 <main> 的结构路径：tag + 同名兄弟序号。
  function pathOf(element: Element): string[] {
    const parts: string[] = [];
    for (let node: Element | null = element; node && node.tagName !== 'MAIN'; node = node.parentElement) {
      const tag = node.tagName;
      let index = 0;
      let sibling: Element | null = node.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === tag) index++;
        sibling = sibling.previousElementSibling;
      }
      parts.push(tag + '#' + index);
    }
    return parts.reverse();
  }

  function resolve(doc: Document, parts: readonly string[]): Element | null {
    let node: Element | null = doc.querySelector('main');
    if (!node) return null;
    for (const part of parts) {
      const [tag, indexText] = part.split('#');
      const index = Number(indexText);
      let matchingIndex = -1;
      let found: Element | null = null;
      const children: HTMLCollection = node.children;
      for (const child of children) {
        if (child.tagName === tag && ++matchingIndex === index) {
          found = child;
          break;
        }
      }
      if (!found) return null;
      node = found;
    }
    return node;
  }

  // 已绑定过的元素（含未保存的修改）保留原路径，仍然可改可存。
  function bindAll(): void {
    const source = new DOMParser().parseFromString(snapshot, 'text/html');
    document.querySelectorAll<HTMLElement>(selector).forEach(element => {
      if (state.bound.has(element) || element.closest(skip) || element.isContentEditable) return;
      const path = pathOf(element);
      const original = resolve(source, path);
      if (original && original.outerHTML === element.outerHTML) state.bound.set(element, path);
    });
  }

  // 静态站点的隐藏入口，不是权限校验；保留本机、localStorage 和 ?edit 门槛。
  const key = 'rsi-edit-enabled';
  function localHost(): boolean {
    const host = location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '' ||
      /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  }
  function granted(): boolean {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  }
  function gate(): boolean {
    return granted() || localHost() || /[?&]edit\b/.test(location.search);
  }

  let sequence = '';
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if (event.key && event.key.length === 1) {
      sequence = (sequence + event.key.toLowerCase()).slice(-4);
      if (sequence === 'edit') {
        const on = !granted();
        try { on ? localStorage.setItem(key, '1') : localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
        toggle.hidden = !on && !localHost();
        toast(on ? '编辑入口已开启' : '编辑入口已关闭');
        sequence = '';
      }
    }
  });

  function buildUI(): { toggle: HTMLButtonElement; bar: HTMLDivElement; statusEl: HTMLSpanElement } {
    const toggle = document.createElement('button');
    toggle.id = 'editToggle';
    toggle.className = 'edit-toggle';
    toggle.textContent = '✎ 编辑';
    toggle.title = '就地编辑正文内容（Ctrl+E）';
    toggle.addEventListener('click', () => { state.on ? exit() : enter(); });
    toggle.hidden = !gate();
    document.body.appendChild(toggle);

    const bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.innerHTML =
      '<span class="eb-dot"></span><b>编辑模式</b>' +
      '<span class="eb-status" id="ebStatus">可直接点改正文；小组件内容请在 content/site-data.json 里改</span>' +
      '<button class="btn small" id="ebCancel">放弃修改</button>' +
      '<button class="btn small primary" id="ebSave">保存本地 index.html</button>';
    bar.hidden = true;
    document.body.appendChild(bar);
    const statusEl = bar.querySelector<HTMLSpanElement>('#ebStatus');
    const saveButton = bar.querySelector<HTMLButtonElement>('#ebSave');
    const cancelButton = bar.querySelector<HTMLButtonElement>('#ebCancel');
    if (!statusEl || !saveButton || !cancelButton) throw new Error('Editor controls are missing');
    saveButton.addEventListener('click', save);
    cancelButton.addEventListener('click', cancel);
    return { toggle, bar, statusEl };
  }

  function setEditable(on: boolean): void {
    state.bound.forEach((_path, element) => {
      if (on) element.setAttribute('contenteditable', 'true');
      else element.removeAttribute('contenteditable');
      element.classList.toggle('editing', on);
    });
    document.body.classList.toggle('edit-on', on);
  }

  function enter(): void {
    bindAll();
    if (!state.bound.size) { toast('没有可编辑的静态内容'); return; }
    state.on = true;
    setEditable(true);
    bar.hidden = false;
    toggle.textContent = '✕ 退出';
    updateStatus();
  }
  function exit(): void {
    setEditable(false);
    state.on = false;
    bar.hidden = true;
    toggle.textContent = '✎ 编辑';
  }
  function cancel(): void {
    if (state.dirty.size && !confirm('放弃 ' + state.dirty.size + ' 处未保存修改？')) return;
    const source = new DOMParser().parseFromString(snapshot, 'text/html');
    state.dirty.forEach(element => {
      const path = state.bound.get(element);
      const original = path ? resolve(source, path) : null;
      if (original) element.innerHTML = original.innerHTML;
    });
    state.dirty.clear();
    exit();
  }
  function updateStatus(extra?: string): void {
    statusEl.textContent = extra || (state.dirty.size
      ? state.dirty.size + ' 处未保存修改'
      : '可直接点改正文；小组件内容请在 content/site-data.json 里改');
  }

  // 编辑期间阻止链接跳转。
  document.addEventListener('click', event => {
    const target = event.target;
    if (state.on && target instanceof Element && target.closest('a') && target.closest('.editing')) event.preventDefault();
  }, true);
  document.addEventListener('input', event => {
    if (!state.on) return;
    let target = event.target instanceof HTMLElement ? event.target : null;
    while (target && !state.bound.has(target)) target = target.parentElement;
    if (target) { state.dirty.add(target); updateStatus(); }
  });
  // 粘贴一律转纯文本，避免把外部样式/脚本带进正文。
  document.addEventListener('paste', event => {
    if (!state.on || !(event.target instanceof Element)) return;
    const host = event.target.closest('[contenteditable]');
    if (!host) return;
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    document.execCommand('insertText', false, text);
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      if (!gate()) return;
      event.preventDefault();
      state.on ? exit() : enter();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && state.on) { event.preventDefault(); void save(); }
  });
  window.addEventListener('beforeunload', event => {
    if (state.dirty.size) { event.preventDefault(); event.returnValue = ''; }
  });

  function serialize(): { html: string; count: number } {
    const source = new DOMParser().parseFromString(snapshot, 'text/html');
    source.documentElement.classList.remove('js');
    let count = 0;
    state.dirty.forEach(element => {
      const path = state.bound.get(element);
      const original = path ? resolve(source, path) : null;
      if (original) { original.innerHTML = element.innerHTML; count++; }
    });
    // Vite 的模块/CSS 仍在部署站点；本地导出不是离线单文件。
    if (location.protocol === 'https:' || location.protocol === 'http:') {
      const existingBase = source.querySelector<HTMLBaseElement>('base[href]');
      if (existingBase) {
        existingBase.href = document.baseURI;
      } else {
        const base = source.createElement('base');
        base.href = new URL('.', location.href).href;
        source.head.prepend(base);
      }
    }
    return { html: '<!DOCTYPE html>\n' + source.documentElement.outerHTML + '\n', count };
  }

  async function save(): Promise<void> {
    if (!state.dirty.size) { updateStatus('没有改动'); return; }
    const out = serialize();
    try {
      const pickerWindow = window as FilePickerWindow;
      if (pickerWindow.showSaveFilePicker) {
        if (!state.handle) {
          state.handle = await pickerWindow.showSaveFilePicker({
            suggestedName: 'index.html',
            types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }],
          });
        }
        const writable = await state.handle.createWritable();
        await writable.write(out.html);
        await writable.close();
        state.dirty.clear();
        updateStatus('已保存 ' + out.count + ' 处 → 本地 ' + state.handle.name + '（资源仍需访问原站点）');
      } else {
        const blob = new Blob([out.html], { type: 'text/html' });
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = 'index.html';
        anchor.click();
        URL.revokeObjectURL(anchor.href);
        state.dirty.clear();
        updateStatus('已下载 index.html（含 ' + out.count + ' 处修改；资源仍需访问原站点，不会更新服务器）');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      updateStatus('保存失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }

  function toast(message: string): void {
    const element = document.createElement('div');
    element.className = 'edit-toast';
    element.textContent = message;
    document.body.appendChild(element);
    setTimeout(() => { element.classList.add('show'); }, 10);
    setTimeout(() => { element.classList.remove('show'); setTimeout(() => { element.remove(); }, 300); }, 2200);
  }

  const { toggle, bar, statusEl } = buildUI();
}
