const express = require('express');
const Usuario = require('../models/usuario');
const app = express();

app.get('/usuario', function(rq, rs) {
    rs.json('get usuario DESARROLLO');
});

app.post('/usuario', function(rq, rs) {
    let body = rq.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        role: body.role
    });

    usuario.save((err, usuario_db) => {
        if (err) return rs.status(400).json({ ok: false, err });

        rs.json({ ok: true, usuario: usuario_db });
    });

});

app.put('/usuario/:id', function(rq, rs) {
    let id = rq.params.id;
    rs.json({
        id,
        action: `put usuario`
    });
});

app.delete('/usuario', function(rq, rs) {
    rs.json('delete usuario');
});

module.exports = app;