import express from "express";
import bookController from "../controllers/book.controller.js";
import { upload } from "../middlewares/uploadImages.js";


const router = express.Router();

router
  .route("/")
  .get(bookController.findAll)
  .post(upload.single("cover"), bookController.create)
  .delete(bookController.deleteAll);

router
  .route("/:bookId")
  .get(bookController.findOne)
  .put(upload.single("cover"), bookController.update)
  .delete(bookController.delete);

export default router;
