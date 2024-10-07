document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginPopup = document.getElementById('loginPopup');
    const closePopup = document.getElementById('closePopup');
    const toggleText = document.getElementById('toggleText');
    const formTitle = document.getElementById('formTitle');
    const submitButton = document.getElementById('submitButton');
    const adicionarIcon = document.getElementById('adicionar');

    let isLogin = true; // Inicia como tela de login

    // Alternar formulário entre login e cadastro
    function toggleForm() {
        if (isLogin) {
            formTitle.textContent = 'Cadastrar';
            submitButton.textContent = 'Cadastrar';
            toggleText.innerHTML = 'Já tem uma conta? <a href="#" id="toggleLink">Faça login</a>';

            // Adiciona campos de nome para o cadastro
            const nameLabel = document.createElement('label');
            nameLabel.setAttribute('for', 'name');
            nameLabel.textContent = 'Nome:';
            const nameInput = document.createElement('input');
            nameInput.setAttribute('type', 'text');
            nameInput.setAttribute('id', 'name');
            nameInput.setAttribute('name', 'name');
            nameInput.required = true;
            loginForm.insertBefore(nameLabel, submitButton);
            loginForm.insertBefore(nameInput, submitButton);
        } else {
            formTitle.textContent = 'Login';
            submitButton.textContent = 'Entrar';
            toggleText.innerHTML = 'Não tem uma conta? <a href="#" id="toggleLink">Cadastre-se</a>';

            // Remove campos de nome quando voltar ao login
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.parentElement.removeChild(nameInput.previousElementSibling); // Remove o label
                nameInput.parentElement.removeChild(nameInput); // Remove o input
            }
        }
        isLogin = !isLogin;
    }

    toggleText.addEventListener('click', toggleForm);

    // Fechar o popup
    function closeLoginPopup() {
        loginPopup.style.display = 'none';
    }

    closePopup.addEventListener('click', closeLoginPopup);

    window.addEventListener('click', (event) => {
        if (event.target === loginPopup) {
            closeLoginPopup();
        }
    });

    // Função para atualizar a visibilidade do ícone de adicionar
    function updateAddIconVisibility(isVisible) {
        if (adicionarIcon) { // Verifica se o elemento existe
            adicionarIcon.style.display = isVisible ? 'block' : 'none'; // Mostrar ou esconder o ícone
        } else {
            console.warn('Elemento "adicionar" não encontrado.');
        }
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
    
        const url = isLogin ? `http://localhost:3333/usuario/login` : `http://localhost:3333/usuario/cadastrar`;
        const data = isLogin ? { email, password } : { name: document.getElementById('name').value, email, password };
    
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Erro ao processar a solicitação');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data.success) {
                    localStorage.setItem('isLoggedIn', 'true');
    
                    // Verifica se o usuário logado é o permitido
                    if (email === 'cleber@gmail.com' && password === '220208') {
                        localStorage.setItem('hasAddAccess', 'true'); // Permitir acesso ao ícone
                        updateAddIconVisibility(true); // Mostrar o ícone
                    } else {
                        localStorage.setItem('hasAddAccess', 'false'); // Negar acesso ao ícone
                        updateAddIconVisibility(false); // Esconder o ícone
                    }
    
                    alert(isLogin ? 'Login realizado com sucesso!' : 'Usuário cadastrado com sucesso!');
                    closeLoginPopup();
                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro: ' + error.message);
            });
    });
    
    // Atualizar a visibilidade do ícone ao carregar a página
    const hasAddAccess = localStorage.getItem('hasAddAccess') === 'true';
    updateAddIconVisibility(hasAddAccess); // Inicializa o ícone baseado na condição

    // Mostrar o popup ao clicar no ícone de perfil
    document.getElementById('profileIcon').addEventListener('click', () => {
        loginPopup.style.display = 'block';
    });

    // Atualizar a visibilidade do ícone ao carregar a página
    updateAddIconVisibility(false); // Inicialmente, esconde o ícone
});