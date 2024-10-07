const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

dotenv.config(); // Carregar variáveis de ambiente

const app = express();
const port = 3333;

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'secretestrandomkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.listen(port, () => console.log(`Rodando na port ${port}`));
// Importar a conexão com o banco
const connection = require('./db_config');

// Rotas
// Cadastro de usuários
app.post('/usuario/cadastrar', (request, response) => {
    const { name, email, password } = request.body;

    // Verificar se o e-mail já existe na tabela de usuários
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: "Erro no servidor ao verificar o usuário",
                data: err
            });
        }

        if (results.length > 0) {
            // Se o e-mail já existe, retorna erro
            return response.status(409).json({
                success: false,
                message: "E-mail já cadastrado",
            });
        } else {
            // Se o e-mail não existe, insere o novo usuário
            const insertUserQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
            connection.query(insertUserQuery, [name, email, password], (err, results) => {
                if (err) {
                    return response.status(500).json({
                        success: false,
                        message: "Erro ao cadastrar usuário",
                        data: err
                    });
                }

                return response.status(201).json({
                    success: true,
                    message: "Usuário cadastrado com sucesso",
                    data: { id: results.insertId, name, email }
                });
            });
        }
    });
});

// Login de usuários
app.post('/usuario/login', (request, response) => {
    const { email, password } = request.body;

    // Verificar se o e-mail e a senha estão corretos
    const query = "SELECT * FROM users WHERE email = ?";
    connection.query(query, [email], (err, results) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: "Erro no servidor",
                data: err
            });
        }

        if (results.length === 0) {
            // Se o e-mail não for encontrado
            return response.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        } else {
            const user = results[0];
            // Verificar se a senha fornecida é a mesma armazenada
            if (user.password === password) {
                return response.status(200).json({
                    success: true,
                    message: "Login realizado com sucesso",
                    user: { id: user.id, name: user.name, email: user.email }
                });
            } else {
                return response.status(401).json({
                    success: false,
                    message: "Senha incorreta",
                });
            }
        }
    });
});

app.get('/usuario/listar', (request, response) => {
    let query = "SELECT * FROM users";
    connection.query(query, (err, results) => {
        if (results) {
            response.status(201).json({
                success: true,
                message: "Sucesso",
                data: results
            });
        } else {
            response
            .status(400)
            .json({
                success: false,
                message: "Sem sucesso",
                data: err
            });
        }
    });
});

app.put('/usuario/editar/:id', (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email } = request.body;

    // Verifica se os dados foram fornecidos
    if (!name && !email) {
        return response.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
    }

    // Cria a query de atualização com base nos campos fornecidos
    let query = "UPDATE users SET ";
    let params = [];
    
    if (name) {
        query += "name = ?, ";
        params.push(name);
    }
    
    if (email) {
        query += "email = ?, ";
        params.push(email);
    }

    query = query.slice(0, -2); // Remove a última vírgula
    query += " WHERE id = ?";
    params.push(id);

    // Executa a query
    connection.query(query, params, (err, results) => {
        if (err) {
            return response.status(500).json({ success: false, message: 'Erro ao atualizar usuário', error: err });
        }
        
        if (results.affectedRows === 0) {
            return response.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        response.status(200).json({ success: true, message: 'Usuário atualizado com sucesso' });
    });
});

app.delete('/usuario/deletar/:id', (request, response) => {
    const id = parseInt(request.params.id);

    let query = "DELETE FROM users WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (err) {
            return response.status(500).json({ success: false, message: 'Erro ao deletar usuário', error: err });
        }
        
        if (results.affectedRows === 0) {
            return response.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        response.status(200).json({ success: true, message: 'Usuário deletado com sucesso' });
    });
});


// PRODUTO ==================================================================================================

app.post('/produto/cadastrar', (request, response) => {
    let params = [
        request.body.name,
        request.body.description,
        request.body.price,
        request.body.imagem_link
    ];

    let query = "INSERT INTO products(name, description, price, imagem_link) VALUES (?, ?, ?, ?);";

    connection.query(query, params, (err, results) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: "Erro ao cadastrar produto",
                data: err
            });
        }

        response.status(201).json({
            success: true,
            message: "Produto cadastrado com sucesso",
            data: {
                id: results.insertId,
                nome: request.body.name,
                description: request.body.description,
                price: request.body.price,
                imagem_link:request.body.imagem_link
            }
        });
    });
});

app.get('/produto/listar', (request, response) => {
    let query = "SELECT * FROM products";
    connection.query(query, (err, results) => {
        if (results) {
            response.status(201).json({
                success: true,
                message: "Sucesso",
                data: results
            });
        } else {
            response
            .status(400)
            .json({
                success: false,
                message: "Sem sucesso",
                data: err
            });
        }
    });
});

app.get('/produto/listar/:id', (request, response) => {
    const productId = request.params.id;

    let query = "SELECT * FROM products WHERE id = ?";
    connection.query(query, [productId], (err, results) => {
        if (err) {
            return response.status(500).json({
                success: false,
                message: "Erro ao buscar produto",
                data: err
            });
        }

        if (results.length > 0) {
            response.status(200).json({
                success: true,
                message: "Produto encontrado",
                data: results[0] // Retorna o primeiro resultado
            });
        } else {
            response.status(404).json({
                success: false,
                message: "Produto não encontrado"
            });
        }
    });
});



app.delete('/produto/deletar/:id', (request, response) => {
    const id = parseInt(request.params.id);

    let query = "DELETE FROM products WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (err) {
            return response.status(500).json({ success: false, message: 'Erro ao deletar produto', error: err });
        }
        
        if (results.affectedRows === 0) {
            return response.status(404).json({ success: false, message: 'produto não encontrado' });
        }

        response.status(200).json({ success: true, message: 'produto deletado com sucesso' });
    });
});

//favoritar produto
app.post('/produto/favoritar/:id', (request, response) => {
    const productId = parseInt(request.params.id);

    // Verifica se o produto existe
    const checkProductQuery = "SELECT * FROM products WHERE id = ?";
    connection.query(checkProductQuery, [productId], (err, productResults) => {
        if (err) {
            return response.status(500).json({ success: false, message: "Erro no servidor", error: err });
        }

        if (productResults.length === 0) {
            return response.status(404).json({ success: false, message: "Produto não encontrado" });
        }

        // Insere o produto na tabela de favoritos
        const favoriteQuery = "INSERT INTO favorites (product_id) VALUES (?)";
        connection.query(favoriteQuery, [productId], (err, results) => {
            if (err) {
                return response.status(500).json({ success: false, message: "Erro ao favoritar produto", error: err });
            }

            response.status(201).json({ success: true, message: "Produto favoritado com sucesso" });
        });
    });
});


app.get('/produtos/favoritos', (request, response) => {
    const query = `
        SELECT p.id, p.name, p.description, p.price, p.imagem_link
        FROM favorites f
        JOIN products p ON f.product_id = p.id
    `;

    connection.query(query, (err, results) => {
        if (err) {
            return response.status(500).json({ success: false, message: "Erro ao listar produtos favoritados", error: err });
        }

        if (results.length === 0) {
            return response.status(404).json({ success: false, message: "Nenhum produto favoritado encontrado" });
        }

        response.status(200).json({ success: true, message: "Produtos favoritados listados com sucesso", data: results });
    });
});
