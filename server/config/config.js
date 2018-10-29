// PUERTO
process.env.PORT = process.env.PORT || 3000;


// ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// BASE DE DATOS
let url_db;
if (process.env.NODE_ENV === 'dev')
    url_db = 'mongodb://localhost:27017/cafe';
else
    url_db = 'mongodb://cafe-usr:123456abcd@ds155192.mlab.com:55192/cafe';

process.env.URL_DB = url_db;