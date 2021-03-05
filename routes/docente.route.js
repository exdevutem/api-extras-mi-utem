const express = require("express");

const docente = require("../controllers/docente.controller");

const router = express.Router();

router.get("/buscar", docente.buscar);

module.exports = router;