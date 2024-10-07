document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('catalogContainer');
    const adicionarIcon = document.getElementById('adicionar');

    try {
        const response = await fetch('http://localhost:3333/produto/listar'); // Alterar conforme necessário
        const result = await response.json();

        if (result.success) {
            const products = result.data;
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'retangulo';

                productDiv.innerHTML = `
                    <a href="../item/index.html?id=${product.id}">
                        <img src="${product.imagem_link}" class="itens" alt="${product.name}">
                    </a>
                    <p>${product.name}</p>
                    <p>R$ ${product.price}</p>
                `;

                productList.appendChild(productDiv);
            });
        } else {
            productList.innerHTML = '<p>Erro ao carregar produtos.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productList.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }

    // Verifica o status de acesso ao ícone de adicionar
    const hasAddAccess = localStorage.getItem('hasAddAccess') === 'true';
    adicionarIcon.style.display = hasAddAccess ? 'block' : 'none';
});