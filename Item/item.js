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