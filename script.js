// Poptávky odesílá serverová funkce functions/api/lead.js do Telegramu (viz README.md)
const LEAD_ENDPOINT = "/api/lead";

const PHONE_DISPLAY = "+420 702 875 037";
const PHONE_LINK = "tel:+420702875037";

(function () {
  "use strict";

  /* ---------- Rok v patičce ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Hlavička: stín po scrollu ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Tlačítko „zpět nahoru“ ---------- */
  const toTop = document.querySelector(".to-top");
  const onScrollTop = () => toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
  onScrollTop();
  window.addEventListener("scroll", onScrollTop, { passive: true });
  toTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", window.location.pathname + window.location.search);
  });

  /* ---------- Burger menu ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    nav.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- FAQ akordeon ---------- */
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* ---------- Animace při scrollu ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Mobilní lišta: skrýt, když je formulář na obrazovce ---------- */
  const bar = document.querySelector(".mobile-bar");
  const formSection = document.getElementById("poptavka");
  if (bar && formSection && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => bar.classList.toggle("is-hidden", entry.isIntersecting), { threshold: 0.15 })
      .observe(formSection);
  }

  /* ---------- Modální okno: Zásady ochrany osobních údajů ---------- */
  const modal = document.getElementById("privacy");
  let lastFocus = null;
  document.querySelectorAll("[data-open-privacy]").forEach((b) => b.addEventListener("click", () => {
    lastFocus = b;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
  }));
  const closeModal = () => {
    if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open");
  };
  modal.querySelectorAll("[data-close-privacy]").forEach((b) => b.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  modal.addEventListener("close", () => { if (lastFocus) lastFocus.focus(); });

  /* ---------- Formulář ---------- */
  const form = document.getElementById("lead-form");
  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const success = document.querySelector(".form-success");

  // UTM parametry a fbclid z URL do skrytých polí
  const params = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"].forEach((key) => {
    const v = params.get(key);
    if (v && form.elements[key]) form.elements[key].value = v.slice(0, 500);
  });

  const showError = () => {
    status.innerHTML = `Poptávku se nepodařilo odeslat. Zkuste to prosím znovu, nebo nám rovnou zavolejte na <a href="${PHONE_LINK}">${PHONE_DISPLAY}</a>.`;
  };

  // Vyskakovací okno „Poptávka byla úspěšně odeslána“
  const done = document.getElementById("lead-done");
  const showDone = () => {
    form.hidden = true;
    success.hidden = false;
    if (done && typeof done.showModal === "function") done.showModal();
    else success.focus();
  };
  if (done) {
    const closeDone = () => done.close();
    done.querySelectorAll("[data-close-done]").forEach((b) => b.addEventListener("click", closeDone));
    done.addEventListener("click", (e) => { if (e.target === done) closeDone(); });
    done.addEventListener("close", () => success.focus());
  }

  // Návrat po odeslání bez JavaScriptu (funkce přesměruje zpět s ?odeslano nebo ?chyba)
  if (params.has("odeslano")) {
    showDone();
  } else if (params.has("chyba")) {
    showError();
  }
  if (params.has("odeslano") || params.has("chyba")) {
    history.replaceState(null, "", window.location.pathname + "#poptavka");
  }

  const rules = {
    phone: (v) => {
      const digits = v.replace(/[^\d]/g, "");
      if (!v.trim()) return "Vyplňte prosím telefon, abychom vám mohli zavolat.";
      if (!/^[+\d\s()\-/]+$/.test(v) || digits.length < 9 || digits.length > 15)
        return "Zadejte telefon ve tvaru +420 123 456 789.";
      return "";
    },
    email: (v) => (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Zkontrolujte prosím e-mailovou adresu." : ""),
    obec: (v) => (v.trim().length < 2 ? "Napište prosím obec nebo lokalitu lesa." : ""),
    souhlas: (_, el) => (!el.checked ? "Pro odeslání potřebujeme váš souhlas se zpracováním údajů." : ""),
  };
  const errIds = { phone: "f-phone-err", email: "f-email-err", obec: "f-place-err", souhlas: "f-consent-err" };

  const validateField = (name) => {
    const el = form.elements[name];
    const msg = rules[name](el.value, el);
    document.getElementById(errIds[name]).textContent = msg;
    el.closest(".field").classList.toggle("has-error", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };

  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    el.addEventListener(el.type === "checkbox" ? "change" : "blur", () => validateField(name));
    el.addEventListener("input", () => { if (el.closest(".field").classList.contains("has-error")) validateField(name); });
  });

  const setLoading = (on) => {
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.querySelector(".btn__label").textContent = on ? "Odesílám…" : "Odeslat poptávku";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    const invalid = Object.keys(rules).filter((n) => !validateField(n));
    if (invalid.length) {
      form.elements[invalid[0]].focus();
      return;
    }
    if (form.elements.botcheck.checked) return; // spam

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.botcheck;
    data.souhlas = "ano";
    Object.keys(data).forEach((k) => { if (data[k] === "") delete data[k]; });

    setLoading(true);
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "HTTP " + res.status);

      showDone();
      onLeadSuccess();
    } catch (err) {
      console.error("Odeslání formuláře selhalo:", err);
      showError();
    } finally {
      setLoading(false);
    }
  });
})();

/**
 * Volá se po úspěšném odeslání poptávky.
 * Sem můžete později přidat Meta Pixel:  if (window.fbq) fbq('track', 'Lead');
 */
function onLeadSuccess() {
  // zatím nic
}
