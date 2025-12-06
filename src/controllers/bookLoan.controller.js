import BookLoan from "../models/bookLoan.model.js";
import Book from "../models/book.model.js";
import ApiError from "../api_error.js";
import Reader from "../models/reader.model.js";

async function generateLoanCode() {
  const loans = await BookLoan.find({}, "LOANID").lean();

  const numbers = loans
    .map((l) => parseInt(l.LOANID.replace("PM", ""), 10))
    .filter((n) => !isNaN(n));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `PM${next.toString().padStart(3, "0")}`;
}

async function adjustBookQuantity(MASACH, amount) {
  const book = await Book.findOne({ MASACH });

  if (!book) throw new ApiError(400, "Sách không tồn tại");

  const newQty = book.CONLAI + amount;

  if (newQty < 0) {
    throw new ApiError(400, "Không đủ số lượng sách để cho mượn");
  }

  book.CONLAI = newQty;
  await book.save();

  return book;
}

class BookLoanController {
  async create(req, res, next) {
    try {
      const { MADOCGIA, MASACH, NGAYMUON, NGAYTRA } = req.body;

      if (!MADOCGIA || !MASACH || !NGAYMUON || !NGAYTRA) {
        return next(new ApiError(400, "Thiếu thông tin phiếu mượn"));
      }

      // Kiểm tra giới hạn 5 cuốn
      const activeCount = await BookLoan.countDocuments({
        MADOCGIA,
        STATUS: { $in: ["pending", "borrowed"] },
      });

      if (activeCount >= 3) {
        return next(
          new ApiError(
            400,
            "Độc giả đã mượn tối đa 3 cuốn. Hãy trả bớt trước khi mượn thêm."
          )
        );
      }

      // Kiểm tra nếu có cuốn nào quá hạn
      const overdueCount = await BookLoan.countDocuments({
        MADOCGIA,
        STATUS: { $in: ["overdue"] },
      });

      if (overdueCount > 0) {
        return next(
          new ApiError(
            400,
            "Độc giả đang quá hạn 1 quyển sách, vui lòng trả sách trước khi mượn thêm."
          )
        );
      }

      // Không cho mượn trùng 1 cuốn nếu đang pending/borrowed
      const existed = await BookLoan.findOne({
        MADOCGIA,
        MASACH,
        STATUS: { $in: ["pending", "borrowed"] },
      });

      if (existed) {
        return next(
          new ApiError(400, "Độc giả đã mượn hoặc đang chờ duyệt cuốn sách này")
        );
      }

      const book = await Book.findOne({ MASACH });
      if (!book) {
        return next(new ApiError(400, "Sách không tồn tại"));
      }

      const LOANID = await generateLoanCode();

      const loan = new BookLoan({
        LOANID,
        MADOCGIA,
        MASACH,
        NGAYMUON,
        NGAYTRA,
        STATUS: "pending",
      });

      await loan.save();

      return res.send({
        status: "success",
        message:
          "Tạo phiếu mượn thành công! Vui lòng nhận sách trong vòng 3 ngày.",
        data: loan,
      });
    } catch (error) {
      console.error(error);

      if (error.code === 11000) {
        return next(new ApiError(400, "Độc giả đã có phiếu mượn cho cuốn này"));
      }

      return next(new ApiError(500, "Lỗi khi tạo phiếu mượn"));
    }
  }

