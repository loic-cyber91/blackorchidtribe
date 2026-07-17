/* ==========================================================================
   BLACK ORCHID TRIBE — moteur de contenu
   Va chercher content.json et remplit la page. Ne pas éditer ce fichier
   pour changer un texte : tout se passe dans content.json.
   Chaque renderer vérifie que son conteneur existe : index.html et
   candidature.html partagent ce fichier sans avoir les mêmes sections.
   ========================================================================== */

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* ==========================================================================
   Langues : FR (référence, content.json), NL et EN.
   Priorité : langue forcée par la page (body[data-lang], ex. candidature)
   > paramètre d'URL ?lang= > choix mémorisé > langue du navigateur > FR.
   ========================================================================== */
const LANG_FILES = {
  fr: "content.json",
  nl: "content_nl.json",
  en: "content_en.json"
};

function currentLang() {
  const fixed = document.body.getAttribute("data-lang");
  if (fixed && LANG_FILES[fixed]) return fixed;
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl && LANG_FILES[fromUrl]) {
    try { localStorage.setItem("bot-lang", fromUrl); } catch (e) {}
    return fromUrl;
  }
  try {
    const stored = localStorage.getItem("bot-lang");
    if (stored && LANG_FILES[stored]) return stored;
  } catch (e) {}
  const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
  return LANG_FILES[nav] ? nav : "fr";
}

function setupLangSwitch(lang) {
  const wrap = document.getElementById("langSwitch");
  const current = document.getElementById("langCurrent");
  if (!wrap || !current) return;

  const code = document.getElementById("langCurrentCode");
  if (code) code.textContent = lang.toUpperCase();
  current.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = wrap.classList.toggle("open");
    current.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("click", () => {
    wrap.classList.remove("open");
    current.setAttribute("aria-expanded", "false");
  });

  wrap.querySelectorAll("button[data-lang]").forEach(btn => {
    if (btn.getAttribute("data-lang") === lang) btn.classList.add("active");
    btn.addEventListener("click", () => {
      const chosen = btn.getAttribute("data-lang");
      if (chosen === lang) { wrap.classList.remove("open"); return; }
      try { localStorage.setItem("bot-lang", chosen); } catch (e) {}
      location.href = location.pathname;
    });
  });
}

/* Mise en forme légère depuis content.json : **gras**, *italique*, __souligné__.
   Le texte est échappé avant transformation — aucun HTML brut n'est interprété. */
function formatText(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>");
}
function setFormatted(el, val) {
  el.innerHTML = formatText(val);
}

function fillSimpleFields(data) {
  document.querySelectorAll("[data-key]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key"));
    if (val != null) setFormatted(el, val);
  });

  document.querySelectorAll("[data-key-src]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key-src"));
    if (val) el.setAttribute("src", val);
  });

  document.querySelectorAll("[data-key-alt]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key-alt"));
    if (val) el.setAttribute("alt", val);
  });

  document.querySelectorAll("[data-key-href]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key-href"));
    if (val) el.setAttribute("href", val);
  });

  document.querySelectorAll("[data-key-href-mailto]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key-href-mailto"));
    if (val) el.setAttribute("href", "mailto:" + val);
  });

  document.querySelectorAll("[data-key-href-tel]").forEach(el => {
    const val = getPath(data, el.getAttribute("data-key-href-tel"));
    if (val) el.setAttribute("href", "tel:" + val.replace(/[^+\d]/g, ""));
  });
}

function fillRepeats(data) {
  document.querySelectorAll("[data-repeat]").forEach(container => {
    const list = getPath(data, container.getAttribute("data-repeat")) || [];
    const as = container.getAttribute("data-as");
    container.innerHTML = "";

    list.forEach(item => {
      if (as === "p") {
        const p = document.createElement("p");
        setFormatted(p, item);
        container.appendChild(p);
      }
      if (as === "person") {
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(item.name));
        if (item.phone) {
          p.appendChild(document.createTextNode(" — "));
          const a = document.createElement("a");
          a.href = "tel:" + item.phone.replace(/[^+\d]/g, "");
          a.textContent = item.phone;
          p.appendChild(a);
        }
        container.appendChild(p);
      }
    });
  });
}

