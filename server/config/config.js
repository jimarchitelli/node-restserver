//Puerto
process.env.PORT = process.env.PORT || 3000;

//Vencimiento del token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
process.env.SEED = process.env.SEED || 'seed-desarrollo';

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV ||  'dev';
let urlDB;

if (process.env.NODE_ENV == 'dev')
   urlDB = 'mongodb://localhost:27017/cafe'
else
   urlDB = process.env.MONGO_URI

process.env.URL_DB = urlDB;

//Google Client Id
process.env.CLIENT_ID = process.env.CLIENT_ID || '759738400319-nf6bnhj768tvbpkosjcffd5qs8gvaqov.apps.googleusercontent.com';