const express = require("express");
const _ = require("underscore");
const app = express();

const Producto = require("../models/producto");
const { verificaToken } = require("../middlewares/autenticacion");

//Obener productos
app.get("/producto", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  Producto.find({ disponible: true })
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err)
        return res.status(500).json({
          ok: false,
          err
        });

      return res.json({ ok: true, productos });
    });
});

//Obtener porducto por Id
app.get("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "nombre")
    .exec((err, producto) => {
      if (err)
        return res.status(500).json({
          ok: false,
          err
        });

      if (!producto)
        return res.status(400).json({
          ok: false,
          err: { message: "No existe el producto" }
        });

      return res.json({ ok: true, producto });
    });
});

//Buscar Productos
app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
  
    Producto.find({nombre: regex})
      .populate("usuario", "nombre email")
      .populate("categoria", "nombre")
      .exec((err, productos) => {
        if (err)
          return res.status(500).json({
            ok: false,
            err
          });
  
        if (!productos)
          return res.status(400).json({
            ok: false,
            err: { message: "No existe el producto" }
          });
  
        return res.json({ ok: true, productos });
      });
  });

//Crear producto
app.post("/producto", verificaToken, (req, res) => {
  let body = req.body;

  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria
  });

  producto.save((err, productoDB) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      });

    res.status(201).json({
      ok: true,
      producto: productoDB
    });
  });
});

//Actualizar Producto
app.put("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Producto.findById(id, (err, productoDB) => {
    if (err) return res.status(500).json({ ok: true, err });

    if (!productoDB)
      return res
        .status(400)
        .json({ ok: true, err: { message: "El producto no existe" } });

    productoDB.nombre = body.nombre;
    productoDB.precioUni = body.precioUni;
    productoDB.categoria = body.categoria;
    productoDB.disponible = body.disponible;
    productoDB.descripcion = body.descripcion;

    productoDB.save((err, productoGuardado) => {
      if (err) return res.status(500).json({ ok: true, err });

      if (!productoGuardado)
        return res.status(400).json({
          ok: true,
          err: { message: "El producto no se pudo guardar" }
        });

      return res.json({
        ok: true,
        producto: productoGuardado
      });
    });
  });
});

app.delete("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;

  Producto.findById(id, (err, productoDB) => {
    if (err) return res.status(500).json({ ok: true, err });

    if (!productoDB)
      return res.status(400).json({
        ok: true,
        err: { message: "El producto no existe" }
      });

    productoDB.disponible = false;

    productoDB.save((err, productoBorrado) => {
      if (err) return res.status(500).json({ ok: true, err });

      res.json({
        ok: true,
        producto: productoBorrado
      });
    });
  });
});

module.exports = app;
