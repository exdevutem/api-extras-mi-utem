const express = require("express");

const poblar = require("../controllers/poblar.controller");

const router = express.Router();

router.get("/docentes/json", poblar.poblarDocentesDesdeJson);
router.get("/personas/directory", poblar.poblarPersonasDesdeDirectory);
router.post("/personas/directory", poblar.recibirPersonaDesdeDirectory);

module.exports = router;