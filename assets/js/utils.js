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
            tag_title: '标签',
            all_tags: '所有标签',
            back: '返回'
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
            tag_title: 'Tag',
            all_tags: 'All Tags',
            back: 'Back'
        }
    },
    tagTranslations: {
        zh: {
            '生活随笔': '生活 фотограф',
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
            '金融科技': '金融科技',
            '随便': '随便',
            '祝福大家': '祝福大家'
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
            '金融科技': 'FinTech',
            '随便': 'Casual',
            '祝福大家': 'Wishing Everyone'
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
    },
    executeIndexScripts: async (urlObj) => {
        const urlParams = new URLSearchParams(urlObj.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        const perPage = 5;
        const lang = localStorage.getItem('lang') || 'zh';

        try {
            const response = await fetch('/posts.json');
            if (!response.ok) throw new Error(`Failed to load posts data, status: ${response.status}`);
            const posts = await response.json();

            const filteredPosts = posts.filter(post => post.lang === lang);
            const totalPages = Math.ceil(filteredPosts.length / perPage);
            const paginatedPosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = paginatedPosts.length > 0
                    ? paginatedPosts.map(post => `
                        <li>
                            <div class="article-data">
                                <div class="article-data-date">
                                    <p>${post.date}</p>
                                </div>
                                <div class="article-data-tag">
                                    ${post.tags?.map(tag =>
                                        `<a href="/tags/${encodeURIComponent(tag)}?lang=${lang}" 
                                           class="tag-link"
                                           style="margin-left: 8px;">${Utils.tagTranslations[lang][tag] || tag}</a>`
                                    ).join('') || ''}
                                </div>
                            </div>
                            <div class="article-content">
                                <a href="${post.url}?lang=${lang}">
                                    <h3>${post.title}</h3>
                                </a>
                                <p>${post.content?.substring(0, 150) || ''}...</p>
                            </div>
                        </li>
                    `).join('')
                    : `<li><p class="no-results">${lang === 'en' ? 'No posts found.' : '未找到文章。'}</p></li>`;
            }

            const pagination = document.getElementById('pagination');
            if (pagination) {
                pagination.innerHTML = Utils.generatePagination(totalPages, currentPage, lang, urlParams.get('q') || '');
            }
        } catch (error) {
            console.error('Error in executeIndexScripts:', error);
            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = `<li><p class="no-results">${lang === 'en' ? 'Failed to load posts.' : '加载文章失败。'}</p></li>`;
            }
        }
    },
    executeFragmentsScripts: async (urlObj) => {
        const urlParams = new URLSearchParams(urlObj.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        const perPage = 5;
        const lang = localStorage.getItem('lang') || 'zh';

        try {
            const response = await fetch('/fragments.json');
            if (!response.ok) throw new Error(`Failed to load fragments data, status: ${response.status}`);
            const posts = await response.json();

            const filteredPosts = posts.filter(post => {
                const postLang = post.lang || (post.url.includes('/en/') ? 'en' : 'zh');
                const postCategory = post.category || 'fragments';
                return postLang === lang && postCategory.toLowerCase().includes('fragment');
            });
            const totalPages = Math.ceil(filteredPosts.length / perPage);
            const paginatedPosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = paginatedPosts.length > 0
                    ? paginatedPosts.map(post => `
                        <li>
                            <div class="article-data">
                                <div class="article-data-date">
                                    <p>${post.date}</p>
                                </div>
                            </div>
                            <div class="article-content">
                                <p>${post.content?.substring(0, 150) || ''}...</p>
                            </div>
                        </li>
                    `).join('')
                    : `<li><p class="no-results">${lang === 'en' ? 'No fragments found.' : '未找到随笔。'}</p></li>`;
            }

            const pagination = document.getElementById('pagination');
            if (pagination) {
                pagination.innerHTML = Utils.generatePagination(totalPages, currentPage, lang, urlParams.get('q') || '');
            }
        } catch (error) {
            console.error('Error in executeFragmentsScripts:', error);
            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = `<li><p class="no-results">${lang === 'en' ? 'Failed to load fragments.' : '加载随笔失败。'}</p></li>`;
            }
        }
    },
    executeTagsIndexScripts: async (urlObj) => {
        const lang = localStorage.getItem('lang') || 'zh';
        try {
            const response = await fetch('/posts.json');
            if (!response.ok) throw new Error(`Failed to load posts data, status: ${response.status}`);
            const posts = await response.json();

            const tagTitleElement = document.querySelector('[data-lang-key="tag_title"]');
            if (tagTitleElement) {
                tagTitleElement.textContent = Utils.translations[lang].all_tags;
            }

            const postsList = document.getElementById('posts-list');
            if (!postsList) {
                console.error('Posts list element not found');
                return;
            }

            const tagsSet = new Set();
            posts.forEach(post => {
                if (post.lang === lang && post.tags) {
                    post.tags.forEach(tag => tagsSet.add(tag));
                }
            });

            const tagsArray = Array.from(tagsSet);
            postsList.innerHTML = tagsArray.length > 0
                ? tagsArray.map(tag => `
                    <a href="/tags/${encodeURIComponent(tag)}?lang=${lang}" class="tag-button">
                        ${Utils.tagTranslations[lang][tag.toLowerCase()] || tag}
                    </a>
                `).join('')
                : `<p class="no-results">${lang === 'en' ? 'No tags found.' : '未找到标签。'}</p>`;
        } catch (error) {
            console.error('Error in executeTagsIndexScripts:', error);
            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = `<p class="no-results">${lang === 'en' ? 'Failed to load tags.' : '加载标签失败。'}</p>`;
            }
        }
    },
    executeTagScripts: async (urlObj) => {
        const urlParams = new URLSearchParams(urlObj.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        const perPage = 5;
        const lang = localStorage.getItem('lang') || 'zh';
        let currentTag = decodeURIComponent(urlObj.pathname.split('/tags/')[1].replace('/index.html', '')).trim();
        
        currentTag = currentTag.toLowerCase();
        const displayTag = Utils.tagTranslations[lang][currentTag] || currentTag;

        const tagTitleElement = document.querySelector('[data-lang-key="tag_title"]');
        if (tagTitleElement) {
            tagTitleElement.textContent = `${Utils.translations[lang].tag_title}: ${displayTag}`;
        }

        try {
            const response = await fetch('/posts.json');
            if (!response.ok) throw new Error(`Failed to load posts data, status: ${response.status}`);
            const posts = await response.json();

            const filteredPosts = posts.filter(post => {
                if (post.lang !== lang) return false;
                if (!post.tags) return false;
                return post.tags.some(tag => tag.toLowerCase() === currentTag);
            });

            const totalPages = Math.ceil(filteredPosts.length / perPage);
            const paginatedPosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

            const postsList = document.getElementById('posts-list');
            if (!postsList) {
                console.error('Posts list element not found');
                return;
            }

            postsList.innerHTML = paginatedPosts.length > 0
                ? paginatedPosts.map(post => `
                    <li>
                        <div class="article-data">
                            <div class="article-data-date">
                                <p>${post.date}</p>
                            </div>
                            <div class="article-data-tag">
                                ${post.tags?.map(tag =>
                                    `<a href="/tags/${encodeURIComponent(tag)}?lang=${lang}" 
                                       class="tag-link"
                                       style="margin-left: 8px;">${Utils.tagTranslations[lang][tag] || tag}</a>`
                                ).join('') || ''}
                            </div>
                        </div>
                        <div class="article-content">
                            <a href="${post.url}?lang=${lang}">
                                <h3>${post.title}</h3>
                            </a>
                            <p>${post.content?.substring(0, 150) || ''}...</p>
                        </div>
                    </li>
                `).join('')
                : `<li><p class="no-results">${lang === 'en' ? 'No posts found for this tag.' : '未找到该标签的文章。'}</p></li>`;

            const pagination = document.getElementById('pagination');
            if (pagination) {
                pagination.innerHTML = Utils.generatePagination(totalPages, currentPage, lang);
            }
        } catch (error) {
            console.error('Error loading tag posts:', error);
            const postsList = document.getElementById('posts-list');
            if (postsList) {
                postsList.innerHTML = `<li><p class="no-results">${lang === 'en' ? 'Failed to load tag posts.' : '加载标签文章失败。'}</p></li>`;
            }
        }
    },
    executeSearchScripts: async (urlObj) => {
        const urlParams = new URLSearchParams(urlObj.search);
        const query = urlParams.get('q')?.toLowerCase() || '';
        const page = parseInt(urlParams.get('page')) || 1;
        const perPage = 5;
        const lang = localStorage.getItem('lang') || 'zh';
        const searchQueryElement = document.querySelector('#search-query');
        if (searchQueryElement) {
            searchQueryElement.textContent = query 
                ? lang === 'en' ? `Search Results for "${query}"` : `"${query}" 的搜索结果`
                : lang === 'en' ? 'Search Results' : '搜索结果';
        }

        try {
            const response = await fetch('/posts.json');
            if (!response.ok) throw new Error(`Failed to load posts data, status: ${response.status}`);
            const posts = await response.json();

            const filteredPosts = posts.filter(post => 
                post.lang === lang &&
                (
                    post.title?.toLowerCase().includes(query) ||
                    post.content?.toLowerCase().includes(query) ||
                    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
                )
            );
            const totalPages = Math.ceil(filteredPosts.length / perPage);
            const paginatedResults = filteredPosts.slice((page - 1) * perPage, page * perPage);
            const searchResultsContainer = document.querySelector('#search-results');
            if (!searchResultsContainer) {
                console.error('Search results container not found');
                return;
            }

            // 清空旧结果
            searchResultsContainer.innerHTML = '';

            // 加载新结果
            searchResultsContainer.innerHTML = paginatedResults.length > 0
                ? paginatedResults.map(post => `
                    <div class="search-result-item">
                        ${post.tags ? `<div class="search-result-tags">
                            ${post.tags.map(tag => `<a href="/tags/${tag}?lang=${lang}" class="tag">${Utils.tagTranslations[lang][tag] || tag}</a>`).join(' ')}
                        </div>` : ''}
                        <h3><a href="${post.url}?lang=${lang}">${post.title}</a></h3>
                        <p>${post.content?.substring(0, 150) || ''}...</p>
                        <div class="search-result-date">${post.date}</div>
                    </div>
                `).join('') + `<div class="page-nav"><ul>${Utils.generatePagination(totalPages, page, lang, query)}</ul></div>`
                : `<p class="no-results">${lang === 'en' ? 'No matching content found' : '未找到匹配内容'}</p>`;
        } catch (error) {
            console.error('Error loading search results:', error);
            const searchResultsContainer = document.querySelector('#search-results');
            if (searchResultsContainer) {
                searchResultsContainer.innerHTML = `<p class="no-results">${lang === 'en' ? 'Failed to load posts.' : '加载文章失败。'}</p>`;
            }
        }
    }
};