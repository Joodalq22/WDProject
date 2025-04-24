const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'project')));

const db = new sqlite3.Database('./todo.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    mobile TEXT,
    dob TEXT,
    email TEXT,
    language TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post('/contact', (req, res) => {
  const { firstName, lastName, gender, mobile, dob, email, lang, message } = req.body;

  db.run(`INSERT INTO contacts 
    (first_name, last_name, gender, mobile, dob, email, language, message) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [firstName, lastName, gender, mobile, dob, email, lang, message], 
    function(err) {
      if (err) {
        console.error("Error saving contact:", err);
        return res.status(500).send("Error saving contact.");
      }
      res.json({ id: this.lastID });
  });
});

app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
