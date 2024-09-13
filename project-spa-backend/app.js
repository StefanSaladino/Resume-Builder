var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var globals = require("./configs/globals");
const mongoose = require('mongoose');
var passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
var User = require('./models/user'); // Import the user model
const authRouter = require('./routes/auth'); // Auth routes
var dotenv = require('dotenv');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Enabling cross origin resource sharing so the API can be called at the host origin
var corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200
};






// Catch-all route: Send all other requests to Angular's index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'project-spa-frontend', 'src', 'index.html'));
// });
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOptions));

// Configure session object
// Initialize passport
app.use(session({
  secret: "resumeBuilder", // Value used to sign session ID cookie
  resave: false, // Save session even if not modified
  saveUninitialized: false // Save session even if not used
}));

app.use(passport.initialize());
app.use(passport.session());


// Initialize passport strategy
passport.use(User.createStrategy());
// Configure passport to serialize and deserialize user data
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// Use the auth routes
app.use('/auth', authRouter);

// Connect to MongoDB
mongoose
.connect(globals.ConnectionString.MongoDB)
.then(() => {
  console.log("Successful connection to MongoDB");
})
.catch((err) => {
  console.log(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
