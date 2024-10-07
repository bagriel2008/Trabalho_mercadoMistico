// Função para exibir os itens selecionados no checkout ao carregar a página
window.addEventListener('DOMContentLoaded', function () {
    resultadoFinal();
});

// Função para exibir os itens selecionados no checkout
function resultadoFinal() {
    // Carrega os itens do localStorage
    let itensSelecionados = JSON.parse(localStorage.getItem('itensSelecionadosCheckout')) || {};
    let checkoutContainer = document.querySelector('.compras .itens');
    let total = 0;

    checkoutContainer.innerHTML = ''; // Limpa o conteúdo atual

    // Verifica se há itens no localStorage
    if (Object.keys(itensSelecionados).length === 0) {
        checkoutContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        return; // Se o carrinho estiver vazio, sai da função
    }

    // Exibir cada item no checkout
    for (let nome in itensSelecionados) {
        let item = itensSelecionados[nome];

        let produtoHTML = `
            <div class="primeiroItem">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <p class="nome">${item.name}</p>
                    <p class="preco">Preço: R$ <span class="item-preco">${(item.price * item.quantity).toFixed(2)}</span></p>
                    <p class="qntd">Quantidade: ${item.quantity}</p>
                </div>
            </div>`;

        checkoutContainer.insertAdjacentHTML('beforeend', produtoHTML);

        total += item.price * item.quantity; // Calcula o total da compra
    }

    // Exibe o total e as informações da compra
    let totalCompraHTML = `
        <div class="container">
            <p>Total: <span id="total">R$ ${total.toFixed(2)}</span></p>
            <p>Desconto: R$ 0</p>
        </div>`;

    let confirmarCompraHTML = `
        <div class="confirmarCompra">
            <button id="confirmar-compra">
                <p>Confirmar compra</p>
            </button>
        </div>`;

    let informacoesContainer = document.querySelector('.informacoes');
    informacoesContainer.innerHTML = totalCompraHTML + confirmarCompraHTML;

    // Lógica do botão de confirmar compra
    const confirmarCompraBtn = document.getElementById('confirmar-compra');
    confirmarCompraBtn.addEventListener('click', function () {
        // Limpa o localStorage
        localStorage.removeItem('itensSelecionadosCheckout'); // Apenas remove os itens selecionados

        // Exibe uma mensagem de confirmação
        alert('Compra confirmada! O carrinho foi limpo.');
        window.location.reload(); // Opcional: recarrega a página após confirmar a compra
    });
}