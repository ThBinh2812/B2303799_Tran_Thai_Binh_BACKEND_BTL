import express from 'express';
import publisherController from '../controllers/publisher.controller.js';

const router = express.Router();

router.route('/')
  .get(publisherController.findAll)
  .post(publisherController.create)
  .delete(publisherController.deleteAll);

// publisherId = MANXB
router.route('/:publisherId')
  .get(publisherController.findOne)
  .put(publisherController.update)
  .delete(publisherController.delete)

export default router;