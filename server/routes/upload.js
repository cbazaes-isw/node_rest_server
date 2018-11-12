const express = require('express');
const file_upload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

app.use(file_upload());

app.put('/upload/:tipo/:id', (request, response) => {

    let tipo = request.params.tipo;
    let id = request.params.id;

    if (!request.files) {
        return response.status(400).json({ ok: false, err: { message: 'No se ha seleccionado ningún archivo.' } });
    }

    // Valido el tipo
    let tipos_validos = ['productos', 'usuarios'];
    if (tipos_validos.indexOf(tipo) < 0) {
        return response.status(400).json({ ok: false, err: { message: `Los tipos permitidos son ${tipos_validos.join(', ')}.` } });
    }

    // Validación de extensiones permitidas
    let file = request.files.archivo;
    let extensiones_validas = ['png', 'jpg', 'jpeg', 'gif'];
    let arr = file.name.split('.');

    // Valido que al menos tenga una extensión.
    if (arr.length < 2) {
        return response.status(400).json({ ok: false, err: { message: 'El archivo debe tener extensión.' } });
    }

    // Extraigo la extensión del archivo y verifico que
    // se encuentre en el listado de extensiones válidas.
    let extension = arr[arr.length - 1];
    let extension_valida = (extensiones_validas.indexOf(extension) >= 0);
    if (!extension_valida) {
        return response.status(400).json({ ok: false, err: { message: `Las extensiones permitidas son ${extensiones_validas.join(', ')}.` } });
    }

    // Defino el nombre del archivo.
    let nombre_archivo = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    // Subo el archivo
    file.mv(`./uploads/${tipo}/${nombre_archivo}`, (err) => {

        if (err) {
            return response.status(500).json({ ok: false, err });
        }

        // Imagen cargada
        // Procedo a actualizar el modelo de acuerdo al tipo seleccionado.
        switch (tipo) {
            case 'usuarios':

                carga_imagen_usuario(id, response, nombre_archivo);
                break;

            case 'productos':

                carga_imagen_producto(id, response, nombre_archivo);
                break;

        }

    });

});

//#region funciones privadas

let carga_imagen_usuario = (id, response, nombre_archivo) => {

    Usuario.findById(id, (err, usuario_db) => {

        if (err) {
            borrar_archivo(nombre_archivo, 'usuarios');
            return response.status(500).json({ ok: false, err });
        }

        if (!usuario_db) {
            borrar_archivo(nombre_archivo, 'usuarios');
            return response.status(400).json({ ok: false, err: { message: 'El usuario no existe.' } });
        }

        // Elimino la imagen anterior del usuario.
        borrar_archivo(usuario_db.img, 'usuarios');

        usuario_db.img = nombre_archivo;
        usuario_db.save((err, usuario_actualizado) => {

            if (err) return response.status(500).json({ ok: false, err });

            return response.json({ ok: true, message: 'Imagen subida correctamente.', img: nombre_archivo });

        });

    });

};

let carga_imagen_producto = (id, response, nombre_archivo) => {

    Producto.findById(id, (err, producto_db) => {

        if (err) {
            borrar_archivo(nombre_archivo, 'productos');
            return response.status(500).json({ ok: false, err });
        }

        if (!producto_db) {
            borrar_archivo(nombre_archivo, 'productos');
            return response.status(400).json({ ok: false, err: { message: 'El producto no existe.' } });
        }

        // Elimino la imagen anterior del producto.
        borrar_archivo(producto_db.img, 'productos');

        producto_db.img = nombre_archivo;
        producto_db.save((err, producto_actualizado) => {

            if (err) return response.status(500).json({ ok: false, err });

            return response.json({ ok: true, message: 'Imagen subida correctamente.', img: nombre_archivo });

        });

    });

};

let borrar_archivo = (nombre_archivo, tipo) => {
    // Elimino la imagen anterior del usuario.
    let path_image = path.resolve(__dirname, `../../uploads/${tipo}/${nombre_archivo}`);
    if (fs.existsSync(path_image)) {
        fs.unlinkSync(path_image);
    }
};

//#endregion

module.exports = app;