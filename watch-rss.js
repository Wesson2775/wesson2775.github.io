const chokidar = require('chokidar');
const { generateRSS } = require('./generate-rss');
const path = require('path');

// 只保留本地路径配置
const config = {
  docsDir: './docs',
  listFile: './list.json',
  debounceDelay: 1000 // 防抖延迟，避免频繁触发
};

let debounceTimer = null;

// 防抖函数
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 重新生成RSS的函数
function regenerateRSS() {
  generateRSS();
}

// 防抖后的重新生成函数
const debouncedRegenerateRSS = debounce(regenerateRSS, config.debounceDelay);

// 启动文件监听
function startWatching() {
  // 监听docs目录下的所有.md文件
  const docsWatcher = chokidar.watch(path.join(config.docsDir, '**/*.md'), {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  // 监听list.json文件
  const listWatcher = chokidar.watch(config.listFile, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  // 监听markdown文件变化
  docsWatcher
    .on('add', (filePath) => {
      debouncedRegenerateRSS();
    })
    .on('change', (filePath) => {
      debouncedRegenerateRSS();
    })
    .on('unlink', (filePath) => {
      debouncedRegenerateRSS();
    })
    .on('error', (error) => {
    });

  // 监听list.json文件变化
  listWatcher
    .on('change', (filePath) => {
      debouncedRegenerateRSS();
    })
    .on('error', (error) => {
    });

  // 处理进程退出
  process.on('SIGINT', () => {
    docsWatcher.close();
    listWatcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    docsWatcher.close();
    listWatcher.close();
    process.exit(0);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  // 首次生成RSS
  generateRSS();

  // 开始监听
  startWatching();
}

module.exports = { startWatching }; 