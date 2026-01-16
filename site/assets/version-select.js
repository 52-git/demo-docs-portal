(() => {
  const state = {
    container: null,
    select: null,
    versions: [],
    latest: "",
    defaultVersion: "",
    basePath: "/",
    versionsUrl: "versions.json",
    changeRegistered: false,
  };

  const createContainer = () => {
    const header = document.querySelector(".md-header__inner");
    if (!header || state.container) {
      return;
    }

    const container = document.createElement("div");
    container.className = "version-select";
    container.innerHTML = `
      <label class="version-select__label" for="version-select">Version</label>
      <select id="version-select" class="version-select__input" aria-label="Version"></select>
    `.trim();

    const search = header.querySelector(".md-header__search");
    if (search && search.parentNode) {
      search.parentNode.insertBefore(container, search.nextSibling);
    } else {
      header.appendChild(container);
    }

    const select = container.querySelector("#version-select");
    if (!select) {
      container.remove();
      return;
    }

    state.container = container;
    state.select = select;
  };

  const updateBasePaths = () => {
    const logo = document.querySelector(".md-header__button.md-logo");
    if (logo && logo.getAttribute("href")) {
      try {
        const baseUrl = new URL(logo.getAttribute("href"), window.location.href);
        state.basePath = baseUrl.pathname.replace(/\/?$/, "/");
        state.versionsUrl = new URL("versions.json", baseUrl.toString()).toString();
      } catch {
        state.basePath = "/";
        state.versionsUrl = new URL("versions.json", window.location.origin).toString();
      }
    } else {
      state.basePath = "/";
      state.versionsUrl = new URL("versions.json", window.location.origin).toString();
    }
  };

  const buildTargetUrl = (targetVersion) => {
    const url = new URL(window.location.href);
    const match = url.pathname.match(/^(.*?\/releases\/)([^/]+)(\/.*|$)/);
    if (match) {
      url.pathname = `${match[1]}${targetVersion}${match[3] || "/"}`.replace(/\/{2,}/g, "/");
    } else {
      url.pathname = `${state.basePath}releases/${targetVersion}/`.replace(/\/{2,}/g, "/");
    }
    return url.toString();
  };

  const renderOptions = () => {
    if (!state.select || state.versions.length === 0) {
      return;
    }

    state.select.innerHTML = "";
    state.versions.forEach((version) => {
      const option = document.createElement("option");
      option.value = version;
      option.textContent = version === state.latest ? `${version} (latest)` : version;
      state.select.appendChild(option);
    });

    if (!state.changeRegistered) {
      state.select.addEventListener("change", () => {
        window.location.href = buildTargetUrl(state.select.value);
      });
      state.changeRegistered = true;
    }
  };

  const resolveCurrentVersion = () => {
    const pathMatch = window.location.pathname.match(/\/releases\/([^/]+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }
    return state.defaultVersion || state.versions[0] || "";
  };

  const refreshSelection = () => {
    if (!state.select || state.versions.length === 0) {
      return;
    }

    const currentVersion = resolveCurrentVersion();
    state.select.value = state.versions.includes(currentVersion)
      ? currentVersion
      : state.versions[0];
  };

  const fetchVersions = () => {
    fetch(state.versionsUrl)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.releases) || data.releases.length === 0) {
          state.container?.remove();
          return;
        }

        state.versions = data.releases
          .map((entry) => entry.version)
          .filter(Boolean)
          .sort((a, b) =>
            b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
          );
        if (state.versions.length === 0) {
          state.container?.remove();
          return;
        }

        state.latest = data.latest || state.versions[0];
        state.defaultVersion = data.default || state.versions[0];
        renderOptions();
        refreshSelection();
      })
      .catch(() => {
        state.container?.remove();
      });
  };

  const notifyLocationChange = () => {
    refreshSelection();
  };

  const patchHistory = () => {
    const wrap = (method) => (...args) => {
      const result = history[method].apply(history, args);
      notifyLocationChange();
      return result;
    };
    history.pushState = wrap("pushState");
    history.replaceState = wrap("replaceState");
    window.addEventListener("popstate", notifyLocationChange);
  };

  const init = () => {
    createContainer();
    if (!state.select) {
      return;
    }
    updateBasePaths();
    fetchVersions();
    refreshSelection();
    patchHistory();
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
