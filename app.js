import express from 'express';
import cors from 'cors';
import ApiError  from './src/api_error.js';
import db from './src/utils/mongodb.util.js';
import publisherRouter from './src/routes/publisher.route.js';
import bookRouter from './src/routes/book.route.js';
import bookLoanRouter from './src/routes/bookLoan.route.js';
import readerRouter from './src/routes/reader.route.js';
import employeeRouter from './src/routes/employee.route.js';
import authRouter from './src/routes/auth.route.js';
import categoryRouter from './src/routes/category.route.js';
import { fileURLToPath } from "url";
import path from "path";

const app = express();
db.connect();

app.use(cors());
app.use(express.json());

// Static cho thư mục hình
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/imgs", express.static(path.join(__dirname, "public/imgs")));

// Các routes website
app.use('/api/publishers', publisherRouter);
app.use('/api/books', bookRouter);
app.use('/api/bookLoans', bookLoanRouter);
app.use('/api/readers', readerRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);

// Define a simple route

// ***
app.get('/', (req, res) => {
  res.send('Welcome to library application!')
});

// Handle 404 response
app.use((req, res, next) => {
  return next(new ApiError(404, "Resources not found"));
});

// Define error-handling middleware last
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    data: null
  });
});

export default app;
