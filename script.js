(function () {
  const data = window.APP_DATA || [];
  const grid = document.getElementById("app-grid");
  const filterTabs = document.getElementById("filter-tabs");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const resetButton = document.getElementById("reset-filters");
  const themeToggle = document.getElementById("theme-toggle");

  let activeCategory = "all";
  let keyword = "";

  function buildCategories() {
    const categories = [...new Set(data.map((app) => app.category))].sort();
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-tab";
      button.dataset.category = category;
      button.textContent = category;
      filterTabs.appendChild(button);
    });
  }

  function getFilteredApps() {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return data.filter((app) => {
      const matchesCategory =
        activeCategory === "all" || app.category === activeCategory;
      const searchable = [
        app.name,
        app.description,
        app.category,
        ...(app.tags || [])
      ]
        .join(" ")
        .toLowerCase();
      const matchesKeyword =
        !normalizedKeyword || searchable.includes(normalizedKeyword);

      return matchesCategory && matchesKeyword;
    });
  }

  function render() {
    const apps = getFilteredApps();

    grid.innerHTML = "";

    apps.forEach((app) => {
      const card = document.createElement("a");
      card.className = "app-card";
      card.href = app.url || "#";
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const icon = document.createElement("div");
      icon.className = "app-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = app.icon || "✦";

      const name = document.createElement("h2");
      name.className = "app-name";
      name.textContent = app.name;

      const category = document.createElement("div");
      category.className = "app-category";
      category.textContent = app.category;

      const description = document.createElement("p");
      description.className = "app-description";
      description.textContent = app.description;

      const tags = document.createElement("div");
      tags.className = "app-tags";
      (app.tags || []).slice(0, 4).forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.className = "app-tag";
        tagElement.textContent = tag;
        tags.appendChild(tagElement);
      });

      card.append(icon, name, category, description, tags);
      grid.appendChild(card);
    });

    resultCount.textContent = `共 ${apps.length} 个应用`;
    emptyState.hidden = apps.length > 0;
  }

  function setActiveCategory(category) {
    activeCategory = category;
    filterTabs.querySelectorAll(".filter-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.category === category);
    });
    render();
  }

  filterTabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".filter-tab");
    if (!tab) return;
    setActiveCategory(tab.dataset.category);
  });

  searchInput.addEventListener("input", (event) => {
    keyword = event.target.value;
    render();
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    keyword = "";
    setActiveCategory("all");
  });

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("app-list-theme", isDark ? "dark" : "light");
  });

  function initTheme() {
    const savedTheme = localStorage.getItem("app-list-theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    }
  }

  initTheme();
  buildCategories();
  render();
})();
