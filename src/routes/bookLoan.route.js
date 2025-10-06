import express from 'express';
import bookLoansController from '../controllers/bookLoan.controller.js';

const router = express.Router();

router.route('/')
  .get(bookLoansController.findAll)
  .post(bookLoansController.create)
  .delete(bookLoansController.deleteAll);

router.route('/:loanId')
  .get(bookLoansController.findOne)
  .put(bookLoansController.update)
  .delete(bookLoansController.delete);

export default router;