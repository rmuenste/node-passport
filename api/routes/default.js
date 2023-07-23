const express = require('express');
const router = express.Router();

const simpleQuery = 'SELECT * FROM German_Words';
const allQuery = "SELECT German_Words.word AS german_word," +
"Russian_Words.word AS russian_word " +
"FROM Ger_Ru " +
"INNER JOIN German_Words ON Ger_Ru.ger_word_id = German_Words.word_id " +
"INNER JOIN Russian_Words ON Ger_Ru.ru_word_id = Russian_Words.word_id";

module.exports = (db) => {

router.route('/').get( async (req, res) => {

    try {
      console.log(`Received GET request ${req.body}`);
      const [result] = await db.query(allQuery);
      console.log('Result: ', result);
      res.send(result);

    } catch {
        console.error('Error executing MySQL query:', err);
        res.status(500).send('Error executing MySQL query');
    }

});

return router;
}
