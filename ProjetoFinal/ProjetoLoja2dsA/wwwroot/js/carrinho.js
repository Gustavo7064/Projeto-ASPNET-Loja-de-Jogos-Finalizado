// =========================================================
// FUNÇÕES BÁSICAS DO CARRINHO (localStorage)
// =========================================================
function getCarrinho() {
    try {
        const data = localStorage.getItem("carrinho");
        if (!data) return [];
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch (e) {
        console.error("Erro ao ler carrinho do localStorage:", e);
        // Se deu erro no JSON, zera o carrinho para não quebrar o JS
        localStorage.setItem("carrinho", "[]");
        return [];
    }
}

function setCarrinho(carrinho) {
    // Salva o carrinho atual
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    // Se o usuário estiver logado, salva o carrinho dele separadamente
    if (window.usuarioId && window.usuarioId !== 0) {
        localStorage.setItem("carrinho_usuario_" + window.usuarioId, JSON.stringify(carrinho));
    }
}

// Atualiza o número do carrinho no badge
function atualizarBadgeCarrinho() {
    const carrinho = getCarrinho();
    const totalItens = carrinho.reduce((soma, item) => soma + item.qtd, 0);

    const badge = document.getElementById("cart-count-badge");
    if (badge) {
        badge.textContent = totalItens;
        badge.style.display = totalItens > 0 ? "inline-block" : "none";
    }
}

// =========================================================
// ADICIONAR AO CARRINHO
// =========================================================
function adicionarAoCarrinho(nome, preco) {

    // 1) SE NÃO ESTIVER LOGADO -> mandar para login
    if (!window.usuarioLogado || window.usuarioId === 0) {
        window.location.href = "/Usuario/Login";
        return;
    }

    // 2) CONVERTER PREÇO
    const precoNumero = parseFloat(String(preco).replace(",", "."));
    let carrinho = getCarrinho();

    // 3) ADICIONAR OU INCREMENTAR
    const existente = carrinho.find(i => i.nome === nome);

    if (existente) {
        existente.qtd += 1;
    } else {
        carrinho.push({
            nome: nome,
            preco: precoNumero,
            qtd: 1
        });
    }

    // 4) SALVAR
    setCarrinho(carrinho);
    atualizarBadgeCarrinho();

    alert(`${nome} adicionado ao carrinho!`);
}

// =========================================================
// REMOVER ITEM
// =========================================================
function removerDoCarrinho(index) {
    let carrinho = getCarrinho();
    carrinho.splice(index, 1);

    setCarrinho(carrinho);
    atualizarBadgeCarrinho();
    carregarCarrinho();
}

// =========================================================
// MONTAR A TABELA DA PÁGINA CARRINHO
// =========================================================
function carregarCarrinho() {
    const carrinho = getCarrinho();
    const corpo = document.getElementById("cart-body");
    const totalSpan = document.getElementById("cart-total");
    const btnFinalizar = document.getElementById("btn-finalizar");

    if (!corpo) return;

    corpo.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        corpo.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;padding:56px 20px;color:var(--clr-text-3);background:transparent!important;">
                    <i class="bi bi-bag" style="font-size:2rem;display:block;margin-bottom:10px;opacity:.3;"></i>
                    Seu carrinho está vazio
                </td>
            </tr>`;
        if (totalSpan) totalSpan.textContent = "R$ 0,00";
        if (btnFinalizar) btnFinalizar.disabled = true;
        return;
    }

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.qtd;
        total += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td class="col-qtd">${item.qtd}</td>
            <td class="col-preco">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
            <td class="col-acao">
                <button class="btn-remover" onclick="removerDoCarrinho(${index})" title="Remover">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        corpo.appendChild(tr);
    });

    if (totalSpan) totalSpan.textContent = "R$ " + total.toFixed(2).replace('.', ',');
    if (btnFinalizar) btnFinalizar.disabled = false;
}

// =========================================================
// INICIALIZAÇÃO IMEDIATA (SEM DOMContentLoaded)
// =========================================================

// Se o usuário estiver logado → usa o carrinho dele
if (window.usuarioId && window.usuarioId !== 0) {
    const salvo = localStorage.getItem("carrinho_usuario_" + window.usuarioId);

    if (salvo) {
        localStorage.setItem("carrinho", salvo);
    } else {
        localStorage.setItem("carrinho", "[]");
    }
} else {
    // Usuário NÃO logado → garante que exista um carrinho
    if (!localStorage.getItem("carrinho")) {
        localStorage.setItem("carrinho", "[]");
    }
}

// Atualiza badge e tabela assim que o script carregar
atualizarBadgeCarrinho();
carregarCarrinho();

// 🔹 Botão "Finalizar Compra" leva para a tela de pagamento
const btnFinalizar = document.getElementById("btn-finalizar");
console.log("btnFinalizar encontrado?", btnFinalizar);

if (btnFinalizar) {
    btnFinalizar.addEventListener("click", function () {
        if (btnFinalizar.disabled) {
            return;
        }

        console.log("Clique no botão Finalizar Compra → redirecionando...");
        window.location.href = "/Pagamento/FazerPagamento";
    });
} else {
    console.warn("Botão #btn-finalizar não encontrado na página.");
}
