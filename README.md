# 个人博客 RSS 生成器

这是一个自动化的RSS生成工具，能够动态读取markdown文件并生成符合Atom标准的RSS订阅源。支持配置文件管理，实现文章列表和RSS文件的自动更新。

## 功能特性

- 🔄 **自动生成**: 根据markdown文件自动生成atom.xml
- 📝 **Front Matter解析**: 支持YAML格式的元数据解析
- 🏷️ **标签支持**: 自动提取文章标签
- 📅 **日期排序**: 按发布日期自动排序
- 👀 **文件监听**: 实时监听文件变化，自动重新生成
- 📱 **移动友好**: 生成的RSS支持各种RSS阅读器
- ⚙️ **配置管理**: 统一的配置文件管理站点信息
- 🌐 **前端集成**: 前端自动读取配置并渲染站点信息

## 安装依赖

```bash
npm install
```

## 使用方法

### 1. 一次性生成RSS

```bash
npm run generate-rss
```

或者直接运行：

```bash
node generate-rss.js
```

### 2. 监听模式（推荐）

```bash
npm run watch
```

或者：

```bash
npm run dev
```

监听模式会：
- 首次生成RSS
- 持续监听`docs/`目录下的markdown文件变化
- 监听`list.json`文件变化
- 自动重新生成RSS

## 文件结构要求

### 1. 配置文件 (`config/site.json`)

```json
{
  "title": "我的博客",
  "description": "热爱技术，分享知识，记录成长",
  "author": "博主",
  "email": "xxx@email.com",
  "siteUrl": "https://wesson2775.github.io",
  "avatar": "头像.png",
  "github": "https://github.com/your-username"
}
```

### 2. 文章列表文件 (`list.json`)

```json
[
  "2024-07-02-ai-frontend.md",
  "2024-06-18-web-performance.md",
  "2024-05-20-css-tips.md"
]
```

### 3. Markdown文件格式

每个markdown文件需要包含YAML格式的front matter：

```markdown
---
title: 文章标题
date: 2024-07-02
tags: [前端开发, AI]
summary: 文章摘要（可选）
---

# 文章内容

这里是文章的正文内容...
```

### 4. 必要的元数据

- `title`: 文章标题（必需）
- `date`: 发布日期（必需，格式：YYYY-MM-DD）
- `tags`: 标签数组（可选）
- `summary`: 文章摘要（可选）

## 配置说明

### 后端配置

在`config/site.json`文件中配置站点信息：

- `title`: 博客标题（同时用作首页标题）
- `description`: 博客描述（同时用作首页副标题）
- `author`: 作者名称
- `email`: 作者邮箱
- `siteUrl`: 网站URL
- `avatar`: 头像文件路径
- `github`: GitHub链接

### 前端配置

前端会自动读取`config/site.json`并更新以下元素：

- 页面标题 (`document.title`)
- 头像图片 (`drawer-avatar`, `header-avatar`, `about-avatar`)
- GitHub链接 (`drawer-github`, `header-github`)
- 邮箱链接 (`drawer-email`, `header-email`)
- 首页标题和副标题 (`hero-title`, `hero-subtitle`) - 使用 `title` 和 `description`
- 关于页面信息 (`about-name`, `about-bio`)

## 输出格式

生成的`atom.xml`文件符合Atom 1.0标准，包含：

- 博客基本信息（标题、描述、作者等）
- 文章列表（按日期倒序排列）
- 每篇文章的标题、链接、发布日期、摘要、标签
- 完整的文章内容（CDATA格式）

## 示例输出

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>我的博客</title>
  <subtitle>热爱技术，分享知识，记录成长</subtitle>
  <link href="https://wesson2775.github.io" rel="alternate" type="text/html"/>
  <link href="https://wesson2775.github.io/atom.xml" rel="self" type="application/atom+xml"/>
  <id>https://wesson2775.github.io/</id>
  <updated>2024-07-02T00:00:00.000Z</updated>
  <author>
    <name>博主</name>
    <email>xxx@email.com</email>
  </author>
  <generator>Custom RSS Generator</generator>
  <entry>
    <title>AI助力前端开发</title>
    <link href="https://wesson2775.github.io/docs/2024-07-02-ai-frontend" rel="alternate" type="text/html"/>
    <id>https://wesson2775.github.io/docs/2024-07-02-ai-frontend</id>
    <updated>2024-07-02T00:00:00.000Z</updated>
    <summary type="text">本文介绍了AI如何提升前端开发效率...</summary>
    <content type="html" xml:base="https://wesson2775.github.io/docs/2024-07-02-ai-frontend">
      <![CDATA[# AI助力前端开发

随着AI技术的发展，前端开发也迎来了新的变革...]]>
    </content>
    <category term="前端开发"/>
    <category term="AI"/>
  </entry>
</feed>
```

## 部署到GitHub Pages

1. 确保所有文件都已提交到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择部署分支（通常是`main`或`master`）
4. 访问 `https://your-username.github.io/repository-name` 查看网站
5. RSS订阅地址为 `https://your-username.github.io/repository-name/atom.xml`

## 故障排除

### 1. 文件不存在错误

确保：
- `config/site.json`文件存在且格式正确
- `list.json`文件存在且格式正确
- `docs/`目录存在
- markdown文件路径正确

### 2. 元数据解析错误

检查markdown文件的front matter格式：
- 确保以`---`开始和结束
- 确保`title`和`date`字段存在
- 日期格式为`YYYY-MM-DD`

### 3. 监听模式不工作

- 确保安装了`chokidar`依赖
- 检查文件权限
- 在Windows上可能需要管理员权限

### 4. 前端配置不生效

- 检查`config/site.json`文件格式是否正确
- 确保文件路径为`config/site.json`（不是`config/site.json`）
- 检查浏览器控制台是否有错误信息

## 许可证

MIT License 