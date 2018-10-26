const config = require('./config/config');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/usuario', function(rq, rs) {
    rs.json('get usuario');
});

app.post('/usuario', function(rq, rs) {
    let body = rq.body;

    if (body.nombre === undefined) {
        rs.status(400).json({ ok: false, mensaje: 'El nombre es necesario' });
    } else {
        rs.json({ persona: body });
    }
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

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto', process.env.PORT);
});