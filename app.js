(() => {
  "use strict";
  const profile = window.HOJUN_PROFILE || {};
  if (profile.github) {
    try {
      const url = new URL(profile.github);
      if (url.protocol === "https:" && url.hostname === "github.com" && url.pathname.length > 1) {
        const link = document.getElementById("github-link");
        link.href = url.href;
        link.hidden = false;
      }
    } catch (_) { /* An invalid optional link remains hidden. */ }
  }
  if (profile.portrait) {
    const image = new Image();
    image.alt = "Hojun Lee";
    image.width = 224;
    image.height = 224;
    image.addEventListener("load", () => {
      const art = document.getElementById("profile-art");
      art.replaceChildren(image);
      art.removeAttribute("role");
      art.removeAttribute("aria-label");
    });
    image.src = profile.portrait;
  }

  const toast = document.getElementById("toast");
  let toastTimeout;
  function announce(message) {
    window.clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* Try the selection fallback. */ }
    }
    const field = document.createElement("textarea");
    const previousFocus = document.activeElement;
    field.value = text;
    field.readOnly = true;
    field.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    field.remove();
    previousFocus?.focus({preventScroll: true});
    return copied;
  }
  document.querySelectorAll("[data-copy-text], [data-copy-target]").forEach(button => {
    button.addEventListener("click", async () => {
      const isCitation = Boolean(button.dataset.copyTarget);
      const text = isCitation ? document.getElementById(button.dataset.copyTarget).textContent.trim() : button.dataset.copyText;
      const copied = await copyText(text);
      announce(copied ? (isCitation ? "BibTeX copied to clipboard" : "Email address copied") : "Copy unavailable. Please select and copy the text.");
    });
  });

  const links = [...document.querySelectorAll(".nav-link")];
  function setActive(id) {
    links.forEach(link => {
      const active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  links.forEach(link => link.addEventListener("click", () => setActive(link.hash.slice(1))));
  const sections = [...document.querySelectorAll(".observed-section")];
  let scheduled = false;
  function updateActive() {
    const marker = window.innerHeight * .32;
    let active = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) active = section.id;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) active = "contact";
    setActive(active);
    scheduled = false;
  }
  window.addEventListener("scroll", () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateActive); }
  }, {passive:true});
  window.addEventListener("resize", updateActive);
  updateActive();
})();
