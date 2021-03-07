const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var docenteSchema = new mongoose.Schema({
    idInterno: {
        type: Number
    },
    correoVerificado: {
        type: Boolean,
        default: false,
    },
    nombreCompleto: {
        type: String,
        trim: true,
        text: true,
    },
    nombres: {
        type: String,
        trim: true,
    },
    apellidos: {
        type: String,
        trim: true,
    },
    rut: {
        type: Number,
        unique: true
    },
    correo: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        text: true,
    },
});

docenteSchema.plugin(mongoosePaginate);
var Docente = mongoose.model("Docente", docenteSchema);

module.exports = Docente;