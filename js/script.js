// NAV
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// MÓDULOS
function toggleModule(id) {
    const body = document.getElementById(id + '-body');
    if (!body) return;
    body.classList.toggle('collapsed');
}

document.addEventListener('DOMContentLoaded', () => {
    const body1 = document.getElementById('mod1-body');
    if (body1) body1.classList.remove('collapsed');
});

// NAV shadow on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.08)'
        : 'none';
});

// VÍDEOS
const videoIds = {
    1: 'hOyqqdyIrp0',
    2: 'x6bHQj8fH_k'
};

function loadVideo(n) {
    const el = document.getElementById('video' + n);
    if (!el) return;
    el.style.background = '#000';
    el.innerHTML = `<iframe 
      src="https://www.youtube.com/embed/${videoIds[n]}?autoplay=1&rel=0" 
      allow="autoplay; encrypted-media" 
      allowfullscreen 
      style="position:absolute;inset:0;width:100%;height:100%;border:none">
    </iframe>`;
}