/* Bio : un bloc par paragraphe, photo(s) en vis-à-vis, sens alterné en CSS */
function renderBio(bio) {
  const wrap = document.getElementById("bioBlocks");
  if (!wrap || !bio) return;
  wrap.innerHTML = "";
  (bio.blocks || []).forEach(block => {
    const row = document.createElement("div");
    row.className = "bio-block";

    const text = document.createElement("div");
    text.className = "bio-block-text";
    const p = document.createElement("p");
    setFormatted(p, block.text);
    text.appendChild(p);

    const media = document.createElement("div");
    media.className = "bio-block-media" + ((block.images || []).length > 1 ? " multi" : "");
    (block.images || []).forEach(img => {
      const a = document.createElement("a");
      a.href = img.src;
      a.className = "lightbox-trigger";
      const el = document.createElement("img");
      el.src = img.src;
      el.alt = img.alt || "";
      el.loading = "lazy";
      a.appendChild(el);
      media.appendChild(a);
    });

    row.appendChild(text);
    row.appendChild(media);
    wrap.appendChild(row);
  });
}

function renderTracks(music) {
  const wrap = document.getElementById("tracks");
  if (!wrap || !music) return;
  wrap.innerHTML = "";
  (music.tracks || []).forEach(t => {
    const card = document.createElement("div");
    card.className = "track";

    const coverWrap = document.createElement("div");
    coverWrap.className = "cover";
    const img = document.createElement("img");
    img.src = t.cover;
    img.alt = t.title;
    img.loading = "lazy";
    coverWrap.appendChild(img);
    card.appendChild(coverWrap);

    const info = document.createElement("div");
    info.className = "info";
    const h4 = document.createElement("h4");
    h4.textContent = t.title;
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = t.note || "";
    const a = document.createElement("a");
    a.href = t.link;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = t.linkLabel || "Écouter";
    info.appendChild(h4);
    info.appendChild(note);
    info.appendChild(a);
    card.appendChild(info);

    wrap.appendChild(card);
  });
}

/* Galerie générique : utilisée pour Live, Crafter et la mosaïque de fin */
function renderGalleryInto(containerId, images) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = "";
  (images || []).forEach(img => {
    const figure = document.createElement("figure");
    const a = document.createElement("a");
    a.href = img.src;
    a.className = "lightbox-trigger";
    const el = document.createElement("img");
    el.src = img.src;
    el.alt = img.alt || "";
    el.loading = "lazy";
    a.appendChild(el);
    figure.appendChild(a);
    wrap.appendChild(figure);
  });
}

function renderLiveChips(live) {
  const wrap = document.getElementById("liveChips");
  if (!wrap || !live) return;
  wrap.innerHTML = "";
  (live.highlights || []).forEach(h => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = h;
    wrap.appendChild(span);
  });
}

function renderPressQuotes(press) {
  const wrap = document.getElementById("pressQuotes");
  if (!wrap || !press) return;
  wrap.innerHTML = "";
  (press.quotes || []).forEach(q => {
    const bq = document.createElement("blockquote");
    const p = document.createElement("p");
    p.textContent = "« " + q.text + " »";
    const cite = document.createElement("cite");
    cite.textContent = q.source;
    bq.appendChild(p);
    bq.appendChild(cite);
    wrap.appendChild(bq);
  });
}

function renderPress(press) {
  const wrap = document.getElementById("pressList");
  if (!wrap || !press) return;
  wrap.innerHTML = "";
  (press.links || []).forEach(l => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = l.name;
    li.appendChild(a);
    wrap.appendChild(li);
  });
}

/* Pictogrammes monochromes des plateformes (DA du site : blanc sur rond sombre) */
const SOCIAL_ICONS = {
  youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.5 15.5v-7L15.8 12z"/>',
  instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3"/>',
  facebook: '<path d="M13.6 21.5v-7.2h2.4l.4-2.8h-2.8V9.7c0-.8.3-1.4 1.5-1.4h1.4V5.8c-.6-.1-1.5-.2-2.4-.2-2.4 0-4 1.5-4 4.1v1.8H7.7v2.8h2.4v7.2h3.5z"/>',
  spotify: '<path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.05 8.5-.6 11.66 1.34.35.22.46.68.25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 1 1-.55-1.8c4.37-1.32 9.8-.68 13.51 1.6.44.27.58.85.31 1.29zm.13-3.4C15.24 8.33 9.09 8.12 5.4 9.24a1.13 1.13 0 1 1-.65-2.16c4.24-1.28 11.28-1.03 15.72 1.6a1.13 1.13 0 0 1-1.15 1.95z"/>',
  hyperfollow: '<path d="M12 2a9 9 0 0 0-9 9v7.5A2.5 2.5 0 0 0 5.5 21H7a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5v-2a7 7 0 0 1 14 0v2h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.5a2.5 2.5 0 0 0 2.5-2.5V11a9 9 0 0 0-9-9z"/>'
};

