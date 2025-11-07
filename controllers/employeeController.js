const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.listEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const searchQuery = req.query.search || '';
    const departmentFilter = req.query.department || '';
    const jobTitleFilter = req.query.jobTitle || '';
    
    let query = {};
    
    if (searchQuery) {
      query.$or = [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    if (departmentFilter) {
      query.department = departmentFilter;
    }
    
    if (jobTitleFilter) {
      query.jobTitle = { $regex: jobTitleFilter, $options: 'i' };
    }
    
    const totalEmployees = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalEmployees / limit);
    
    const employees = await Employee.find(query)
      .populate('department')
      .populate('supervisor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const departments = await Department.find().sort({ name: 1 });
    
    res.render('employee/list', {
      title: 'Employees',
      employees,
      departments,
      currentPage: page,
      totalPages,
      searchQuery,
      departmentFilter,
      jobTitleFilter,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading employees');
    res.redirect('/dashboard');
  }
};

exports.getAddEmployee = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    const employees = await Employee.find().sort({ firstName: 1 });
    
    res.render('employee/add', {
      title: 'Add Employee',
      departments,
      employees,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading form');
    res.redirect('/employees');
  }
};

exports.postAddEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    jobTitle,
    department,
    salary,
    dateOfJoining,
    country,
    state,
    city,
    address,
    supervisor,
    status
  } = req.body;
  
  let errors = [];
  
  if (!firstName || !lastName || !email || !phone || !jobTitle || 
      !department || !salary || !dateOfJoining || !country || 
      !state || !city || !address) {
    errors.push({ msg: 'Please fill in all required fields' });
  }
  
  if (errors.length > 0) {
    const departments = await Department.find().sort({ name: 1 });
    const employees = await Employee.find().sort({ firstName: 1 });
    
    return res.render('employee/add', {
      title: 'Add Employee',
      errors,
      departments,
      employees,
      formData: req.body,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  }
  
  try {
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    
    if (existingEmployee) {
      errors.push({ msg: 'Email already registered' });
      const departments = await Department.find().sort({ name: 1 });
      const employees = await Employee.find().sort({ firstName: 1 });
      
      return res.render('employee/add', {
        title: 'Add Employee',
        errors,
        departments,
        employees,
        formData: req.body,
        user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
      });
    }
    
    const newEmployee = new Employee({
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      salary,
      dateOfJoining,
      country,
      state,
      city,
      address,
      supervisor: supervisor || null,
      status: status || 'active'
    });
    
    await newEmployee.save();
    
    await Department.findByIdAndUpdate(department, {
      $inc: { employeeCount: 1 }
    });
    
    req.flash('success_msg', 'Employee added successfully');
    res.redirect('/employees');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error adding employee');
    res.redirect('/employees/add');
  }
};

exports.getEmployeeDetails = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('supervisor');
    
    if (!employee) {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/employees');
    }
    
    const subordinates = await Employee.find({ supervisor: req.params.id });
    
    res.render('employee/details', {
      title: 'Employee Details',
      employee,
      subordinates,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading employee details');
    res.redirect('/employees');
  }
};

exports.getEditEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/employees');
    }
    
    const departments = await Department.find().sort({ name: 1 });
    const employees = await Employee.find({ _id: { $ne: req.params.id } }).sort({ firstName: 1 });
    
    res.render('employee/edit', {
      title: 'Edit Employee',
      employee,
      departments,
      employees,
      user: req.user || { fullName: 'Guest User', email: 'guest@office.com', role: 'admin' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error loading employee');
    res.redirect('/employees');
  }
};

exports.postEditEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    jobTitle,
    department,
    salary,
    dateOfJoining,
    country,
    state,
    city,
    address,
    supervisor,
    status
  } = req.body;
  
  try {
    const currentEmployee = await Employee.findById(req.params.id);
    const oldDepartment = currentEmployee.department;
    
    const existingEmployee = await Employee.findOne({
      _id: { $ne: req.params.id },
      email: email.toLowerCase()
    });
    
    if (existingEmployee) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect(`/employees/edit/${req.params.id}`);
    }
    
    await Employee.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      department,
      salary,
      dateOfJoining,
      country,
      state,
      city,
      address,
      supervisor: supervisor || null,
      status,
      updatedAt: Date.now()
    });
    
    if (oldDepartment.toString() !== department) {
      await Department.findByIdAndUpdate(oldDepartment, {
        $inc: { employeeCount: -1 }
      });
      await Department.findByIdAndUpdate(department, {
        $inc: { employeeCount: 1 }
      });
    }
    
    req.flash('success_msg', 'Employee updated successfully');
    res.redirect('/employees');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating employee');
    res.redirect('/employees');
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/employees');
    }
    
    const subordinateCount = await Employee.countDocuments({ supervisor: req.params.id });
    
    if (subordinateCount > 0) {
      req.flash('error_msg', 'Cannot delete employee who is supervising others');
      return res.redirect('/employees');
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    
    await Department.findByIdAndUpdate(employee.department, {
      $inc: { employeeCount: -1 }
    });
    
    req.flash('success_msg', 'Employee deleted successfully');
    res.redirect('/employees');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error deleting employee');
    res.redirect('/employees');
  }
};
