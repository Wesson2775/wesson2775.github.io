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
  console.log('\n检测到文件变化，重新生成RSS...');
  try {
    generateRSS();
    console.log('RSS重新生成完成！\n');
  } catch (error) {
    console.error('重新生成RSS时出错:', error.message);
  }
}

// 防抖后的重新生成函数
const debouncedRegenerateRSS = debounce(regenerateRSS, config.debounceDelay);

// 启动文件监听
function startWatching() {
  console.log('开始监听文件变化...');
  console.log(`监听目录: ${config.docsDir}`);
  console.log(`监听文件: ${config.listFile}`);
  console.log('按 Ctrl+C 停止监听\n');

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
      console.log(`新增文件: ${path.relative('.', filePath)}`);
      debouncedRegenerateRSS();
    })
    .on('change', (filePath) => {
      console.log(`文件修改: ${path.relative('.', filePath)}`);
      debouncedRegenerateRSS();
    })
    .on('unlink', (filePath) => {
      console.log(`文件删除: ${path.relative('.', filePath)}`);
      debouncedRegenerateRSS();
    })
    .on('error', (error) => {
      console.error('监听docs目录时出错:', error);
    });

  // 监听list.json文件变化
  listWatcher
    .on('change', (filePath) => {
      console.log(`文件修改: ${path.relative('.', filePath)}`);
      debouncedRegenerateRSS();
    })
    .on('error', (error) => {
      console.error('监听list.json时出错:', error);
    });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n停止监听...');
    docsWatcher.close();
    listWatcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n停止监听...');
    docsWatcher.close();
    listWatcher.close();
    process.exit(0);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  // 首次生成RSS
  console.log('首次生成RSS...');
  try {
    generateRSS();
    console.log('首次RSS生成完成！\n');
  } catch (error) {
    console.error('首次生成RSS时出错:', error.message);
    process.exit(1);
  }

  // 开始监听
  startWatching();
}

module.exports = { startWatching }; 