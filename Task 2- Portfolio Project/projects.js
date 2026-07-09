/* ============================================================
   BACKGROUND PARTICLES (same setup as the main page)
   ============================================================ */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W,
  H,
  particles = [];
const COUNT = 80;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.35 + 0.5;
    this.vx = (Math.random() - 0.5) * 1.25;
    this.vy = (Math.random() - 0.5) * 1.25;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(127,90,240,${this.alpha})`;
    ctx.fill();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
}

for (let i = 0; i < COUNT; i++) particles.push(new Particle());

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(loop);
}
loop();

/* ============================================================
   NAVBAR — mirrors the main page: solid background past a small
   scroll offset, and hides on scroll-down / reveals on scroll-up.
   ============================================================ */
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

let lastScrollY = window.scrollY;
let navTicking = false;
const NAV_REVEAL_THRESHOLD = 12; // px of scroll before reacting, avoids jitter
const NAV_HIDE_START = 120; // don't hide until scrolled a bit past the top

function updateNavOnScroll() {
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;

  nav.classList.toggle("scrolled", currentY > 40);

  const menuOpen = mobileMenu.classList.contains("open");

  if (menuOpen || currentY < NAV_HIDE_START) {
    nav.style.transform = "translateY(0)";
  } else if (delta > NAV_REVEAL_THRESHOLD) {
    nav.style.transform = "translateY(-100%)";
  } else if (delta < -NAV_REVEAL_THRESHOLD) {
    nav.style.transform = "translateY(0)";
  }

  lastScrollY = currentY;
  navTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!navTicking) {
      requestAnimationFrame(updateNavOnScroll);
      navTicking = true;
    }
  },
  { passive: true },
);

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

const backToTop = document.getElementById("back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============================================================
   PROJECT CARDS — reveal on scroll, cursor spotlight, filtering
   ============================================================ */
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const delay = parseInt(card.dataset.delay || 0);
      setTimeout(() => card.classList.add("show"), delay);
      cardObserver.unobserve(card);
    });
  },
  { threshold: 0.08 },
);

const cards = document.querySelectorAll(".project-card");

cards.forEach((card, i) => {
  card.dataset.delay = (i % 3) * 80;
  cardObserver.observe(card);

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--x", "-9999px");
    card.style.setProperty("--y", "-9999px");
  });
});

const filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const tags = card.dataset.tags || "";
      const match = filter === "all" || tags.includes(filter);
      if (match) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
        card.style.pointerEvents = "";
      } else {
        card.style.opacity = "0.15";
        card.style.transform = "scale(0.97)";
        card.style.pointerEvents = "none";
      }
    });
  });
});

/* ============================================================
   MAGNETIC HOVER PULL on nav buttons
   ============================================================ */
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener(
    "mousemove",
    (e) => {
      const rect = btn.getBoundingClientRect();
      const xDrift = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const yDrift = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.transform = `translate(${xDrift}px, ${yDrift}px)`;
    },
    { passive: true },
  );
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});