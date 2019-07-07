const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();
const Usuario = require("../models/usuario");

app.post("/login", (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({ ok: false, error: err });
    }

    //No existe el usuario
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        error: { err: "Usuario o contraseña incorrectos" }
      });
    }

    //La contrasña no es correcta
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        error: { err: "Usuario o contraseña incorrectos" }
      });
    }

    let token = jwt.sign(
      {
        usuario: usuarioDB
      },
      process.env.SEED,
      { expiresIn: process.env.CADUCIDAD_TOKEN }
    );

    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token
    });
  });
});

//Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID
  });
  const payload = ticket.getPayload();

  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token).catch(err => {
    return res.json(403).json({
      ok: false,
      err
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({ ok: false, error: err });
    }

    if (usuarioDB) {
      if (!usuarioDB.google)
        return res.status(400).json({
          ok: false,
          error: { message: "Debe utilizar su autenticacion normal" }
        });

      let token = jwt.sign(
        {
          usuario: usuarioDB
        },
        process.env.SEED,
        { expiresIn: process.env.CADUCIDAD_TOKEN }
      );

      res.json({
        ok: true,
        usuario: usuarioDB,
        token: token
      });
    } else {
      let usuario = new Usuario();

      usuario.nombre = googleUser.name;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = googleUser.google;
      usuario.password = "password";

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({ ok: false, error: err });
        }

        let token = jwt.sign(
          {
            usuario: usuarioDB
          },
          process.env.SEED,
          { expiresIn: process.env.CADUCIDAD_TOKEN }
        );

        res.json({
          ok: true,
          usuario: usuarioDB,
          token: token
        });
      });
    }
  });
});

module.exports = app;
