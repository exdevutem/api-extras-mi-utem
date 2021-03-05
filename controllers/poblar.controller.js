// @ts-nocheck
const puppeteer = require("puppeteer");

const Docente = require("../models/docente.model");
const Persona = require("../models/persona.model");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function diacriticSensitiveRegex(string = "") {
  return string
    .replace(/a/g, "[a,á,à,ä,ã]")
    .replace(/e/g, "[e,é,ë]")
    .replace(/i/g, "[i,í,ï]")
    .replace(/o/g, "[o,ó,ö,ò]")
    .replace(/u/g, "[u,ü,ú,ù]");
}

const poblarDocentesDesdeJson = async (req, res, next) => {
  try {
    if (process.env.IS_LOCALHOST) {
      try {
        const docentesJson = require("../static/docentes.json");
        const docentesPromises = docentesJson.map((d) => {
          return new Promise(async (resolve, reject) => {
            try {
              const rut = parseInt(d.label.split(" - ")[0].trim());
              // @ts-ignore
              const nombreCompleto = unescape(
                encodeURIComponent(
                  d.label
                    .split(" - ")[1]
                    .replace(".", "")
                    .replace("      ", " ")
                    .split(" ")
                    .filter((e) => e && e != "")
                    .join(" ")
                )
              ).toTitleCase();
              const idInterno = parseInt(d.value.trim());
  
              let personas = await Persona.find({
                nombreCompleto: {
                  $regex: diacriticSensitiveRegex(nombreCompleto),
                  $options: "i",
                },
              }).lean();
  
              let correo;
              let correoVerificado = false;
  
              if (personas.length == 1) {
                correo = personas[0].correo;
                correoVerificado = true;
              } else {
                try {
                  let personas = await Persona.find({
                    $text: { $search: nombreCompleto },
                  })
                    .sort({ score: { $meta: "textScore" } })
                    .lean();
  
                  const persona = personas[0];
                  correo = persona.correo;
                } catch (error) {
                  console.error("Error en la búsqueda:", error);
                }
              }
  
              const docente = new Docente({
                rut,
                nombreCompleto,
                idInterno,
                correoVerificado,
                correo,
              });
  
              try {
                await docente.save();
              } catch (error) {
                console.error("Error al guardar:", error);
              }
              resolve(docente);
            } catch (error) {
              resolve(null);
            }
          });
        });
  
        const docentes = await Promise.all(docentesPromises);
  
        res.status(200).json(docentes);
      } catch (ex) {
        res.status(200).json([]);
      }
      
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    next(error);
  }
};

const poblarPersonasDesdeDirectory = async (req, res, next) => {
  let browser = null;
  try {
    if (process.env.IS_LOCALHOST) {
      const directorySelector =
        "#yDmH0d > c-wiz > div > div:nth-child(3) > div:nth-child(1) > div";

      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-zygote"],
        headless: false,
      });
      const page = await browser.newPage();

      await page.goto("https://contacts.google.com/u/1/directory", {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector(directorySelector);

      await sleep(5000);

      await page.evaluate(async () => {
        const scrollSelector = ".ZvpjBb.C8Dkz";
        const itemSelector = ".XXcuqd";
        const nameIndex = 1;
        const emailIndex = 2;
        const phoneIndex = 3;
        const jobIndex = 4;

        function sleep(ms) {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        }

        window.scroller = document.querySelectorAll(
          scrollSelector
        )[0].parentElement.parentElement.parentElement.parentElement;
        while (scroller.scrollHeight - scroller.scrollTop > 400) {
          for (let item of document
            .querySelectorAll(scrollSelector)[0]
            .querySelectorAll(itemSelector)) {
            if (item.firstChild.childNodes.length == 1) {
              break;
            }
            const name = item.firstChild.childNodes[nameIndex].innerText;
            const email = item.firstChild.childNodes[emailIndex].innerText;
            const phone = item.firstChild.childNodes[phoneIndex].innerText;
            const job = item.firstChild.childNodes[jobIndex].innerText;

            const person = { name: name, job: job, email: email, phone: phone };

            var xhr = new XMLHttpRequest();
            xhr.open(
              "POST",
              "http://localhost:3000/v1/poblar/personas/directory",
              true
            );
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(person));
          }
          scroller.scrollTo({
            top: scroller.scrollTop + 400,
            behavior: "smooth",
          });

          const percentage = (scroller.scrollTop / scroller.scrollHeight) * 100;
          console.log(
            `(${percentage.toFixed(2)}%) Completed iteration;`,
            `${scroller.scrollTop}/${scroller.scrollHeight}`
          );
          await sleep(4000);
        }
      });
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    next(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

const recibirPersonaDesdeDirectory = async (req, res, next) => {
  try {
    if (process.env.IS_LOCALHOST) {
      const { name, email, job, phone } = req.body;
      const persona = new Persona({
        nombreCompleto: name && name != "" ? name.trim().toTitleCase() : null,
        correo: email && email != "" ? email.trim().toLowerCase() : null,
        trabajo: job && job != "" ? job : null,
        phone: phone && phone != "" ? phone : null,
      });
      await persona.save();
      res.status(200).json(persona);
    } else {
      res.status(200).json();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  poblarDocentesDesdeJson,
  poblarPersonasDesdeDirectory,
  recibirPersonaDesdeDirectory,
};
