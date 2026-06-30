/* =========================================================
   Clínica Vitalis — script.js
   Maneja: navegación, scroll reveal, contadores animados,
   slider de testimonios, acordeón de FAQ, formulario de citas.
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initSmoothAnchors();
    initScrollReveal();
    initCounters();
    initTestimonialSlider();
    initFaqAccordion();
    initAppointmentForm();
    triggerHeroLoad();
  });

  /* ---------- año del footer ---------- */
  function setYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- fondo del header al hacer scroll ---------- */
  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- menú móvil ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileNav");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  /* ---------- scroll suave en anclas internas ---------- */
  function initSmoothAnchors() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerOffset = 84;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  /* ---------- animaciones al hacer scroll ---------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal-up");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- contadores animados ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat-number[data-count]");
    if (counters.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) { observer.observe(el); });

    function animateCounter(el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      var suffix = el.dataset.suffix || "";
      var duration = 1600;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString("es-MX") + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString("es-MX") + suffix;
        }
      }
      requestAnimationFrame(step);
    }
  }

  /* ---------- secuencia de entrada del hero ---------- */
  function triggerHeroLoad() {
    requestAnimationFrame(function () {
      setTimeout(function () {
        document.body.classList.add("loaded");
      }, 60);
    });
  }

  /* ---------- slider de testimonios ---------- */
  function initTestimonialSlider() {
    var track = document.getElementById("testimonialTrack");
    var dotsWrap = document.getElementById("testimonialDots");
    var prevBtn = document.getElementById("testimonialPrev");
    var nextBtn = document.getElementById("testimonialNext");
    if (!track || !dotsWrap) return;

    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var autoplayId = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () { goTo(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
    }

    function startAutoplay() {
      autoplayId = setInterval(function () { goTo(current + 1); }, 6000);
    }
    function restartAutoplay() {
      clearInterval(autoplayId);
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); restartAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); restartAutoplay(); });

    goTo(0);
    startAutoplay();
  }

  /* ---------- acordeón de preguntas frecuentes ---------- */
  function initFaqAccordion() {
    var items = document.querySelectorAll(".faq-item");
    if (items.length === 0) return;

    items.forEach(function (item) {
      var question = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");

      question.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";

        items.forEach(function (other) {
          other.setAttribute("data-open", "false");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isOpen) {
          item.setAttribute("data-open", "true");
          question.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- formulario de citas ---------- */
  function initAppointmentForm() {
    var form = document.getElementById("appointmentForm");
    if (!form) return;

    var statusEl = document.getElementById("apptStatus");
    var fields = {
      apptName: { input: document.getElementById("apptName"), error: document.getElementById("error-apptName") },
      apptPhone: { input: document.getElementById("apptPhone"), error: document.getElementById("error-apptPhone") },
      apptSpecialty: { input: document.getElementById("apptSpecialty"), error: document.getElementById("error-apptSpecialty") },
      apptDate: { input: document.getElementById("apptDate"), error: document.getElementById("error-apptDate") }
    };

    // No permitir fechas en el pasado
    var dateInput = fields.apptDate.input;
    if (dateInput) {
      var today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener("blur", function () { validateField(key); });
      fields[key].input.addEventListener("input", function () { clearFieldError(key); });
      fields[key].input.addEventListener("change", function () { clearFieldError(key); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var validations = Object.keys(fields).map(validateField);
      var allValid = validations.every(Boolean);

      if (!allValid) {
        statusEl.style.color = "";
        statusEl.textContent = "Por favor revisa los campos marcados.";
        statusEl.style.color = "#E0654F";
        return;
      }

      var submitBtn = form.querySelector(".form-submit");
      var label = submitBtn.querySelector(".btn-label");
      var originalLabel = label.textContent;

      submitBtn.disabled = true;
      label.textContent = "Enviando…";

      // No hay backend conectado — se simula una confirmación.
      setTimeout(function () {
        label.textContent = originalLabel;
        submitBtn.disabled = false;
        statusEl.style.color = "";
        statusEl.textContent = "¡Listo! Tu solicitud fue recibida. Te confirmaremos por correo o WhatsApp en breve.";
        form.reset();
      }, 900);
    });

    function validateField(key) {
      var field = fields[key];
      var value = field.input.value.trim();
      var message = "";

      if (value === "") {
        message = "Este campo es obligatorio.";
      } else if (key === "apptPhone" && !isValidPhone(value)) {
        message = "Ingresa un número de teléfono válido.";
      }

      var row = field.input.closest(".form-row") || field.input.parentElement;
      if (message) {
        row.classList.add("has-error");
        if (field.error) field.error.textContent = message;
        return false;
      } else {
        row.classList.remove("has-error");
        if (field.error) field.error.textContent = "";
        return true;
      }
    }

    function clearFieldError(key) {
      var field = fields[key];
      var row = field.input.closest(".form-row") || field.input.parentElement;
      row.classList.remove("has-error");
      if (field.error) field.error.textContent = "";
      statusEl.textContent = "";
    }

    function isValidPhone(value) {
      return /^[\d\s()+-]{7,}$/.test(value);
    }
  }
})();
