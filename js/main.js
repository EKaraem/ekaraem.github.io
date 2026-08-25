const skillLabels = {
  programming: "Programming & Development",
  ai: "AI & Generative AI",
  devops: "DevOps & Cloud",
  collaboration: "Collaboration & Tools",
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function link(href, label, className) {
  const a = el("a", className, label);
  a.href = href;
  a.target = href.startsWith("http") ? "_blank" : "_self";
  if (a.target === "_blank") a.rel = "noopener noreferrer";
  return a;
}

async function copyText(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
}

function copyable(value, label) {
  const btn = el("button", "copyable", label);
  btn.type = "button";
  btn.title = "Click to copy";
  btn.setAttribute("aria-label", `Copy ${label}`);

  btn.addEventListener("click", async () => {
    try {
      await copyText(value);
      btn.classList.add("is-copied");
      const previous = btn.textContent;
      btn.textContent = "Copied!";
      window.setTimeout(() => {
        btn.textContent = previous;
        btn.classList.remove("is-copied");
      }, 1200);
    } catch (error) {
      console.error("Copy failed", error);
    }
  });

  return btn;
}

function showSection(id, hasContent) {
  document.getElementById(id).classList.toggle("is-empty", !hasContent);
  syncNavLinks();
}

function syncNavLinks() {
  document.querySelectorAll("[data-nav-section]").forEach((navLink) => {
    const sectionId = navLink.getAttribute("data-nav-section");
    const section = document.getElementById(sectionId);
    const visible = section && !section.classList.contains("is-empty");
    navLink.hidden = !visible;
  });
}

function renderBio(bio) {
  document.title = bio.name || "Profile";
  document.getElementById("hero-name").textContent = bio.name || "";
  document.getElementById("hero-title").textContent = bio.title || "Profile";
  document.getElementById("hero-about").textContent = bio.about || "";

  const meta = document.getElementById("hero-meta");
  meta.replaceChildren();
  if (bio.location) meta.append(el("span", null, bio.location));
  if (bio.email) meta.append(copyable(bio.email, bio.email));
  if (bio.phone) meta.append(copyable(bio.phone, bio.phone));

  const actions = document.getElementById("hero-actions");
  actions.replaceChildren();
  actions.append(
    link("assets/RF-EnasKaraem-CV.pdf", "Download CV", "btn btn-primary")
  );
  if (bio.github) actions.append(link(bio.github, "GitHub", "btn btn-ghost"));
  if (bio.linkedin) actions.append(link(bio.linkedin, "LinkedIn", "btn btn-ghost"));

  document.getElementById("about-text").textContent = bio.about || "";
  document.getElementById("footer-copy").textContent =
    `© ${new Date().getFullYear()} ${bio.name || ""}`;
}

function renderSkills(skills) {
  const root = document.getElementById("skills");
  root.replaceChildren();
  if (!skills || typeof skills !== "object") return false;

  Object.entries(skills).forEach(([key, items]) => {
    if (!Array.isArray(items) || items.length === 0) return;
    const group = el("div", "skill-group");
    group.append(el("h3", null, skillLabels[key] || key));
    const tags = el("div", "tags");
    items.forEach((item) => tags.append(el("span", "tag", item)));
    group.append(tags);
    root.append(group);
  });

  return root.childElementCount > 0;
}

function renderWork(work) {
  const list = document.getElementById("work-list");
  list.replaceChildren();

  if (!Array.isArray(work) || work.length === 0) {
    showSection("work", false);
    return;
  }

  work.forEach((job) => {
    const entry = el("article", "entry");
    const header = el("div", "entry-header");
    header.append(el("h3", "entry-role", job.role || ""));
    if (job.period) header.append(el("span", "entry-period", job.period));
    entry.append(header);

    const orgParts = [job.company, job.location].filter(Boolean).join(" · ");
    if (orgParts) entry.append(el("p", "entry-org", orgParts));

    if (Array.isArray(job.highlights) && job.highlights.length) {
      const ul = document.createElement("ul");
      job.highlights.forEach((item) => ul.append(el("li", null, item)));
      entry.append(ul);
    }

    if (Array.isArray(job.technologies) && job.technologies.length) {
      const tags = el("div", "tags");
      job.technologies.forEach((tech) => tags.append(el("span", "tag", tech)));
      entry.append(tags);
    }

    list.append(entry);
  });

  showSection("work", true);
}

function renderEducation(education) {
  const list = document.getElementById("education-list");
  list.replaceChildren();

  if (!Array.isArray(education) || education.length === 0) {
    showSection("education", false);
    return;
  }

  education.forEach((item) => {
    const entry = el("article", "entry");
    const header = el("div", "entry-header");
    header.append(el("h3", "entry-role", item.degree || ""));
    if (item.period) header.append(el("span", "entry-period", item.period));
    entry.append(header);

    const orgParts = [item.school, item.location].filter(Boolean).join(" · ");
    if (orgParts) entry.append(el("p", "entry-org", orgParts));

    if (Array.isArray(item.highlights) && item.highlights.length) {
      const ul = document.createElement("ul");
      item.highlights.forEach((line) => ul.append(el("li", null, line)));
      entry.append(ul);
    }

    list.append(entry);
  });

  showSection("education", true);
}

function renderProjects(projects) {
  const list = document.getElementById("projects-list");
  list.replaceChildren();

  if (!Array.isArray(projects) || projects.length === 0) {
    showSection("projects", false);
    return;
  }

  projects.forEach((project) => {
    const entry = el("article", "entry");
    entry.append(el("h3", "entry-role", project.name || "Untitled project"));
    if (project.description) entry.append(el("p", "entry-org", project.description));
    if (project.url) entry.append(link(project.url, "View project"));
    list.append(entry);
  });

  showSection("projects", true);
}

function renderAll(data) {
  const bio = data.bio || {};
  renderBio(bio);
  const hasSkills = renderSkills(data.skills);
  showSection("about", Boolean(bio.about) || hasSkills);
  renderWork(data.work || []);
  renderEducation(data.education || []);
  renderProjects(data.projects || []);
}

function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
  syncThemeButtons();
}

function syncThemeButtons() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-theme-set") === current);
  });
}

function initControls() {
  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme-set")));
  });
  syncThemeButtons();
}

async function loadCv() {
  try {
    if (location.protocol !== "file:") {
      const response = await fetch("data/cv.json", { cache: "no-cache" });
      if (response.ok) {
        renderAll(await response.json());
        return;
      }
    }
  } catch (error) {
    console.warn("fetch cv.json failed, using data/cv.js fallback", error);
  }

  if (window.CV_DATA) {
    renderAll(window.CV_DATA);
    return;
  }

  document.getElementById("hero-about").textContent =
    "Could not load CV data. Open http://127.0.0.1:5500 or ensure data/cv.js is present.";
}

initControls();
loadCv();
