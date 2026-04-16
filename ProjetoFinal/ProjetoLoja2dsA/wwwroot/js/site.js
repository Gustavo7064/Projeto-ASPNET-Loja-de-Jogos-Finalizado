(function () {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const grid = $('#games-grid');
    const cards = $$('.game-card', grid);

    const fSearch = $('#f-search');
    const fGenre = $('#f-genre');
    const fPlatforms = $$('.f-platform');
    const fPrice = $('#f-price');
    const fPriceValue = $('#f-price-value');
    const fSort = $('#f-sort');
    const count = $('#count');
    const chips = $$('.chip');
    const chipRow = $('#chip-row');

    const fmtBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const updatePriceLabel = () => (fPriceValue.textContent = fmtBRL(Number(fPrice.value)));
    updatePriceLabel();

    // Debounce
    const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

    function getCardData(card) {
        return {
            name: (card.dataset.name || '').toLowerCase(),
            genre: (card.dataset.genre || '').toLowerCase(),
            platforms: (card.dataset.platforms || '').toLowerCase().split(',').map(s => s.trim()),
            price: Number(card.dataset.price || 0),
            rating: Number(card.dataset.rating || 0)
        };
    }

    function filterCards() {
        const q = (fSearch.value || '').trim().toLowerCase();
        const chipGenre = (chipRow?.querySelector('.chip.is-active')?.dataset?.genre || '').toLowerCase();
        const ddGenre = (fGenre.value || '').toLowerCase();
        // prioridade para chip; se “Tudo”, cai no select
        const genre = chipGenre || ddGenre;

        const maxPrice = Number(fPrice.value);
        const plats = fPlatforms.filter(c => c.checked).map(c => c.value.toLowerCase());

        let visible = [];
        cards.forEach(card => {
            const d = getCardData(card);
            const passSearch = !q || d.name.includes(q);
            const passGenre = !genre || d.genre.split(',').map(g => g.trim()).includes(genre);

            const passPrice = d.price <= maxPrice;
            const passPlat = plats.length === 0 || d.platforms.some(p => plats.includes(p));
            const show = passSearch && passGenre && passPrice && passPlat;
            card.style.display = show ? '' : 'none';
            if (show) visible.push(card);
        });

        // Ordenação
        switch (fSort.value) {
            case 'price-asc': visible.sort((a, b) => getCardData(a).price - getCardData(b).price); break;
            case 'price-desc': visible.sort((a, b) => getCardData(b).price - getCardData(a).price); break;
            case 'name-asc': visible.sort((a, b) => getCardData(a).name.localeCompare(getCardData(b).name)); break;
            case 'rating-desc': visible.sort((a, b) => getCardData(b).rating - getCardData(a).rating); break;
        }
        visible.forEach(c => grid.appendChild(c));

        // Contador / vazio
        count.textContent = `${visible.length} resultado${visible.length === 1 ? '' : 's'}`;
        toggleEmptyState(visible.length === 0);
    }

    function toggleEmptyState(isEmpty) {
        let empty = $('.dg-empty', grid);
        if (isEmpty) {
            if (!empty) {
                empty = document.createElement('div');
                empty.className = 'dg-empty';
                empty.textContent = 'Nenhum jogo encontrado com os filtros atuais.';
                grid.appendChild(empty);
            }
        } else if (empty) empty.remove();
    }

    // Eventos
    fSearch.addEventListener('input', debounce(filterCards, 180));
    fGenre.addEventListener('change', () => { // ao usar o select, desmarca chips
        chips.forEach(c => c.classList.remove('is-active'));
        filterCards();
    });
    fPlatforms.forEach(cb => cb.addEventListener('change', filterCards));
    fPrice.addEventListener('input', () => { updatePriceLabel(); filterCards(); });
    fSort.addEventListener('change', filterCards);

    // Chips
    chips.forEach(ch => ch.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        ch.classList.add('is-active');
        // se escolher “Tudo”, limpa o select; senão, mantém livre
        if (!ch.dataset.genre) fGenre.value = '';
        filterCards();
    }));

    // Curtir / Carrinho
    grid.addEventListener('click', (e) => {
        const wish = e.target.closest('.wish');
        const add = e.target.closest('.add-cart');

        if (wish) {
            wish.classList.toggle('on');
            wish.textContent = wish.classList.contains('on') ? '♥' : '♡';
            wish.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 220 });
        }
        if (add) {
            const name = add.closest('.game-card')?.dataset?.name || 'Jogo';
            // Aqui você pode fazer um POST para sua action ASP.NET
            
        }
    });

    // Init
    filterCards();
})();
// ======== FILTRO DE GÊNERO (ACEITA VÁRIAS CATEGORIAS) ========

// Pega todos os jogos
const jogos = document.querySelectorAll('.game-card');
// Pega o select de gênero
const filtroGenero = document.querySelector('#f-genre');
// Quando o usuário mudar o gênero no select...
filtroGenero.addEventListener('change', () => {
// Converte o valor selecionado para minúsculas
    const generoSelecionado = filtroGenero.value.toLowerCase();
    // Percorre todos os jogos da tela
    jogos.forEach(jogo => {

        // Lê as categorias do jogo (ex: "Aventura,RPG,Mundo Aberto")
        const generosDoJogo = jogo.dataset.genre.toLowerCase().split(',');
        /* 
          A lógica abaixo faz o seguinte:
          - Se o usuário escolheu um gênero (por exemplo: "rpg")
          - E esse gênero NÃO está entre as categorias do jogo
            → o card é escondido (display: none)
          - Caso contrário, o jogo é exibido normalmente
        */
        if (generoSelecionado && !generosDoJogo.includes(generoSelecionado)) {
            jogo.style.display = 'none';
        } else {
            jogo.style.display = '';
        }
    });
});
