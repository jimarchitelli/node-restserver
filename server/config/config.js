//Puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV ||  'dev';
let urlDB;

if (process.env.NODE_ENV == 'dev')
   urlDB = 'mongodb://localhost:27017/cafe'
else
   urlDB = 'mongodb+srv://cafe:U0iOYoh1aXSnC2kN@cluster0-hfrgx.mongodb.net/cafe'

process.env.URL_DB = urlDB;