const jwt = require('jsonwebtoken');

// Verificar token
let verifica_token = (request, response, next) => {

    let token = request.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) return response.status(401).json({ ok: false, err: { message: 'Token inválido' } });

        request.usuario = decoded.usuario;

        next();

    });

};

// Verificar token img
let verifica_token_querystring = (request, response, next) => {

    let token = request.query.t;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) return response.status(401).json({ ok: false, err: { message: 'Token inválido' } });

        request.usuario = decoded.usuario;

        next();

    });

};

// Verifica rol de admin
let verifica_admin = (request, response, next) => {

    let usuario = request.usuario;

    if (usuario.role !== 'ADMIN_ROLE') return response.status(401).json({ ok: false, err: { message: 'Solo un ADMIN puede ejecutar esta petición' } });

    next();

};

module.exports = {
    verifica_token,
    verifica_admin,
    verifica_token_querystring
};