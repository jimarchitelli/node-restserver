const mongoose = require("mongoose");

let Schema = mongoose.Schema;
let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        required: [true, 'El usuario es obligatorio']
    }
});

module.exports = mongoose.model('categoria', categoriaSchema);