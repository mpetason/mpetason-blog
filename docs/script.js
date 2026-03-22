// Theme toggle — cycles dark → light → psychedelic → dark
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const MODES = ['dark', 'light', 'psychedelic'];
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.borderBottomColor = window.scrollY > 10 ? '#1e2d3d' : 'transparent';
}, { passive: true });

// Active nav link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (i % 3) * 80 + 'ms';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));
