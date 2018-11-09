const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verifica_token, verifica_admin } = require('../middlewares/authorization');

const app = express();

app.get('/usuario', verifica_token, (request, response) => {

    let pag_desde = Number(request.query.desde) || 0;
    let limite = Number(request.query.limite) || 5;

    let filtro = { estado: true };

    Usuario
        .find(filtro, 'nombre email google role estado img')
        .skip(pag_desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) return response.status(400).json({ ok: false, err });

            Usuario.count(filtro, (err, cantidad) => {

                response.json({
                    ok: true,
                    cantidad,
                    usuarios
                });

            });

        });
});

app.post('/usuario', [verifica_token, verifica_admin], (request, response) => {
    let body = request.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuario_db) => {
        if (err) return response.status(400).json({ ok: false, err });

        response.json({ ok: true, usuario: usuario_db });
    });

});

app.put('/usuario/:id', [verifica_token, verifica_admin], (request, response) => {

    let id = request.params.id;
    let body = _.pick(request.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuario_db) => {

        if (err) return response.status(400).json({ ok: false, err });

        response.json({
            ok: true,
            usuario: usuario_db
        });
    });

});

app.delete('/usuario/:id', [verifica_token, verifica_admin], (request, response) => {

    let id = request.params.id;

    o = { estado: false };

    Usuario.findByIdAndUpdate(id, o, { new: true }, (err, usuario_db) => {

        if (err) return response.status(400).json({ ok: false, err });

        if (!usuario_db) return response.status(400).json({ ok: false, err: { message: 'Usuario no encontrado' } });

        response.json({
            ok: true,
            usuario: usuario_db
        });
    });

    // let id = rq.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuario_eliminado) => {

    //     if (err) return rs.status(400).json({ ok: false, err });

    //     if (!usuario_eliminado) return rs.status(400).json({ ok: false, err: { message: 'Usuario no encontrado' } });

    //     rs.json({
    //         ok: true,
    //         usuario: usuario_eliminado
    //     });

    // });

});

module.exports = app;