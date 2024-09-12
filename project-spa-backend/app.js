var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var globals = require("./configs/globals");
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user'); // Import the user model
const authRoutes = require('./routes/auth'); // Auth routes

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Serve static files from Angular's 'src' directory for development
app.use(express.static(path.join(__dirname, 'project-spa-frontend', 'src')));

// Catch-all route: Send all other requests to Angular's index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'project-spa-frontend', 'src', 'index.html'));
});

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure session object
// Initialize passport
app.use(session({
  secret: "resumeBuilder", // Value used to sign session ID cookie
  resave: false, // Save session even if not modified
  saveUninitialized: false // Save session even if not used
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// Use the auth routes
app.use('/', authRoutes);

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
