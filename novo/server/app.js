const express = require("express");
const cors = require("cors");
const port = 3002;
const app = express();

app.use(cors());
app.use(express.json());

app.listen(port, ()=> console.log ("rodando na porta" + port));

const connection = require('./db/connection.js');

// cadastro usuarios 

app.post('/usuarios/cadastrar', (request, response) => {
    let params = Array(
        request.body.nome,
        request.body.email,
        request.body.senha 
    );
    let query = "INSERT INTO usuarios(nome, email, senha) VALUES (?,?,?)";
    connection.query(query, params, (err, results) => {
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

// login usuarios 

app.post('/login', (req, res) => { 
    const { email, senha } = req.body;
 
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
 
    connection.query(query, [email, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }
        if (results.length > 0) {
            console.log("login reali blaaa")
            res.json({ success: true, message: 'Login realizado' });
        } else {
            res.json({ success: false, message: 'Nome ou senha incorretos' });
        }
    });
});

// cadastro publicações
app.post('/publicacoes', (req, res) => {
    const { titulo, descricao } = req.body;
    const query = 'INSERT INTO publicacoes(titulo, descricao) VALUES(?, ?)';
    
    connection.query(query, [titulo, descricao], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao postar publicação' });
        }
        res.json({ success: true, message: "Publicação realizada com sucesso", id: result.insertId });
    });
});

// editar publicações 

app.get('/publicacoes', (req, res) => {
    const query = 'SELECT * FROM publicacoes';
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao buscar publicações' });
        }
        res.json({ success: true, data: results });
    });
});
app.put('/publicacoes/:id', (req, res) =>{
    const {id} = req.params
    const {titulo, descricao} = req.body
    const query = 'UPDATE publicacoes SET titulo = ?, descricao = ? WHERE id = ?'
    connection.query(query, [titulo, descricao, id], (err) =>{
        if(err){
            return res.status(500).json({success: false, message: 'Erro ao atualizar publicação'})
        }
        res.json({success: true, message: "publicação atualizada"})
    })
})

app.delete('/publicacoes/:id', (req, res) =>{
    const {id} = req.params
    const query = 'DELETE FROM publicacoes WHERE id = ?'
    connection.query(query, [id], (err) =>{
        if(err){
            return res.status(500).json({success: false, message: 'Erro ao deletar publicação'})
        }
        res.json({success: true, message: "publicação deletada"})
    })
})