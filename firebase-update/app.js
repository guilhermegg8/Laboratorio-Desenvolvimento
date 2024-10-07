const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars')

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, collection, addDoc } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json')

initializeApp({
    credential: cert(serviceAccount)
})

const Handlebars = require('handlebars');
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

const db = getFirestore();

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

/*app.engine('handlebars', handlebars({
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    
    }
}));*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  res.render("primeira_pagina");
});

app.post("/cadastrar", (req, res) => {
    const { nome, telefone, origem, data_contato, observacao } = req.body;
    db.collection('clientes').add({
        nome: nome,
        telefone: telefone,
        origem: origem,
        data_contato: data_contato,
        observacao: observacao
    }).then(() => {
        console.log('Dados cadastrados');
        res.redirect('/');  
    }).catch(err => {
        console.log('Erro ao cadastrar: ', err);
        res.status(500).send('Erro ao cadastrar');
    });
});

app.get('/consulta', function(req, res) {
    var posts = []
    db.collection('clientes').get().then((snapshot) => {
        snapshot.forEach((doc) => {
            posts.push({id: doc.id, ...doc.data()})
        })
        res.render('consulta',{posts: posts})
    })
})

app.get("/editar/:id", function (req, res) {
    id = req.params.id
    var posts = []
    db.collection('clientes').doc(id).get().then(function(doc) {
        const data = doc.data()
        data.id = doc.id
        posts.push(data)
        res.render('editar', {posts: posts})
    })    
})

app.post('/editar', function (req, res) {
    id = req.body.id
    db.collection('clientes').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        res.redirect('/consulta')
    }).catch(function(error) {
        console.log("Erro ao editar: " + error)
    })
})

app.get('/excluir/:id', async (req, res) => {
    id = req.params.id
    db.collection('clientes').doc(id).delete().then(function() {
        res.redirect('/consulta')
    }).catch(function(error) {
      console.log("Erro ao deletar: " + error)
    })
})

app.listen(8081, function () {
  console.log('Servidor rodando na url http://localhost:8081');
});
