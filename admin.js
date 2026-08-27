(function () {
  const REPO_OWNER = "stutasliu";
  const REPO_NAME = "SelfAppList";
  const DATA_PATH = "apps.json";
  const TOKEN_KEY = "selfapplist_gh_token";
  const AUTH_KEY = "selfapplist_admin_auth";
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "lyj0514";

  const elements = {
    loginOverlay: document.getElementById("login-overlay"),
    loginForm: document.getElementById("login-form"),
    loginUsername: document.getElementById("login-username"),
    loginPassword: document.getElementById("login-password"),
    loginError: document.getElementById("login-error"),
    togglePassword: document.getElementById("toggle-password"),
    adminHeader: document.getElementById("admin-header"),
    adminMain: document.getElementById("admin-main"),
    logoutButton: document.getElementById("logout-button"),
    tokenInput: document.getElementById("token-input"),
    saveToken: document.getElementById("save-token"),
    clearToken: document.getElementById("clear-token"),
    appUrl: document.getElementById("app-url"),
    fetchMeta: document.getElementById("fetch-meta"),
    urlMessage: document.getElementById("url-message"),
    appName: document.getElementById("app-name"),
    appCategory: document.getElementById("app-category"),
    appDescription: document.getElementById("app-description"),
    appTags: document.getElementById("app-tags"),
    appIcon: document.getElementById("app-icon"),
    iconPreview: document.getElementById("icon-preview"),
    saveApp: document.getElementById("save-app"),
    cancelEdit: document.getElementById("cancel-edit"),
    formTitle: document.getElementById("form-title"),
    formMode: document.getElementById("form-mode"),
    categoryOptions: document.getElementById("category-options"),
    appList: document.getElementById("app-list"),
    appCount: document.getElementById("app-count"),
    publish: document.getElementById("publish"),
    status: document.getElementById("status")
  };

  let apps = [];
  let editingIndex = null;
  let appsLoaded = false;

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function showLogin() {
    elements.loginOverlay.hidden = false;
    elements.adminHeader.hidden = true;
    elements.adminMain.hidden = true;
    elements.loginError.textContent = "";
    elements.loginUsername.focus();
  }

  function showAdmin() {
    elements.loginOverlay.hidden = true;
    elements.adminHeader.hidden = false;
    elements.adminMain.hidden = false;
    elements.loginPassword.value = "";
    if (!appsLoaded) {
      appsLoaded = true;
      loadApps();
    }
  }

  window.__showAdmin = showAdmin;

  function handleLogin(event) {
    event.preventDefault();
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value.trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      elements.loginError.textContent = "";
      showAdmin();
    } else {
      elements.loginError.textContent = "账号或密码错误，请重试。";
      elements.loginPassword.select();
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    elements.loginUsername.value = "";
    elements.loginPassword.value = "";
    showLogin();
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setStatus(message, type) {
    elements.status.textContent = message || "";
    elements.status.className = "status" + (type ? ` ${type}` : "");
  }

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText || "处理中…";
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function normalizeUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }

  function safeBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function encodeJsonContent(appsArray) {
    return safeBase64(JSON.stringify(appsArray, null, 2));
  }

  function apiHeaders() {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "SelfAppList-Admin"
    };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async function loadApps() {
    setStatus("正在加载应用列表…");

    if (getToken()) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`,
          { headers: apiHeaders() }
        );
        if (!response.ok) {
          throw new Error(`GitHub 请求失败：${response.status}`);
        }
        const file = await response.json();
        const content = decodeURIComponent(escape(atob(file.content.replace(/\s/g, ""))));
        apps = JSON.parse(content);
      } catch (error) {
        setStatus(`从 GitHub 加载失败：${error.message}`, "error");
        await loadAppsFromSite();
      }
    } else {
      await loadAppsFromSite();
    }

    renderCategoryOptions();
    renderApps();
    setStatus(getToken() ? "已从 GitHub 加载应用列表。" : "已从当前网站加载应用列表；如需保存修改，请先填写令牌。");
  }

  async function loadAppsFromSite() {
    try {
      const response = await fetch(DATA_PATH);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      apps = await response.json();
    } catch (error) {
      apps = [];
      setStatus(`加载本地数据失败：${error.message}`, "error");
    }
  }

  function renderCategoryOptions() {
    const categories = [...new Set(apps.map((app) => app.category).filter(Boolean))].sort();
    elements.categoryOptions.innerHTML = "";
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      elements.categoryOptions.appendChild(option);
    });
  }

  function renderApps() {
    elements.appList.innerHTML = "";
    elements.appCount.textContent = `共 ${apps.length} 个应用`;

    if (!apps.length) {
      elements.appList.innerHTML = '<div class="empty-list">还没有应用，先从左侧添加一个吧。</div>';
      return;
    }

    apps.forEach((app, index) => {
      const row = document.createElement("div");
      row.className = "app-row";

      const icon = document.createElement("div");
      icon.className = "app-row-icon";
      if (app.icon && /^https?:\/\//i.test(app.icon)) {
        const img = document.createElement("img");
        img.src = app.icon;
        img.alt = "";
        icon.appendChild(img);
      } else {
        icon.textContent = app.icon || "✦";
      }

      const main = document.createElement("div");
      main.className = "app-row-main";
      const name = document.createElement("strong");
      name.textContent = app.name || "未命名应用";
      const meta = document.createElement("small");
      meta.textContent = `${app.category || "未分类"} · ${app.url || "无链接"}`;
      main.append(name, meta);

      const actions = document.createElement("div");
      actions.className = "app-row-actions";
      const editButton = document.createElement("button");
      editButton.className = "button secondary";
      editButton.type = "button";
      editButton.textContent = "编辑";
      editButton.addEventListener("click", () => startEdit(index));
      const deleteButton = document.createElement("button");
      deleteButton.className = "button danger";
      deleteButton.type = "button";
      deleteButton.textContent = "删除";
      deleteButton.addEventListener("click", () => deleteApp(index));
      actions.append(editButton, deleteButton);

      row.append(icon, main, actions);
      elements.appList.appendChild(row);
    });
  }

  function readForm() {
    const tags = elements.appTags.value
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      name: elements.appName.value.trim(),
      category: elements.appCategory.value.trim() || "未分类",
      icon: elements.appIcon.value.trim() || "✦",
      description: elements.appDescription.value.trim(),
      tags,
      url: normalizeUrl(elements.appUrl.value)
    };
  }

  function resetForm() {
    editingIndex = null;
    elements.formTitle.textContent = "添加应用";
    elements.formMode.textContent = "新应用";
    elements.cancelEdit.hidden = true;
    elements.appUrl.value = "";
    elements.appName.value = "";
    elements.appCategory.value = "";
    elements.appDescription.value = "";
    elements.appTags.value = "";
    elements.appIcon.value = "";
    renderIconPreview("");
    setUrlMessage("", "");
    elements.appUrl.focus();
  }

  function startEdit(index) {
    const app = apps[index];
    editingIndex = index;
    elements.formTitle.textContent = "编辑应用";
    elements.formMode.textContent = `正在编辑：${app.name || "未命名应用"}`;
    elements.cancelEdit.hidden = false;
    elements.appUrl.value = app.url || "";
    elements.appName.value = app.name || "";
    elements.appCategory.value = app.category || "";
    elements.appDescription.value = app.description || "";
    elements.appTags.value = (app.tags || []).join(", ");
    elements.appIcon.value = app.icon || "";
    renderIconPreview(app.icon);
    setUrlMessage("", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteApp(index) {
    const app = apps[index];
    if (!confirm(`确定删除“${app.name || "这个应用"}”吗？`)) return;
    apps.splice(index, 1);
    if (editingIndex === index) {
      resetForm();
    } else if (editingIndex !== null && editingIndex > index) {
      editingIndex -= 1;
    }
    renderApps();
    renderCategoryOptions();
    setStatus("已从当前列表移除，点击“保存全部并发布”后才会更新到主站。");
  }

  function saveCurrentApp() {
    const app = readForm();
    if (!app.name || !app.url) {
      setStatus("请至少填写应用名称和 GitHub Pages 地址。", "error");
      return;
    }

    if (editingIndex === null) {
      apps.push(app);
    } else {
      apps[editingIndex] = app;
    }

    renderApps();
    renderCategoryOptions();
    resetForm();
    setStatus("已加入当前草稿，点击“保存全部并发布”后才会更新到主站。");
  }

  function renderIconPreview(icon) {
    elements.iconPreview.innerHTML = "";
    if (icon && /^https?:\/\//i.test(icon)) {
      const img = document.createElement("img");
      img.src = icon;
      img.alt = "";
      img.addEventListener("error", () => {
        elements.iconPreview.textContent = "✦";
      });
      elements.iconPreview.appendChild(img);
    } else {
      elements.iconPreview.textContent = icon || "✦";
    }
  }

  function setUrlMessage(message, type) {
    elements.urlMessage.textContent = message || "";
    elements.urlMessage.className = "field-message" + (type ? ` ${type}` : "");
  }

  async function fetchMetadata() {
    const rawUrl = elements.appUrl.value.trim();
    const url = normalizeUrl(rawUrl);
    if (!url) {
      setUrlMessage("请先填写 GitHub Pages 地址。", "error");
      return;
    }

    setBusy(elements.fetchMeta, true, "获取中…");
    setUrlMessage("正在读取页面信息…");

    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const meta = (selectors) => {
        for (const selector of selectors) {
          const element = doc.querySelector(selector);
          const value = element && (element.getAttribute("content") || element.textContent);
          if (value && value.trim()) return value.trim();
        }
        return "";
      };

      const linkHref = (selectors) => {
        for (const selector of selectors) {
          const element = doc.querySelector(selector);
          const href = element && element.getAttribute("href");
          if (href && href.trim()) return href.trim();
        }
        return "";
      };

      const title =
        meta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
        meta(['meta[property="og:site_name"]']) ||
        (doc.title || "").trim();

      const description =
        meta(['meta[property="og:description"]', 'meta[name="description"]', 'meta[name="twitter:description"]']) ||
        "";

      let icon =
        linkHref([
          'link[rel="apple-touch-icon"]',
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="icon shortcut"]'
        ]) ||
        "";

      if (icon) {
        icon = new URL(icon, url).href;
      }

      if (!elements.appName.value && title) {
        elements.appName.value = title;
      }
      if (!elements.appCategory.value) {
        elements.appCategory.value = "未分类";
      }
      if (!elements.appDescription.value && description) {
        elements.appDescription.value = description;
      }
      if (!elements.appIcon.value) {
        elements.appIcon.value = icon;
      }
      if (!elements.appUrl.value) {
        elements.appUrl.value = url;
      }

      renderIconPreview(elements.appIcon.value);
      setUrlMessage("已获取页面信息，你可以继续修改后再保存。", "success");
    } catch (error) {
      setUrlMessage(`获取失败：${error.message}`, "error");
    } finally {
      setBusy(elements.fetchMeta, false);
    }
  }

  async function publishApps() {
    const token = getToken();
    if (!token) {
      setStatus("请先填写并保存 GitHub 访问令牌。", "error");
      elements.tokenInput.focus();
      return;
    }

    setBusy(elements.publish, true, "发布中…");
    setStatus("正在保存到 GitHub…");

    try {
      const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`;
      const currentResponse = await fetch(fileUrl, { headers: apiHeaders() });
      if (currentResponse.status !== 200 && currentResponse.status !== 404) {
        const errorData = await currentResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `读取现有文件失败：${currentResponse.status}`);
      }
      const currentFile = await currentResponse.json();
      const sha = currentFile.sha || "";

      const body = {
        message: "更新应用列表",
        content: encodeJsonContent(apps)
      };
      if (sha) {
        body.sha = sha;
      }

      const saveResponse = await fetch(fileUrl, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify(body)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub 保存失败：${saveResponse.status}`);
      }

      setStatus("已保存到 GitHub，主站正在自动更新。", "success");
      renderApps();
    } catch (error) {
      setStatus(`发布失败：${error.message}`, "error");
    } finally {
      setBusy(elements.publish, false);
    }
  }

  function saveToken() {
    const token = elements.tokenInput.value.trim();
    if (!token) {
      setStatus("请输入令牌后再保存。", "error");
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    elements.tokenInput.value = "";
    setStatus("令牌已保存到当前浏览器。正在重新加载应用列表…", "success");
    loadApps();
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    elements.tokenInput.value = "";
    setStatus("令牌已清除。", "success");
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.logoutButton.addEventListener("click", handleLogout);
    elements.togglePassword.addEventListener("click", () => {
      const isPassword = elements.loginPassword.type === "password";
      elements.loginPassword.type = isPassword ? "text" : "password";
      elements.togglePassword.textContent = isPassword ? "🙈" : "👁️";
    });
    elements.saveToken.addEventListener("click", saveToken);
    elements.clearToken.addEventListener("click", clearToken);
    elements.fetchMeta.addEventListener("click", fetchMetadata);
    elements.saveApp.addEventListener("click", saveCurrentApp);
    elements.cancelEdit.addEventListener("click", resetForm);
    elements.publish.addEventListener("click", publishApps);
    elements.appIcon.addEventListener("input", (event) => renderIconPreview(event.target.value));
    elements.appUrl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        fetchMetadata();
      }
    });
  }

  bindEvents();
  if (isLoggedIn()) {
    showAdmin();
  } else {
    showLogin();
  }
})();
