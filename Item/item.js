document.addEventListener('DOMContentLoaded', () => {
    // Extrai o ID do produto da URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (productId) {
        // Faz a requisição ao backend para buscar os detalhes do produto
        fetch(`http://localhost:3333/produto/listar/${productId}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const product = result.data;
                    document.getElementById('produtoNome').innerText = product.name;
                    document.getElementById('descricao').querySelector('p').innerText = product.description;
                    document.getElementById('produtoPreco').innerText = `R$ ${product.price}`;
                    
                    if (product.imagem_link) {
                        document.getElementById('produto-imagem').src = product.imagem_link;
                    }
                } else {
                    console.error('Erro ao carregar produto:', result.message);
                }
            })
            .catch(error => console.error('Erro ao carregar produto:', error));
    } else {
        console.error('ID do produto não encontrado na URL');
    }
});

function adicionarAoCarrinho() {
    // Obtenha os dados do produto a partir do DOM
    const productName = document.getElementById('produtoNome').innerText;
    const productPrice = parseFloat(document.getElementById('produtoPreco').innerText.replace('R$', '').trim());
    const productImage = document.getElementById('produto-imagem').src;

    // Verifique se os dados foram capturados corretamente
    console.log('Nome do produto:', productName);
    console.log('Preço do produto:', productPrice);
    console.log('Imagem do produto:', productImage);

    // Crie um objeto para o produto
    const product = {
        name: productName,
        price: productPrice,
        image: productImage
    };

    // Verifique se já existe um carrinho no localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Adicione o novo produto ao carrinho
    cart.push(product);

    // Salve o carrinho atualizado no localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Opcional: Exiba uma mensagem de confirmação
    alert(`${productName} foi adicionado ao carrinho!`);
}

