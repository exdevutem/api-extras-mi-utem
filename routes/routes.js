const express = require("express");

const docente = require("./docente.route");
const poblar = require("./poblar.route");

const router = express.Router();

router.use("/docentes", docente);
router.use("/poblar", poblar);

module.exports = router;
