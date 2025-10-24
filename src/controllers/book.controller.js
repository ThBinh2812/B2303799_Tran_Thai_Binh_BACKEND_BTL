import Book from "../models/book.model.js";
import Category from "../models/category.model.js";
import ApiError from "../api_error.js";

async function generateBookCode() {
  const books = await Book.find({}, "MASACH").lean();
  const codes = books.map((b) => b.MASACH).sort();
  const usedNumbers = codes
    .map((code) => parseInt(code.replace("B", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `B${nextNumber.toString().padStart(3, "0")}`;
}

class BookController {
  // [POST] /api/books
  async create(req, res, next) {
    try {
      const MASACH = await generateBookCode();

      const existed = await Book.findOne({ MASACH });
      if (existed) return next(new ApiError(400, "Mã sách đã tồn tại"));

      const coverPath = req.file ? `/imgs/${req.file.filename}` : "";

      if (typeof req.body.THELOAI === "string") {
        try {
          req.body.THELOAI = JSON.parse(req.body.THELOAI);
        } catch {
          req.body.THELOAI = [req.body.THELOAI];
        }
      }

      const book = new Book({
        ...req.body,
        MASACH,
        cover: coverPath,
      });
      await book.save();

      const categories = await Category.find(
        { MATHELOAI: { $in: book.THELOAI || [] } },
        "MATHELOAI TENTHELOAI -_id"
      ).lean();

      const bookWithCategories = {
        ...book.toObject(),
        THELOAI_NAMES: categories.map((c) => c.TENTHELOAI),
      };

      return res.send({
        status: "success",
        message: "Tạo sách thành công!",
        data: bookWithCategories,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi tạo sách"));
    }
  }

  // [PUT] /api/books/:bookId
  async update(req, res, next) {
    try {
      const coverPath = req.file
        ? `/imgs/${req.file.filename}`
        : req.body.cover;

      if (typeof req.body.THELOAI === "string") {
        try {
          req.body.THELOAI = JSON.parse(req.body.THELOAI);
        } catch {
          req.body.THELOAI = [req.body.THELOAI];
        }
      }

      const updatedBook = await Book.findOneAndUpdate(
        { MASACH: req.params.bookId },
        { ...req.body, cover: coverPath },
        { new: true }
      );

      if (!updatedBook) return next(new ApiError(404, "Không tìm thấy sách"));

      const categories = await Category.find(
        { MATHELOAI: { $in: updatedBook.THELOAI || [] } },
        "MATHELOAI TENTHELOAI -_id"
      ).lean();

      const bookWithCategories = {
        ...updatedBook.toObject(),
        THELOAI_NAMES: categories.map((c) => c.TENTHELOAI),
      };

      return res.send({
        status: "success",
        message: "Cập nhật thành công!",
        data: bookWithCategories,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi cập nhật sách"));
    }
  }

  // [GET] /api/books/:bookId
  async findOne(req, res, next) {
    try {
      const book = await Book.findOne({ MASACH: req.params.bookId }).lean();
      if (!book) return next(new ApiError(404, "Sách không tồn tại"));

      const categories = await Category.find(
        { MATHELOAI: { $in: book.THELOAI || [] } },
        "MATHELOAI TENTHELOAI -_id"
      ).lean();

      book.THELOAI_NAMES = categories.map((c) => c.TENTHELOAI);

      return res.send({
        status: "success",
        message: "Lấy sách thành công!",
        data: book,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy sách"));
    }
  }

  // [GET] /api/books
  async findAll(req, res, next) {
    try {
      const books = await Book.find().lean();
      const allCategories = await Category.find(
        {},
        "MATHELOAI TENTHELOAI"
      ).lean();

      const categoryMap = Object.fromEntries(
        allCategories.map((c) => [c.MATHELOAI, c.TENTHELOAI])
      );

      const booksWithCategoryNames = books.map((b) => ({
        ...b,
        THELOAI_NAMES: (b.THELOAI || []).map((id) => categoryMap[id] || id),
      }));

      return res.send({
        status: "success",
        message: "Lấy danh sách sách thành công!",
        data: booksWithCategoryNames,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
    }
  }

  // [DELETE] /api/books/:bookId
  async delete(req, res, next) {
    try {
      const book = await Book.findOne({ MASACH: req.params.bookId });
      if (!book) return next(new ApiError(404, "Sách không tồn tại"));

      await Book.deleteOne({ MASACH: req.params.bookId });

      return res.send({
        status: "success",
        message: "Xóa thành công!",
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa sách"));
    }
  }

  // [DELETE] /api/books
  async deleteAll(req, res, next) {
    try {
      const result = await Book.deleteMany({});
      return res.send({
        status: "success",
        message: `${result.deletedCount} sách đã được xóa`,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa tất cả sách"));
    }
  }
}

export default new BookController();
