const makeDbConnection = require("./connection");
const dbConnection = makeDbConnection();
const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration

app.use(express.json());

app.get("/:url", (req, res) => {
  const { url } = req.params;

  dbConnection.execute(
    `SELECT id, url, shortcode, createdat, updatedat, accesscount FROM url WHERE shortcode = '${url}'`,
    (err, results) => {
      const thereIsAnyResult = results.length !== 0;

      if (thereIsAnyResult) {
        const lastValidResult = results[0];
        res.json(lastValidResult);
        console.log("Resultados: ");
        console.log(results[0]);
      } else {
        res.json({ message: "URL não cadastrada" });
      }
    }
  );
});

app.post("/url", (req, res) => {
  // dbConnection.execute(`DELETE FROM url WHERE url ="${req.body.url}"`);
  console.log(req.body);

  dbConnection.execute(
    `SELECT url from url WHERE shortcode = '${req.body.shortcode}'`,
    (err, results) => {
      if (results.length !== 0) {
        res.json({ message: "URL de encurtamento já sendo utilizada!" });
      } else {
        dbConnection.execute(
          `INSERT INTO url VALUES(DEFAULT, "${req.body.url}", "${req.body.shortcode}", "${req.body.createdat}", "${req.body.updatedat}", 0);`,
          (err, results) => {
            if (results.affectedRows === 1) {
              res.json({
                id: results.insertId,
                url: req.body.url,
                shortcode: req.body.shortcode,
                createdat: req.body.createdat,
                updatedat: req.body.updatedat,
                accesscount: 0,
              });
            }
          }
        );
      }
    }
  );
});

app.put("/url", (req, res) => {
  console.log("URL - SHORT -  - NEW");
  console.log(req.body.url);
  console.log(req.body.shortcode);
  console.log(req.body.newshortcode);
  console.log(req.body.updatedat);

  dbConnection.execute(
    `UPDATE url SET shortcode = '${req.body.newshortcode}', updatedat = '${req.body.updatedat}' WHERE shortcode = '${req.body.shortcode}' AND url = '${req.body.url}'`,
    (err, results) => {
      console.log(`Afetou ${results.affectedRows} linhas`);
      if (results.affectedRows === 1) {
        res.json({ message: "Afetado com sucesso" });
      } else {
        res.json({ message: "Erro" });
      }
    }
  );
});

app.patch("/url/:shorturl", (req, res) => {
  dbConnection.execute(
    `SELECT * FROM url WHERE shortcode = '${req.params.shorturl}'`,
    (err, results) => {
      if (err) throw err;
      console.log(results);
      console.log(`AFFECTEd: ${results.affectedRows}`);
      if (results) {
        if (req.body.accesscount) {
          dbConnection.execute(
            `SELECT accesscount FROM url WHERE shortcode = '${req.params.shorturl}'`,
            (err, results) => {
              const newAccessCount =
                Number.parseInt(results[0].accesscount) + 1;

              dbConnection.execute(
                `UPDATE url SET accessCount = '${newAccessCount}' WHERE shortcode = '${req.params.shorturl}'`,
                (err, results) => {
                  res.json({
                    message: "Acessado com sucesso e alterado com sucesso!",
                  });
                }
              );
            }
          );
        }
      } else {
        res.json({ message: "URL não existe!" });
      }
    }
  );
});

app.delete("/url/:url", (req, res) => {
  const deleteSQL = `DELETE FROM url WHERE shortcode='${req.params.url}'`;

  dbConnection.execute(deleteSQL, (err, results) => {
    if (err) throw err;
    if (results.affectedRows === 0) {
      res.json({ message: "URL não existe!" });
    } else {
      res.json({ message: "URL deletada com sucesso!" });
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on localhost");
});
