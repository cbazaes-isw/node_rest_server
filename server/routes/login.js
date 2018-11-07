const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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


// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
};

app.post('/google', async(request, response) => {

    let token = request.body.idtoken;

    let google_user = await verify(token)
        .catch(err => response.status(403).json({ ok: false, err }));

    Usuario.findOne({ email: google_user.email }, (err, usuario_db) => {
        if (err) return response.status(500).json({ ok: false, err });

        if (usuario_db) {
            if (!usuario_db.google) {
                return response.status(400).json({ ok: false, err: { message: 'Debe usar su autenticación normal' } });
            } else {
                let token = jwt.sign({
                    usuario: usuario_db
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

                return response.json({
                    ok: true,
                    usuario: usuario_db,
                    token
                });
            }
        } else {

            let usuario = new Usuario();
            usuario.nombre = google_user.nombre;
            usuario.email = google_user.email;
            usuario.img = google_user.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuario) => {

                if (err) return response.status(500).json({ ok: false, err });

                let token = jwt.sign({
                    usuario: usuario_db
                }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION });

                return response.json({
                    ok: true,
                    usuario: usuario_db,
                    token
                });

            });

        }
    });

    response.json({ usuario: google_user });

});

module.exports = app;