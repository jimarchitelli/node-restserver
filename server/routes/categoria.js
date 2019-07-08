const express = require("express");
const _ = require("underscore");
const {
  verificaToken,
  verificaAdmin_Role
} = require("../middlewares/autenticacion");

const app = express();
const Categoria = require("../models/categoria");

app.get("/categoria", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Categoria.find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(limite)
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({ ok: false, error: err });
      }

      Categoria.count((err, conteo) => {
        res.json({ ok: true, categorias, cuantos: conteo });
      });
    });
});

app.get("/categoria/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Categoria.findById(id).populate('usuario').exec((err, categoria) => {
    if (err) {
      return res.status(500).json({ ok: false, error: err });
    }

    if (!categoria) {
        return res.status(400).json({ ok: false, error: err });
      }

    Categoria.count({ estado: true }, () => {
      res.json({ ok: true, categoria });
    });
  });
});

app.post("/categoria", [verificaToken, verificaAdmin_Role], (req, res) => {
  let body = req.body;

  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({ ok: false, error: err });
    }

    if (!categoriaDB) {
      return res.status(400).json({ ok: false, error: err });
    }

    res.json({ ok: true, categoria: categoriaDB });
  });
});

app.put("/categoria/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["descripcion"]);

  Categoria.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({ ok: false, error: err });
      }

      if (!categoriaDB) {
        return res.status(400).json({ ok: false, error: err });
      }

      res.json({
        ok: true,
        usuario: categoriaDB
      });
    }
  );
});

app.delete(
  "/categoria/:id",
  [verificaToken, verificaAdmin_Role],
  (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrada) => {
      if (err) {
        return res.status(400).json({ ok: false, error: err });
      }

      if (!categoriaBorrada) {
        return res
          .status(400)
          .json({ ok: false, error: { err: "Categoria no encontrada" } });
      }

      res.json({ ok: true, categoria: categoriaBorrada });
    });
  }
);

module.exports = app;
