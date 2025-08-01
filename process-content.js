#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const marked = require('marked');

// 配置marked选项
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false
});

// 处理link.md文件
function processLinkFile() {
  const linkPath = path.join(__dirname, 'link.md');
  const outputPath = path.join(__dirname, 'data', 'links.json');
  
  if (!fs.existsSync(linkPath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(linkPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const links = [];
    let currentLink = {};
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // 新的链接组
        if (currentLink.name) {
          links.push(currentLink);
        }
        currentLink = {
          category: line.replace('## ', '').trim(),
          links: []
        };
      } else if (line.startsWith('- [')) {
        // 链接项
        const match = line.match(/- \[([^\]]+)\]\(([^)]+)\)(.*)/);
        if (match) {
          currentLink.links.push({
            name: match[1].trim(),
            url: match[2].trim(),
            description: match[3].trim() || ''
          });
        }
      }
    }
    
    // 添加最后一个链接组
    if (currentLink.name) {
      links.push(currentLink);
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入JSON文件
    fs.writeFileSync(outputPath, JSON.stringify(links, null, 2));
    
  } catch (error) {
  }
}

// 处理about.md文件
function processAboutFile() {
  const aboutPath = path.join(__dirname, 'about.md');
  const outputPath = path.join(__dirname, 'data', 'about.json');
  
  if (!fs.existsSync(aboutPath)) {
    return;
  }
  
  try {
    const content = fs.readFileSync(aboutPath, 'utf8');
    
    // 解析markdown内容
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // 保存前一个section
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim(),
            html: marked.parse(currentContent.join('\n').trim())
          });
        }
        
        // 开始新的section
        currentSection = line.replace('## ', '').trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // 保存最后一个section
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim(),
        html: marked.parse(currentContent.join('\n').trim())
      });
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入JSON文件
    fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2));
    
  } catch (error) {
  }
}

// 更新文章列表
function updateArticleList() {
  const docsPath = path.join(__dirname, 'docs');
  const outputPath = path.join(__dirname, 'list.json');
  
  if (!fs.existsSync(docsPath)) {
    return;
  }
  
  try {
    const files = fs.readdirSync(docsPath)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        // 按文件名排序（通常是日期）
        return b.localeCompare(a);
      });
    
    // 直接输出文件名数组，保持与当前list.json格式一致
    // 这样前端代码可以继续使用现有的逻辑
    fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
    
  } catch (error) {
    console.error('更新文章列表失败:', error);
  }
}

// 更新站点配置
function updateSiteConfig() {
  const configPath = path.join(__dirname, 'config', 'site.json');
  const outputPath = path.join(__dirname, 'data', 'site-config.json');
  
  if (!fs.existsSync(configPath)) {
    return;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入处理后的配置
    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    
  } catch (error) {
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('all')) {
    processLinkFile();
    processAboutFile();
    updateArticleList();
    updateSiteConfig();
  } else {
    if (args.includes('link')) processLinkFile();
    if (args.includes('about')) processAboutFile();
    if (args.includes('articles')) updateArticleList();
    if (args.includes('config')) updateSiteConfig();
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  processLinkFile,
  processAboutFile,
  updateArticleList,
  updateSiteConfig
}; 