const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    
    const recentEmployees = await Employee.find()
      .populate('department')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      totalEmployees,
      totalDepartments,
      activeEmployees,
      recentEmployees,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading dashboard');
    res.redirect('/');
  }
};
