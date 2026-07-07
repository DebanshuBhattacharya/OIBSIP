gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Prevents mobile address-bar collapse/expand from being treated as a
// real resize, which used to make pinned sections jump mid-scroll
ScrollTrigger.config({ ignoreMobileResize: true });

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const useStaticFallback = prefersReducedMotion;

/* ---------- Navbar shrink ---------- */
const navbar = document.getElementById("navbar");
const navbarWrap = document.getElementById("navbarWrap");
ScrollTrigger.create({
  start: "top -60",
  end: 99999,
  onUpdate: (self) => navbar.classList.toggle("shrink", self.scroll() > 60),
});

/* ---------- Mobile menu toggle ---------- */
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu(returnFocus) {
  mobileMenu.classList.remove("open");
  navToggle.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (returnFocus) navToggle.focus();
}

navToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen) {
    const firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus();
  }
});

mobileMenu
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => closeMobileMenu(false)));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
    closeMobileMenu(true);
  }
});

/* ---------- Smooth anchor-link scrolling ---------- */
const NAV_OFFSET = 90;

function smoothScrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  if (prefersReducedMotion) {
    target.scrollIntoView({ block: "start" });
    return;
  }
  gsap.to(window, {
    duration: 1.1,
    ease: "power3.inOut",
    scrollTo: { y: target, offsetY: NAV_OFFSET },
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return;
  link.addEventListener("click", (e) => {
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    smoothScrollToHash(hash);
    if (mobileMenu.classList.contains("open")) closeMobileMenu(false);
  });
});

/* ---------- Hero load timeline ---------- */
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
heroTl
  .from(".navbar", { y: -30, opacity: 0, duration: 0.8 })
  .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
  .from(
    "#heroTitle .line span",
    { yPercent: 110, duration: 1, stagger: 0.12 },
    "-=0.2",
  )
  .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
  .from(".hero-buttons .btn", { y: 0, opacity: 0, duration: 0.6 }, "-=0.4")
  .from(
    "#heroVisual",
    { opacity: 0, scale: 0.94, x: 500, duration: 1, ease: "power3.out" },
    "-=0.9",
  )
  .call(() => {
    document.documentElement.classList.remove("js-anim");
  });

/* ---------- Hero stage: 3D tilt toward cursor (desktop only) ---------- */
const heroStage = document.getElementById("heroVisual");
if (
  heroStage &&
  !prefersReducedMotion &&
  window.matchMedia("(hover: hover)").matches
) {
  gsap.set(heroStage, { transformPerspective: 800 });
  const tiltX = gsap.quickTo(heroStage, "rotateX", {
    duration: 0.5,
    ease: "power2.out",
  });
  const tiltY = gsap.quickTo(heroStage, "rotateY", {
    duration: 0.5,
    ease: "power2.out",
  });
  heroStage.addEventListener("mousemove", (e) => {
    const r = heroStage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltX(-py * 10);
    tiltY(px * 10);
  });
  heroStage.addEventListener("mouseleave", () => {
    tiltX(0);
    tiltY(0);
  });
}

/* ---------- Section titles reveal on scroll ---------- */
const titleSelectors = [
  "#introTitle",
  "#featuresTitle",
  "#statsTitle",
  "#variantsTitle",
  "#faqTitle",
  "#galleryTitle",
];
titleSelectors.forEach((sel) => {
  const el = document.querySelector(sel);
  if (!el) return;
  gsap.from(sel + " .line span", {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: { trigger: sel, start: "top 82%" },
  });
});

/* Blur-to-sharp paragraph reveal */
document.querySelectorAll(".section-desc").forEach((p) => {
  gsap.to(p, {
    filter: "blur(0px)",
    opacity: 1,
    duration: 1.1,
    ease: "power2.out",
    scrollTrigger: { trigger: p, start: "top 85%" },
  });
});

