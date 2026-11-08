/* 个人作品集 · 交互脚本（零依赖）
   ------------------------------------------------------------
   替换位置：
     1) PROJECTS  —— title / desc / category / art / link
        link 填完整网址（https://...）：卡片右上角出现「打开链接 ↗」，
        详情弹层里也会出现「打开项目链接 ↗」；留空则不显示。
     2) CATEGORIES —— 筛选分类
     3) index.html —— 名字、自我介绍、邮箱
   art 可选 art-1 ~ art-6，是纯 CSS 封面，无需准备图片。
   ------------------------------------------------------------ */

document.documentElement.classList.add('js');

const CATEGORIES = [
  { key: 'all',    label: '全部' },
  { key: 'web',    label: '网页' },
  { key: 'visual', label: '视觉' },
  { key: 'other',  label: '其他' }
];

const PROJECTS = [
  { id: 1, title: '项目 01', category: 'web',    art: 'art-1', desc: '[ 一句话介绍这个项目 ]', link: '' },
  { id: 2, title: '项目 02', category: 'visual', art: 'art-2', desc: '[ 一句话介绍这个项目 ]', link: '' },
  { id: 3, title: '项目 03', category: 'web',    art: 'art-3', desc: '[ 一句话介绍这个项目 ]', link: 'https://pan.quark.cn/s/756f5b519c73' },
  { id: 4, title: '项目 04', category: 'other',  art: 'art-4', desc: '[ 网盘链接 ]', link: 'https://pan.quark.cn/s/756f5b519c73' },
  { id: 5, title: '项目 05', category: 'visual', art: 'art-5', desc: '[ 一句话介绍这个项目 ]', link: '' },
  { id: 6, title: '项目 06', category: 'other',  art: 'art-6', desc: '[ 一句话介绍这个项目 ]', link: '' }
];

const labelOf = key => (CATEGORIES.find(c => c.key === key) || {}).label || '';
const grid = document.getElementById('workGrid');
const filters = document.getElementById('filters');
const empty = document.getElementById('workEmpty');

function countFor(key) {
  return key === 'all' ? PROJECTS.length : PROJECTS.filter(p => p.category === key).length;
}

function coverHTML(p, index) {
  return `
    <div class="cover ${p.art}">
      <div class="cover-inner"></div>
      <span class="cover-num">${String(index + 1).padStart(2, '0')}</span>
    </div>`;
}

function renderFilters(active) {
  filters.innerHTML = CATEGORIES.map(c => `
    <button class="filter-btn${c.key === active ? ' is-active' : ''}" type="button"
            data-filter="${c.key}" aria-pressed="${c.key === active}">
      ${c.label}<span>${String(countFor(c.key)).padStart(2, '0')}</span>
    </button>`).join('');
}

function renderCards(filter = 'all') {
  const list = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter);
  grid.innerHTML = list.map(p => {
    const index = PROJECTS.indexOf(p);
    const link = p.link
      ? `<a class="card-link" href="${p.link}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${p.title} 的项目链接">打开链接 ↗</a>`
      : '';
    return `
    <div class="work-card" style="animation-delay:${index * 60}ms">
      <button class="card-hit" type="button" data-id="${p.id}" aria-label="查看项目详情：${p.title}">
        ${coverHTML(p, index)}
        <div class="work-info">
          <div>
            <h3>${p.title}</h3>
            <p class="ph">${p.desc}</p>
          </div>
          <span class="work-tag">${labelOf(p.category)}</span>
        </div>
      </button>
      ${link}
    </div>`;
  }).join('');
  empty.hidden = list.length > 0;
}

filters.addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  renderFilters(btn.dataset.filter);
  renderCards(btn.dataset.filter);
});

renderFilters('all');
renderCards('all');

/* ---------- 详情弹层 ---------- */
const modal = document.getElementById('projectModal');
const modalLink = document.getElementById('modalLink');
let lastFocused = null;

function openModal(id) {
  const p = PROJECTS.find(item => item.id === Number(id));
  if (!p) return;
  lastFocused = document.activeElement;
  const index = PROJECTS.indexOf(p);

  document.getElementById('modalCover').innerHTML = coverHTML(p, index);
  document.getElementById('modalKicker').textContent = `${labelOf(p.category)} · ${String(index + 1).padStart(2, '0')}`;
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalDesc').textContent = p.desc;

  if (p.link) {
    modalLink.href = p.link;
    modalLink.hidden = false;
  } else {
    modalLink.hidden = true;
    modalLink.removeAttribute('href');
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

grid.addEventListener('click', e => {
  const hit = e.target.closest('.card-hit');
  if (hit) openModal(hit.dataset.id);
});
modal.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/* ---------- 主题 ---------- */
const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');

try {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
} catch (_) { /* 隐私模式下忽略 */ }

function syncThemeMeta() {
  if (themeMeta) themeMeta.content = root.dataset.theme === 'dark' ? '#141517' : '#f7f6f2';
}
syncThemeMeta();

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  syncThemeMeta();
  try { localStorage.setItem('portfolio-theme', next); } catch (_) { /* 忽略 */ }
});

/* ---------- 移动端菜单 ---------- */
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
});
document.getElementById('nav').addEventListener('click', e => {
  if (!e.target.closest('a')) return;
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
});

/* ---------- 滚动状态 ---------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -60% 0px' });
document.querySelectorAll('main section[id]').forEach(sec => sectionObserver.observe(sec));

document.getElementById('year').textContent = new Date().getFullYear();
