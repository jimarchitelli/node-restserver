const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const app = express();
const Usuario = require("../models/usuario");

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({ ok: false, error: err });
          }

          //No existe el usuario
          if (!usuarioDB) {
            return res
              .status(400)
              .json({ ok: false, error: { err: "Usuario o contraseña incorrectos" } });
          }

          //La contrasña no es correcta
          if (!bcrypt.compareSync(body.password, usuarioDB.password))
          {
            return res
            .status(400)
            .json({ ok: false, error: { err: "Usuario o contraseña incorrectos" } });
          }

          let token = jwt.sign({
              usuario: usuarioDB
          }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

          res.json({
              ok: true,
              usuario: usuarioDB,
              token: token
        });
    })
})

module.exports = app;