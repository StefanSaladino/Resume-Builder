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
const cors = require('cors');
var User = require('./models/user'); // Import the user model
const authRouter = require('./routes/auth'); // Auth routes
const { createProxyMiddleware } = require('http-proxy-middleware');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Enable CORS
var corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://resume-builder-3aba3.web.app',
    'https://resume-builder-backend-ahjg.onrender.com'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const resumeRoutes = require('./routes/components');
const apiRoute = require('./routes/openAi');

var app = express();

// Catch-all route for serving Angular's index.html (currently commented out if needed for CSR support)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'project-spa-frontend', 'src', 'index.html'));
// });

// Middleware setup
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Welcome route for base URL
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// MongoDB connection setup for session storage
app.use(session({
  secret: 'resume-Builder',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  } // Secure should be true only in production with HTTPS
}));

// CORS setup
app.use(cors(corsOptions));

// Passport and session management
app.use(passport.initialize());
app.use(passport.session());

// Session logger to help with debugging
app.use((req, res, next) => {
  console.log('Session Data:', req.session);
  next();
});

// Proxy setup for Python API
app.use('/python-api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Passport strategy configuration for user login
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/resume', resumeRoutes);
app.use('/api', apiRoute);

// Connect to MongoDB for additional non-session usage
mongoose.connect(globals.ConnectionString.MongoDB)
.then(() => {
  console.log("Successful connection to MongoDB");
})
.catch((err) => {
  console.log(err);
});

// 404 Error handling
app.use(function(req, res, next) {
  next(createError(404));
});

// Global error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
