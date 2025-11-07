// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config();

// Import database configuration
const connectDB = require('./config/database');

// Import passport configuration
require('./config/passport')(passport);

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const departmentRoutes = require('./routes/department');
const employeeRoutes = require('./routes/employee');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override middleware
app.use(methodOverride('_method'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not defined in .env file');
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' };
  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/departments', departmentRoutes);
app.use('/employees', employeeRoutes);

// 404 Page
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Server Error');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MongoDB Atlas Connected`);
});
