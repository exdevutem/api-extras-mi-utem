const Docente = require("../models/docente.model");

const buscar = async (req, res, next) => {
  try {
    const limit = req.query.limit ? req.query.limit : 10

    const { nombre } = req.query;

    if (limit == 1) {
      const docente = await Docente.findOne({
        $text: { $search: nombre },
      })
        .sort({ score: { $meta: "textScore" } })
        
        .lean();
      res.status(200).json(docente);
    } else {
      const docentes = await Docente.find({
        $text: { $search: nombre },
      })
        .sort({ score: { $meta: "textScore" } })
        .select("rut nombreCompleto correo")
        .limit(limit)
        .lean();
      res.status(200).json(docentes);
    }

    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buscar
};
