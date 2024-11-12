/**
 * Coby Chun
 * CSE 154 AE Peter & Kasten
 * 5/28/2024
 *
 * Server side JS file for yipper. Handles get and post requests from clientside
 * yipper.js. Connects to yipper.db to access yips table. Access using nodemon in terminal
 * and going to localhost:8000/yipper.html.
 */

'use strict';

const SERVER_ERR = 500;
const CLIENT_ERR = 400;
const MY_PORT = 8000;
const SERVER_ERROR_MSG = 'Something went wrong on the server.';

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none()); // requires the "multer" module

app.get("/yipper/yips", async function(req, res) {
  try {
    let search = req.query['search'];
    let db = await getDBConnection();
    let query = "";
    let yips;
    if (search) {
      search = "%" + search + "%";
      query = "SELECT id FROM yips WHERE yip LIKE ? ORDER BY id";
      yips = await db.all(query, search);
      yips = addKey(yips);
    } else {
      query = "SELECT * FROM yips ORDER BY date DESC";
      yips = await db.all(query);
      yips = addKey(yips);
    }
    await db.close();
    res.type("json");

    res.send(yips);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/yipper/user/:user", async function(req, res) {
  try {
    let user = req.params.user;
    let db = await getDBConnection();

    const query = "SELECT name, yip, hashtag, date FROM yips WHERE name = ? ORDER BY date DESC";
    let yips = await db.all(query, user);
    await db.close();
    res.type("json");

    res.send(yips);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.post("/yipper/likes", async function(req, res) {
  res.type("text");
  let id = req.body.id;
  let response = "";
  if (id) {
    try {
      let db = await getDBConnection();

      const queryUpdate = "UPDATE yips SET likes = likes+1 WHERE id = ?";
      await db.run(queryUpdate, id);
      const queryGet = "SELECT * FROM yips WHERE id = ?";
      let yip = await db.get(queryGet, id);

      response = yip.likes + "";

      await db.close();
    } catch (err) {
      res.status(SERVER_ERR);

      response = SERVER_ERROR_MSG;
    }
  } else {
    res.status(SERVER_ERR);
    response = "Missing Body Parameters";
  }

  res.send(response);
});

app.post("/yipper/new", async function(req, res) {
  let name = req.body.name;
  let full = req.body.full;

  let response;
  if (name && full) {
    try {
      let db = await getDBConnection();

      let yip = full.split(" #")[0];
      let hashtag = full.split(" #")[1];

      const queryInsert = "INSERT INTO yips (name, yip, hashtag, likes) " +
        "VALUES (?, ?, ?, 0)";
      let result = await db.run(queryInsert, [name, yip, hashtag]);
      const querySelect = "SELECT * FROM yips WHERE id = ?";
      response = await db.get(querySelect, result.lastID);
      res.type("json");

      await db.close();
    } catch (err) {
      res.type("text").status(SERVER_ERR);

      response = SERVER_ERROR_MSG;
    }
  } else {
    res.type("text").status(CLIENT_ERR);
    response = "Missing Body Parameters";
  }

  res.send(response);
});

/* ------------------------------ Helper Functions  ------------------------------ */

/**
 * Establishes a database connection to yipper database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'yipper.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Orders yips into a new object with a key "yips"
 * @param {object} yipData - JSON object with yips from yips table
 * @returns {object} - New JSON object with "yips" key with yips
 */
function addKey(yipData) {
  let ordered = {};
  ordered["yips"] = [];
  for (let i = 0; i < yipData.length; i++) {
    let yip = yipData[i];
    ordered["yips"].push(yip);
  }
  return ordered;
}

const PORT = process.env.PORT || MY_PORT;
app.listen(PORT);
app.use(express.static("public"));