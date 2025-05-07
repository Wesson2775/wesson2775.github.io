# 使用说明书 - 个人博客项目

## 1. 项目概述

这是一个基于 [Jekyll](https://jekyllrb.com/) 的静态博客网站，托管于 GitHub Pages（[https://zor666.me](https://zor666.me)），支持中英文内容，适合分享随笔、技术笔记、旅行日志等。项目通过 GitHub Actions 自动构建和部署，使用自定义插件生成标签页面，并支持动态内容加载和多语言切换。

### 主要功能
- **多语言支持**：中文（`zh`）和英文（`en`）内容，动态切换。
- **随笔管理**：在 `fragments.html` 展示完整随笔内容，按语言分组（`_fragments/zh/` 和 `_fragments/en/`）。
- **标签系统**：自动生成标签页面（例如 `/tags/人工智能/`），支持中英文标签。
- **搜索功能**：通过关键词搜索文章标题、内容和标签。
- **分页**：首页、随笔页和标签页支持分页，每页 5 条内容。
- **响应式设计**：适配桌面和移动端，样式美观。
- **自动化部署**：GitHub Actions 自动构建和部署到 GitHub Pages。

---

## 2. 技术栈
- **静态站点生成器**：Jekyll
- **前端**：HTML, CSS (SCSS), JavaScript (`utils.js` 实现动态加载)
- **部署**：GitHub Actions, GitHub Pages
- **插件**：自定义 `generate_tags.rb` 生成标签页面
- **依赖**：Ruby, Bundler, Jekyll 插件（`jekyll-feed`, `jekyll-seo-tag`, `jekyll-paginate`）

---

## 3. 安装与本地运行

### 3.1 前提条件
- **操作系统**：Windows, macOS, 或 Linux
- **工具**：
  - [Git](https://git-scm.com/)
  - [Ruby](https://www.ruby-lang.org/)（推荐版本 3.2.x）
  - [Bundler](https://bundler.io/)（用于管理 Ruby 依赖）
- **GitHub 账户**：用于托管仓库和部署

### 3.2 克隆仓库
1. 克隆项目到本地：
   ```bash
   git clone https://github.com/wesson2775/wesson2775.github.io.git
   cd wesson2775.github.io
   ```
2. 确保 `.gitignore` 包含 `_site` 和 `.jekyll-cache`。

### 3.3 安装依赖
1. 安装 Ruby 和 Bundler：
   - macOS/Linux：
     ```bash
     sudo apt-get install ruby-full build-essential zlib1g-dev  # Ubuntu
     brew install ruby  # macOS
     gem install bundler
     ```
   - Windows：使用 [RubyInstaller](https://rubyinstaller.org/) 安装 Ruby 和 Bundler。
2. 安装项目依赖：
   ```bash
   bundle install
   ```

### 3.4 本地运行
1. 启动 Jekyll 本地服务器：
   ```bash
   bundle exec jekyll serve --livereload
   ```
2. 打开浏览器，访问 `http://localhost:4000`。
3. 修改文件后，页面会自动刷新（`--livereload`）。

---

## 4. 项目结构

以下是项目的主要文件和目录：

```
wesson2775.github.io/
├── _config.yml           # 配置文件（站点设置、集合、插件）
├── _fragments/           # 随笔内容
│   ├── zh/               # 中文随笔（Markdown 文件）
│   └── en/               # 英文随笔（Markdown 文件）
├── _layouts/             # 页面布局模板
│   ├── default.html      # 默认布局（导航、页脚）
│   └── fragments.html    # 随笔页面布局
├── _plugins/             # 自定义插件
│   └── generate_tags.rb  # 自动生成标签页面
├── assets/               # 静态资源
│   ├── js/               # JavaScript 文件
│   │   └── utils.js      # 动态加载和多语言逻辑
│   └── main.scss         # 样式文件
├── fragments.html        # 随笔列表页面
├── tags.html             # 标签列表页面
├── search.html           # 搜索页面
├── fragments.json        # 随笔数据（JSON 格式）
├── .nojekyll             # 确保 GitHub Pages 识别子目录
├── .github/workflows/    # GitHub Actions 工作流程
│   └── sync_and_deploy.yml
└── README.md             # 项目说明
```

---

## 5. 配置

### 5.1 站点配置
编辑 `_config.yml` 设置站点信息：

```yaml
url: "https://zor666.me"
baseurl: ""
title: "您的博客标题"
title_en: "Your Blog Title"
description: "博客描述"
description_en: "Blog Description"
author: "您的名字"
author_en: "Your Name"
start_year: 2024
license: "CC BY-SA 4.0"
collections:
  fragments:
    output: true
    permalink: /fragments/:path/
excerpt_separator: ""
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-paginate
```

- `url`：站点域名。
- `baseurl`：如果部署在子目录，设置为子目录路径（例如 `/blog`）。
- `collections.fragments`：定义随笔集合，生成独立页面。

### 5.2 多语言配置
- 中文随笔存储在 `_fragments/zh/`，英文随笔在 `_fragments/en/`。
- 每篇随笔的 YAML 前置元数据需包含：
  ```yaml
  ---
  title: "随笔标题"
  date: 2024-09-05
  lang: zh  # 或 en
  category: fragments
  tags: [生活随笔, 随便]
  ---
  ```

### 5.3 标签配置
- 标签在随笔的 `tags` 字段中定义（例如 `tags: [人工智能, 云技术]`）。
- `_plugins/generate_tags.rb` 自动生成标签页面（例如 `_site/tags/人工智能/index.html`）。
- 中英文标签翻译在 `utils.js` 的 `tagTranslations` 中定义：
  ```javascript
  tagTranslations: {
      zh: { '人工智能': '人工智能', '云技术': '云技术' },
      en: { '人工智能': 'Artificial Intelligence', '云技术': 'Cloud Technology' }
  }
  ```

---

## 6. 内容管理

### 6.1 添加随笔
1. 在 `_fragments/zh/` 或 `_fragments/en/` 创建 Markdown 文件，例如 `_fragments/zh/2025-01-01-新年随笔.md`：
   ```markdown
   ---
   title: 新年随笔
   date: 2025-01-01
   lang: zh
   category: fragments
   tags: [生活随笔, 祝福大家]
   ---
   今天是新年，阳光明媚，心情愉悦...
   ```
2. 保存后，Jekyll 自动生成随笔页面（例如 `/fragments/zh/新年随笔/`）。

### 6.2 添加标签
- 在随笔的 `tags` 字段添加新标签，例如 `tags: [新标签]`。
- 更新 `utils.js` 的 `tagTranslations`：
  ```javascript
  tagTranslations: {
      zh: { '新标签': '新标签' },
      en: { '新标签': 'New Tag' }
  }
  ```
- 提交后，标签页面（`/tags/新标签/`）会自动生成。

### 6.3 修改样式
- 编辑 `assets/main.scss` 调整样式，例如：
  ```scss
  .fragment-content {
      margin: 1em 0;
      line-height: 1.6;
  }
  ```

---

## 7. 部署

### 7.1 GitHub Actions 配置
项目使用 `.github/workflows/sync_and_deploy.yml` 自动构建和部署：

```yaml
name: Sync MD Files and Deploy Jekyll
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      - name: Install Dependencies
        run: bundle install
      - name: Build Jekyll
        run: bundle exec jekyll build --verbose
      - name: Create .nojekyll
        run: touch _site/.nojekyll
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./_site
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 7.2 部署步骤
1. 提交更改：
   ```bash
   git add .
   git commit -m "Add new fragment"
   git push origin main
   ```
2. GitHub Actions 自动运行：
   - 构建 `_site` 目录。
   - 上传到 GitHub Pages。
3. 访问 `https://zor666.me` 查看更新（可能需等待几分钟）。

### 7.3 GitHub Pages 设置
- 确保仓库的 **Settings > Pages** 配置为：
  - **Source**: GitHub Actions
  - **Branch**: 无需设置（由 Actions 管理）

---

## 8. 常见问题解答

### 8.1 标签页面显示 404
- **原因**：GitHub Pages 未识别子目录（如 `/tags/人工智能/`）。
- **解决**：
  - 确保 `_site/.nojekyll` 文件存在。
  - 检查 `sync_and_deploy.yml` 是否包含 `touch _site/.nojekyll`。
  - 验证 GitHub Pages 设置为 **GitHub Actions**。

### 8.2 随笔内容未显示完整
- **原因**：`fragments.json` 或 `utils.js` 截断了内容。
- **解决**：
  - 确认 `fragments.json` 使用 `{{ fragment.content | jsonify }}`。
  - 检查 `utils.js` 的 `executeFragmentsScripts`，确保未使用 `substring`。

### 8.3 多语言切换失效
- **原因**：`utils.js` 未正确处理 `lang` 参数。
- **解决**：
  - 验证 `localStorage.getItem('lang')` 是否返回 `zh` 或 `en`。
  - 检查随笔的 `lang` 元数据（`lang: zh` 或 `lang: en`）。

### 8.4 本地运行报错
- **原因**：Ruby 依赖缺失或版本不匹配。
- **解决**：
  - 运行 `bundle install` 安装依赖。
  - 确保 Ruby 版本为 3.2.x（`ruby -v`）。

---

## 9. 维护与扩展

### 9.1 添加新页面
1. 创建新页面（例如 `new-page.html`）：
   ```html
   ---
   layout: default
   lang: zh
   ---
   <h1>新页面</h1>
   ```
2. 更新导航（在 `_layouts/default.html` 或 `utils.js`）。

### 9.2 自定义插件
- 在 `_plugins/` 添加新 Ruby 插件，参考 `generate_tags.rb`。
- 确保插件与 GitHub Actions 的安全模式兼容。

### 9.3 备份
- 定期备份 `_fragments/`, `_config.yml`, `utils.js` 等关键文件。
- 使用 Git 版本控制跟踪更改。

---

## 10. 联系与支持
- **仓库**：https://github.com/wesson2775/wesson2775.github.io
- **问题反馈**：在 GitHub 提交 Issue。
- **文档更新**：编辑 `docs/USAGE.md` 并提交 Pull Request。