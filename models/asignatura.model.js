// @ts-nocheck
const mongoose = require("mongoose");

var asignaturaSchema = new mongoose.Schema({
    codigo: {
        type: String,
        trim: true,
        text: true,
        unique: true,
    },
    nombre: {
        type: String,
        trim: true,
        text: true,
    },
    docentesRelacionados: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Asignatura' 
    }]
});

var Asignatura = mongoose.model("Asignatura", asignaturaSchema);

module.exports = Asignatura;