function renderSocials(socials) {
  const wrap = document.getElementById("socialList");
  if (!wrap || !socials) return;
  wrap.innerHTML = "";
  (socials.items || []).forEach(s => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener";

    const iconKey = (s.icon || s.name || "").toLowerCase();
    if (SOCIAL_ICONS[iconKey]) {
      const circle = document.createElement("span");
      circle.className = "social-icon";
      circle.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        SOCIAL_ICONS[iconKey] + "</svg>";
      a.appendChild(circle);
    }
    const label = document.createElement("span");
    label.textContent = s.name;
    a.appendChild(label);

    li.appendChild(a);
    wrap.appendChild(li);
  });
}

/* ==========================================================================
   Animations d'apparition au scroll.
   - Les classes .reveal ne sont posées que par JS : sans JS, tout reste visible.
   - Respecte le réglage système « réduire les animations ».
   ========================================================================== */
function setupReveals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const selector = [
    ".bio-block", ".track", ".ep-card",
    ".gallery-grid figure", ".outro-grid figure",
    ".press-quotes blockquote", ".press-grid",
    ".live-intro", ".chips",
    ".crafter-text", ".crafter-cta",
    ".social-list li", ".contact-block",
    ".intention-head", ".intention-grid", ".intention-visual", ".intention-actions",
    "section .kicker", "section h2"
  ].join(", ");
  document.querySelectorAll(selector).forEach(el => el.classList.add("reveal"));

  /* Décalage en cascade au sein des grilles */
  document.querySelectorAll(".tracks, .gallery-grid, .outro-grid, .press-quotes, .social-list")
    .forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        const el = child.classList.contains("reveal") ? child : child.querySelector(".reveal");
        if (el) el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      });
    });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  document.getElementById("lightboxImg").src = src;
  lb.classList.add("open");
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Un seul écouteur pour toutes les galeries (bio, live, crafter, outro) */
  document.addEventListener("click", e => {
    const trigger = e.target.closest(".lightbox-trigger");
    if (trigger) {
      e.preventDefault();
      openLightbox(trigger.getAttribute("href"));
    }
  });

  const lang = currentLang();
  document.documentElement.lang = lang;
  setupLangSwitch(lang);

  fetch(LANG_FILES[lang])
    .then(r => {
      if (!r.ok) throw new Error(LANG_FILES[lang] + " introuvable");
      return r.json();
    })
    .then(data => {
      if (data.site && data.site.pageTitle && !document.body.hasAttribute("data-keep-title")) {
        document.title = data.site.pageTitle;
      }
      fillSimpleFields(data);
      fillRepeats(data);
      renderBio(data.bio);
      renderTracks(data.music);
      renderGalleryInto("liveGallery", data.live && data.live.images);
      renderLiveChips(data.live);
      renderPressQuotes(data.press);
      renderPress(data.press);
      renderGalleryInto("crafterGallery", data.crafter && data.crafter.images);
      renderSocials(data.socials);
      renderGalleryInto("outroGallery", data.outro && data.outro.images);
      setupReveals();

      const lbClose = document.getElementById("lightboxClose");
      const lb = document.getElementById("lightbox");
      if (lbClose) lbClose.addEventListener("click", closeLightbox);
      if (lb) lb.addEventListener("click", e => {
        if (e.target.id === "lightbox") closeLightbox();
      });
    })
    .catch(err => {
      console.error(err);
      document.body.insertAdjacentHTML(
        "afterbegin",
        '<p style="background:#5a1a1a;color:#fff;padding:1rem;text-align:center;">' +
        "Impossible de charger content.json — si vous ouvrez ce fichier directement " +
        "depuis votre ordinateur (file://), lancez un petit serveur local " +
        "(ex: <code>python3 -m http.server</code>) ou déployez le dossier sur Netlify / GitHub Pages." +
        "</p>"
      );
    });
});
