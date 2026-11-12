// ========================================
// MAA MANSA DEVI GLASS WORKS — Interactive JS
// Premium architectural glass & aluminium website
// ========================================

(function () {
  "use strict";

  /* ---------- Config (replace with real values) ---------- */
  const CONFIG = {
    whatsapp: "",   // e.g. "919876543210" (country code + number, no +)
    phone: "",      // e.g. "+919876543210"
  };

  /* ---------- Fallback Data (used if API fails) ---------- */
  const FALLBACK_PRODUCTS = [
    {
      id: 1,
      title: "Glass Work",
      category: "Glass",
      image: "https://images.unsplash.com/photo-1560449029-e1408978d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      desc: "Custom glass panels, partitions, mirrors and glazing solutions for homes and commercial spaces.",
      details: [
        "Toughened and laminated glass options",
        "Custom sizes and edge finishes",
        "Glass partitions for offices",
        "Mirror installation and fitting",
      ],
    },
    {
      id: 2,
      title: "Aluminium Work",
      category: "Aluminium",
      image: "https://images.unsplash.com/photo-1582517277278-a24e8e74cb6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      desc: "Lightweight, corrosion-resistant aluminium frames, windows and doors for modern architecture.",
      details: [
        "Sliding and casement windows",
        "Aluminium doors and partitions",
        "Powder-coated finishes",
        "Mosquito mesh integration",
      ],
    },
    {
      id: 3,
      title: "Steel Work",
      category: "Steel",
      image: "https://images.unsplash.com/photo-1532987622753-3c1b9f9d6d09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      desc: "Strong structural steel fabrication including gates, grills, railings and support frameworks.",
      details: [
        "Steel gates and grills",
        "Staircase railings",
        "Structural support frames",
        "Custom steel design and welding",
      ],
    },
    {
      id: 4,
      title: "UPVC Profiles",
      category: "UPVC",
      image: "https://images.unsplash.com/photo-1600596542815-0ad49f3377ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      desc: "Energy-efficient UPVC doors and windows with excellent insulation and low maintenance.",
      details: [
        "UPVC sliding windows",
        "Casement and tilt-turn windows",
        "UPVC doors with multi-point locks",
        "Sound and heat insulation",
      ],
    },
    {
      id: 5,
      title: "ACP Panels",
      category: "ACP",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19648f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      desc: "Modern aluminium composite panel cladding for building exteriors and signage.",
      details: [
        "Exterior facade cladding",
        "Interior wall paneling",
        "Signage and branding panels",
        "Weather-resistant finish",
      ],
    },
  ];

  const FALLBACK_PROJECTS = [
    {
      id: 1,
      title: "Elegant Glass Partition",
      category: "Glass",
      image: "https://images.unsplash.com/photo-1560449029-e1408978d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Modern Aluminium Windows",
      category: "Aluminium",
      image: "https://images.unsplash.com/photo-1582517277278-a24e8e74cb6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Structural Steel Gate",
      category: "Steel",
      image: "https://images.unsplash.com/photo-1532987622753-3c1b9f9d6d09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "UPVC Windows & Doors",
      category: "UPVC",
      image: "https://images.unsplash.com/photo-1600596542815-0ad49f3377ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "Building Facade Cladding",
      category: "ACP",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19648f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Storefront Glazing",
      category: "Glass",
      image: "https://images.unsplash.com/photo-1560449029-e1408978d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  /* ---------- DOM Elements ---------- */
  const header = document.getElementById("header");
  const productsGrid = document.getElementById("products-grid");
  const projectsGrid = document.getElementById("projects-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const backToTop = document.getElementById("back-to-top");
  const navToggle = document.getElementById("nav-toggle");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("contact-form");
  const formMsg = document.getElementById("form-msg");

  // Lightbox elements
  const lightbox = document.getElementById("lightbox");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  /* ---------- WhatsApp / Phone Links ---------- */
  function setContactLinks() {
    const whatsappLinks = document.querySelectorAll("#whatsapp-btn, #contact-whatsapp, #footer-whatsapp");
    const phoneLinks = document.querySelectorAll("#contact-phone, #footer-phone");

    whatsappLinks.forEach((el) => {
      if (CONFIG.whatsapp) {
        el.href = `https://wa.me/${CONFIG.whatsapp}`;
      } else {
        el.href = "#";
        el.addEventListener("click", (e) => {
          e.preventDefault();
          alert("Please configure your WhatsApp number in js/main.js (CONFIG.whatsapp).");
        });
      }
    });

    phoneLinks.forEach((el) => {
      if (CONFIG.phone) {
        el.href = `tel:${CONFIG.phone}`;
      } else {
        el.href = "#";
        el.addEventListener("click", (e) => {
          e.preventDefault();
          alert("Please configure your phone number in js/main.js (CONFIG.phone).");
        });
      }
    });
  }

  /* ---------- Render Products (API with fallback) ---------- */
  async function renderProducts(filter = "all") {
    if (!productsGrid) return;

    let productData = FALLBACK_PRODUCTS;

    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const apiData = await res.json();
        if (apiData && apiData.length > 0) {
          productData = apiData;
        }
      }
    } catch (err) {
      console.error("Products API failed, using fallback:", err);
    }

    productsGrid.innerHTML = productData
      .filter((p) => filter === "all" || p.category === filter)
      .map((p) => {
        return `
          <article class="product-card reveal" data-category="${p.category}" onclick="openProductModal(${p.id})">
            <div class="product-img-wrap">
              <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560449029-e1408978d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
              <a href="#" class="view-link" aria-label="View ${p.title} details" onclick="event.stopPropagation(); openProductModal(${p.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M14.31 8l5.74 9.94M4.05 8.01l5.47 11.66M8.1 15.9l3.29 3.29"></path></svg>
              </a>
            </div>
            <div class="product-info">
              <h3>${p.title}</h3>
              <p>${p.desc}</p>
              <button class="product-btn" onclick="event.stopPropagation(); openProductModal(${p.id})">View Details</button>
            </div>
          </article>
        `;
      }
    )
    .join("");
  }

  /* ---------- Product Detail Modal ---------- */
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.id = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="product-modal" id="product-modal">
      <button class="modal-close" id="modal-close" aria-label="Close modal">×</button>
      <div class="modal-content">
        <div class="modal-img" id="modal-img"></div>
        <div class="modal-info">
          <h2 class="modal-title" id="modal-title"></h2>
          <p class="modal-category" id="modal-category"></p>
          <p class="modal-desc" id="modal-desc"></p>
          <div class="modal-actions">
            <a href="#" class="btn-primary" id="modal-enquiry">Enquire About This Product</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  const modalClose = document.getElementById("modal-close");
  const modalTitle = document.getElementById("modal-title");
  const modalCategory = document.getElementById("modal-category");
  const modalDesc = document.getElementById("modal-desc");
  const modalImg = document.getElementById("modal-img");
  const modalEnquiry = document.getElementById("modal-enquiry");

  window.openProductModal = function (id) {
    const product = FALLBACK_PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    modalTitle.textContent = product.title;
    modalCategory.textContent = product.category;
    modalDesc.textContent = product.desc;
    modalImg.innerHTML = `<img src="${product.image}" alt="${product.title}" style="width:100%;height:100%;object-fit:cover;">`;

    if (CONFIG.whatsapp) {
      const msg = `Hi MAA MANSA DEVI GLASS WORKS, I am interested in "${product.title}" (${product.category}). Please share more details.`;
      modalEnquiry.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
      modalEnquiry.style.display = "inline-block";
    } else {
      modalEnquiry.style.display = "none";
    }

    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  function closeModal() {
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- Render Projects (API with fallback) ---------- */
  async function renderProjects(filter = "all") {
    if (!projectsGrid) return;

    let projectData = FALLBACK_PROJECTS;

    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const apiData = await res.json();
        if (apiData && apiData.length > 0) {
          projectData = apiData;
        }
      }
    } catch (err) {
      console.error("Projects API failed, using fallback:", err);
    }

    projectsGrid.innerHTML = projectData
      .filter((p) => filter === "all" || p.category === filter)
      .map((p) => {
        return `
          <article class="project-card reveal" data-category="${p.category}">
            <div class="project-img">
              <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560449029-e1408978d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
            </div>
            <div class="project-overlay">
              <span class="project-category">${p.category}</span>
              <h3>${p.title}</h3>
            </div>
          </article>
        `;
      }
    )
    .join("");

    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => {
        const img = card.querySelector("img");
        const title = card.querySelector("h3").textContent;
        const category = card.querySelector(".project-category").textContent;
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
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
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

    // Header transparency with hysteresis (only toggle when clearly past threshold)
    if (scrollY > 120 && headerTransparent) {
      header.classList.remove("transparent");
      headerTransparent = false;
    } else if (scrollY <= 80 && !headerTransparent) {
      header.classList.add("transparent");
      headerTransparent = true;
    }

    // Back to top visibility
    if (scrollY > 400) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavbar();
        ticking = false;
      });
      ticking = true;
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

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

  /* ---------- Scroll Reveal ---------- */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -80px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ---------- Contact Form ---------- */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const phone = contactForm.phone.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !phone || !message) {
        showFormMsg("Please fill in all fields.", "error");
        return;
      }

      const btn = contactForm.querySelector("button[type='submit']");
      const originalText = btn.textContent;
      btn.textContent = "Sending...";
      btn.disabled = true;

      if (CONFIG.whatsapp) {
        const waMsg = `*New Enquiry from MAA MANSA DEVI GLASS WORKS Website*\n*Name:* ${name}\n*Phone:* ${phone}\n*Message:* ${message}`;
        const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(waMsg)}`;

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

    if (type === "success") {
      formMsg.style.color = "var(--success)";
    } else if (type === "error") {
      formMsg.style.color = "var(--danger)";
    } else {
      formMsg.style.color = "var(--sky-dark)";
    }

    setTimeout(() => {
      formMsg.textContent = "";
    }, 6000);
  }

  /* ---------- Init ---------- */
  function init() {
    setContactLinks();
    renderProducts();
    renderProjects();
  }

  init();
})();
