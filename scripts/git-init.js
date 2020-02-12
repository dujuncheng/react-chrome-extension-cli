// 这段代码是从 react 脚手架搬过来的
'use strict';

const path = require('path');
const fs = require('fs-extra');
const execSync = require('child_process').execSync;

// 尝试初始化 git
function tryGitInit(appPath) {
  let didInit = false;

  try {
    execSync('git --version', { cwd: appPath, stdio: 'ignore' });

    try {
      // 判断是否已经在 git 仓库中了
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: appPath,
        stdio: 'ignore',
      });
      return false;
    } catch (e) {
      // Ignore.
    }

    execSync('git init', { cwd: appPath, stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { cwd: appPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from Chrome Extension CLI"', {
      cwd: appPath,
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    if (didInit) {
      try {
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }

    return false;
  }
}

module.exports = tryGitInit;
