// Flipclock
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('flipclock').textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();
// 日期
function updateDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const week = ['日','一','二','三','四','五','六'];
  document.getElementById('date').textContent = `${y}年${m}月${d}日 星期${week[now.getDay()]}`;
}
updateDate();
// 每日一言
fetch('https://v1.hitokoto.cn/?encode=json')
  .then(res => res.json())
  .then(data => {
    const text = data.hitokoto || '获取每日一言失败。';
    const from = data.from || '';
    document.getElementById('quote').innerHTML = `
      <div class="quote-content">${text}</div>
      <div class="quote-footer">
        <span class="quote-author">${from ? `《${from}》` : ''}</span>
      </div>
    `;
  })
  .catch(() => {
    document.getElementById('quote').innerHTML = `
      <div class="quote-content">获取每日一言失败。</div>
      <div class="quote-footer"><span class="quote-label">每日一言</span></div>
    `;
  });
// 导航栏高亮与滚动
const menuLinks = document.querySelectorAll('.website-menu a');
const homeSection = document.querySelector('.main-fullscreen');
const blogSection = document.querySelector('.website-bg');

// 当前内容类型
let currentSection = 'HOME';
// 自动滑动标志
let hasAutoScrolledDown = false;
let hasAutoScrolledUp = false;
let lastScrollY = 0;
let currentPage = 1; // 1为第一页，2为第二页
let isAutoScrolling = false;
let scrollTimeout = null;
let hasUserInteracted = false;
// 记录第二页内容类型
let secondPageContent = '';

// 1. 点击导航栏
menuLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    menuLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const blogSection = document.querySelector('.website-bg');
    if (this.textContent.trim() === 'HOME') {
      currentSection = 'HOME';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.textContent.trim() === 'BLOG') {
      currentSection = 'BLOG';
      secondPageContent = 'BLOG';
      window.scrollTo({ top: blogSection.offsetTop, behavior: 'smooth' });
      showBlogList();
    } else if (this.textContent.trim() === 'ARCHIVE') {
      currentSection = 'ARCHIVE';
      secondPageContent = 'ARCHIVE';
      window.scrollTo({ top: blogSection.offsetTop, behavior: 'smooth' });
      showTagCollection();
    } else if (this.textContent.trim() === 'LINK') {
      currentSection = 'LINK';
      secondPageContent = 'LINK';
      window.scrollTo({ top: blogSection.offsetTop, behavior: 'smooth' });
      showFriendLinks();
    } else if (this.textContent.trim() === 'ABOUT') {
      currentSection = 'ABOUT';
      secondPageContent = 'ABOUT';
      window.scrollTo({ top: blogSection.offsetTop, behavior: 'smooth' });
      showAboutSection();
    }
    // 其他菜单可按需扩展
  });
});

// 2. 点击箭头
document.getElementById('downArrow').onclick = function() {
  // 只滚动，不设置任何内容和高亮状态
  const blogSection = document.querySelector('.website-bg');
  window.scrollTo({
    top: blogSection.offsetTop,
    behavior: 'smooth'
  });
};

// 3. 滚动时自动高亮
let scrollRafId = null;
window.addEventListener('scroll', function() {
  if (isAutoScrolling) return;
  if (scrollRafId) cancelAnimationFrame(scrollRafId);
  scrollRafId = requestAnimationFrame(() => {
    const blogSection = document.querySelector('.website-bg');
    const blogTop = blogSection.offsetTop;
    // 只要用户有过明显滚动就标记
    if (window.scrollY > 10 || window.scrollY < blogTop - 10) hasUserInteracted = true;
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    // 只做高亮，不做吸附
    if (!hasUserInteracted) return;
    if (scrollY + 10 >= blogTop) {
      // 第二页高亮 secondPageContent 对应的导航
      menuLinks.forEach(l => l.classList.remove('active'));
      menuLinks.forEach(l => {
        if (l.textContent.trim() === secondPageContent) l.classList.add('active');
      });
    } else {
      // 第一页高亮 HOME
      menuLinks.forEach(l => l.classList.remove('active'));
      menuLinks.forEach(l => {
        if (l.textContent.trim() === 'HOME') l.classList.add('active');
      });
    }
  });
});

// 导航高亮同步函数
function updateMenuHighlight() {
  menuLinks.forEach(l => l.classList.remove('active'));
  if (currentPage === 1) {
    menuLinks.forEach(l => {
      if (l.textContent.trim() === 'HOME') l.classList.add('active');
    });
  } else {
    menuLinks.forEach(l => {
      if (l.textContent.trim() === secondPageContent) l.classList.add('active');
    });
  }
}

