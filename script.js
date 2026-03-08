const counters = document.querySelectorAll('.counter');

const animateCounter = (el) => {
  const target = Number(el.dataset.target);
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

counters.forEach((counter) => observer.observe(counter));

document.getElementById('year').textContent = new Date().getFullYear();

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = Array.from({ length: Math.min(180, Math.floor(window.innerWidth / 8)) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6,
    v: 0.2 + Math.random() * 0.6,
  }));
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(86, 241, 255, 0.9)';

  for (const s of stars) {
    s.y += s.v;
    if (s.y > canvas.height) {
      s.y = -2;
      s.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(render);
};

window.addEventListener('resize', resize);
resize();
render();
