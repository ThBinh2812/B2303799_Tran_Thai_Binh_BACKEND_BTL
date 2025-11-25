import AuthController from '../controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

router
  .post('/register', AuthController.register)
  .post('/login', AuthController.login)
  .post('/loginAdmin', AuthController.loginAdmin);

export default router;
