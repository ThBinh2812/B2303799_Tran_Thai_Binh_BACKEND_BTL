import Reader from "../models/reader.model.js";
import ApiError from "../api_error.js";

async function generateReaderCode() {
  const readers = await Reader.find({}, "MADOCGIA").lean();
  const codes = readers.map((r) => r.MADOCGIA).sort();
  const usedNumbers = codes
    .map((code) => parseInt(code.replace("R", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `R${nextNumber.toString().padStart(3, "0")}`;
}

class ReaderController {
  // [POST] /api/readers
  async create(req, res, next) {
    try {
      const MADOCGIA = await generateReaderCode();

      // Kiểm tra trùng mã (phòng trường hợp gửi từ client)
      const existed = await Reader.findOne({ MADOCGIA: req.body.MADOCGIA });
      if (existed) {
        return next(new ApiError(400, "Mã độc giả đã tồn tại"));
      }

      const reader = new Reader({
        ...req.body,
        MADOCGIA,
      });

      await reader.save();

      return res.send({
        status: "success",
        message: "Tạo độc giả thành công!",
        data: reader,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while creating reader"));
    }
  }

  // [PUT] /api/readers/:readerId
  async update(req, res, next) {
    try {
      const updatedReader = await Reader.findOneAndUpdate(
        { MADOCGIA: req.params.readerId },
        req.body,
        { new: true }
      );

      if (!updatedReader) {
        return next(new ApiError(404, "Không tìm thấy độc giả để cập nhật"));
      }

      return res.send({
        status: "success",
        message: "Cập nhật độc giả thành công!",
        data: updatedReader,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while updating reader"));
    }
  }

  // [GET] /api/readers/:readerId
  async findOne(req, res, next) {
    try {
      const reader = await Reader.findOne({ MADOCGIA: req.params.readerId });

      if (!reader) {
        return next(new ApiError(404, "Độc giả không tồn tại"));
      }

      return res.send({
        status: "success",
        message: "Tìm thấy độc giả",
        data: reader,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500, "An error occurred while retrieving reader")
      );
    }
  }

  // [GET] /api/readers
  async findAll(req, res, next) {
    try {
      const readers = await Reader.find().lean();

      return res.send({
        status: "success",
        message: "Lấy danh sách độc giả thành công",
        data: readers,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500, "An error occurred while retrieving readers")
      );
    }
  }

  // [DELETE] /api/readers/:readerId
  async delete(req, res, next) {
    try {
      const reader = await Reader.findOne({ MADOCGIA: req.params.readerId });
      if (!reader) {
        return next(new ApiError(404, "Độc giả không tồn tại"));
      }

      await Reader.deleteOne({ MADOCGIA: req.params.readerId });

      return res.send({
        status: "success",
        message: "Xóa độc giả thành công",
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "An error occurred while deleting reader"));
    }
  }

  // [DELETE] /api/readers
  async deleteAll(req, res, next) {
    try {
      const result = await Reader.deleteMany({});
      return res.send({
        status: "success",
        message: `${result.deletedCount} độc giả đã được xóa`,
        data: null,
      });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(500, "An error occurred while deleting readers")
      );
    }
  }
}

export default new ReaderController();
