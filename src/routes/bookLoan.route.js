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

router.route("/:loanId/borrowed").put(bookLoansController.approve);
router.route("/:loanId/rejected").put(bookLoansController.reject);
router.route("/:loanId/returned").put(bookLoansController.returnLoan);
router.route("/:loanId/pending").put(bookLoansController.reborrow);
router.route("/:loanId/overdue").put(bookLoansController.overdue);


// /api/bookLoans/reader/:readerId
router.route("/reader/:readerId").get(bookLoansController.findByReader);


export default router;