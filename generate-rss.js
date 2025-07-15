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
  articlesDir: './articles',
  outputFile: './atom.xml'
};

// 解析html文章的第一个<h2>元信息
function parseHtmlMetaAndContent(html) {
  const h2Match = html.match(/<h2>([\s\S]*?)<\/h2>/i);
  let meta = { title: '', date: '', tags: [] };
  if (h2Match) {
    h2Match[1].split(/\r?\n/).forEach(line => {
      if (line.startsWith('title:')) meta.title = line.replace('title:', '').trim();
      else if (line.startsWith('date:')) meta.date = line.replace('date:', '').trim();
      else if (line.startsWith('tags:')) meta.tags = line.replace('tags:', '').replace(/\[|\]/g, '').split(',').map(t => t.trim()).filter(Boolean);
    });
  }
  // 正文内容：去掉第一个<h2>标签
  const content = html.replace(/<h2>[\s\S]*?<\/h2>/i, '').trim();
  return { ...meta, content };
}

// 生成文章的唯一ID
function generateEntryId(filename, date, siteConfig) {
  const baseName = path.basename(filename, '.html');
  return `${siteConfig.siteUrl}/articles/${baseName}.html`;
}

// 格式化日期为RFC 3339格式
function formatDate(date) {
  return new Date(date).toISOString();
}

// 生成atom.xml内容（无summary）
function generateAtomXml(entries, siteConfig) {
  const now = new Date();
  const latestEntry = entries.length > 0 ? entries[0] : null;
  let atomXml = `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${siteConfig.title}</title>\n  <subtitle>${siteConfig.description}</subtitle>\n  <link href="${siteConfig.siteUrl}" rel="alternate" type="text/html"/>\n  <link href="${siteConfig.siteUrl}/atom.xml" rel="self" type="application/atom+xml"/>\n  <id>${siteConfig.siteUrl}/</id>\n  <updated>${latestEntry ? formatDate(latestEntry.date) : formatDate(now)}</updated>\n  <author>\n    <name>${siteConfig.author}</name>\n    <email>${siteConfig.email}</email>\n  </author>\n  <generator>Custom RSS Generator</generator>`;
  entries.forEach(entry => {
    const entryUrl = generateEntryId(entry.filename, entry.date, siteConfig);
    atomXml += `\n  <entry>\n    <title>${entry.title}</title>\n    <link href="${entryUrl}" rel="alternate" type="text/html"/>\n    <id>${entryUrl}</id>\n    <updated>${formatDate(entry.date)}</updated>\n    <content type="html" xml:base="${entryUrl}"><![CDATA[${entry.content}]]></content>`;
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach(tag => {
        atomXml += `\n    <category term="${tag}"/>`;
      });
    }
    atomXml += `\n  </entry>`;
  });
  atomXml += `\n</feed>`;
  return atomXml;
}

// 主函数
function generateRSS() {
  try {
    const siteConfig = getSiteConfig();
    const listPath = path.join(__dirname, 'list.json');
    if (!fs.existsSync(listPath)) {
      throw new Error('list.json 文件不存在');
    }
    const articleList = JSON.parse(fs.readFileSync(listPath, 'utf8'));
    const entries = [];
    for (const filename of articleList) {
      const filePath = path.join(__dirname, localConfig.articlesDir, filename);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      const html = fs.readFileSync(filePath, 'utf8');
      const meta = parseHtmlMetaAndContent(html);
      if (!meta.title || !meta.date) {
        continue;
      }
      entries.push({
        filename,
        title: meta.title,
        date: new Date(meta.date),
        content: meta.content,
        tags: meta.tags
      });
    }
    entries.sort((a, b) => b.date - a.date);
    const atomXml = generateAtomXml(entries, siteConfig);
    fs.writeFileSync(localConfig.outputFile, atomXml, 'utf8');
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  generateRSS();
}

module.exports = { generateRSS, parseHtmlMetaAndContent, generateAtomXml }; 