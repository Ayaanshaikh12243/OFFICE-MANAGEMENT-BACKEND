// Import required modules
const passport = require('passport');
const User = require('../models/User');

// GET - Display login page
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};

// POST - Handle login
exports.postLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
};

// GET - Display registration page
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

// POST - Handle registration
exports.postRegister = async (req, res) => {
  const { username, email, password, password2, fullName } = req.body;
  
  // Validation
  let errors = [];
  
  // Check required fields
  if (!username || !email || !password || !password2 || !fullName) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  
  // If there are errors, render the form again with error messages
  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Register',
      errors,
      username,
      email,
      fullName
    });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      errors.push({ msg: 'Email or username already registered' });
      return res.render('auth/register', {
        title: 'Register',
        errors,
        username,
        email,
        fullName
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      fullName,
      role: 'employee' // Default role
    });
    
    // Save user to database (password will be hashed automatically)
    await newUser.save();
    
    // Success message and redirect
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
    
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
};

// GET - Handle logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
};
