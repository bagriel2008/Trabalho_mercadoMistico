document.addEventListener('DOMContentLoaded', () => {
    // Carregue o carrinho do localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Atualize a interface com os produtos do carrinho
    const produtosContainer = document.querySelector('.produtos');
    produtosContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (cart.length === 0) {
        // Se o carrinho estiver vazio, exiba uma mensagem apropriada
        const aviso = document.createElement('p');
        aviso.innerText = 'Seu carrinho está vazio.';
        produtosContainer.appendChild(aviso);
        document.getElementById('itensEscolhidos').textContent = '0';
        document.getElementById('custoTotal').textContent = '0';
        return; // Interrompe a execução se não houver itens
    }

    cart.forEach((item, index) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('primeiroProduto');
        productDiv.id = `produto${index + 1}`;

        productDiv.innerHTML = `
            <div class="primeiroQuadrado">
                <label class="checkbox-container">
                    <input type="checkbox" id="checkbox${index + 1}" data-price="${item.price}" data-name="${item.name}" data-image="${item.image}" onchange="updateSelectedItems()">
                </label>

                <div class="produto" id="produto${index + 1}">
                    <div class="item">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div>
                        <p>${item.name}</p>
                        <p>Preço: R$ <span id="preco${index + 1}" class="preco">${item.price.toFixed(2)}</span></p>
                        <p>Quantidade:</p>
                        <input type="number" id="quantidade${index + 1}" value="1" min="1" onchange="updateSelectedItems()">
                    </div>
                </div>
            </div>
        `;

        produtosContainer.appendChild(productDiv);
    });

    // Adiciona o botão "Limpar o carrinho" abaixo do último item
    const limparCarrinhoDiv = document.createElement('div');
    limparCarrinhoDiv.classList.add('limparCarrinho');
    limparCarrinhoDiv.innerHTML = `
        <button onclick="limparCarrinho()">
            <h1>Limpar o carrinho</h1>
        </button>
    `;
    produtosContainer.appendChild(limparCarrinhoDiv);

    // Atualize a contagem total de itens e custo total
    updateCart();
});

// Função para atualizar os itens selecionados e calcular total
function updateSelectedItems() {
    const checkboxes = document.querySelectorAll('.primeiroProduto input[type="checkbox"]');
    let totalItems = 0;
    let totalCost = 0;
    let itensSelecionados = {}; // Novo objeto para armazenar itens selecionados

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            // Encontre o campo de quantidade correspondente
            const quantityInput = checkbox.closest('.primeiroProduto').querySelector('input[type="number"]');
            const quantity = parseInt(quantityInput.value);
            const price = parseFloat(checkbox.getAttribute('data-price'));
            const image = checkbox.getAttribute('data-image'); // Obtém a imagem do produto

            totalItems += quantity; // Some a quantidade
            totalCost += price * quantity; // Calcule o custo total

            // Adiciona item selecionado ao objeto, incluindo a imagem
            const itemName = checkbox.getAttribute('data-name');
            itensSelecionados[itemName] = {
                name: itemName,
                price: price,
                quantity: quantity,
                image: image // Armazena a imagem
            };
        }
    });

    document.getElementById('itensEscolhidos').innerText = totalItems;
    document.getElementById('custoTotal').innerText = totalCost.toFixed(2);

    // Salvar os itens selecionados no localStorage
    localStorage.setItem('itensSelecionadosCheckout', JSON.stringify(itensSelecionados));
}

// Função para limpar o carrinho
function limparCarrinho() {
    // Limpa o localStorage
    localStorage.removeItem("cart");
    localStorage.removeItem("itensSelecionadosCheckout"); // Limpa os itens selecionados também

    // Reseta as informações da interface
    const produtosContainer = document.querySelector('.produtos');
    produtosContainer.innerHTML = ''; // Limpa o conteúdo do carrinho

    document.getElementById('itensEscolhidos').textContent = '0';
    document.getElementById('custoTotal').textContent = '0';

    // Você pode adicionar uma mensagem opcional de que o carrinho foi limpo
    const aviso = document.createElement('p');
    aviso.innerText = 'O carrinho foi limpo.';
    produtosContainer.appendChild(aviso);
}