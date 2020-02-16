# Contributing to React Chrome Extension CLI

Loving React Chrome Extension CLI and want to get involved? Thanks.<br>
We're actively looking for folks interested in helping out. Suggestions and pull requests are highly encouraged!

## Workflow

1. Clone the project:
1. 下载 react-chrome-extension-cli项目

```sh
git clone https://github.com/dujuncheng/react-chrome-extension-cli.git
cd react-chrome-extension-cli
npm install
```

2. When working on the CLI, create a symlink in the global folder by executing this command:

2. 为了方便开发，使用 npm link 建立软连接

```sh
npm link react-chrome-extension-cli
```

3. Now you can execute the CLI with command:
3. 现在可以使用命令行开发了

```sh
react- chrome-extension-cli my-extension
```

## Loading an extension into the browser

Once an extension is built with `npm run build` command, load it in the browser with below instructions:

当使用 `npm run build` 打包完毕，可以加载到 chrome 浏览器中

1. 打开 **chrome://extensions**
2. 确保打开了开发者模式 
3. 点击 **Load unpacked extension** 按钮
4. 选中 **my-extension/build** 目录

