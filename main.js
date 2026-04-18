/* ── Nav scroll effect ──────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile menu toggle ─────────────────────────────────── */
const menuBtn = document.querySelector('.nav-menu-btn');
const navLinks = document.querySelector('.nav-links');
menuBtn?.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? '' : 'flex';
  if (!open) {
    Object.assign(navLinks.style, {
      flexDirection: 'column',
      position: 'absolute',
      top: '64px', left: 0, right: 0,
      background: 'rgba(13,15,20,0.97)',
      padding: '24px',
      gap: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    });
  }
});

/* ── Scroll-reveal with IntersectionObserver ────────────── */
const revealTargets = document.querySelectorAll(
  '.project-card, .timeline-item, .skill-group'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = (parseInt(el.dataset.index ?? 0)) * 80;
    setTimeout(() => el.classList.add('visible'), delay);
    observer.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => observer.observe(el));

/* ── Animated dot-field canvas ──────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('dots-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots;
  const DOT_COUNT = 80;
  const MAX_DIST  = 140;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    if (!dots) buildDots();
  }

  function buildDots() {
    dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }));
  }

  let mouse = { x: W / 2, y: H / 2 };
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,158,11,0.55)';
      ctx.fill();
    });

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(245,158,11,${0.18 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();
