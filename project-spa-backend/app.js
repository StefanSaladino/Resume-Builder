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

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const resumeRoutes = require('./routes/components');
const apiRoute = require('./routes/openAi');

var app = express();

// Enable CORS with options
var corsOptions = {
  origin: [
    'http://localhost:4200', 
    'https://resume-builder-3aba3.web.app', 
    'https://resume-builder-backend-ahjg.onrender.com'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Allow cookies to be sent with requests
};
app.use(cors(corsOptions));

// Connect to MongoDB for session storage
mongoose.connect(globals.ConnectionString.MongoDB, {
}).then(() => {
  console.log('Connected to MongoDB for session storage');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with MongoStore
app.use(session({
  secret: 'your-secret', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.CONNECTION_STRING_MONGODB,
    collectionName: 'sessions', 
    ttl: 14 * 24 * 60 * 60 // Sessions last 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production only
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14 // Expire after 14 days
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Log session data for debugging
app.use((req, res, next) => {
  console.log('Session Data:', req.session);
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/resume', resumeRoutes);
app.use('/api', apiRoute);

// Proxy for Python API
app.use('/python-api', createProxyMiddleware({
  target: 'http://localhost:5000', 
  changeOrigin: true
}));

// Catch-all route for Angular app (assuming your app is served from this directory)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'project-spa-frontend', 'src', 'index.html'));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
