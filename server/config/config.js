// PUERTO
process.env.PORT = process.env.PORT || 3000;


// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// BASE DE DATOS
let url_db;
if (process.env.NODE_ENV === 'dev')
    url_db = 'mongodb://localhost:27017/cafe';
else
    url_db = process.env.MONGO_URI;

process.env.URL_DB = url_db;


// VENCIMIENTO TOKEN
process.env.TOKEN_EXPIRATION = 60 * 60 * 24 * 30


// SEED DE AUTENTICACIÓN
process.env.SEED = process.env.SEED || 'seed-de-desarrollo-para-la-generacion-de-tokens';