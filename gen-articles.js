const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');
const files = fs.readdirSync(docsDir)
  .filter(f => f.endsWith('.md'))
  .map(f => 'docs/' + f);

fs.writeFileSync(path.join(docsDir, 'articles.json'), JSON.stringify(files, null, 2));
console.log('已生成 docs/articles.json'); 