/* ---------- Background giant words parallax ---------- */
if (!prefersReducedMotion) {
  gsap.utils.toArray(".bg-word").forEach((word) => {
    const dir = word.style.right ? 1 : -1;
    gsap.to(word, {
      x: () => dir * 120,
      ease: "none",
      scrollTrigger: {
        trigger: word.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  });
}

/* ---------- Marquees tied to scroll velocity ---------- */
function makeMarquee(id, baseSpeed, direction) {
  const track = document.getElementById(id);
  if (!track) return null;

  // Duplicate once for a seamless loop, guarded so this can't run twice
  if (!track.dataset.duplicated) {
    track.innerHTML += track.innerHTML;
    track.dataset.duplicated = "true";
  }

  let xPos = 0;
  const totalWidth = () => track.scrollWidth / 2;
  const proxy = { speed: baseSpeed };

  gsap.ticker.add(() => {
    if (prefersReducedMotion) return;
    xPos -= proxy.speed * direction;
    const w = totalWidth();
    if (w === 0) return;
    if (xPos <= -w) xPos += w;
    if (xPos > 0) xPos -= w;
    gsap.set(track, { x: xPos });
  });

  return proxy;
}

const t1 = makeMarquee("track1", 1.1, 1);
const t2 = makeMarquee("track2", 0.7, -1);
const t3 = makeMarquee("track3", 1.4, 1);
const t4 = makeMarquee("track4", 0.9, -1);
const marqueeProxies = [t1, t2, t3, t4].filter(Boolean);

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    const vel = self.getVelocity() / 1000;
    const dirMultiplier = gsap.utils.clamp(0.4, 3, 1 + Math.abs(vel) * 0.15);
    const bases = [1.1, 0.7, 1.4, 0.9];
    marqueeProxies.forEach((p, i) => {
      gsap.to(p, {
        speed: bases[i] * dirMultiplier,
        duration: 0.4,
        overwrite: true,
      });
    });
  },
});

/* ---------- Pinned storytelling (Technology section) ---------- */
if (!useStaticFallback) {
  const storyTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#story",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      pin: "#storyStage",
      anticipatePin: 1,
    },
  });

  storyTl
    .to("#storyBgWord", { opacity: 0.08, scale: 1.08, duration: 1 })
    .fromTo(
      "#storyShoe",
      { opacity: 0 },
      { opacity: 1, rotate: 8, duration: 1 },
      0,
    )
    .fromTo(
      "#card1",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 10, duration: 0.6 },
      0.2,
    )
    .call(() => setProgress(1), null, 0.2)
    .to("#storyShoe", { rotate: -6, duration: 1 }, 1)
    .fromTo(
      "#card2",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      1.2,
    )
    .to("#card1", { opacity: 0.3, duration: 0.4 }, 1.2)
    .call(() => setProgress(2), null, 1.2)
    .to("#storyShoe", { rotate: 10, duration: 1 }, 2)
    .fromTo(
      "#card3",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      2.2,
    )
    .to("#card2", { opacity: 0.3, duration: 0.4 }, 2.2)
    .call(() => setProgress(3), null, 2.2)
    .to("#storyShoe", { rotate: 0, duration: 1 }, 3)
    .fromTo(
      "#card4",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      3.2,
    )
    .to("#card3", { opacity: 0.3, duration: 0.4 }, 3.2)
    .call(() => setProgress(4), null, 3.2);
} else {
  document
    .querySelectorAll(".story-card")
    .forEach((card) => card.classList.add("rm-visible"));
}

function setProgress(step) {
  document.querySelectorAll(".story-progress span").forEach((el, i) => {
    el.classList.toggle("active", i < step);
  });
}

/* ---------- Stat counters ---------- */
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      if (prefersReducedMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = obj.val.toFixed(decimals) + suffix;
        },
      });
    },
  });
});

/* Sustainability big figure counter */
document.querySelectorAll("[data-count-figure]").forEach((el) => {
  const target = parseFloat(el.dataset.countFigure);
  const numEl = el.querySelector(".sustain-figure-num");
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      if (prefersReducedMotion) {
        numEl.textContent = Math.round(target);
        return;
      }
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          numEl.textContent = Math.round(obj.val);
        },
      });
    },
  });
});

gsap.utils.toArray(".stat-card").forEach((card, i) => {
  gsap.from(card, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".stats-grid", start: "top 82%" },
    delay: i * 0.1,
  });
});

/* ---------- Feature cards: staggered reveal ---------- */
gsap.utils.toArray(".feature-card").forEach((card, i) => {
  const fromX = i % 3 === 0 ? -40 : i % 3 === 2 ? 40 : 0;
  gsap.from(card, {
    y: 50,
    x: fromX,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: card, start: "top 88%" },
  });
});

/* Feature card tilt (desktop only) */
if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: px * 8,
        rotateX: -py * 8,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 600,
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    });
  });
}

/* ---------- Color variant swatches ---------- */
const variantNames = [
  "Phantom Black",
  "Bone White",
  "Burnt Ochre",
  "Concrete Grey",
];
document.querySelectorAll(".swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    const target = swatch.dataset.target;
    document.querySelectorAll(".swatch").forEach((s) => {
      s.classList.remove("active");
      s.setAttribute("aria-pressed", "false");
    });
    swatch.classList.add("active");
    swatch.setAttribute("aria-pressed", "true");
    document
      .querySelectorAll("[data-variant]")
      .forEach((img) =>
        img.classList.toggle("active", img.dataset.variant === target),
      );
    document.getElementById("variantName").textContent = variantNames[target];
  });
});

