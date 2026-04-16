// wwwroot/js/home.js

// ==========================
// Helpers
// ==========================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Debounce
function debounce(fn, ms = 150) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

// ==========================
// Reveal-on-scroll
// ==========================
(function revealOnScroll() {
    const els = $$('.reveal-on-scroll');
    if (!('IntersectionObserver' in window) || els.length === 0) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    els.forEach(el => io.observe(el));
})();

// ==========================
// Hero Slider (banners)
// ==========================
(function initHeroSlider() {
    const root = $('#hero-slider');
    if (!root) return;

    const slides = $$('.hero-slide', root);
    const dots = $$('.hero-dot', root);
    const prev = $('.hero-prev', root);
    const next = $('.hero-next', root);

    let idx = 0;
    let autoplayMs = 5000;
    let timer = null;
    let paused = false;

    function goTo(n) {
        idx = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        dots.forEach((d, i) => {
            const active = i === idx;
            d.classList.toggle('is-active', active);
            d.setAttribute('aria-selected', active ? 'true' : 'false');
            if (active) d.focus({ preventScroll: true });
        });
    }

    function start() {
        stop();
        timer = setInterval(() => {
            if (!paused) goTo(idx + 1);
        }, autoplayMs);
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    // Events
    prev?.addEventListener('click', () => { goTo(idx - 1); restart(); });
    next?.addEventListener('click', () => { goTo(idx + 1); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); restart(); }));

    // Keyboard (left/right)
    root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1); restart(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1); restart(); }
    });

    // Pause on hover/focus
    root.addEventListener('mouseenter', () => paused = true);
    root.addEventListener('mouseleave', () => paused = false);
    root.addEventListener('focusin', () => paused = true);
    root.addEventListener('focusout', () => paused = false);

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
    });

    function restart() { paused = false; start(); }

    // Init
    goTo(0);
    start();
})();

// ==========================
// Carrossel genérico (Sagas + Promoções)
// anda 1 card por vez, calcula quantos cabem, desabilita botões nas extremidades
// ==========================
class StepCarousel {
    constructor(container) {
        this.container = container;
        this.prevBtn = $('.carousel-btn.prev', container);
        this.nextBtn = $('.carousel-btn.next', container);
        this.windowEl = $('.carousel-window', container);
        this.track = $('.carousel-track', container);
        this.cards = $$('.game-card, .promo-card', this.track);

        this.index = 0;
        this.visible = 1;
        this.cardWidth = 250; // fallback
        this.gap = 24;        // fallback (bate com seu CSS)

        if (!this.track || this.cards.length === 0) return;

        this.measure();
        this.bind();
        this.update();
        this.ro = new ResizeObserver(debounce(() => {
            this.measure();
            this.clampIndex();
            this.update();
        }, 100));
        this.ro.observe(this.windowEl);
    }

    getGapFromCSS() {
        const cs = getComputedStyle(this.track);
        // para flex, 'gap' retorna o gap horizontal
        const g = parseFloat(cs.gap || cs.columnGap || '24');
        return isNaN(g) ? 24 : g;
    }

    measure() {
        // mede largura real do card
        const first = this.cards[0];
        this.cardWidth = first.getBoundingClientRect().width || this.cardWidth;
        this.gap = this.getGapFromCSS();

        const winW = this.windowEl.getBoundingClientRect().width;
        // quantos cabem inteiros na janela
        this.visible = Math.max(1, Math.floor((winW + this.gap) / (this.cardWidth + this.gap)));
    }

    clampIndex() {
        const maxIndex = Math.max(0, this.cards.length - this.visible);
        if (this.index > maxIndex) this.index = maxIndex;
        if (this.index < 0) this.index = 0;
    }

    translate() {
        const x = this.index * (this.cardWidth + this.gap);
        this.track.style.transform = `translateX(${-x}px)`;
    }

    updateButtons() {
        const maxIndex = Math.max(0, this.cards.length - this.visible);
        if (this.prevBtn) this.prevBtn.disabled = this.index <= 0;
        if (this.nextBtn) this.nextBtn.disabled = this.index >= maxIndex;
    }

    step(dir) {
        this.index += dir;
        this.clampIndex();
        this.update();
    }

    update() {
        this.translate();
        this.updateButtons();
    }

    bind() {
        this.prevBtn?.addEventListener('click', () => this.step(-1));
        this.nextBtn?.addEventListener('click', () => this.step(1));

        // Clique/teclado: acessibilidade básica
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.step(-1);
            if (e.key === 'ArrowRight') this.step(1);
        });

        // Drag/touch opcional (simples)
        let startX = 0;
        let dragging = false;

        const onDown = (x) => { startX = x; dragging = true; this.track.style.transition = 'none'; };
        const onMove = (x) => {
            if (!dragging) return;
            const dx = x - startX;
            this.track.style.transform = `translateX(${-(this.index * (this.cardWidth + this.gap)) + dx}px)`;
        };
        const onUp = (x) => {
            if (!dragging) return;
            dragging = false;
            this.track.style.transition = ''; // volta transição CSS
            const dx = x - startX;
            const threshold = (this.cardWidth + this.gap) * 0.25;
            if (dx > threshold) this.step(-1);
            else if (dx < -threshold) this.step(1);
            else this.update();
        };

        // mouse
        this.windowEl.addEventListener('mousedown', (e) => onDown(e.clientX));
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', (e) => onUp(e.clientX));
        // touch
        this.windowEl.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
        this.windowEl.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
        this.windowEl.addEventListener('touchend', (e) => onUp(e.changedTouches[0].clientX));
    }
}

// Inicializa todos os carrosséis da página
(function initCarousels() {
    ['#sagas-carousel', '#promo-carousel-1', '#promo-carousel-2'].forEach(sel => {
        const el = $(sel);
        if (el) new StepCarousel(el);
    });
})();

// ==========================
// UX extra: efeito "pressed" nos cards
// ==========================
(function pressedEffect() {
    const pressables = $$('.game-card, .promo-card');
    pressables.forEach(el => {
        el.addEventListener('mousedown', () => el.classList.add('is-pressed'));
        el.addEventListener('mouseleave', () => el.classList.remove('is-pressed'));
        el.addEventListener('mouseup', () => el.classList.remove('is-pressed'));
        el.addEventListener('touchstart', () => el.classList.add('is-pressed'), { passive: true });
        el.addEventListener('touchend', () => el.classList.remove('is-pressed'));
        el.addEventListener('touchcancel', () => el.classList.remove('is-pressed'));
    });
})();

// ==========================
// (Opcional) Popular chips do hero se estiver vazio
// ==========================
