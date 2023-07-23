const bcrypt = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

module.exports = (passport, db) => {

    passport.use(
      new localStrategy(async (username, password, done) => {

        // Perform the SQL query to check if the user exists
        const existsQuery = 'SELECT * FROM users WHERE username = ?';
        try {
            // Await the response from the data base
            const [results, fields] = await db.query(existsQuery, [username]); 

            if (results.length > 0) {
                // The user exists
                bcrypt.compare(password, results[0].password, (err, value) => {
                    if (err) throw err;
                    if (value === true) {
                      return done(null, results[0]);
                    } 
                    else {
                      console.log("compare not successful");
                      return done(null, false);
                    }
                });
            }
            else {
                console.log("No user found");
                return done(null, false);
            }
        } catch (err) {
            console.error('Error executing the local strategy.');
            throw err;
        }

      })
    );

    passport.serializeUser( (user, callBack) => {
        console.log("Passport serialize");
        callBack(null, user.user_id);
    });

    passport.deserializeUser( async (id, callBack) => {
        console.log("Passport deserialize");
        const userIdQuery = 'SELECT * FROM users WHERE user_id = ?';
        try {
            // Await the response from the data base
            const results = await db.query(userIdQuery, [id]); 

            if (results.length > 0) {
                // The user exists
                callBack(err, results[0]);
            }
            else {
                console.log("No user found");
                callBack(err, null);
            }
        } catch (err) {
            callBack(err, null);
        }

    });
};