  // ========================= UPDATE =========================
  async update(req, res, next) {
    try {
      const loan = await BookLoan.findOneAndUpdate(
        { LOANID: req.params.loanId },
        req.body,
        { new: true }
      );

      if (!loan) return next(new ApiError(404, "Không tìm thấy phiếu mượn"));

      return res.send({
        status: "success",
        message: "Cập nhật phiếu mượn thành công!",
        data: loan,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi cập nhật phiếu mượn"));
    }
  }

  // ========================= APPROVE =========================
  async approve(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId });

      if (!loan) return next(new ApiError(404, "Không tìm thấy phiếu mượn"));

      if (loan.STATUS !== "pending") {
        return next(
          new ApiError(400, "Chỉ phiếu đang chờ duyệt mới được duyệt")
        );
      }

      await adjustBookQuantity(loan.MASACH, -1);

      loan.STATUS = "borrowed";
      await loan.save();

      res.send({
        status: "success",
        message: "Đã duyệt phiếu mượn!",
        data: loan,
      });
    } catch (err) {
      console.error(err);
      next(
        err instanceof ApiError ? err : new ApiError(500, "Lỗi khi duyệt phiếu")
      );
    }
  }

  // ========================= REJECT =========================
  async reject(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId });

      if (!loan) {
        return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
      }

      if (loan.STATUS !== "pending") {
        return next(
          new ApiError(400, "Chỉ phiếu đang chờ duyệt mới có thể bị từ chối!")
        );
      }

      loan.STATUS = "rejected";
      await loan.save();

      res.send({
        status: "success",
        message: "Đã từ chối phiếu mượn!",
        data: loan,
      });
    } catch (err) {
      console.error(err);
      next(new ApiError(500, "Lỗi khi từ chối phiếu"));
    }
  }

  // ========================= OVERDUE =========================
  async overdue(req, res, next) {
    try {
      const loan = await BookLoan.findOneAndUpdate(
        { LOANID: req.params.loanId },
        { STATUS: "overdue" },
        { new: true }
      );

      if (!loan) return next(new ApiError(404, "Không tìm thấy phiếu mượn"));

      res.send({
        status: "success",
        message: "Đánh dấu phiếu quá hạn!",
        data: loan,
      });
    } catch (err) {
      console.error(err);
      next(new ApiError(500, "Lỗi khi đánh dấu quá hạn"));
    }
  }

  // ========================= RETURN =========================
  async returnLoan(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId });

      if (!loan) return next(new ApiError(404, "Không tìm thấy phiếu mượn"));

      if (loan.STATUS !== "borrowed" && loan.STATUS !== "overdue") {
        return next(new ApiError(400, "Phiếu này không trong trạng thái mượn"));
      }

      await adjustBookQuantity(loan.MASACH, +1);

      loan.STATUS = "returned";
      loan.RETURNDATE = new Date();
      await loan.save();

      res.send({
        status: "success",
        message: "Đã trả sách!",
        data: loan,
      });
    } catch (err) {
      console.error(err);
      next(
        err instanceof ApiError ? err : new ApiError(500, "Lỗi khi trả sách")
      );
    }
  }

  // ========================= REBORROW =========================
  async reborrow(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId });

      if (!loan) return next(new ApiError(404, "Không tìm thấy phiếu mượn"));

      if (
        loan.STATUS === "borrowed" ||
        loan.STATUS === "pending" ||
        loan.STATUS === "overdue"
      ) {
        return next(
          new ApiError(
            400,
            "Phiếu này đang được mượn, chờ duyệt hoặc quá hạn, không thể mượn lại"
          )
        );
      }

      const existed = await BookLoan.findOne({
        MADOCGIA: loan.MADOCGIA,
        MASACH: loan.MASACH,
        STATUS: { $in: ["pending", "borrowed"] },
        LOANID: { $ne: loan.LOANID },
      });

      if (existed) {
        return next(
          new ApiError(
            400,
            "Độc giả đang mượn hoặc chờ duyệt cuốn sách này ở phiếu khác"
          )
        );
      }

      loan.STATUS = "pending";
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const NGAYMUON = today.toISOString().split("T")[0];
      const NGAYTRA = nextWeek.toISOString().split("T")[0];
      loan.NGAYMUON = NGAYMUON;
      loan.NGAYTRA = NGAYTRA;

      await loan.save();

      return res.send({
        status: "success",
        message: "Đã khởi tạo mượn lại thành công! Chờ duyệt.",
        data: loan,
      });
    } catch (err) {
      console.error(err);
      next(new ApiError(500, "Lỗi khi khởi tạo mượn lại"));
    }
  }

  // ========================= FIND ONE =========================
  async findOne(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId }).lean();

      if (!loan) return next(new ApiError(404, "Phiếu mượn không tồn tại"));

      return res.send({
        status: "success",
        message: "Lấy phiếu mượn thành công!",
        data: loan,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy phiếu mượn"));
    }
  }

  // ========================= FIND ALL =========================
  // [GET] /api/bookloans
  async findAll(req, res, next) {
    try {
      const loans = await BookLoan.find().lean();

      const allReaders = await Reader.find({}, "MADOCGIA HOLOT TEN").lean();

      const readerMap = Object.fromEntries(
        allReaders.map((r) => [r.MADOCGIA, `${r.HOLOT} ${r.TEN}`])
      );

      const allBooks = await Book.find({}, "MASACH TENSACH").lean();

      const bookMap = Object.fromEntries(
        allBooks.map((b) => [b.MASACH, b.TENSACH])
      );

      const loansWithNames = loans.map((loan) => ({
        ...loan,
        readerName: readerMap[loan.MADOCGIA] || "Không tìm thấy độc giả",
        bookName: bookMap[loan.MASACH] || "Không tìm thấy sách",
      }));

      return res.send({
        status: "success",
        message: "Lấy danh sách phiếu mượn thành công!",
        data: loansWithNames,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn"));
    }
  }

  // ========================= FIND BY READER =========================
  async findByReader(req, res, next) {
    try {
      const loans = await BookLoan.find({
        MADOCGIA: req.params.readerId,
      }).lean();

      const bookIds = [...new Set(loans.map((l) => l.MASACH))];

      const books = await Book.find(
        { MASACH: { $in: bookIds } },
        "MASACH TENSACH"
      ).lean();

      const bookMap = Object.fromEntries(
        books.map((b) => [b.MASACH, b.TENSACH])
      );

      const loansWithBookName = loans.map((loan) => ({
        ...loan,
        bookName: bookMap[loan.MASACH] || "Không tìm thấy sách",
      }));

      return res.send({
        status: "success",
        message: "Lấy lịch sử mượn thành công!",
        data: loansWithBookName,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi lấy lịch sử mượn"));
    }
  }

  // ========================= DELETE ONE =========================
  async delete(req, res, next) {
    try {
      const loan = await BookLoan.findOne({ LOANID: req.params.loanId });

      if (!loan)
        return next(new ApiError(404, "Không tìm thấy phiếu mượn để xóa"));

      if (loan.STATUS === "borrowed") {
        return next(
          new ApiError(
            400,
            "Không thể xóa phiếu đang mượn. Vui lòng trả sách trước."
          )
        );
      }

      if (loan.STATUS === "overdue") {
        return next(
          new ApiError(
            400,
            "Không thể xóa phiếu quá hạn. Vui lòng cập nhật trạng thái trả sách."
          )
        );
      }

      await BookLoan.deleteOne({ LOANID: req.params.loanId });

      return res.send({
        status: "success",
        message: "Xóa phiếu mượn thành công!",
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa phiếu mượn"));
    }
  }

  // ========================= DELETE ALL =========================
  async deleteAll(req, res, next) {
    try {
      const result = await BookLoan.deleteMany({});
      return res.send({
        status: "success",
        message: `Đã xóa ${result.deletedCount} phiếu mượn`,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi khi xóa toàn bộ phiếu mượn"));
    }
  }
}

export default new BookLoanController();
