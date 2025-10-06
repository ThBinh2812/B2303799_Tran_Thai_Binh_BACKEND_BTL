import express from 'express';
import readerController from '../controllers/reader.controller.js';

const router = express.Router();

router.route('/')
  .get(readerController.findAll)
  .post(readerController.create)
  .delete(readerController.deleteAll);

// readerId = MADOCGIA
router.route('/:readerId')
  .get(readerController.findOne)
  .put(readerController.update)
  .delete(readerController.delete);

export default router;