/* ---------- Sustainability image parallax scale ---------- */
if (!useStaticFallback) {
  gsap.to("#sustainImg", {
    scale: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#craftsmanship",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });
} else {
  gsap.set("#sustainImg", { scale: 1 });
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  if (item.classList.contains("open")) {
    answer.style.maxHeight = answer.scrollHeight + "px";
  }
  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-answer").style.maxHeight = 0;
        openItem
          .querySelector(".faq-question")
          .setAttribute("aria-expanded", "false");
      }
    });
    item.classList.toggle("open", !isOpen);
    answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : 0;
    question.setAttribute("aria-expanded", String(!isOpen));
  });
});

// Keep the open answer's height in sync on resize (e.g. tablet rotation)
let faqResizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(faqResizeTimeout);
  faqResizeTimeout = setTimeout(() => {
    const openAnswer = document.querySelector(".faq-item.open .faq-answer");
    if (openAnswer) openAnswer.style.maxHeight = openAnswer.scrollHeight + "px";
  }, 150);
});

// Re-measure once webfonts swap in, otherwise the open answer can freeze
// at the wrong max-height and clip its last line
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    const openAnswer = document.querySelector(".faq-item.open .faq-answer");
    if (openAnswer) openAnswer.style.maxHeight = openAnswer.scrollHeight + "px";
  });
}

/* ---------- Magnetic buttons + ripple ---------- */
if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    });
  });
}
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const r = this.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(r.width, r.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - r.left - size / 2 + "px";
    ripple.style.top = e.clientY - r.top - size / 2 + "px";
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

/* ---------- Horizontal gallery pinned scroll ---------- */
const galleryTrack = document.getElementById("galleryTrack");
const galleryStage = document.querySelector(".gallery-stage");

function getGalleryDistance() {
  return galleryTrack.scrollWidth - galleryStage.clientWidth;
}

if (!useStaticFallback) {
  gsap.to(galleryTrack, {
    x: () => -getGalleryDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: "#gallery",
      start: "top top",
      end: () => "+=" + getGalleryDistance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
} else {
  galleryStage.classList.add("rm-scroll");
}

/* ---------- Testimonials: pinned horizontal scroll-linked drift ---------- */
const testimonialsTrack = document.querySelector(".testimonials-track");
const testimonialsSection = document.querySelector(".testimonials-section");

if (testimonialsTrack && testimonialsSection) {
  if (!useStaticFallback) {
    const getScrollAmount = () =>
      -(testimonialsTrack.scrollWidth - window.innerWidth + 80);

    gsap.to(testimonialsTrack, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: testimonialsSection,
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => "+=" + (testimonialsTrack.scrollWidth - window.innerWidth),
        invalidateOnRefresh: true,
      },
    });
  } else {
    testimonialsSection.classList.add("rm-scroll");
  }
}

/* ---------- Resize handling ---------- */
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 200);
});

window.addEventListener("load", () => ScrollTrigger.refresh());
ScrollTrigger.refresh();

if (!prefersReducedMotion) {
  gsap.utils.toArray(".hehehe").forEach((word) => {
    const dir = word.style.right ? 1 : -1;
    gsap.to(word, {
      x: () => dir * 250,
      ease: "none",
      scrollTrigger: {
        trigger: word.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  });
}
gsap.from(".finale h1", {
  y: 120,
  opacity: 0,
  duration: 1.4,
  ease: "power4.out",
  scrollTrigger: {
    trigger: ".finale",
    start: "top 70%",
  },
});

gsap.from(".finale p", {
  y: 60,
  opacity: 0,
  duration: 1,
  delay: 0.3,
  scrollTrigger: {
    trigger: ".finale",
    start: "top 70%",
  },
});

gsap.from(".signature", {
  opacity: 0,
  y: 50,
  duration: 1.2,
  delay: 0.6,
  scrollTrigger: {
    trigger: ".finale",
    start: "top 70%",
  },
});

/* ---------- Navbar: hide on scroll-down, reveal on scroll-up ---------- */
const NAVBAR_REVEAL_THRESHOLD = 120;
if (navbarWrap) {
  ScrollTrigger.create({
    start: "top top",
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      if (y < NAVBAR_REVEAL_THRESHOLD) {
        navbarWrap.classList.remove("navbar-hide");
        return;
      }
      if (self.direction === 1) {
        navbarWrap.classList.add("navbar-hide");
      } else if (self.direction === -1) {
        navbarWrap.classList.remove("navbar-hide");
      }
    },
  });

  navToggle.addEventListener("click", () => {
    if (mobileMenu.classList.contains("open")) {
      navbarWrap.classList.remove("navbar-hide");
    }
  });
}
