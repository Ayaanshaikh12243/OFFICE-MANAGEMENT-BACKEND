const Department = require('../models/Department');
const Employee = require('../models/Employee');

exports.listDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalDepartments = await Department.countDocuments();
    const totalPages = Math.ceil(totalDepartments / limit);
    
    const departments = await Department.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('department/list', {
      title: 'Departments',
      departments,
      currentPage: page,
      totalPages,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading departments');
    res.redirect('/dashboard');
  }
};

exports.getAddDepartment = (req, res) => {
  res.render('department/add', {
    title: 'Add Department',
    user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
  });
};

exports.postAddDepartment = async (req, res) => {
  const { name, code, description } = req.body;
  
  let errors = [];
  
  if (!name || !code || !description) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  if (errors.length > 0) {
    return res.render('department/add', {
      title: 'Add Department',
      errors,
      name,
      code,
      description,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  }
  
  try {
    const existingDept = await Department.findOne({
      $or: [{ name }, { code: code.toUpperCase() }]
    });
    
    if (existingDept) {
      errors.push({ msg: 'Department name or code already exists' });
      return res.render('department/add', {
        title: 'Add Department',
        errors,
        name,
        code,
        description,
        user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
      });
    }
    
    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      description
    });
    
    await newDepartment.save();
    
    req.flash('success_msg', 'Department added successfully');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error adding department');
    res.redirect('/departments/add');
  }
};

exports.getEditDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      req.flash('error_msg', 'Department not found');
      return res.redirect('/departments');
    }
    
    res.render('department/edit', {
      title: 'Edit Department',
      department,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading department');
    res.redirect('/departments');
  }
};

exports.postEditDepartment = async (req, res) => {
  const { name, code, description } = req.body;
  
  try {
    const existingDept = await Department.findOne({
      _id: { $ne: req.params.id },
      $or: [{ name }, { code: code.toUpperCase() }]
    });
    
    if (existingDept) {
      req.flash('error_msg', 'Department name or code already exists');
      return res.redirect(`/departments/edit/${req.params.id}`);
    }
    
    await Department.findByIdAndUpdate(req.params.id, {
      name,
      code: code.toUpperCase(),
      description,
      updatedAt: Date.now()
    });
    
    req.flash('success_msg', 'Department updated successfully');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating department');
    res.redirect('/departments');
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    
    if (employeeCount > 0) {
      req.flash('error_msg', 'Cannot delete department with existing employees');
      return res.redirect('/departments');
    }
    
    await Department.findByIdAndDelete(req.params.id);
    
    req.flash('success_msg', 'Department deleted successfully');
    res.redirect('/departments');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error deleting department');
    res.redirect('/departments');
  }
};
