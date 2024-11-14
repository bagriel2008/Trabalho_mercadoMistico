async function cadastrar(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const data = {
        nome,
        email,
        senha
    }

    try {
        const response = await fetch('http://localhost:3002/usuarios/cadastrar', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const results = await response.json();

        if (results.success) {
            console.log(results)
            alert(results.message)
            window.location.href = 'index.html'
        } else {
            alert(results.message)
        }
    }
    catch (error) {
        console.log(error);
    }
}