const express = require('express');
const _ = require('underscore');

const { verifica_token, verifica_admin } = require('../middlewares/authorization');

let app = express();

let Categoria = require('../models/categoria');

// Mostrar todas las categorías
app.get('/categoria', verifica_token, (request, response) => {

    Categoria
        .find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) return response.status(400).json({ ok: false, err });

            return response.json({
                ok: true,
                categorias
            });

        });

});

// Mostrar una categoría por ID
app.get('/categoria/:id', verifica_token, (request, response) => {
    // Categoria.findById();
    let id = request.params.id;
    Categoria.findById(id, (err, categoria_db) => {
        if (err) return response.status(500).json({ ok: false, err });

        if (!categoria_db) return response.status(400).json({ ok: false, err: { message: 'Categoría no encontrada.' } });

        return response.json({
            ok: true,
            categoria: categoria_db
        });

    });

});

// Crear nueva categoía
app.post('/categoria', verifica_token, (request, response) => {
    // Regresar la nueva categoría
    // req.usuario._id
    let body = request.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: request.usuario._id
    });

    categoria.save((err, categoria_db) => {
        if (err) return response.status(500).json({ ok: false, err });

        if (!categoria_db) return response.status(400).json({ ok: false, err: { message: 'Categoría no encontrada.' } });

        return response.json({ ok: true, categoria: categoria_db });
    });

});

// Actualizar una categoría
app.put('/categoria/:id', verifica_token, (request, response) => {
    // Actualizar el nombre de la categoría
    let id = request.params.id;
    let body = _.pick(request.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoria_db) => {

        if (err) return response.status(500).json({ ok: false, err });

        if (!categoria_db) return response.status(400).json({ ok: false, err: { message: 'Categoría no encontrada.' } });

        response.json({
            ok: true,
            usuario: categoria_db
        });

    });

});

// Eliminar una categoría
app.delete('/categoria/:id', [verifica_token, verifica_admin], (request, response) => {
    // Solo admin puede borrar
    // requiere token
    let id = request.params.id;

    Categoria.findByIdAndRemove(id, (err, categoria_db) => {

        if (err) return response.status(500).json({ ok: false, err });

        if (!categoria_db) return response.status(400).json({ ok: false, err: { message: 'Categoría no encontrada.' } });

        response.json({
            ok: true,
            categoria: categoria_db
        });

    });

});

module.exports = app;