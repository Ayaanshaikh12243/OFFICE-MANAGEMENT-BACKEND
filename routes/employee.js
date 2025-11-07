const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.listEmployees);
router.get('/add', employeeController.getAddEmployee);
router.post('/add', employeeController.postAddEmployee);
router.get('/details/:id', employeeController.getEmployeeDetails);
router.get('/edit/:id', employeeController.getEditEmployee);
router.post('/edit/:id', employeeController.postEditEmployee);
router.post('/delete/:id', employeeController.deleteEmployee);

module.exports = router;
