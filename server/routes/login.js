const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (request, response) => {

    let body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {

        if (err) return response.status(500).json({ ok: false, err });

        if (!usuario) return response.status(400).json({ ok: false, err: { message: 'Usuario (o contraseña) incorrectos' } });

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return response.status(400).json({ ok: false, err: { message: '(Usuario o) contraseña incorrectos' } });
        }

        let token = jwt.sign({
            usuario
        }, process.env.SEED, {
            expiresIn: process.env.TOKEN_EXPIRATION
        });

        response.json({
            ok: true,
            usuario,
            token
        });

    });

});

module.exports = app;