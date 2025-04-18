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
const cron = require('node-cron');
require('dotenv').config();

// Enable CORS
var corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://resume-builder-3aba3.web.app',
    'https://resume-builder-backend-ahjg.onrender.com',
    'https://resume-builder-py-script.onrender.com'
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
mongoose.connect(process.env.CONNECTION_STRING_MONGODB, {
}).then(() => {
  console.log('Connected to MongoDB for session storage');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Configure express-session with MongoStore
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.CONNECTION_STRING_MONGODB,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // Sessions last 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    // httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14 // Expire after 14 days
  }
}));

// Passport strategy configuration for user login
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CORS setup
app.use(cors(corsOptions));

// Session logger to help with debugging
app.use((req, res, next) => {
  console.log('Session Data:', req.session);
  next();
});

// Proxy setup for Python API
app.use('/python-api', createProxyMiddleware({
  target: 'https://resume-builder-py-script.onrender.com',
  changeOrigin: true,
  pathRewrite: { '^/python-api': '' } // Remove the /python-api prefix
}));


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

//scheduling reset of API calls to 0 every night
cron.schedule('1 0 * * *', async () => {
  console.log('Resetting API Calls Today to 0 at 00:01 every night');
  try {
    const res = await User.updateMany({}, { apiCallsToday: 0 });
    console.log('API calls reset successfully:', res);
  } catch (err) {
    console.error('Error resetting apiCallsToday:', err);
  }
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
