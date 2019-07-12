const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

const app = express();
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

app.use(fileUpload());

app.put("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  //Validar tipo
  let tiposValidos = ["productos", "usuarios"];

  if (tiposValidos.indexOf(tipo.toLowerCase()) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Los tipos permitidos son ${tiposValidos.join(", ")}`,
        tipo
      }
    });
  }

  if (Object.keys(req.files).length == 0) {
    return res.status(400).josn({
      ok: false,
      err: { message: "No se ha seleccionado ningún archivo" }
    });
  }

  let extensionesValidas = ["jpg", "png", "gif", "jpeg"];
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];

  //Cambiar nombre archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension.toLowerCase()}`;

  if (extensionesValidas.indexOf(extension.toLowerCase()) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Las extensiones permitidas son ${extensionesValidas.join(
          ", "
        )}`,
        extension
      }
    });
  }

  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, err => {
    if (err) return res.status(500).json({ ok: false, err });

    if (tipo == "usuarios") ImagenUsuario(id, res, nombreArchivo);
    if (tipo == "productos") ImagenProducto(id, res, nombreArchivo);
  });
});

function ImagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      });

    if (!usuarioDB)
      return res.status(400).json({
        ok: false,
        err: {
          message: "El usuario no existe"
        }
      });

    BorraArchivo(usuarioDB.img, 'usuarios');

    usuarioDB.img = nombreArchivo;

    usuarioDB.save((err, usuarioGuardado) => {
      if (err)
        return res.status(500).json({
          ok: false,
          err
        });

      res.json({ ok: true, usuario: usuarioGuardado, img: nombreArchivo });
    });
  });
}

function ImagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err
      });

    if (!productoDB)
      return res.status(400).json({
        ok: false,
        err: {
          message: "El producto no existe"
        }
      });

      BorraArchivo(productoDB.img, 'productos');

    productoDB.img = nombreArchivo;

    productoDB.save((err, productoGuardado) => {
      if (err)
        return res.status(500).json({
          ok: false,
          err
        });

      res.json({ ok: true, producto: productoGuardado, img: nombreArchivo });
    });
  });
}

function BorraArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );

  if (fs.existsSync(pathImagen)) fs.unlinkSync(pathImagen);
}

module.exports = app;
