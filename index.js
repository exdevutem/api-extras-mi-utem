require('dotenv').config()

const bodyParser = require("body-parser");
const express = require("express");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const router = require("./routes/routes");
const morgan = require("morgan");
const mongoose = require('mongoose');

const CustomError = require("./models/error.model");

const app = express();

app.use(bodyParser.json({limit: '50mb'}));

Sentry.init({
  dsn: process.env.SENTRY_URL,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

mongoose.connect(
    process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw err;
  
      console.log("👍 Conectado correctamente a la base de datos");
    }
);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// @ts-ignore
String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

app.use(morgan("dev"));

// @ts-ignore
app.get("/", (req, res) => {
  res.json({
    funcionando: true,
    estado: "API funcionando correctamente",
  });
});

app.use("/v1", router);

app.use(Sentry.Handlers.errorHandler());

// @ts-ignore
app.use(function onError(err, req, res, next) {
  console.error(err);
  if (err instanceof CustomError) {
    res.statusCode = err.statusCode;
    res.json({
      codigoHttp: err.statusCode ? err.statusCode : 500,
      mensaje: err.message ? err.message : "Error inesperado",
      codigoInterno: err.internalCode ? err.internalCode : 0,
      error: err.toString(),
    });
  } else {
    res.statusCode = 500;
    res.json({
      codigoHttp: 500,
      mensaje: "Error inesperado",
      codigoInterno: 0,
      error: err.toString(),
    });
  }
  
});



let puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log("🚀 Escuchando en el puerto", puerto);
});
