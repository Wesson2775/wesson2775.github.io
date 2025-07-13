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
  const linkPath = path.join(__dirname, '..', 'link.md');
  const outputPath = path.join(__dirname, '..', 'data', 'links.json');
  
  if (!fs.existsSync(linkPath)) {
    console.log('link.md not found, skipping...');
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
    console.log('✅ link.md processed successfully');
    
  } catch (error) {
    console.error('❌ Error processing link.md:', error.message);
  }
}

// 处理about.md文件
function processAboutFile() {
  const aboutPath = path.join(__dirname, '..', 'about.md');
  const outputPath = path.join(__dirname, '..', 'data', 'about.json');
  
  if (!fs.existsSync(aboutPath)) {
    console.log('about.md not found, skipping...');
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
    console.log('✅ about.md processed successfully');
    
  } catch (error) {
    console.error('❌ Error processing about.md:', error.message);
  }
}

// 更新文章列表
function updateArticleList() {
  const docsPath = path.join(__dirname, '..', 'docs');
  const outputPath = path.join(__dirname, '..', 'list.json');
  
  if (!fs.existsSync(docsPath)) {
    console.log('docs directory not found, skipping...');
    return;
  }
  
  try {
    const files = fs.readdirSync(docsPath)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        // 按文件名排序（通常是日期）
        return b.localeCompare(a);
      });
    
    const articles = [];
    
    for (const file of files) {
      const filePath = path.join(docsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 提取标题（第一行）
      const lines = content.split('\n');
      let title = file.replace('.md', '');
      let summary = '';
      let tags = [];
      let date = '';
      
      // 解析front matter或第一行标题
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('# ')) {
          title = line.replace('# ', '').trim();
        } else if (line.startsWith('tags:')) {
          tags = line.replace('tags:', '').split(',').map(t => t.trim());
        } else if (line.startsWith('date:')) {
          date = line.replace('date:', '').trim();
        } else if (line && !line.startsWith('---') && !summary) {
          // 第一段非空内容作为摘要
          summary = line.substring(0, 100) + (line.length > 100 ? '...' : '');
        }
      }
      
      // 如果没有找到日期，从文件名提取
      if (!date) {
        const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          date = dateMatch[1];
        }
      }
      
      articles.push({
        filename: file,
        title: title,
        summary: summary,
        tags: tags,
        date: date,
        path: `docs/${file}`
      });
    }
    
    // 写入JSON文件
    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));
    console.log(`✅ Article list updated with ${articles.length} articles`);
    
  } catch (error) {
    console.error('❌ Error updating article list:', error.message);
  }
}

// 更新站点配置
function updateSiteConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'site.json');
  const outputPath = path.join(__dirname, '..', 'data', 'site-config.json');
  
  if (!fs.existsSync(configPath)) {
    console.log('site.json not found, skipping...');
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
    console.log('✅ Site configuration updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating site configuration:', error.message);
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 Starting content processing...');
  
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
  
  console.log('✅ Content processing completed!');
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