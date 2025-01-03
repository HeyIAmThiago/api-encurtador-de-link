const mysql = require("mysql2");

const makeDbConnection = () => {
  const connection = mysql.createConnection({
    host: "sql10.freemysqlhosting.net",
    user: "sql10755172",
    password: "vsRDlkm5P6",
    database: "sql10755172",
    port: 3306,
  });

  return connection;
};

module.exports = makeDbConnection;
