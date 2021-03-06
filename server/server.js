const config = require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require('./routes/index'));
//Habilitar Public
app.use(express.static(path.resolve(__dirname, '../public')));

mongoose.connect(process.env.URL_DB, {useNewUrlParser: true, useCreateIndex: true}, (err, res) => {
  if (err) throw err;
  console.log("Base de datos ONLINE");
});

app.listen(process.env.PORT, () => {
  console.log(`Escuchando puerto ${process.env.PORT}`);
});
