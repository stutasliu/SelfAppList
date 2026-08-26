# SelfAppList

一个基于 GitHub Pages 的轻量静态应用列表网站，并带有可视化管理后台。

## 本地预览

直接用浏览器打开 `index.html` 即可预览，无需安装依赖。

## 管理应用

1. 打开 `admin.html`。
2. 填写一个 GitHub Personal Access Token（需要 `repo` 权限）并保存；令牌只保存在当前浏览器中。
3. 在“GitHub Pages 地址”中粘贴应用的 Pages 地址，点击“获取信息”，系统会自动读取页面标题、简介和图标。
4. 补充或修改名称、分类、标签等信息，点击“保存应用”。
5. 编辑完成后，点击“保存全部并发布”，数据会写入仓库的 `apps.json`，GitHub Pages 会自动重新构建主站。

## 修改应用列表

主站读取的是 `apps.json` 中的数组，每个应用包含以下字段：

- `name`：应用名称
- `category`：分类
- `icon`：显示在卡片上的图标（支持 Emoji）
- `description`：一句话简介
- `tags`：标签数组
- `url`：点击卡片后打开的链接

## 发布到 GitHub Pages

1. 将代码推送到仓库。
2. 在仓库的 **Settings → Pages** 中，把 **Source** 设置为 `main` 分支的根目录。
3. 保存后等待片刻，访问 `https://<用户名>.github.io/SelfAppList/`。
