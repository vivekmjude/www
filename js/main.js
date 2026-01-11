(function () {
  "use strict";

  // === CONFIG ===
  const CONFIG = {
    // Note: JavaScript months are 0-indexed (0=Jan, 1=Feb,..., 11=Dec)
    yoeStartDate: new Date(2024, 8, 10), // Sep 10, 2024 (5-year milestone)
    crunchrStartDate: new Date(2022, 11, 1), // Dec 1, 2022
    headerOffset: 100,
    scrollThreshold: 50,
    observerThreshold: 0.1,
    observerRootMargin: "0px 0px -50px 0px",
    footnoteScrollDelay: 350,
  };

  // === SMART LINK HELPER ===
  // Automatically converts clean URLs to .html when running locally
  // This allows both double-clicking index.html and local dev servers to work
  // while keeping clean URLs in production
  function initSmartLinks() {
    const isFileProtocol = window.location.protocol === "file:";
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "";

    // Only convert links when running locally (file:// or localhost)
    // In production (vivek.ooo), let GitHub Pages handle clean URLs
    if (!isFileProtocol && !isLocalhost) return;

    const routes = {
      "/": "index.html",
      "/imprint": "imprint.html",
      "/resume": "resume.html",
    };

    document.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");

      if (routes[href]) {
        link.setAttribute("href", routes[href]);
      }

      if (href && href.startsWith("/#")) {
        link.setAttribute("href", "index.html" + href.substring(1));
      }
    });
  }

  // Run smart link helper immediately (script is at end of body, DOM is ready)
  initSmartLinks();

  // === UTILITIES ===
  function calculateYOE() {
    // 5 years completed on: Tuesday, September 10, 2024
    // Excluding MSc gap: September 2021 - October 2022
    const fiveYearMilestone = CONFIG.yoeStartDate;
    const now = new Date();

    // Calculate additional time since the 5-year milestone
    const additionalMs = now - fiveYearMilestone;
    const additionalYears = additionalMs / (1000 * 60 * 60 * 24 * 365.25);

    const totalYears = Math.floor(5 + additionalYears);
    return totalYears + "+";
  }

  function calculateCrunchrDuration() {
    const startDate = CONFIG.crunchrStartDate;
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const yearStr = years > 0 ? years + "yr" : "";
    const monthStr = months > 0 ? months + "mo" : "";

    return [yearStr, monthStr].filter(Boolean).join(" ");
  }

  // === DYNAMIC CONTENT ===
  const yoeElement = document.getElementById("yoe");
  const crunchrDurationElement = document.getElementById("crunchr-duration");
  const yearElement = document.getElementById("year");

  if (yoeElement) {
    yoeElement.textContent = calculateYOE();
  }

  if (crunchrDurationElement) {
    crunchrDurationElement.textContent = calculateCrunchrDuration();
  }

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // === INTERSECTION OBSERVER ===
  const observerOptions = {
    threshold: CONFIG.observerThreshold,
    rootMargin: CONFIG.observerRootMargin,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll("section").forEach((section) => {
    if (!section.classList.contains("visible")) {
      observer.observe(section);
    }
  });

  // === NAVIGATION ===
  const navLinks = document.querySelectorAll("nav a[href^='#']");
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    const scrollPos = window.scrollY + CONFIG.headerOffset;
    const bottomReached =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - CONFIG.scrollThreshold;

    // If at bottom of page, highlight last nav link (contact)
    if (bottomReached) {
      navLinks.forEach((link) => link.classList.remove("active"));
      const lastLink = navLinks[navLinks.length - 1];
      if (lastLink) lastLink.classList.add("active");
      return;
    }

    // Check if we're above the first section
    const firstSection = sections[0];
    if (firstSection && scrollPos < firstSection.offsetTop) {
      navLinks.forEach((link) => link.classList.remove("active"));
      return;
    }

    let activeFound = false;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("active");
          }
        });
        activeFound = true;
      }
    });

    // If no section matched and we're not at the top, remove all active classes
    if (!activeFound) {
      navLinks.forEach((link) => link.classList.remove("active"));
    }
  }

  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav(); // run on load

  // === EASTER EGGS ===

  // Terminal close button
  const terminal = document.getElementById("work-terminal");
  const closeButton = terminal?.querySelector(".terminal-control.close");

  if (closeButton) {
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      terminal.classList.add("hidden");
    });
  }

  // Footer footnote toggle
  const footerOrigin = document.querySelector(".footer-origin");
  if (footerOrigin) {
    footerOrigin.addEventListener("click", function () {
      this.classList.toggle("expanded");
      if (this.classList.contains("expanded")) {
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        }, CONFIG.footnoteScrollDelay);
      }
    });
  }

  // Logo: scroll to top on home page, navigate home on other pages
  const logo = document.querySelector(".logo");
  if (logo) {
    const isHomePage =
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("/index.html") ||
      window.location.pathname === "" ||
      window.location.href.endsWith("/index.html");

    logo.addEventListener("click", function (e) {
      if (isHomePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Otherwise, let the link navigate normally
    });
  }

  // V keypress - logo animation
  const cornerLogo = document.querySelector(".corner-logo");
  if (cornerLogo) {
    document.addEventListener("keydown", function (e) {
      // Only trigger when V is pressed alone (not paste) and not in editable context
      if (
        e.key.toLowerCase() === "v" &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA" &&
        !document.activeElement.isContentEditable
      ) {
        cornerLogo.classList.add("pressed");
      }
    });

    document.addEventListener("keyup", function (e) {
      if (e.key.toLowerCase() === "v") {
        cornerLogo.classList.remove("pressed");
      }
    });

    // Logo click animation: scroll to top on home page, navigate home on other pages
    cornerLogo.addEventListener("click", function () {
      cornerLogo.classList.add("pressed");
      const isHomePage =
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("/index.html") ||
        window.location.pathname === "" ||
        window.location.href.endsWith("/index.html");

      if (isHomePage) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "/";
      }

      setTimeout(() => {
        cornerLogo.classList.remove("pressed");
      }, 100);
    });
  }

  // Fade out scroll hint after user scrolls
  window.addEventListener(
    "scroll",
    () => {
      const hint = document.querySelector(".scroll-hint");
      if (hint && window.scrollY > CONFIG.scrollThreshold) {
        hint.classList.add("hidden");
      }
    },
    { passive: true }
  );
})();
