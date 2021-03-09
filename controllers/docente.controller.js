// @ts-nocheck
const Asignatura = require("../models/asignatura.model");
const Docente = require("../models/docente.model");

var opcionesByReqQuery = (reqQuery) => {
  const etiquetas = {
    totalDocs: "total",
    docs: "docentes",
    limit: "limite",
    page: "pagina",
    totalPages: "paginasTotales",
    hasPrevPage: "tieneAnterior",
    hasNextPage: "tieneSiguiente",
    nextPage: false,
    prevPage: false,
    pagingCounter: false,
    meta: false,
  };

  var opciones = {
    page: 1,
    limit: 10,
    lean: true,
    sort: null,
    select: "rut nombreCompleto correo",
    customLabels: etiquetas,
  };

  if (reqQuery) {
    if (reqQuery.pagina && parseInt(reqQuery.pagina)) {
      opciones.page = parseInt(reqQuery.pagina);
    }
    if (reqQuery.limite && parseInt(reqQuery.limite)) {
      opciones.limit = parseInt(reqQuery.limite);
    }
    if (reqQuery.ordenar) {
      opciones.sort = reqQuery.ordenar;
    }
  }

  return opciones;
};

const buscar = async (req, res, next) => {
  try {
    const limit = req.query.limit ? req.query.limit : 10

    if (limit == 1) {
      const { nombre, rut, correo } = req.query;
      let docente;
      if (nombre) {
        docente = await Docente.findOne({
          $text: { $search: nombre },
        })
        .sort({ score: { $meta: "textScore" } })
        .lean();
      } else if (rut) {
        docente = await Docente.findOne({
          rut
        })
        .lean();
      } else if (correo) {
        docente = await Docente.findOne({
          correo
        })
        .lean();
      }
      
      res.status(200).json(docente);
    } else {
      const { nombre } = req.query;
      req.query.ordenar = { score: { $meta: "textScore" } };
      const docentes = await Docente.paginate({
        $text: { $search: nombre },
      }, opcionesByReqQuery(req.query));
      res.status(200).json(docentes);
    }

    
  } catch (error) {
    next(error);
  }
};

const asignar = async (req, res, next) => {
  try {
      const { nombreDocente, codigoAsignatura, nombreAsignatura } = req.body;
      let docente = await Docente.findOne({
        $text: { $search: nombreDocente },
      })
      .populate("asignaturasRelacionadas")
      .sort({ score: { $meta: "textScore" } });
      
      let relacionadas = docente.asignaturasRelacionadas;
      if (relacionadas == null) {
        relacionadas = [];
      }
      
      let yaEstaAgregada = relacionadas.filter(a => a.codigo.toUpperCase() == codigoAsignatura.toUpperCase()).length > 0
      
      let asignatura = await Asignatura.findOne({
        codigo: codigoAsignatura
      });

      if (!yaEstaAgregada) {
        if (!asignatura) {
          asignatura = new Asignatura({
            nombre: nombreAsignatura,
            codigo: codigoAsignatura,
            docentesRelacionados: [docente]
          });
        }
        relacionadas.push(asignatura);
        docente.asignaturasRelacionadas = relacionadas;
        await docente.save()
      } else {
        let docentes = asignatura.docentesRelacionados;
        if (docentes == null) {
          docentes = [];
        }
        
        console.log("id", docentes[0]._id.toString(), docente._id.toString(), docentes[0]._id.toString() == docente._id.toString())
        let yaEstaAgregado = docentes.filter(d => d._id.toString() == docente._id.toString()).length > 0;
        if (!yaEstaAgregado) {
          docentes.push(docente);
          asignatura.docentesRelacionados = docentes;
        }
      }

      await asignatura.save();
      
      res.status(200).json(docente);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  asignar,
  buscar
};
