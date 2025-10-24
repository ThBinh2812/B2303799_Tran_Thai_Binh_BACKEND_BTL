import express from "express";
import CategoryController from "../controllers/category.controller.js";

const router = express.Router();

router
  .post("/", CategoryController.create)
  .get("/", CategoryController.findAll)
  .delete("/", CategoryController.deleteAll);

router
  .get("/:id", CategoryController.findOne)  
  .put("/:id", CategoryController.update)
  .delete("/:id", CategoryController.delete);

export default router;
