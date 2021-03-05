const mongoose = require("mongoose");

var docenteSchema = new mongoose.Schema({
    nombres: {
        type: String,
        trim: true,
    },
    apellidos: {
        type: String,
        trim: true,
    },
    correo: {
        type: String,
        trim: true,
    },
});


var Docente = mongoose.model("Docente", docenteSchema);

module.exports = Docente;