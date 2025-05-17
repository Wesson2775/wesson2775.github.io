document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.querySelector('.search-icon');

    // 检查 loadPageContent 是否存在
    if (!window.loadPageContent) {
        console.error('loadPageContent function not found. Ensure default.html includes the correct script.');
        return;
    }

    // 搜索函数
    function performSearch() {
        const query = searchInput.value.trim();
        const lang = localStorage.getItem('lang') || 'zh';
        const searchUrl = `/search.html?q=${encodeURIComponent(query)}&lang=${lang}`;
        window.loadPageContent(searchUrl, true);
    }

    // 回车触发搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // 点击搜索图标触发搜索
    searchIcon.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });
});