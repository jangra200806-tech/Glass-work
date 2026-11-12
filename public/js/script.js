// ========================================
// MAA MANSA DEVI GLASS WORKS — Interactive JS
// Premium architectural glass & aluminium website
// ========================================

(function () {
  "use strict";

  /* All business details come from public/data/info.js */
  const BIZ = typeof BUSINESS !== "undefined" ? BUSINESS : {};
  const PHONES = Array.isArray(BIZ.phones) ? BIZ.phones.filter(Boolean) : [];
  const PRIMARY_PHONE = PHONES[0] || "";
  const WHATSAPP_DIGITS = String(BIZ.whatsapp || PRIMARY_PHONE).replace(/\D/g, "");

  function displayPhone(phone) {
    const digits = String(phone).replace(/\D/g, "");
    const local = digits.startsWith("91") ? digits.slice(2) : digits;
    return `+91 ${local}`;
  }

  function telHref(phone) {
    const digits = String(phone).replace(/\D/g, "");
    return `tel:+${digits.startsWith("91") ? digits : "91" + digits}`;
  }

  /* ---------- DOM Elements ---------- */
  const header = document.getElementById("header");
  const productsGrid = document.getElementById("products-grid");
  const servicesGrid = document.getElementById("services-grid");
  const projectsGrid = document.getElementById("projects-grid");
  const whyGrid = document.getElementById("why-grid");
  const faqGrid = document.getElementById("faq-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const backToTop = document.getElementById("back-to-top");
  const navToggle = document.getElementById("nav-toggle");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("contact-form");
  const formMsg = document.getElementById("form-msg");

  /* ---------- Slider State ---------- */
  let currentSlide = 0;
  let slideInterval = null;
  const slideIntervalTime = 3000;
  const slides = document.querySelectorAll(".hero-slide");
  const totalSlides = slides.length;
  const dots = document.querySelectorAll(".hero-dots button, .slider-dots button");

  /* ---------- Business Details / Contact Links ---------- */
  function renderBusinessInfo() {
    document.querySelectorAll("[data-biz-name]").forEach((el) => {
      if (BIZ.name) el.textContent = BIZ.name;
    });

    document.querySelectorAll("[data-biz-address]").forEach((el) => {
      if (BIZ.address) el.textContent = BIZ.address;
    });

    document.querySelectorAll("[data-biz-hours]").forEach((el) => {
      if (!Array.isArray(BIZ.hours)) return;
      el.replaceChildren(
        ...BIZ.hours.map((item) => {
          const row = document.createElement("span");
          row.className = "contact-hours-row";
          row.textContent = `${item.days}: ${item.time}`;
          return row;
        })
      );
    });

    document.querySelectorAll("[data-biz-rating]").forEach((el) => {
      if (BIZ.rating) el.textContent = `${BIZ.rating.value}/5 on ${BIZ.rating.source}`;
    });

    if (BIZ.address) {
      const mapQuery = encodeURIComponent(BIZ.address);
      document.querySelectorAll("[data-map-link]").forEach((el) => {
        el.href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      });

      const mapEmbed = document.querySelector("[data-map-embed]");
      if (mapEmbed) {
        mapEmbed.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
      }
    }
  }

  function setContactLinks() {
    const whatsappLinks = document.querySelectorAll(
      "#whatsapp-btn, #contact-whatsapp, #footer-whatsapp, #cta-whatsapp, #float-whatsapp, [data-wa-link]"
    );

    whatsappLinks.forEach((el) => {
      if (WHATSAPP_DIGITS) {
        el.href = `https://wa.me/${WHATSAPP_DIGITS}`;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
        el.removeAttribute("title");
      } else {
        el.href = "contact.html";
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    });

    document.querySelectorAll("[data-call-link], #float-call").forEach((el) => {
      if (PRIMARY_PHONE) {
        el.href = telHref(PRIMARY_PHONE);
        el.setAttribute("aria-label", `Call ${BIZ.name || "us"} at ${displayPhone(PRIMARY_PHONE)}`);
      } else {
        el.href = "contact.html";
      }
    });

    document.querySelectorAll("[data-phone-index]").forEach((el) => {
      const phone = PHONES[Number(el.dataset.phoneIndex)];
      if (!phone) {
        el.href = "contact.html";
        return;
      }
      el.href = telHref(phone);
      el.setAttribute("aria-label", `Call ${displayPhone(phone)}`);
      const textTarget = el.querySelector("[data-phone-text]");
      if (textTarget) textTarget.textContent = displayPhone(phone);
      else el.textContent = displayPhone(phone);
    });
  }

  /* ---------- Slider Functions ---------- */
  function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + totalSlides) % totalSlides;
    slides.forEach((s, i) => s.classList.toggle("active", i === currentSlide));
    dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startSlider() {
    if (!slides.length) return;
    slideInterval = setInterval(nextSlide, slideIntervalTime);
  }
  function stopSlider() { clearInterval(slideInterval); slideInterval = null; }

  function initSlider() {
    if (!slides.length) return;
    dots.forEach((d, i) => {
      d.addEventListener("click", () => { stopSlider(); goToSlide(i); startSlider(); });
    });
    const prevBtn = document.querySelector(".hero-prev, .slider-prev");
    const nextBtn = document.querySelector(".hero-next, .slider-next");
    if (prevBtn) prevBtn.addEventListener("click", () => { stopSlider(); prevSlide(); startSlider(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { stopSlider(); nextSlide(); startSlider(); });
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stopSlider);
      hero.addEventListener("mouseleave", startSlider);
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { stopSlider(); prevSlide(); startSlider(); }
      if (e.key === "ArrowRight") { stopSlider(); nextSlide(); startSlider(); }
    });
    let startX = 0;
    if (hero) {
      hero.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
      hero.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
          stopSlider();
          if (diff > 0) nextSlide(); else prevSlide();
          startSlider();
        }
      }, { passive: true });
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopSlider();
      slides.forEach((s, i) => s.classList.toggle("active", i === 0));
      dots.forEach((d, i) => d.classList.toggle("active", i === 0));
      currentSlide = 0;
    } else {
      startSlider();
    }
  }

  /* ---------- Render Products ---------- */
  function renderProducts(filter = "all") {
    if (!productsGrid) return;
    const products = BUSINESS.products.filter((p) => filter === "all" || p.category === filter);
    productsGrid.innerHTML = products.map((p) => `
      <article class="product-card">
        <div class="product-img-wrap">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title} — ${p.category} work by MAA MANSA DEVI GLASS WORKS" loading="lazy" decoding="async" width="800" height="520" onerror="this.src='images/placeholder.svg'"><span class="product-img-tag">${p.category}</span>`
            : `<div class="media-gradient" role="img" aria-label="${p.title}"><span class="media-gradient-tag">${p.category}</span></div>`}
        </div>
        <div class="product-info">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <ul>
            ${(p.bullets || []).map((b) => `<li>${b}</li>`).join("")}
          </ul>
          <a href="contact.html?product=${encodeURIComponent(p.title)}" class="btn-primary">Get a Quote</a>
        </div>
      </article>
    `).join("");
  }

  /* ---------- Render Services ---------- */
  function renderServices() {
    if (!servicesGrid) return;
    servicesGrid.innerHTML = BUSINESS.services.map((s) => `
      <div class="service-card">
        <div class="service-icon">🛠️</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <a href="contact.html?service=${encodeURIComponent(s.title)}" class="btn-outline">Get a Quote</a>
      </div>
    `).join("");
  }

  /* ---------- Render Why Choose Us ---------- */
  function renderWhyUs() {
    if (!whyGrid) return;
    whyGrid.innerHTML = BUSINESS.whyUs.map((w) => `
      <div class="why-card">
        <div class="why-icon">✦</div>
        <h3>${w.title}</h3>
        <p>${w.desc}</p>
      </div>
    `).join("");
  }

  /* ---------- Render FAQs ---------- */
  function renderFaqs() {
    if (!faqGrid || !BUSINESS.faqs) return;
    faqGrid.innerHTML = BUSINESS.faqs.map((item, i) => `
      <div class="faq-card">
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-answer-${i}">
          <span class="faq-q">${item.q}</span>
          <span class="faq-arrow" aria-hidden="true">+</span>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" hidden>
          <p>${item.a}</p>
        </div>
      </div>
    `).join("");

    faqGrid.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
        const answer = document.getElementById(btn.getAttribute("aria-controls"));
        if (answer) answer.hidden = isOpen;
        const arrow = btn.querySelector(".faq-arrow");
        if (arrow) arrow.textContent = isOpen ? "+" : "−";
      });
    });
  }

  /* ---------- Render Projects ---------- */
  function renderProjects(filter = "all") {
    if (!projectsGrid) return;
    const projects = BUSINESS.projects.filter((p) => filter === "all" || p.category === filter);
    projectsGrid.innerHTML = projects.map((p) => `
      <article class="project-card" data-category="${p.category}">
        <div class="project-img">
          ${p.image
            ? `<img src="${p.image}" alt="${p.title} — ${p.category} project by MAA MANSA DEVI GLASS WORKS" loading="lazy" decoding="async" width="400" height="300" class="${p.fit === "contain" ? "project-img-contain" : ""}" onerror="this.src='images/placeholder.svg'">`
            : `<div class="media-gradient" role="img" aria-label="${p.title}"><span class="media-gradient-tag">${p.category}</span></div>`}
        </div>
        <div class="project-overlay">
          <span class="project-category">${p.category}</span>
          <h3>${p.title}</h3>
        </div>
      </article>
    `).join("");

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => {
        const img = card.querySelector("img");
        if (!img) return;
        const title = card.querySelector("h3").textContent;
        const category = card.querySelector(".project-category").textContent;
        const lightbox = document.getElementById("lightbox");
        const lightboxImg = document.getElementById("lightbox-img");
        const lightboxCaption = document.getElementById("lightbox-caption");
        if (!lightbox || !lightboxImg || !lightboxCaption) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = title;
        lightboxCaption.textContent = `${title} — ${category}`;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
  }

  /* ---------- Lightbox ---------- */
  function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  const lightboxCloseBtn = document.getElementById("lightbox-close");
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);

  const lightboxRoot = document.getElementById("lightbox");
  if (lightboxRoot) {
    lightboxRoot.addEventListener("click", (e) => {
      if (e.target === lightboxRoot) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Filter Buttons ---------- */
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(filter);
      renderProjects(filter);
    });
  });

  /* ---------- Navbar Scroll Effect ---------- */
  let ticking = false;
  let headerTransparent = true;
  function updateNavbar() {
    const scrollY = window.scrollY;
    if (scrollY > 120 && headerTransparent) {
      header.classList.remove("transparent");
      headerTransparent = false;
    } else if (scrollY <= 80 && !headerTransparent) {
      header.classList.add("transparent");
      headerTransparent = true;
    }
    if (scrollY > 400) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => { updateNavbar(); ticking = false; });
      ticking = true;
    }
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile Nav ---------- */
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", isOpen);
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Contact Form ---------- */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameField = contactForm.querySelector("#name");
      const phoneField = contactForm.querySelector("#phone");
      const serviceField = contactForm.querySelector("#service");
      const messageField = contactForm.querySelector("#message");
      const name = nameField ? nameField.value.trim() : "";
      const phone = phoneField ? phoneField.value.trim() : "";
      const service = serviceField ? serviceField.value.trim() : "";
      const message = messageField ? messageField.value.trim() : "";
      if (!name || !phone) {
        showFormMsg("Naam aur phone number zaroori hain.", "error");
        return;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        showFormMsg("Sahi 10 ank ka phone number likhein.", "error");
        return;
      }
      const btn = contactForm.querySelector("button[type='submit']");
      const originalText = btn.textContent;
      btn.textContent = "Sending...";
      btn.disabled = true;
      if (WHATSAPP_DIGITS) {
        const waMsg = `*New Enquiry from MAA MANSA DEVI GLASS WORKS Website*\n*Name:* ${name}\n*Phone:* ${phone}\n*Service:* ${service}\n*Message:* ${message}`;
        const waUrl = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(waMsg)}`;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          contactForm.reset();
          showFormMsg("Opening WhatsApp to send your enquiry...", "success");
          window.open(waUrl, "_blank");
        }, 800);
      } else {
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          contactForm.reset();
          showFormMsg("Thank you! Please call or WhatsApp us directly.", "info");
        }, 1200);
      }
    });
  }

  function showFormMsg(text, type) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.style.fontWeight = "600";
    formMsg.style.minHeight = "1.25rem";
    if (type === "success") formMsg.style.color = "var(--success)";
    else if (type === "error") formMsg.style.color = "var(--danger)";
    else formMsg.style.color = "var(--sky-dark)";
    setTimeout(() => { formMsg.textContent = ""; }, 6000);
  }

  /* ---------- Populate Service Dropdown ---------- */
  function populateServiceDropdown() {
    const serviceSelect = document.getElementById("service");
    if (!serviceSelect) return;
    const options = [];
    (BUSINESS.products || []).forEach((p) => options.push(p.title));
    (BUSINESS.services || []).forEach((s) => {
      if (!options.includes(s.title)) options.push(s.title);
    });
    options.forEach((label) => {
      const option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      serviceSelect.appendChild(option);
    });
  }

  /* ---------- Auto-fill Product/Service from URL ---------- */
  function autoFillProductFromUrl() {
    const serviceSelect = document.getElementById("service");
    if (!serviceSelect || !window.location.search) return;
    const params = new URLSearchParams(window.location.search);
    const value = params.get("product") || params.get("service");
    if (value) {
      serviceSelect.value = value;
    }
  }

  /* ---------- Reveal Animation (with safe fallback) ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach((el) => observer.observe(el));

    /* Safety net: never leave content hidden */
    setTimeout(() => {
      items.forEach((el) => el.classList.add("active"));
    }, 1500);
  }

  /* ---------- Init ---------- */
  function init() {
    document.documentElement.classList.add("js");
    document.documentElement.classList.add("js-enabled");
    renderBusinessInfo();
    setContactLinks();
    initSlider();
    renderProducts();
    renderServices();
    renderWhyUs();
    renderFaqs();
    renderProjects();
    populateServiceDropdown();
    autoFillProductFromUrl();
    initReveal();
  }

  init();
})();