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
const { createProxyMiddleware } = require('http-proxy-middleware');
const MongoStore = require('connect-mongo');

var dotenv = require('dotenv');


// Enabling cross origin resource sharing so the API can be called at the host origin
var corsOptions = {
  origin: ['http://localhost:4200', 'https://resume-builder-3aba3.web.app', 'https://resume-builder-backend-ahjg.onrender.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const resumeRoutes = require('./routes/components');
const apiRoute = require('./routes/openAi');

var app = express();



//Catch-all route: Send all other requests to Angular's index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'project-spa-frontend', 'src', 'index.html'));
// });
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});





// Configure session object
// MongoDB connection (adjust with your connection details)
mongoose.connect(process.env.CONNECTION_STRING_MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB for session storage');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// express-session configuration with MongoStore
app.use(session({
  secret: 'your-secret', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.CONNECTION_STRING_MONGODB,
    collectionName: 'sessions', 
    ttl: 14 * 24 * 60 * 60 // Time-to-live for sessions in seconds (14 days)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    maxAge: 1000 * 60 * 60 * 24 * 14 // Expire after 14 days (in milliseconds)
  }
}));

app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  console.log('Session Data:', req.session);
  next();
});

app.use('/python-api', createProxyMiddleware({
  target: 'http://localhost:5000', 
  changeOrigin: true
}));

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// Use the auth routes
app.use('/', authRouter);
// resume component routes
app.use('/resume', resumeRoutes);
// api call route
app.use('/api', apiRoute);

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
