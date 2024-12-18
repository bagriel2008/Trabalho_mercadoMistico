const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const app = express();
const connection = require('./db_config.js');
const port = 3001;

// Define a configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Usuários',
            version: '1.0.0',
            description: 'Documentação da API de Usuários',
        },
    },
    apis: ['./src/server.js'], // Caminho para os arquivos com anotações Swagger
};

// Inicializa o Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Define a rota para a documentação do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});


dotenv.config(); // Carregar variáveis de ambiente


app.use(cors());

app.use(express.json());
app.use(session({
    secret: 'secretestrandomkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


/**
 * @swagger
 * /usuario/cadastrar:
 *   post:
 *     summary: Cadastra um usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 */

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


/**
 * @swagger
 * /usuario/login:
 *   post:
 *     summary: Login de Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@example.com"
 *               password:
 *                 type: string
 *                 example: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Senha incorreta
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
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


/**
 * @swagger
 * /usuario/listar:
 *   get:
 *     summary: Listar todos os usuários
 *     responses:
 *       201:
 *         description: Lista de usuários recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       400:
 *         description: Erro ao buscar usuários
 */
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

/**
 * @swagger
 * /usuario/editar/{id}:
 *   put:
 *     summary: Editar um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Novo Nome"
 *               email:
 *                 type: string
 *                 example: "novoemail@example.com"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Nenhum dado fornecido para atualização
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao atualizar usuário
 */
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


/**
 * @swagger
 * /usuario/deletar/{id}:
 *   delete:
 *     summary: Deletar um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao deletar usuário
 */
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

/**
 * @swagger
 * /produto/cadastrar:
 *   post:
 *     summary: Cadastrar um produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Produto 1"
 *               description:
 *                 type: string
 *                 example: "Descrição do produto"
 *               price:
 *                 type: number
 *                 example: 100.00
 *               imagem_link:
 *                 type: string
 *                 example: "https://imagem.com/produto.jpg"
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso
 *       500:
 *         description: Erro ao cadastrar produto
 */
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
                imagem_link: request.body.imagem_link
            }
        });
    });
});


/**
 * @swagger
 * /produto/listar:
 *   get:
 *     summary: Listar todos os produtos
 *     responses:
 *       201:
 *         description: Lista de produtos recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       imagem_link:
 *                         type: string
 *       400:
 *         description: Erro ao buscar produtos
 */
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

/**
 * @swagger
 * /produto/listar/{id}:
 *   get:
 *     summary: Buscar um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao buscar produto
 */

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

/**
 * @swagger
 * /produto/deletar/{id}:
 *   delete:
 *     summary: Deletar um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao deletar produto
 */

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

