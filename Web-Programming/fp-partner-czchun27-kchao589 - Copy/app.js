/**
 * Coby Chun & Kevin Chao
 * CSE 154
 * Final Project
 * 6/4/2024
 *
 * Server side JS file for course selector. Reads and writes to the courses database.
 * Responsible for most functions in the course selection program.
 */

'use strict';

const SERVER_ERR = 500;
const CLIENT_ERR = 400;
const MY_PORT = 8000;
const SERVER_ERROR_MSG = 'Something went wrong on the server.';
const CONFIRMATION_LEN = 7;
const NUM_DIGITS = 10;

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

// Access using nodemon in terminal and going to localhost:8000 in browser

app.get("/courses/get/courselist", async function(req, res) {
  try {
    let search = req.query['search'];
    let db = await getDBConnection();
    let courses;
    if (search) {
      search = "%" + search + "%";
      const query = "SELECT * FROM courselist WHERE name LIKE ? ORDER BY short";
      courses = await db.all(query, search);
    } else {
      const query = "SELECT * FROM courselist ORDER BY short";
      courses = await db.all(query);
    }
    await db.close();
    res.type("json");

    res.send(courses);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/get/courselist/:course", async function(req, res) {
  try {
    let course = req.params.course;
    let db = await getDBConnection();
    const query = "SELECT * FROM courselist WHERE short = ?";
    let courseInfo = await db.get(query, course);
    await db.close();
    res.type("json");

    res.send(courseInfo);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/courselist/filter/:filter", async function(req, res) {
  try {
    let filter = req.params.filter;
    let db = await getDBConnection();
    let courses;
    if (filter === "all") {
      const query = "SELECT * FROM courselist ORDER BY short";
      courses = await db.all(query);
      await db.close();
    } else if (filter === "available") {
      const query = "SELECT * FROM courselist WHERE numStudents < 50 ORDER BY short";
      courses = await db.all(query);
      await db.close();
    } else {
      const query = "SELECT * FROM courselist WHERE dept LIKE ? ORDER BY short";
      courses = await db.all(query, [filter]);
      await db.close();
    }
    res.json(courses);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/get/degreereq/:degree", async function(req, res) {
  try {
    let degree = req.params.degree;
    let db = await getDBConnection();
    const query = "SELECT * FROM degrees WHERE name = ?";
    let degreeInfo = await db.get(query, degree);
    await db.close();
    res.type("json");

    res.send(degreeInfo);
  } catch (err) {
    res.type("text").status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/get/user", async function(req, res) {
  try {
    let db = await getDBConnection();
    const query = "SELECT id, degree FROM users WHERE currUser = 1";
    let userInfo = await db.get(query);
    await db.close();
    if (userInfo === undefined) {
      res.type("text").status(CLIENT_ERR);

      userInfo = "No active user found";
    } else {
      res.type("json");
    }

    res.send(userInfo);
  } catch (err) {
    res.type("text").status(SERVER_ERR);
    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/get/userCourses/:userid", async function(req, res) {
  try {
    let id = req.params.userid;
    let db = await getDBConnection();
    const query = "SELECT * FROM courses WHERE id = ?";
    let userCourses = await db.all(query, id);
    await db.close();
    if (userCourses === undefined) {
      res.type("text").status(CLIENT_ERR);

      userCourses = "No courses";
    } else {
      res.type("json");
    }

    res.send(userCourses);
  } catch (err) {
    res.type("text").status(SERVER_ERR);
    res.send(SERVER_ERROR_MSG);
  }
});

app.get("/courses/get/transactions/:userid", async function(req, res) {
  try {
    let id = req.params.userid;
    let db = await getDBConnection();
    const query = "SELECT * FROM transactions WHERE id = ? ORDER BY date DESC";
    let txns = await db.all(query, id);
    await db.close();
    if (txns === undefined) {
      res.type("text").status(CLIENT_ERR);

      txns = "No transactions";
    } else {
      res.type("json");
    }

    res.send(txns);
  } catch (err) {
    res.type("text").status(SERVER_ERR);
    res.send(SERVER_ERROR_MSG);
  }
});

app.post("/courses/login", async function(req, res) {
  let username = req.body.user;
  let password = req.body.pass;
  if (username && password) {
    try {
      let response;
      let db = await getDBConnection();
      const searchQuery = "SELECT id FROM users WHERE user = ? AND pass = ?";
      let user = await db.get(searchQuery, [username, password]);
      if (user !== undefined) {
        const updateQuery = "UPDATE users SET currUser = 1 WHERE id = ?";
        await db.run(updateQuery, user.id);
        res.type("json");
        response = user;
      } else {
        response = "Credentials not found";
        res.type("text").status(CLIENT_ERR);
      }
      await db.close();

      res.send(response);
    } catch (err) {
      res.status(SERVER_ERR);

      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.status(CLIENT_ERR);

    res.send("Missing Params");
  }
});

app.post("/courses/logout", async function(req, res) {
  res.type("text");
  try {
    let response;
    let db = await getDBConnection();
    const updateQuery = "UPDATE users SET currUser = 0 WHERE currUser = 1";
    await db.run(updateQuery);
    response = "Logged out user";
    await db.close();

    res.send(response);
  } catch (err) {
    res.status(SERVER_ERR);

    res.send(SERVER_ERROR_MSG);
  }
});

app.post("/courses/add", async function(req, res) {
  let course = req.body.course;
  let id = req.body.id;
  res.type("text");
  if (course && id) {
    try {
      let db = await getDBConnection();
      const insertQuery = "INSERT INTO courses (id, short, status) VALUES (?, ?, 0)";
      await db.run(insertQuery, [id, course]);
      const updateQuery = "UPDATE courselist SET numStudents = numStudents+1 WHERE short = ?";
      await db.run(updateQuery, course);
      const transactQuery = "INSERT INTO transactions (id, short, action, confirmation) " +
        "VALUES (?, ?, 0, ?)";
      await db.run(transactQuery, [id, course, genConfirmation()]);
      await db.close();

      res.send("Added course");
    } catch (err) {
      res.status(SERVER_ERR);

      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.status(CLIENT_ERR);

    res.send("Missing Params");
  }
});

app.post("/courses/remove", async function(req, res) {
  let course = req.body.course;
  let id = req.body.id;
  res.type("text");
  if (course && id) {
    try {
      let db = await getDBConnection();
      const deleteQuery = "DELETE FROM courses WHERE id = ? AND short = ?";
      await db.run(deleteQuery, [id, course]);
      const updateQuery = "UPDATE courselist SET numStudents = numStudents-1 WHERE short = ?";
      await db.run(updateQuery, course);
      const transactQuery = "INSERT INTO transactions (id, short, action, confirmation) " +
        "VALUES (?, ?, 1, ?)";
      await db.run(transactQuery, [id, course, genConfirmation()]);
      await db.close();

      res.send("Dropped course");
    } catch (err) {
      res.status(SERVER_ERR);

      res.send(SERVER_ERROR_MSG);
    }
  } else {
    res.status(CLIENT_ERR);

    res.send("Missing Params");
  }
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
    filename: 'course-selector.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Generates a confirmation number for a transaction
 * @returns {string} - Confirmation number
 */
function genConfirmation() {
  let confirmation = "#";
  for (let i = 0; i < CONFIRMATION_LEN; i++) {
    confirmation = confirmation + Math.floor(Math.random() * NUM_DIGITS);
  }
  return confirmation;
}

const PORT = process.env.PORT || MY_PORT;
app.listen(PORT);
app.use(express.static("public"));