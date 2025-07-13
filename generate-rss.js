const fs = require('fs');
const path = require('path');

// 读取站点配置信息
function getSiteConfig() {
  const configPath = path.join(__dirname, 'config', 'site.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('未找到 config/site.json 配置文件');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// 只保留本地路径配置
const localConfig = {
  docsDir: './docs',
  outputFile: './atom.xml'
};

// 解析markdown文件的front matter
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { metadata: {}, content: content.trim() };
  }
  
  const metadataStr = match[1];
  const contentStr = match[2];
  
  const metadata = {};
  metadataStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // 处理数组类型的值
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      }
      // 处理字符串类型的值
      else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      metadata[key] = value;
    }
  });
  
  return { metadata, content: contentStr.trim() };
}

// 生成文章的唯一ID
function generateEntryId(filename, date, siteConfig) {
  const baseName = path.basename(filename, '.md');
  return `${siteConfig.siteUrl}/docs/${baseName}`;
}

// 格式化日期为RFC 3339格式
function formatDate(date) {
  return new Date(date).toISOString();
}

// 清理HTML标签，获取纯文本摘要
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// 生成摘要
function generateSummary(content, maxLength = 200) {
  // 移除markdown语法，获取纯文本
  let text = content
    .replace(/^#+\s+/gm, '') // 移除标题
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
    .replace(/`([^`]+)`/g, '$1') // 移除代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/\n+/g, ' ') // 将换行替换为空格
    .trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

// 生成atom.xml内容
function generateAtomXml(entries, siteConfig) {
  const now = new Date();
  const latestEntry = entries.length > 0 ? entries[0] : null;
  
  let atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${siteConfig.title}</title>
  <subtitle>${siteConfig.description}</subtitle>
  <link href="${siteConfig.siteUrl}" rel="alternate" type="text/html"/>
  <link href="${siteConfig.siteUrl}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${siteConfig.siteUrl}/</id>
  <updated>${latestEntry ? formatDate(latestEntry.date) : formatDate(now)}</updated>
  <author>
    <name>${siteConfig.author}</name>
    <email>${siteConfig.email}</email>
  </author>
  <generator>Custom RSS Generator</generator>`;

  entries.forEach(entry => {
    const summary = generateSummary(entry.content);
    const entryUrl = generateEntryId(entry.filename, entry.date, siteConfig);
    
    atomXml += `
  <entry>
    <title>${entry.title}</title>
    <link href="${entryUrl}" rel="alternate" type="text/html"/>
    <id>${entryUrl}</id>
    <updated>${formatDate(entry.date)}</updated>
    <summary type="text">${summary}</summary>
    <content type="html" xml:base="${entryUrl}">
      <![CDATA[${entry.content}]]>
    </content>`;
    
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        atomXml += `
    <category term="${tag}"/>`;
      });
    }
    
    atomXml += `
  </entry>`;
  });

  atomXml += `
</feed>`;

  return atomXml;
}

// 主函数
function generateRSS() {
  try {
    const siteConfig = getSiteConfig();
    console.log('开始生成RSS...');
    
    // 读取文章列表
    const listPath = path.join(__dirname, 'list.json');
    if (!fs.existsSync(listPath)) {
      throw new Error('list.json 文件不存在');
    }
    
    const articleList = JSON.parse(fs.readFileSync(listPath, 'utf8'));
    const entries = [];
    
    // 读取每个markdown文件
    for (const filename of articleList) {
      const filePath = path.join(__dirname, localConfig.docsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`警告: 文件 ${filename} 不存在，跳过`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const { metadata, content: articleContent } = parseFrontMatter(content);
      
      // 检查必要的元数据
      if (!metadata.title || !metadata.date) {
        console.warn(`警告: 文件 ${filename} 缺少必要的元数据 (title 或 date)，跳过`);
        continue;
      }
      
      entries.push({
        filename,
        title: metadata.title,
        date: new Date(metadata.date),
        content: articleContent,
        tags: metadata.tags || [],
        summary: metadata.summary || ''
      });
    }
    
    // 按日期排序（最新的在前）
    entries.sort((a, b) => b.date - a.date);
    
    // 生成atom.xml
    const atomXml = generateAtomXml(entries, siteConfig);
    
    // 写入文件
    fs.writeFileSync(localConfig.outputFile, atomXml, 'utf8');
    
    console.log(`RSS生成成功！共处理 ${entries.length} 篇文章`);
    console.log(`输出文件: ${localConfig.outputFile}`);
    
    // 显示最新文章信息
    if (entries.length > 0) {
      console.log('\n最新文章:');
      entries.slice(0, 3).forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.title} (${entry.date.toISOString().split('T')[0]})`);
      });
    }
    
  } catch (error) {
    console.error('生成RSS时出错:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateRSS();
}

module.exports = { generateRSS, parseFrontMatter, generateAtomXml }; 