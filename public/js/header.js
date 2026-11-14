(function () {
  "use strict";

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const callCta = document.querySelector(".site-nav .nav-cta-link");

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  if (toggle) {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      if (nav && nav.classList.contains("open")) closeNav();
      else openNav();
    });
  }

  document.addEventListener("click", function (event) {
    if (!nav || !toggle) return;
    if (nav.classList.contains("open")) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNav();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav && nav.classList.contains("open")) closeNav();
  });

  if (nav) {
    nav.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (link) closeNav();
    });
  }

  if (callCta) {
    callCta.addEventListener("click", function () {
      closeNav();
    });
  }
})();
