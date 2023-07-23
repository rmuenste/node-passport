const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


const simpleQuery = 'SELECT * FROM German_Words';
const allQuery = "SELECT German_Words.word AS german_word," +
"Russian_Words.word AS russian_word " +
"FROM Ger_Ru " +
"INNER JOIN German_Words ON Ger_Ru.ger_word_id = German_Words.word_id " +
"INNER JOIN Russian_Words ON Ger_Ru.ru_word_id = Russian_Words.word_id";

const registerQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';

module.exports = (db, passport) => {

// login route
router.route('/login').post((req, res, next) => {
  console.log(`/login route received POST request ${req.body.username}`);

  passport.authenticate("local", (err, user, info) => {
    // The local strategy will be executed first and the 'user' parameter
    // will hold the return value of the localStrategy
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
      });
    }
  })(req, res, next);    
    
});

router.route('/register').post(async (req, res) => {

    const {username, password, email} = req.body;
  
    if (!username) {
      return res.status(400).json({ error: 'Missing "username" property in the request body.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing "password" property in the request body.' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing "email" property in the request body.' });
    }
  
    console.log(`/register route received POST request ${req.body.username}`);
    console.log(`/register route received POST request ${req.body.password}`);

    // Perform the SQL query to check if the user exists
    const existsQuery = 'SELECT * FROM users WHERE username = ?';

    try {
      // Await the response from the data base
      const [results, fields] = await db.query(existsQuery, [username]); 

      if (results.length > 0) {
        // The user exists
        return res.json({ exists: true, msg: "User already exists" });
      }
    } catch (err) {
        console.error('Error executing the query:', err.message);
        return res.status(500).json({ error: 'An error occurred while checking the user.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [results] = await db.query(registerQuery, [username, hashedPassword, email]);
        return res.json({ success: true, msg: "User was added successfully" });
    } catch (err) {
        console.error('Error executing the query:', err.message);
        return res.status(500).json({ error: 'An error occurred while adding the user.' });
    }

});

return router;
}