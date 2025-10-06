import express from 'express';
import employeeController from '../controllers/employee.controller.js';

const router = express.Router();

router.route('/')
  .get(employeeController.findAll)
  .post(employeeController.create)
  .delete(employeeController.deleteAll);

router.route('/:employeeId')
  .get(employeeController.findOne)
  .put(employeeController.update)
  .delete(employeeController.delete);

export default router;
