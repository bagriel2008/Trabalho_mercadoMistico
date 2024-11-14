// Carregar e exibir publicações
async function loadPublicacao() {
    const response = await fetch('http://localhost:3002/publicacoes');
    const data = await response.json();
    const tbody = document.getElementById('listaPosts');
    tbody.innerHTML = '';

    if (data.success && data.data) {
        data.data.forEach(publicacao => {
            const linha = document.createElement('div');
            linha.classList.add('post-item'); // Usando a classe de item de post
            linha.innerHTML = `
                <div class="post-title">${publicacao.titulo}</div>
                <div class="post-content">${publicacao.descricao}</div>
                <div class="post-actions">
                    <button onclick="editPubli(${publicacao.id})">Editar</button>
                    <button onclick="deletePubli(${publicacao.id})">Deletar</button>
                </div>
            `;
            tbody.appendChild(linha);
        });
    }
}

// Enviar nova publicação
document.getElementById("postForm").addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;

    await fetch('http://localhost:3002/publicacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
    });

    document.getElementById('postForm').reset(); // Limpar o formulário após o envio
    loadPublicacao(); // Recarregar publicações após adicionar
});

// Editar publicação
async function editPubli(id) {
    const titulo = prompt("Novo título");
    const descricao = prompt("Nova descrição");

    await fetch(`http://localhost:3002/publicacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
    });

    loadPublicacao(); // Recarregar publicações após editar
}

// Deletar publicação
async function deletePubli(id) {
    await fetch(`http://localhost:3002/publicacoes/${id}`, {
        method: 'DELETE'
    });
    loadPublicacao(); // Recarregar publicações após deletar
}

// Carregar as publicações ao iniciar
loadPublicacao();