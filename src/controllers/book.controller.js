import Book from "../models/book.model.js";
import ApiError from "../api_error.js";

async function generateBookCode() {
  const books = await Book.find({}, "MASACH").lean();
  const codes = books.map((b) => b.MASACH).sort();
  const usedNumbers = codes
    .map((code) => parseInt(code.replace("B", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNumber = 1;
  for (let i = 0; i < usedNumbers.length; i++) {
    if (usedNumbers[i] !== i + 1) {
      nextNumber = i + 1;
      break;
    }
    nextNumber = usedNumbers.length + 1;
  }
  return `B${nextNumber.toString().padStart(3, "0")}`;
}

class BookController {

  // [POST] /api/books
  async create(req, res, next) {
    try {

      const MASACH = await generateBookCode();

      // Kiểm tra mã sách tồn tại
      const existed = await Book.findOne({ MASACH: req.body.MASACH });
      if (existed) {
        return next(new ApiError(400, "Mã sách đã tồn tại"));
      }

      const coverPath = req.file ? `/imgs/${req.file.filename}` : "";
      const book = new Book({
        ...req.body,
        MASACH,
        cover: coverPath,
      });

      await book.save();
      return res.send({
        status: "success",
        message: "Tạo thành công!",
        data: book,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while creating a book"));
    }
  }

  // [PUT] /api/books/:bookId
  async update(req, res, next) {
    try {
      const coverPath = req.file
        ? `/imgs/${req.file.filename}`
        : req.body.cover;

      const updateData = {
        ...req.body,
        cover: coverPath,
      };

      const updatedBook = await Book.findOneAndUpdate(
        { MASACH: req.params.bookId },
        updateData,
        { new: true }
      );

      if (!updatedBook) {
        return next(new ApiError(404, "Không tìm thấy sách để cập nhật"));
      }

      return res.send({
        status: "success",
        message: "Cập nhật thành công!",
        data: updatedBook,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while updating a book"));
    }
  }

  // [GET] /api/books/:bookId
  async findOne(req, res, next) {
    try {
      const book = await Book.findOne({ MASACH: req.params.bookId });
      if (!book) {
        return next(new ApiError(404, "Sách không tồn tại"));
      }

      return res.send({
        status: "success",
        message: "Tìm thấy sách",
        data: book,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500, "An error occurred while retrieving a book")
      );
    }
  }

  // [GET] /api/books
  async findAll(req, res, next) {
    try {
      const books = await Book.find().lean();

      return res.send({
        status: "success",
        message: "Lấy danh sách thành công",
        data: books,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500, "An error occurred while retrieving books")
      );
    }
  }

  // [DELETE] /api/books/:bookId
  async delete(req, res, next) {
    try {
      const book = await Book.findOne({ MASACH: req.params.bookId });
      if (!book) {
        return next(new ApiError(404, "Sách không tồn tại"));
      }

      await Book.deleteOne({ MASACH: req.params.bookId });

      return res.send({
        status: "success",
        message: "Xóa thành công",
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while deleting a book"));
    }
  }

  // [DELETE] /api/books
  async deleteAll(req, res, next) {
    try {
      const result = await Book.deleteMany({});
      return res.send({
        status: "success",
        message: `${result.deletedCount} sách đã được xóa`,
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while deleting books"));
    }
  }
}

export default new BookController();
