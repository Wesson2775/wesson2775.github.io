# GitHub Action 自动更新内容指南

## 概述

这个GitHub Action会自动监听您的博客内容变化，并在检测到相关文件更新时自动处理内容并提交更改。

## 功能特性

### 🔍 智能变化检测
- 监听 `docs/` 目录下的所有markdown文件
- 监听 `link.md` 和 `about.md` 文件
- 监听 `config/` 目录下的配置文件
- 监听 `generate-rss.js` 和 `watch-rss.js` 脚本文件

### ⚡ 自动内容处理
- **文章列表更新**: 自动扫描docs目录，更新文章索引
- **友链处理**: 解析link.md，生成结构化的友链数据
- **关于页面处理**: 解析about.md，生成HTML内容
- **RSS更新**: 自动重新生成RSS订阅源
- **配置同步**: 同步站点配置到data目录

### 🔄 自动化工作流
- 自动检测文件变化
- 智能处理相关内容
- 自动提交和推送更改
- 提供详细的执行日志

## 文件结构

```
.github/workflows/
├── auto-update-content.yml    # GitHub Action工作流文件

scripts/
├── process-content.js         # 内容处理脚本

data/                          # 自动生成的数据文件
├── links.json                 # 处理后的友链数据
├── about.json                 # 处理后的关于页面数据
├── site-config.json          # 处理后的站点配置

docs/                          # 文章目录
├── *.md                       # 文章文件

link.md                        # 友链文件
about.md                       # 关于页面文件
config/
├── site.json                  # 站点配置文件
```

## 使用方法

### 1. 自动触发
当您推送代码到 `main` 或 `master` 分支时，如果修改了以下文件，Action会自动触发：

- `docs/**` - 任何文章文件
- `link.md` - 友链文件
- `about.md` - 关于页面文件
- `config/**` - 配置文件
- `generate-rss.js` - RSS生成脚本
- `watch-rss.js` - 监听脚本

### 2. 手动触发
在GitHub仓库页面：
1. 进入 "Actions" 标签页
2. 选择 "Auto Update Content" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支并运行

### 3. 本地测试
您也可以在本地测试内容处理脚本：

```bash
# 安装依赖
npm install

# 处理所有内容
npm run process-all

# 处理特定内容
npm run process-link      # 只处理友链
npm run process-about     # 只处理关于页面
npm run process-articles  # 只更新文章列表
npm run process-config    # 只处理配置
```

## 文件格式要求

### link.md 格式
```markdown
## 技术博客
- [张三的博客](https://zhangsan.com) 前端开发技术分享
- [李四的笔记](https://lisi.com) 后端开发经验

## 生活分享
- [王五的生活](https://wangwu.com) 日常记录
```

### about.md 格式
```markdown
## 个人简介
这里是您的个人介绍...

## 技能特长
- 前端开发
- 后端开发
- 设计能力

## 联系方式
- Email: example@email.com
- GitHub: https://github.com/username
```

### 文章文件格式
```markdown
# 文章标题

tags: 前端, JavaScript, Vue
date: 2024-01-15

这里是文章内容...
```

## 输出文件说明

### data/links.json
```json
[
  {
    "category": "技术博客",
    "links": [
      {
        "name": "张三的博客",
        "url": "https://zhangsan.com",
        "description": "前端开发技术分享"
      }
    ]
  }
]
```

### data/about.json
```json
[
  {
    "title": "个人简介",
    "content": "这里是您的个人介绍...",
    "html": "<p>这里是您的个人介绍...</p>"
  }
]
```

### list.json
```json
[
  {
    "filename": "2024-01-15-article.md",
    "title": "文章标题",
    "summary": "文章摘要...",
    "tags": ["前端", "JavaScript"],
    "date": "2024-01-15",
    "path": "docs/2024-01-15-article.md"
  }
]
```

## 配置选项

### 工作流配置
在 `.github/workflows/auto-update-content.yml` 中可以调整：

- **触发条件**: 修改 `paths` 部分来调整监听的文件
- **Node.js版本**: 修改 `node-version` 来使用不同的Node.js版本
- **分支限制**: 修改 `branches` 来限制触发的分支

### 脚本配置
在 `scripts/process-content.js` 中可以调整：

- **输出目录**: 修改输出路径
- **解析规则**: 调整markdown解析逻辑
- **文件格式**: 修改输出文件的格式

## 故障排除

### 常见问题

1. **Action没有触发**
   - 检查文件路径是否正确
   - 确认推送到了正确的分支
   - 查看Action的触发条件

2. **处理失败**
   - 检查文件格式是否正确
   - 查看Action日志获取详细错误信息
   - 确认依赖是否正确安装

3. **权限问题**
   - 确保仓库有写入权限
   - 检查GitHub Token配置

### 调试方法

1. **查看Action日志**
   - 在GitHub仓库的Actions页面查看详细日志
   - 检查每个步骤的输出

2. **本地测试**
   - 使用 `npm run process-*` 命令本地测试
   - 检查生成的文件是否正确

3. **手动触发**
   - 使用手动触发功能测试完整流程

## 更新日志

### v1.0.0
- 初始版本
- 支持文章、友链、关于页面的自动处理
- 支持RSS自动更新
- 支持配置文件同步

## 贡献

如果您发现任何问题或有改进建议，请：

1. 提交Issue描述问题
2. Fork仓库并创建分支
3. 提交Pull Request

## 许可证

MIT License 