// ========== 新增：工具函数 ==========
// 解析YAML头部
function parseYAML(md) {
  const match = md.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const yaml = match[1];
  const obj = {};
  yaml.split(/\n/).forEach(line => {
    const kv = line.split(':');
    if (kv.length >= 2) {
      const key = kv[0].trim();
      let value = kv.slice(1).join(':').trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim());
      }
      obj[key] = value;
    }
  });
  return obj;
}
// 解析正文
function parseContent(md) {
  return md.replace(/^---([\s\S]*?)---/, '').trim();
}
// 获取所有md文件名
async function fetchArticleFiles() {
  const res = await fetch('docs/articles.json');
  return await res.json();
}
// 读取单个md文件
async function fetchMd(url) {
  const res = await fetch(url);
  return await res.text();
}
// ========== BLOG动态渲染 ==========
let blogArticlesCache = null;
let blogCurrentPage = 1;

async function showBlogList(page = null) {
  if (page !== null) blogCurrentPage = page;
  currentSection = 'BLOG';
  secondPageContent = 'BLOG';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  content.innerHTML = '<div style="color:#aaa;text-align:center;">加载中...</div>';
  if (!blogArticlesCache) {
    const files = await fetchArticleFiles();
    const articles = [];
    for (const file of files) {
      const md = await fetchMd(file);
      const meta = parseYAML(md);
      // 只收录有 date 字段的文章，跳过无效或非文章 md 文件
      if (meta && meta.date) {
        articles.push({
          ...meta,
          file,
          content: parseContent(md),
        });
      }
    }
    // 按日期降序
    articles.sort((a, b) => b.date.localeCompare(a.date));
    blogArticlesCache = articles;
  }
  const articles = blogArticlesCache;
  // 分页
  const pageSize = 10;
  const total = articles.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.max(1, Math.min(blogCurrentPage, totalPages));
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageArticles = articles.slice(start, end);
  // 按年份分组
  const yearMap = {};
  pageArticles.forEach(a => {
    const y = a.date.slice(0, 4);
    if (!yearMap[y]) yearMap[y] = [];
    yearMap[y].push(a);
  });
  let html = '<div class="blog-list">';
  Object.keys(yearMap).sort((a, b) => b - a).forEach(year => {
    html += `<div class="blog-year-card"><div class="blog-year">${year}</div><div class="blog-articles">`;
    yearMap[year].forEach(a => {
      html += `<div class="blog-article" data-file="${a.file}"><span class="blog-title">${a.title}</span><span class="blog-date">${a.date.slice(5).replace('-', '月')}日</span></div>`;
    });
    html += '</div></div>';
  });
  html += '</div>';
  // 分页导航
  if (totalPages > 1) {
    html += '<div class="pagination">';
    // 上一页
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">«</button>`;
    // 页码
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) endPage = Math.min(5, totalPages);
    if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += '<span class="page-ellipsis">...</span>';
      html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    // 下一页
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">»</button>`;
    html += '</div>';
  }
  html += `<footer class="website-footer">Copyright ©2024–2015 Musufei</footer>`;
  content.innerHTML = html;
  // 绑定点击事件
  document.querySelectorAll('.blog-article').forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = (e) => {
      e.preventDefault && e.preventDefault();
      showArticleDetail(el.dataset.file);
    };
  });
  // 绑定分页事件
  document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.onclick = function() {
      const p = parseInt(this.getAttribute('data-page'));
      if (!isNaN(p) && p >= 1 && p <= totalPages && p !== currentPage) {
        showBlogList(p);
      }
    };
  });
}
// 文章详情
async function showArticleDetail(file) {
  currentSection = 'BLOG_DETAIL';
  secondPageContent = 'BLOG';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  content.innerHTML = '<div style="color:#aaa;text-align:center;">加载中...</div>';
  const md = await fetchMd(file);
  const meta = parseYAML(md);
  const body = parseContent(md);
  let html = `<div class="article-detail">
    <a class="article-back" id="backToList">&lt; 返回博客列表</a>
    <div class="article-title">${meta.title}</div>
    <div class="article-meta">${meta.date} / ${(meta.tags||[]).map(t=>`<a class='article-tag' data-tag='${t}'>${t}</a>`).join(' ')}</div>
    <div class="article-content">${marked.parse(body)}</div>
  </div>
  <footer class="website-footer">Copyright ©2024–2015 Musufei</footer>`;
  content.innerHTML = html;
  document.getElementById('backToList').onclick = function() { showBlogList(blogCurrentPage); };
  // 标签点击跳转到标签文章列表
  document.querySelectorAll('.article-tag').forEach(tagEl => {
    tagEl.style.cursor = 'pointer';
    tagEl.onclick = function(e) {
      e.preventDefault && e.preventDefault();
      showTagList(tagEl.dataset.tag);
    };
  });
}
// ========== LINK动态渲染 ==========
async function showFriendLinks() {
  currentSection = 'LINK';
  secondPageContent = 'LINK';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  content.innerHTML = '<div style="color:#aaa;text-align:center;">加载中...</div>';
  const md = await fetchMd('docs/link.md');
  // 解析友链
  const links = [];
  md.split('\n').forEach(line => {
    const m = line.match(/^- \[(.+?)\]\((.+?)\) ?: ?(.+)/);
    if (m) {
      links.push({ name: m[1], url: m[2], desc: m[3] });
    }
  });
  let html = `<div class="friend-links">
    <div class="friend-links-title">友情链接</div>
    <ul class="friend-link-list">`;
  links.forEach(l => {
    html += `<li class="friend-link-item">
      <a class="friend-link-name" href="${l.url}" target="_blank" rel="noopener">${l.name}</a>
      <span class="friend-link-desc">${l.desc}</span>
    </li>`;
  });
  html += '</ul></div>';
  html += `<footer class="website-footer">Copyright ©2024–2015 Musufei</footer>`;
  content.innerHTML = html;
}

