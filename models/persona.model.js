const mongoose = require("mongoose");

var personaSchema = new mongoose.Schema({
    idInterno: {
        type: Number
    },
    nombreCompleto: {
        type: String,
        trim: true,
        text: true
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
        unique: true,
        sparse: true,
    },
    correo: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    trabajo: {
        type: String,
        trim: true,
    },
    telefono: {
        type: String,
        trim: true,
    },
});


var Persona = mongoose.model("Persona", personaSchema);

module.exports = Persona;