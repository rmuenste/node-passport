const express = require('express');
const mysql = require('mysql2/promise');
const passport = require('passport');
const cookieParse = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');

//=========================================================================================
//                                 Set up express
//=========================================================================================
const app = express();
const cors = require('cors');
const port = process.env.PORT ?? 5001;


//=========================================================================================
//                                 Set up some middleware
//=========================================================================================
let corsOptions = {
    "origin": "http://localhost:3000",
    "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: true}));
//app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParse('secretcode'));

app.use(passport.initialize());
app.use(passport.session());


//=========================================================================================
//                               Connect to the data base
//=========================================================================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'changeme',
    database: 'vocabulary_db',
    port: 3306
});

db.on('error', (err) => {
    console.error('Error connecting to MySQL database:', err);
});

require('./passportConfig')(passport, db);

const defaultRoute = require('./api/routes/default');
app.use('/api/getwords', defaultRoute(db));
const loggingRoute = require('./api/routes/logging');
app.use('/api/user', loggingRoute(db, passport));

//db.connect((err) => {
//    if(err) {
//        console.error('Error connecting to MySQL database:', err);
//    } else {
//        console.log('Connected to MySQL database');
//        const defaultRoute = require('./api/routes/default');
//        app.use('/api/getwords', defaultRoute(db));
//        const loggingRoute = require('./api/routes/logging');
//        app.use('/api/user', loggingRoute(db));
//    }
//});

//=========================================================================================
//                                 Configure routes
//=========================================================================================


//=========================================================================================
//                                Tell the Server to listen
//=========================================================================================
app.listen(port, () => {
    console.log(`App running on port ${port}`);
})