// 标签文章列表（动态实现）
function showTagList(tag) {
  currentSection = 'ARCHIVE';
  secondPageContent = 'ARCHIVE';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  // 动态筛选所有包含该标签的文章
  if (!blogArticlesCache) {
    // 如果还没缓存，先回到博客页加载一次
    showBlogList();
    return;
  }
  const articles = blogArticlesCache.filter(a => (a.tags || []).includes(tag));
  let html = `
    <div class="tag-list-header">
      <div class="tag-list-title">标签：${tag}</div>
      <a class="tag-back" id="backToBlog">&lt; 返回博客列表</a>
    </div>
    <div class="tag-article-list">`;
  articles.forEach(a => {
    html += `<div class="tag-article-item"><a class="tag-article-title" data-file="${a.file}">${a.title}</a><div class="tag-article-date">${a.date}</div></div>`;
  });
  html += `</div><footer class="website-footer">Copyright ©2024–2015 Musufei</footer>`;
  content.innerHTML = html;
  document.getElementById('backToBlog').onclick = function() { showBlogList(blogCurrentPage); };
  // 绑定标题点击事件
  document.querySelectorAll('.tag-article-title').forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = function(e) {
      e.preventDefault && e.preventDefault();
      showArticleDetail(el.dataset.file);
    };
  });
}

// 标签集合页面
function showTagCollection() {
  currentSection = 'ARCHIVE';
  secondPageContent = 'ARCHIVE';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  // 动态统计所有标签
  if (!blogArticlesCache) {
    showBlogList();
    return;
  }
  const tagMap = {};
  blogArticlesCache.forEach(a => {
    (a.tags || []).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = 0;
      tagMap[tag]++;
    });
  });
  const tags = Object.keys(tagMap).sort();
  let html = `<div class="tag-collection">
    <div class="tag-collection-title">所有标签</div>
    <div class="tag-collection-list">`;
  tags.forEach(tag => {
    html += `<a class="tag-collection-item">${tag} <span style='color:#aaa;font-size:0.95em'>(${tagMap[tag]})</span></a>`;
  });
  html += `</div></div><footer class="website-footer">Copyright ©2024–2015 Musufei</footer>`;
  content.innerHTML = html;
  // 绑定标签点击事件
  document.querySelectorAll('.tag-collection-item').forEach(tagEl => {
    tagEl.onclick = function() {
      showTagList(tagEl.textContent.replace(/\s*\(.+\)$/, '').trim());
    };
  });
}

// 个人介绍页面
function showAboutSection() {
  currentSection = 'ABOUT';
  secondPageContent = 'ABOUT';
  updateMenuHighlight();
  const content = document.querySelector('.website-content');
  content.innerHTML = `
    <div class="about-section">
      <img class="about-avatar" src="https://linux.do/user_avatar/linux.do/zor/48/773055_2.png" alt="头像" />
      <div class="about-subtitle">个人简介</div>
      <div class="about-desc">
        你好，我是 Musufei，一名热爱前端开发与开源社区的技术爱好者。喜欢探索新技术、分享知识，也热衷于设计和摄影。<br><br>
        本站用于记录我的学习、生活与成长，欢迎交流与合作！
      </div>
    </div>
    <footer class="website-footer">Copyright ©2024–2015 Musufei</footer>
  `;
} 