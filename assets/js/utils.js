const Utils = {
    translations: {
        zh: {
            title: '{{ site.title }}',
            description: '{{ site.description }}',
            author: '{{ site.author }}',
            home: '首页',
            fragments: '随笔',
            friends: '友邻',
            tags: '标签',
            about: '关于',
            search: '搜索',
            footer: '© {{ site.start_year }} - {{ "now" | date: "%Y" }} {{ site.author }} · {{ site.license }}',
            nav_menu: '打开导航菜单',
            back_to_top: '返回顶部',
            tag_title: '标签'
        },
        en: {
            title: '{{ site.title_en }}',
            description: '{{ site.description_en }}',
            author: '{{ site.author_en }}',
            home: 'Home',
            fragments: 'Fragments',
            friends: 'Friends',
            tags: 'Tags',
            about: 'About',
            search: 'Search',
            footer: '© {{ site.start_year }} - {{ "now" | date: "%Y" }} {{ site.author_en }} · {{ site.license }}',
            nav_menu: 'Open navigation menu',
            back_to_top: 'Back to top',
            tag_title: 'Tag'
        }
    },
    tagTranslations: {
        zh: {
            '生活随笔': '生活随笔',
            '技术笔记': '技术笔记',
            '旅行日志': '旅行日志',
            '人工智能': '人工智能',
            '云技术': '云技术',
            '信息安全': '信息安全',
            '前端开发': '前端开发',
            '数据分析': '数据分析',
            '智能硬件': '智能硬件',
            '系统设计': '系统设计',
            '编程学习': '编程学习',
            '软件开发': '软件开发',
            '金融科技': '金融科技'
        },
        en: {
            '生活随笔': 'Life Essay',
            '技术笔记': 'Tech Notes',
            '旅行日志': 'Travel Log',
            '人工智能': 'Artificial Intelligence',
            '云技术': 'Cloud Technology',
            '信息安全': 'Information Security',
            '前端开发': 'Frontend Development',
            '数据分析': 'Data Analysis',
            '智能硬件': 'Smart Hardware',
            '系统设计': 'System Design',
            '编程学习': 'Programming',
            '软件开发': 'Software Development',
            '金融科技': 'FinTech'
        }
    },
    iconClasses: {
        home: 'fas fa-home',
        fragments: 'fas fa-book',
        friends: 'fas fa-users',
        tags: 'fas fa-tags',
        about: 'fas fa-info-circle'
    },
    generatePagination: (totalPages, currentPage, lang, query = '') => {
        const cleanLang = String(lang).trim().toLowerCase();
        let paginationHtml = '';
        const baseParams = query ? `q=${encodeURIComponent(query)}&` : '';

        if (currentPage > 1) {
            paginationHtml += `<li><a href="?${baseParams}page=${currentPage - 1}&lang=${encodeURIComponent(cleanLang)}">${cleanLang === 'en' ? 'Previous' : '上一页'}</a></li>`;
        } else {
            paginationHtml += `<li><a class="disabled">${cleanLang === 'en' ? 'Previous' : '上一页'}</a></li>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<li><a ${i === currentPage ? 'class="active"' : ''} href="?${baseParams}page=${i}&lang=${encodeURIComponent(cleanLang)}">${i}</a></li>`;
        }

        if (currentPage < totalPages) {
            paginationHtml += `<li><a href="?${baseParams}page=${currentPage + 1}&lang=${encodeURIComponent(cleanLang)}" class="next-page">${cleanLang === 'en' ? 'Next' : '下一页'}</a></li>`;
        } else {
            paginationHtml += `<li><a class="disabled next-page">${cleanLang === 'en' ? 'Next' : '下一页'}</a></li>`;
        }

        return paginationHtml;
    }
};