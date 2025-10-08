import Book from "../models/book.model.js";
import ApiError from "../api_error.js";

class BookController {
  // [POST] /api/books
  async create(req, res, next) {
    try {
      const existed = await Book.findOne({ MASACH: req.body.MASACH });
      if (existed) {
        return next(new ApiError(400, "Mã sách đã tồn tại"));
      };

      const coverPath = req.file ? `/imgs/${req.file.filename}` : "";
      const book = new Book({
        ...req.body,
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
      const coverPath = req.file? `/imgs/${req.file.filename}`: req.body.cover;

      const updateData = {
        ...req.body,
        cover: coverPath,
      };

      // eslint-disable-next-line no-unused-vars
      const result = await Book.updateOne({ MASACH: req.params.bookId }, updateData);

      return res.send({
        status: "success",
        message: "Cập nhật thành công!",
        data: null,
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
      };

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
