# 行之 · 个人博客

本项目是一个**极简高效的个人博客系统**，支持 Markdown 写作、标签分类、友链、关于页、全文搜索、RSS 订阅等功能。  
**代码托管于 [GitHub](https://github.com/wesson2775/wesson2775.github.io)**，**部署于 [Vercel](https://vercel.com/)**，支持一键自动化部署与持续集成。

## 在线预览

- 博客主页：[https://wesson2775.github.io/](https://wesson2775.github.io/)
- RSS 订阅：[https://wesson2775.github.io/atom.xml](https://wesson2775.github.io/atom.xml)

---

## 项目特色

- 📝 **Markdown 写作**：所有文章、关于、友链均用 Markdown 编写，内容与代码分离，便于管理。
- 🏷️ **标签分类**：自动提取标签，支持标签筛选与聚合。
- 🔍 **全文搜索**：内置前端搜索，支持关键词快速定位文章。
- 🔗 **友链管理**：支持多分组友链，结构化展示。
- 👤 **关于页面**：支持自定义个人介绍、技能、联系方式等。
- 🔄 **自动 RSS**：自动生成 Atom 格式 RSS 订阅源。
- ⚡ **自动化部署**：支持 GitHub Actions 自动构建与 Vercel 部署。
- 📱 **响应式设计**：适配 PC 与移动端，体验流畅。
- 🛠️ **极简无后端**：纯静态，无需服务器，易于维护。

---

## 技术栈

- 前端：原生 HTML5 / CSS3 / JavaScript（无框架依赖）
- 内容处理：Node.js + marked + chokidar
- 自动化：GitHub Actions
- 部署：Vercel / GitHub Pages

---

## 目录结构

```
.
├── index.html              # 博客主页面
├── styles.css              # 样式文件
├── watch-rss.js            # 文件监听与自动生成
├── generate-rss.js         # RSS 生成脚本
├── process-content.js      # 内容处理脚本（友链、关于、文章索引等）
├── atom.xml                # 自动生成的 RSS 文件
├── list.json               # 自动生成的文章列表
├── link.md                 # 友链 Markdown
├── about.md                # 关于我 Markdown
├── docs/                   # 文章目录（Markdown 格式）
├── config/
│   └── site.json           # 站点基础配置
├── public/                 # 静态资源（图片、字体等）
├── .github/workflows/      # GitHub Actions 工作流
└── package.json            # 项目依赖与脚本
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/wesson2775/wesson2775.github.io.git
cd wesson2775.github.io
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发与内容处理

- 监听并自动生成 RSS、文章索引等：

  ```bash
  npm run dev
  # 或
  npm run watch
  ```

- 一次性生成 RSS：

  ```bash
  npm run generate-rss
  ```

- 处理所有内容（友链、关于、文章索引、配置）：

  ```bash
  npm run process-all
  ```

### 4. 本地预览

直接用 VSCode Live Server 或 `npx serve` 等静态服务器工具预览 `index.html`。

---

## 部署到 Vercel

1. 登录 [Vercel](https://vercel.com/)，新建项目，关联你的 GitHub 仓库。
2. 构建命令填写：`npm run generate-rss`
3. 输出目录填写：`./`（根目录）
4. 部署后即可通过 Vercel 分配的域名访问你的博客。

> 你也可以选择 GitHub Pages 作为静态托管，详见下方“常见问题”。

---

## 个性化配置

- **站点信息**：编辑 `config/site.json`，自定义博客标题、描述、作者、邮箱、头像、GitHub 链接等。
- **关于页面**：编辑 `about.md`，支持 Markdown 格式。
- **友链管理**：编辑 `link.md`，支持多分组友链。
- **文章发布**：在 `docs/` 目录下新建 Markdown 文件，自动收录到博客与 RSS。
- **样式美化**：可自定义 `styles.css`，支持深色模式、响应式等。

---

## 常见问题

- **Vercel 部署后 RSS/文章不更新？**
  - 确保构建命令包含 `npm run generate-rss`，每次推送后自动生成最新内容。
- **GitHub Pages 访问路径不对？**
  - 检查 `site.json` 里的 `siteUrl` 是否与你的 Pages 地址一致。
- **本地预览样式错乱？**
  - 请用本地静态服务器打开，避免直接双击 HTML 文件。
- **如何自定义导航/页面？**
  - 修改 `index.html`，可增删导航项，支持自定义页面。

---

## 贡献与自定义

欢迎 Fork 本项目，个性化你的博客！如有建议或问题，欢迎提 Issue 或 PR。

---

## 许可证

MIT License

---

如需更详细的使用说明、二次开发建议或定制化需求，请随时联系作者。 