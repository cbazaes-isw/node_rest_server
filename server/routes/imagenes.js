const { verifica_token_querystring } = require('../middlewares/authorization');

const express = require('express');

const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

let app = express();

app.get('/imagenes/:tipo/:id', verifica_token_querystring, (request, response) => {

    let tipo = request.params.tipo;
    let id = request.params.id;

    // Valido el tipo
    let tipos_validos = ['productos', 'usuarios'];
    if (tipos_validos.indexOf(tipo) < 0) {
        return response.status(400).json({ ok: false, err: { message: `Los tipos permitidos son ${tipos_validos.join(', ')}.` } });
    }

    switch (tipo) {
        case 'usuarios':

            get_imagen_usuario(id, response);
            break;

        case 'productos':

            get_imagen_producto(id, response);
            break;

    }

});

//#region Privados

let get_imagen_usuario = (id, response) => {

    Usuario.findById(id, (err, usuario_db) => {

        if (err) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        if (!usuario_db) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        if (!usuario_db.img) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        let path_image = path.resolve(__dirname, `../../uploads/usuarios/${usuario_db.img}`);
        response.sendFile(path_image)

    });

};

let get_imagen_producto = (id, response) => {

    Producto.findById(id, (err, producto_db) => {

        if (err) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        if (!producto_db) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        if (!producto_db.img) {
            return response.sendFile(path.resolve(__dirname, '../assets/no-image.jpg'));
        }

        let path_image = path.resolve(__dirname, `../../uploads/productos/${producto_db.img}`);
        response.sendFile(path_image)

    });

};

//#endregion

module.exports = app;