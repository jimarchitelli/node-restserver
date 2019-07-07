const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const app = express();

const Usuario = require("../models/usuario");

app.get("/usuario", (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({ estado: true }, "nombre email role estado google img")
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({ ok: false, error: err });
      }

      Usuario.count({ estado: true }, (err, conteo) => {
        res.json({ ok: true, usuarios, cuantos: conteo });
      });
    });
});

app.post("/usuario", (req, res) => {
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    password: bcrypt.hashSync(body.password, 10),
    email: body.email,
    role: body.role
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({ ok: false, error: err });
    }

    res.json({ ok: true, usuario: usuarioDB });
  });
});

app.put("/usuario/:id", (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

  Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
      
    if (err) {
        return res.status(400).json({ ok: false, error: err });
      }
    
      res.json({
        ok: true,
        usuario: usuarioDB
      });
    }
  );
});

app.delete("/usuario/:id", (req, res) => {
  let id = req.params.id;
  let body = { estado: false };

  Usuario.findByIdAndUpdate(id, body, (err, usuarioBorrado) => {
    if (err) {
      return res.status(400).json({ ok: false, error: err });
    }

    if (!usuarioBorrado.estado) {
      return res
        .status(400)
        .json({ ok: false, error: { err: "Usuario no encontrado" } });
    }

    res.json({ ok: true, usuario: usuarioBorrado });
  });
});

module.exports = app;
