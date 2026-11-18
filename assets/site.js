(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("theme-btn");
  const menuButton = document.getElementById("menu-btn");
  const navigation = document.getElementById("nav");
  // The initial theme is set in <head> by partials/theme-init.html.
  // Follow system changes until the visitor picks a theme explicitly.
  const hasSavedTheme = () => {
    try {
      return ["light", "dark"].includes(
        localStorage.getItem("mm-academic-theme"),
      );
    } catch (_) {
      return false;
    }
  };
  matchMedia("(prefers-color-scheme: light)").addEventListener(
    "change",
    (event) => {
      if (hasSavedTheme()) return;
      root.dataset.theme = event.matches ? "light" : "dark";
      updateThemeLabel();
    },
  );

  function updateThemeLabel() {
    if (!themeButton) return;
    const label =
      root.dataset.theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode";
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
  }

  updateThemeLabel();
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("mm-academic-theme", root.dataset.theme);
    } catch (_) {}
    updateThemeLabel();
  });

  menuButton?.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    menuButton.textContent = open ? "✕" : "☰";
  });

  navigation?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open navigation");
      if (menuButton) menuButton.textContent = "☰";
    }),
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navigation?.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open navigation");
      if (menuButton) menuButton.textContent = "☰";
    }
  });

  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.textContent = "↑ Back to top";
  backToTop.hidden = true;
  document.body.append(backToTop);

  function updateBackToTop() {
    backToTop.hidden = window.scrollY < 400;
  }

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("pageshow", updateBackToTop);
  updateBackToTop();
  backToTop.addEventListener("click", () => {
    const heading = document.querySelector("h1");
    if (heading) {
      const originalTabindex = heading.getAttribute("tabindex");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      heading.addEventListener("blur", () => {
        if (originalTabindex === null) heading.removeAttribute("tabindex");
        else heading.setAttribute("tabindex", originalTabindex);
      }, { once: true });
    }
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  });

  const search = document.getElementById("pub-search");
  const publications = [...document.querySelectorAll(".pub[data-year]")];
  const filters = [...document.querySelectorAll(".filter[data-year]")];
  const typeFilters = [...document.querySelectorAll(".filter[data-type]")];
  const empty = document.getElementById("pub-empty");
  let selectedYear = "all";
  let selectedType = "all";

  function filterPublications() {
    if (!search) return;
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    publications.forEach((publication) => {
      const matches =
        (selectedYear === "all" || publication.dataset.year === selectedYear) &&
        (selectedType === "all" || publication.dataset.type === selectedType) &&
        publication.textContent.toLowerCase().includes(query);
      publication.hidden = !matches;
      if (matches) visible += 1;
    });
    document.querySelectorAll("[data-pub-year]").forEach((group) => {
      group.hidden = ![...group.querySelectorAll(".pub")].some(
        (publication) => !publication.hidden,
      );
    });
    if (empty) empty.style.display = visible ? "none" : "block";
  }

  typeFilters.forEach((button) =>
    button.addEventListener("click", () => {
      selectedType = button.dataset.type;
      typeFilters.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      filterPublications();
    }),
  );

  search?.addEventListener("input", filterPublications);
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      selectedYear = button.dataset.year;
      filters.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      filterPublications();
    }),
  );
})();
