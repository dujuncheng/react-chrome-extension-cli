#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const spawn = require('cross-spawn');
const commander = require('commander');

const packageFile = require('./package.json');
const { checkAppName, prettifyAppName } = require('./utils/name');
const generateReadme = require('./scripts/readme');
const tryGitInit = require('./scripts/git-init');

let projectName;
const OVERRIDE_PAGES = ['newtab', 'bookmarks', 'history'];

const program = new commander.Command(packageFile.name)
  .version(packageFile.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .option(
    '--override-page [page-name]',
    'override default page like New Tab, Bookmarks, or History page'
  )
  .option('--devtools', 'add features to Chrome Developer Tools')
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
  })
  .parse(process.argv);

// 如果拿不到 项目的名称
if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.error('请输入初始化目录:');
  console.log()
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log('比如说:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-extension')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

function isOverridePageNameValid(name) {
  if (name === true || OVERRIDE_PAGES.includes(name)) {
    return true;
  }

  return false;
}

function logOverridePageError() {
  console.error(
    `${chalk.red('Invalid page name passed to option:')} ${chalk.cyan(
      '--override-page'
    )}`
  );
  console.log();
  console.log(
    `You can pass page name as ${chalk.cyan('newtab')}, ${chalk.cyan(
      'bookmarks'
    )} or ${chalk.cyan('history')}.`
  );
  console.log();
  console.log('For example:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green(
      'my-extension'
    )} ${chalk.cyan('--override-page')} ${chalk.green('newtab')}`
  );
  process.exit(1);
}

function logOptionsConflictError() {
  console.error(
    `${chalk.red(
      'You have passed both "--override-page" and "--devtools" options'
    )}`
  );
  console.log(`  ${chalk.cyan('Only pass one of the option')}`);
  console.log('');
  process.exit(1);
}

function createExtension(name, { overridePage, devtools }) {
  const root = path.resolve(name);
  let overridePageName;

  if (overridePage) {
    if (isOverridePageNameValid(overridePage)) {
      overridePageName = overridePage === true ? 'newtab' : overridePage;

      if (devtools) {
        logOptionsConflictError();
      }
    } else {
      logOverridePageError();
    }
  }

  checkAppName(name);
  fs.ensureDirSync(name);

  console.log(`Creating a new Chrome extension in ${chalk.green(root)} using React👏👏👏👏👏`);
  console.log();

  const appDetails = {
    version: '0.1.0',
    description: 'My First React Chrome Extension',
  };

  // 生成 package.json 文件
  let appPackage = {
    name: name,
    ...appDetails,
    private: true,
    scripts: {
      watch: 'webpack --mode=development --watch --config config/webpack.config.js',
      build: 'webpack --mode=production --config config/webpack.config.js',
    }
  };

  // 写入指定目录的 package.json
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  let command = 'npm';
  let devDependenciesArgs = [
    'install', '--save-dev'
  ];

  // 增加依依赖
  devDependenciesArgs.push(
    'webpack',
    'webpack-cli',
    'webpack-merge',
    'copy-webpack-plugin',
    'size-plugin',
    'mini-css-extract-plugin',
    'css-loader',
    'file-loader',
    '@babel/core@7.7.7',
    '@babel/preset-env@7.7.7',
    '@babel/preset-react@7.7.4',
    'babel-loader@8.0.6',
  );

  console.log('Installing packages. This might take a couple of minutes.');
  console.log('正在安装依赖，请稍微等一下哈~');

  console.log(
    `安装 ${chalk.cyan('webpack')}, ${chalk.cyan(
      'webpack-cli'
    )} 还有其他的东西`
  );
  console.log();

  // 开始安装 devDependencies
  // spawn.sync 执行命令 第三个参数指定命令执行的目录
  const devDependenciesOk = spawn.sync(command, devDependenciesArgs, { cwd: root, stdio: 'inherit' });
  // 如果返回值不为 0, 则报错
  if (devDependenciesOk.status !== 0) {
    console.error(`\`${command} ${devDependenciesArgs.join(' ')}\` failed`);
    return;
  }


  let dependenciesArgs = [
    'install', '--save'
  ];

  // 增加依依赖
  dependenciesArgs.push(
    'antd@3.26.5',
    'axios@0.19.0',
    'react@16.12.0',
    'react-dom@16.12.0',
  );
  // 开始安装 dependencies
  const dependencies = spawn.sync(command, dependenciesArgs, { cwd: root, stdio: 'inherit' });
  // 如果返回值不为 0, 则报错
  if (dependencies.status !== 0) {
    console.error(`\`${command} ${dependenciesArgs.join(' ')}\` failed`);
    return;
  }

  // Copy template files to project directory
  let templateName;
  if (overridePageName) {
    templateName = 'override-page';
  } else if (devtools) {
    templateName = 'devtools';
  } else {
    templateName = 'popup';
  }

  // 把本 npm 包的目录下的 template 拷贝到对应的目录
  fs.copySync(path.resolve(__dirname, 'templates', templateName), root);

  // 把本 npm 包的目录下的 config 拷贝到对应的目录
  fs.copySync(path.resolve(__dirname, 'config'), path.join(root, 'config'));

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  // Source: https://github.com/facebook/create-react-app/blob/47e9e2c7a07bfe60b52011cf71de5ca33bdeb6e3/packages/react-scripts/scripts/init.js#L138
  fs.moveSync(
    path.join(root, 'gitignore'),
    path.join(root, '.gitignore'),
    []
  );

  // Setup the manifest file
  const manifestDetails = {
    name: prettifyAppName(name),
    ...appDetails,
  };

  let appManifest = {
    manifest_version: 2,
    ...manifestDetails,
    icons: {
      16: 'icons/logo.png',
      32: 'icons/logo.png',
      48: 'icons/logo.png',
      128: 'icons/logo.png',
    },
    background: {
      scripts: ['background.js'],
      persistent: false,
    },
  };

  if (overridePageName) {
    appManifest = {
      ...appManifest,
      chrome_url_overrides: {
        [overridePageName]: 'index.html',
      },
    };
  } else if (devtools) {
    appManifest = {
      ...appManifest,
      devtools_page: 'devtools.html',
    };
  } else {
    appManifest = {
      ...appManifest,
      browser_action: {
        default_title: manifestDetails.name,
        default_popup: 'popup.html',
      },
      permissions: ['storage'],
      content_scripts: [
        {
          matches: ['<all_urls>'],
          run_at: 'document_idle',
          js: ['contentScript.js'],
        },
      ],
    };
  }

  // 创建 manifest.json 文件, chrome extension 所需要的
  fs.writeFileSync(
    path.join(root, 'public', 'manifest.json'),
    JSON.stringify(appManifest, null, 2)
  );

  // 生成 readme 文件
  if (generateReadme(manifestDetails, root)) {
    console.log('Generated a README file.');
    console.log();
  }

  // 初始化 git 仓库
  if (tryGitInit(root, name)) {
    console.log('Initialized a git repository.');
    console.log();
  }


  console.log(`Success! Created ${name} at ${root}`);
  console.log('Inside that directory, you can run below commands:');
  console.log();
  console.log(chalk.cyan(`  ${command} run watch`));
  console.log('    Listens for files changes and rebuilds automatically.');
  console.log();
  console.log(chalk.cyan(`  ${command} run build`));
  console.log('    Bundles the app into static files for Chrome store.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(`  1. ${chalk.cyan('cd')} ${name}`);
  console.log(`  2. Run ${chalk.cyan(`${command} run watch`)}`);
  console.log(`  3. Open ${chalk.cyan('chrome://extensions')}`);
  console.log(`  4. Check the ${chalk.cyan('Developer mode')} checkbox`);
  console.log(
    `  5. Click on the ${chalk.cyan('Load unpacked extension')} button`
  );
  console.log(`  6. Select the folder ${chalk.cyan(name + '/build')}`);
  console.log();
}

createExtension(projectName, {
  overridePage: program.overridePage,
  devtools: program.devtools,
});
