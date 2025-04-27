document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.querySelector('#search-input');

    const handleSearch = (event) => {
        event.preventDefault();
        if (searchIcon) searchIcon.classList.add('animate');
        const query = searchInput.value.trim();
        const lang = localStorage.getItem('lang') || 'zh';
        setTimeout(() => {
            if (searchIcon) searchIcon.classList.remove('animate');
            if (query) {
                window.location.href = `/search.html?q=${encodeURIComponent(query)}&lang=${lang}`;
            }
        }, 400);
    };

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', handleSearch);
        searchIcon.addEventListener('touchstart', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch(e);
        });
    }

    const searchResultsContainer = document.querySelector('#search-results');
    const searchQueryElement = document.querySelector('#search-query');
    if (searchResultsContainer && searchQueryElement) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q')?.toLowerCase() || '';
        const page = parseInt(urlParams.get('page')) || 1;
        const perPage = 5;
        const lang = localStorage.getItem('lang') || 'zh';

        searchQueryElement.textContent = query 
            ? lang === 'en' ? `Search Results for "${query}"` : `"${query}" 的搜索结果`
            : lang === 'en' ? 'Search Results' : '搜索结果';

        fetch('/posts.json')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load posts data, status: ${response.status}`);
                return response.json();
            })
            .then(posts => {
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
            })
            .catch(() => {
                searchResultsContainer.innerHTML = `<p class="no-results">${lang === 'en' ? 'Failed to load posts. Please try again later.' : '加载文章失败，请稍后重试。'}</p>`;
            });
    }
});