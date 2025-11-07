const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.listDepartments);
router.get('/add', departmentController.getAddDepartment);
router.post('/add', departmentController.postAddDepartment);
router.get('/edit/:id', departmentController.getEditDepartment);
router.post('/edit/:id', departmentController.postEditDepartment);
router.post('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
