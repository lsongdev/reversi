# 黑白之间 · Reversi

基于 `lsongdev/static-page` 模板的静态黑白棋游戏。保留模板的 HTML / CSS / JavaScript / manifest / 404 文件结构，游戏无需后端、第三方资源或构建步骤。

- 人机对战：执黑或执白，三个难度，带位置权重和行动力评估的 alpha-beta 搜索。
- 本地双人对战、合法落点提示、上一手标记、实时比分。
- 八方向翻转、自动跳过回合、终局判定。人机悔棋回到玩家上一手之前。
- 手机适配、中文界面、键盘方向键移动焦点，Enter / 空格落子。

## 本地运行

```sh
npm test
npm start
```

打开 http://localhost:8000 。

## GitHub Pages

`.github/workflows/pages.yml` 会在 master 分支推送后运行测试、打包静态资源并部署。使用 [GitHub 官方 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)的配置方式。

在可联网且 gh 已登录的环境中，从本目录运行：

```sh
bash deploy.sh
```

脚本使用 gh 从 `lsongdev/static-page` 创建公开仓库 `lsongdev/reversi`，启用 Pages 的 GitHub Actions 发布源并推送游戏。已有同名仓库时先检查游戏描述，匹配后保留其历史并提交；无法确认时停止部署。

预期地址：https://lsongdev.github.io/reversi/ （工作流成功部署后可访问）。
