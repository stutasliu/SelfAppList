# SelfAppList

一个基于 GitHub Pages 的轻量静态应用列表网站。

## 本地预览

直接用浏览器打开 `index.html` 即可预览，无需安装依赖。

## 修改应用列表

编辑 `apps.js` 中的 `window.APP_DATA` 数组。每个应用包含以下字段：

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
