// How to RSI — Markdown-driven pages.
// Load posts/*.md into #content; hash routing picks which post to show.

const POSTS = {
  home: 'posts/home.md',
};

function postFromHash() {
  const id = (location.hash || '#/home').replace(/^#\/?/, '') || 'home';
  return POSTS[id] ? id : 'home';
}

async function render() {
  const id = postFromHash();
  const res = await fetch(POSTS[id], { cache: 'no-cache' });
  if (!res.ok) {
    document.getElementById('content').innerHTML =
      '<p>加载失败：' + res.status + '</p>';
    return;
  }
  const md = await res.text();
  document.getElementById('content').innerHTML =
    DOMPurify.sanitize(marked.parse(md));
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();
