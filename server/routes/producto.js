const express = require('express');
const _ = require('underscore');

const { verifica_token } = require('../middlewares/authorization');

let app = express();

let Producto = require('../models/producto');

// Mostrar todos los productos
// cargando usuario y categoria
// paginado
app.get('/productos', verifica_token, (request, response) => {

    let pag_desde = Number(request.query.desde) || 0;
    let limite = Number(request.query.limite) || 5;

    let filtro = { disponible: true };

    Producto
        .find(filtro, 'nombre descripcion precioUni categoria usuario')
        .sort('nombre')
        .skip(pag_desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) return response.status(400).json({ ok: false, err });

            Producto.count(filtro, (err, cantidad) => {

                return response.json({
                    ok: true,
                    cantidad,
                    productos
                });

            });

        });

});

// Mostrar un producto por ID
app.get('/productos/:id', verifica_token, (request, response) => {
    // Categoria.findById();
    let id = request.params.id;

    Producto.findById(id, (err, producto_db) => {

            if (err) return response.status(500).json({ ok: false, err });

            if (!producto_db) return response.status(400).json({ ok: false, err: { message: 'Producto no encontrado.' } });

            if (!producto_db.disponible) return response.status(400).json({ ok: false, err: { message: 'Producto no encontrado.' } });

            return response.json({
                ok: true,
                producto: producto_db
            });

        })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre');

});

app.get('/productos/buscar/:q', verifica_token, (request, response) => {

    let q = request.params.q;

    let regex = new RegExp(q, 'i');

    Producto.find({ nombre: regex }).populate('categoria', 'nombre').exec((err, productos) => {

        if (err) return response.status(500).json({ ok: false, err });

        return response.json({ ok: true, productos });

    });

});

// Crear nuevo producto
app.post('/productos/:id_categoria', verifica_token, (request, response) => {
    // Regresar la nueva categoría
    // req.usuario._id
    let body = request.body;
    let id_categoria = request.params.id_categoria;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: parseFloat(body.precioUni),
        descripcion: body.descripcion,
        categoria: id_categoria,
        usuario: request.usuario._id
    });

    producto.save((err, producto_db) => {

        if (err) return response.status(500).json({ ok: false, err });

        if (!producto_db) return response.status(400).json({ ok: false, err: { message: 'Producto no encontrado.' } });

        return response.json({ ok: true, producto: producto_db });

    });

});

// Actualizar un producto
app.put('/productos/:id', verifica_token, (request, response) => {
    // Actualizar el nombre de la categoría
    let id = request.params.id;
    let body = _.pick(request.body, ['nombre', 'descripcion', 'precioUni']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, producto_db) => {

            if (err) return response.status(500).json({ ok: false, err });

            if (!producto_db) return response.status(400).json({ ok: false, err: { message: 'Producto no encontrado.' } });

            response.json({
                ok: true,
                producto: producto_db
            });

        })
        .populate('usuario')
        .populate('categoria');

});

// Eliminar un producto (cambiar el valor de DISPONIBLE)
app.delete('/productos/:id', verifica_token, (request, response) => {

    let id = request.params.id;

    o = { disponible: false };

    Producto.findByIdAndUpdate(id, o, { new: true }, (err, producto_db) => {

        if (err) return response.status(400).json({ ok: false, err });

        if (!producto_db) return response.status(400).json({ ok: false, err: { message: 'Producto no encontrado' } });

        response.json({
            ok: true,
            producto: producto_db
        });
    });

});

module.exports = app;