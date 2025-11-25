import Book from "../models/book.model.js";
import BookLoan from "../models/bookLoan.model.js";
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

      const soquyen = Number(req.body.SOQUYEN) || 0;

      const book = new Book({
        ...req.body,
        MASACH,
        CONLAI: soquyen,
        cover: coverPath,
      });
      await book.save();

      const categories = await Category.find(
        { MATHELOAI: { $in: book.THELOAI || [] } },
        "MATHELOAI TENTHELOAI"
      ).lean();

      const bookWithNames = {
        ...book.toObject(),
        THELOAI: categories.map((c) => ({
          MATHELOAI: c.MATHELOAI,
          TENTHELOAI: c.TENTHELOAI,
        })),
      };

      return res.send({
        status: "success",
        message: "Tạo sách thành công!",
        data: bookWithNames,
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

      // Lấy thông tin sách hiện tại
      const existingBook = await Book.findOne({
        MASACH: req.params.bookId,
      }).lean();
      if (!existingBook) return next(new ApiError(404, "Không tìm thấy sách"));

      // Đếm số phiếu mượn đang active
      const currentlyBorrowed = await BookLoan.countDocuments({
        MASACH: req.params.bookId,
        STATUS: { $in: "borrowed" },
      });

      // Check số quyển
      if (req.body.SOQUYEN !== undefined) {
        const newQty = Number(req.body.SOQUYEN);

        if (newQty < currentlyBorrowed) {
          return next(
            new ApiError(
              400,
              `Sách đang được mượn ${currentlyBorrowed} cuốn. Số lượng mới không thể nhỏ hơn số đang mượn.`
            )
          );
        }
        req.body.CONLAI = newQty - currentlyBorrowed;
      }

      const updatedBook = await Book.findOneAndUpdate(
        { MASACH: req.params.bookId },
        { ...req.body, cover: coverPath },
        { new: true }
      );

      if (!updatedBook) return next(new ApiError(404, "Không tìm thấy sách"));

      const categories = await Category.find(
        { MATHELOAI: { $in: updatedBook.THELOAI || [] } },
        "MATHELOAI TENTHELOAI"
      ).lean();

      const bookWithNames = {
        ...updatedBook.toObject(),
        THELOAI: categories.map((c) => ({
          MATHELOAI: c.MATHELOAI,
          TENTHELOAI: c.TENTHELOAI,
        })),
      };

      return res.send({
        status: "success",
        message: "Cập nhật thành công!",
        data: bookWithNames,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi cập nhật sách"));
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

      const booksWithNames = books.map((b) => ({
        ...b,
        THELOAI: (b.THELOAI || []).map((id) => ({
          MATHELOAI: id,
          TENTHELOAI: categoryMap[id] || id,
        })),
      }));

      return res.send({
        status: "success",
        message: "Lấy danh sách sách thành công!",
        data: booksWithNames,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
    }
  }

  // [GET] /api/books/:bookId
  async findOne(req, res, next) {
    try {
      const book = await Book.findOne({ MASACH: req.params.bookId }).lean();
      if (!book) return next(new ApiError(404, "Sách không tồn tại"));

      const categories = await Category.find(
        { MATHELOAI: { $in: book.THELOAI || [] } },
        "MATHELOAI TENTHELOAI"
      ).lean();

      book.THELOAI = categories.map((c) => ({
        MATHELOAI: c.MATHELOAI,
        TENTHELOAI: c.TENTHELOAI,
      }));

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

  // [DELETE] /api/books
  async deleteAll(req, res, next) {
    try {
      await Book.deleteMany({});
      return res.send({
        status: "success",
        message: "Đã xóa toàn bộ sách!",
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa toàn bộ sách"));
    }
  }

  // [DELETE] /api/books/:bookId
  async delete(req, res, next) {
    try {
      const MASACH = req.params.bookId;

      // Kiểm tra có đang được mượn không
      const activeLoan = await BookLoan.findOne({
        MASACH,
        STATUS: { $in: ["pending", "borrowed", "overdue"] },
      });

      if (activeLoan) {
        return next(
          new ApiError(
            400,
            "Không thể xóa sách vì đang có phiếu mượn hoặc đang chờ/đang quá hạn."
          )
        );
      }

      const deletedBook = await Book.findOneAndDelete({ MASACH });
      if (!deletedBook)
        return next(new ApiError(404, "Không tìm thấy sách để xóa"));

      return res.send({
        status: "success",
        message: "Xóa sách thành công!",
        data: deletedBook,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa sách"));
    }
  }
}  

export default new BookController();
