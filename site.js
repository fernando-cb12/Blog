const entriesResponse = await fetch("entries.json");
if (!entriesResponse.ok) {
  throw new Error(`Could not load entries.json (${entriesResponse.status})`);
}

const entries = await entriesResponse.json();
const currentPage = window.location.pathname.split("/").pop() || "index.html";

function renderNavbar() {
  const nav = document.querySelector("[data-site-nav]");
  if (!nav) return;

  const links = [
    { label: "Home", href: "index.html" },
    ...entries.filter((entry) => entry.number > 1).map((entry) => ({
      label: `Entry ${String(entry.number).padStart(2, "0")}`,
      href: entry.href,
    })),
  ];

  nav.replaceChildren(...links.map(({ label, href }) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (href.split("#")[0] === currentPage) link.setAttribute("aria-current", "page");
    return link;
  }));
}

function renderEntryContent(entry, container) {
  const article = document.createElement("article");
  if (entry.number === 1) article.id = "onboarding";

  const heading = document.createElement("h2");
  heading.textContent = entry.heading || entry.title;
  article.append(heading);

  for (const paragraph of entry.content) {
    const p = document.createElement("p");
    // Content is authored in entries.json; markup supports links within a paragraph.
    p.innerHTML = paragraph;
    article.append(p);
  }

  if (entry.embed) {
    const iframe = document.createElement("iframe");
    iframe.className = "linkedin-embed";
    iframe.src = entry.embed.src;
    iframe.height = String(entry.embed.height);
    iframe.title = entry.embed.title;
    iframe.setAttribute("allowfullscreen", "");
    article.append(iframe);
  }

  container.append(article);
}

function renderHome() {
  const list = document.querySelector("[data-entry-list]");
  const content = document.querySelector("[data-home-entry-content]");
  if (!list || !content) return;

  for (const entry of entries) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = entry.href;
    link.append(document.createTextNode(`${String(entry.number).padStart(2, "0")} — ${entry.title}`));
    const summary = document.createElement("span");
    summary.textContent = entry.summary;
    link.append(summary);
    item.append(link);
    list.append(item);
  }

  renderEntryContent(entries[0], content);
}

function renderEntryPage() {
  const entry = entries.find((candidate) => candidate.href.split("#")[0] === currentPage);
  const container = document.querySelector("[data-entry-content]");
  if (!entry || !container) return;

  document.title = entry.pageTitle || `Entry ${String(entry.number).padStart(2, "0")} | Camou's Blog`;
  const subtitle = document.querySelector("[data-entry-subtitle]");
  if (subtitle) subtitle.textContent = `Entry ${String(entry.number).padStart(2, "0")}`;
  renderEntryContent(entry, container);
}

renderNavbar();
renderHome();
renderEntryPage();
