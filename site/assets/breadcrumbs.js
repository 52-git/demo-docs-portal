(() => {
  const buildBreadcrumbs = () => {
    const content = document.querySelector(".md-content__inner");
    if (!content) {
      return;
    }

    const existing = content.querySelector(".doc-breadcrumbs");
    if (existing) {
      existing.remove();
    }

    const repoLabels = {
      frontend: "Frontend",
      backend: "Backend",
      infra: "Infra",
    };

    const cleanSegment = (segment) =>
      segment
        .replace(/\.md$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    const path = window.location.pathname;
    const match = path.match(/\/releases\/[^/]+\/([^/]+)\/?(.*)$/);
    if (!match) {
      return;
    }

    const repo = match[1];
    const repoLabel = repoLabels[repo];
    if (!repoLabel) {
      return;
    }

    const rest = match[2] || "";
    const parts = rest.split("/").filter(Boolean);
    const items = [{ label: repoLabel, href: "" }];

    if (parts.length === 0) {
      items.push({ label: "Overview", href: "" });
    } else {
      const last = parts[parts.length - 1];
      if (/README\.md$/i.test(last)) {
        const folders = parts.slice(0, -1);
        folders.forEach((segment) => {
          items.push({ label: cleanSegment(segment), href: "" });
        });
        items.push({ label: "Overview", href: "" });
      } else {
        parts.forEach((segment) => {
          items.push({ label: cleanSegment(segment), href: "" });
        });
      }
    }

    if (items.length === 0) {
      return;
    }

    const nav = document.createElement("nav");
    nav.className = "doc-breadcrumbs";
    nav.setAttribute("aria-label", "Breadcrumb");

    items.forEach((entry, index) => {
      if (index > 0) {
        const sep = document.createElement("span");
        sep.className = "doc-breadcrumbs__sep";
        sep.textContent = "/";
        nav.appendChild(sep);
      }

      if (index === items.length - 1 || !entry.href) {
        const span = document.createElement("span");
        span.className = "doc-breadcrumbs__current";
        span.textContent = entry.label;
        nav.appendChild(span);
        return;
      }

      const link = document.createElement("a");
      link.className = "doc-breadcrumbs__link";
      link.textContent = entry.label;
      link.href = entry.href;
      nav.appendChild(link);
    });

    const versionRow = content.querySelector(".version-select__row");
    if (versionRow) {
      content.insertBefore(nav, versionRow);
    } else {
      const h1 = content.querySelector("h1");
      if (h1) {
        content.insertBefore(nav, h1);
      } else {
        content.prepend(nav);
      }
    }
  };

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(buildBreadcrumbs);
  } else {
    window.addEventListener("DOMContentLoaded", buildBreadcrumbs);
  }
})();
