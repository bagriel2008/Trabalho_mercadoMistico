const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('http://localhost:3002/login', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const results = await response.json();
        console.log(results);  

        if (results.success) {
            alert('Login bem-sucedido');
            window.location.assign('index.html');  
        } else {
            alert('Usuário ou senha incorreto');
        }
    } catch (error) {
        console.error('Erro ao tentar logar:', error);
        alert('Erro ao tentar logar');
    }
});