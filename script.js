const body = document.body;
const cursorSystem = document.querySelector(".cursor-system");
const cursorCore = document.querySelector(".cursor-core");
const cursorTrails = document.querySelectorAll(".cursor-trail");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const magneticItems = document.querySelectorAll(".magnetic");
const tiltCards = document.querySelectorAll(".tilt-card");
const counters = document.querySelectorAll("[data-count]");
const testimonials = document.querySelectorAll(".testimonial");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
let testimonialIndex = 0;
let cursorMoveTimer;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUseFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const trailPoints = Array.from(cursorTrails, () => ({
  x: pointer.x,
  y: pointer.y,
  angle: 0
}));

if (cursorSystem && cursorCore && canUseFinePointer && !prefersReducedMotion) {
  window.addEventListener("mousemove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    cursorSystem.classList.add("is-moving");

    clearTimeout(cursorMoveTimer);
    cursorMoveTimer = setTimeout(() => {
      cursorSystem.classList.remove("is-moving");
    }, 120);
  });
}

function animateCursorTrail() {
  if (!cursorCore || !canUseFinePointer || prefersReducedMotion) return;

  cursorCore.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;

  cursorTrails.forEach((trail, index) => {
    const point = trailPoints[index];
    const speed = 0.28 - index * 0.032;
    const dx = pointer.x - point.x;
    const dy = pointer.y - point.y;

    point.x += dx * speed;
    point.y += dy * speed;
    point.angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const scale = 1 - index * 0.075;
    trail.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-88%, -50%) rotate(${point.angle}deg) scaleX(${scale})`;
  });

  requestAnimationFrame(animateCursorTrail);
}

animateCursorTrail();

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16 });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index % 6, 5) * 70}ms`;
  revealObserver.observe(item);
});

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const duration = 1300;
    const started = performance.now();

    function tick(now) {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.round(target * eased)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    countObserver.unobserve(counter);
  });
}, { threshold: 0.65 });

counters.forEach((counter) => countObserver.observe(counter));

if (canUseFinePointer && !prefersReducedMotion) magneticItems.forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "";
  });
});

if (canUseFinePointer && !prefersReducedMotion) tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

function showTestimonial(index) {
  testimonials.forEach((testimonial, itemIndex) => {
    testimonial.classList.toggle("active", itemIndex === index);
  });
}

function nextTestimonial() {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  showTestimonial(testimonialIndex);
}

prevButton?.addEventListener("click", () => {
  testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
  showTestimonial(testimonialIndex);
});

nextButton?.addEventListener("click", nextTestimonial);
if (testimonials.length > 1 && !prefersReducedMotion) setInterval(nextTestimonial, 5200);

const canvas = document.getElementById("particle-canvas");
const ctx = canvas?.getContext("2d");
let particles = [];

function resizeCanvas() {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

  const particleCount = Math.min(86, Math.floor(window.innerWidth / 16));
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.7 + 0.4,
    speed: Math.random() * 0.45 + 0.12,
    drift: Math.random() * 0.45 - 0.225,
    alpha: Math.random() * 0.45 + 0.2
  }));
}

function drawParticles() {
  if (!ctx || prefersReducedMotion) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -10) {
      particle.y = window.innerHeight + 10;
      particle.x = Math.random() * window.innerWidth;
    }

    if (particle.x < -10) particle.x = window.innerWidth + 10;
    if (particle.x > window.innerWidth + 10) particle.x = -10;

    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 5);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
    gradient.addColorStop(0.4, `rgba(24, 215, 255, ${particle.alpha * 0.45})`);
    gradient.addColorStop(1, "rgba(24, 215, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

if (canvas && ctx) {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawParticles();
}
