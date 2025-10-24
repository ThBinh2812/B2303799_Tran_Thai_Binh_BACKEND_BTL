import Category from "../models/category.model.js";
import ApiError from "../api_error.js";

async function generateCategoryCode() {
  const categories = await Category.find({}, "MATHELOAI").lean();
  const codes = categories.map((c) => c.MATHELOAI);
  const usedNumbers = codes
    .map((code) => parseInt(code.replace("TL", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  let nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `TL${nextNumber.toString().padStart(3, "0")}`;
}

class CategoryController {
  // [POST] /api/categories
  async create(req, res, next) {
    try {
      const MATHELOAI = await generateCategoryCode();

      // Kiểm tra tên thể loại trùng
      const existed = await Category.findOne({
        TENTHELOAI: req.body.TENTHELOAI,
      });
      if (existed) {
        return next(new ApiError(400, "Tên thể loại đã tồn tại"));
      }

      const category = new Category({
        MATHELOAI,
        TENTHELOAI: req.body.TENTHELOAI,
      });

      await category.save();

      return res.send({
        status: "success",
        message: "Tạo thể loại thành công!",
        data: category,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Đã xảy ra lỗi khi tạo thể loại"));
    }
  }

  // [GET] /api/categories
  async findAll(req, res, next) {
    try {
      const categories = await Category.find().lean();
      return res.send({
        status: "success",
        message: "Lấy danh sách thể loại thành công",
        data: categories,
      });
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách thể loại")
      );
    }
  }

  // [GET] /api/categories/:id
  async findOne(req, res, next) {
    try {
      const category = await Category.findOne({ MATHELOAI: req.params.id });
      if (!category) {
        return next(new ApiError(404, "Không tìm thấy thể loại"));
      }

      return res.send({
        status: "success",
        message: "Tìm thấy thể loại",
        data: category,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thể loại"));
    }
  }

  // [PUT] /api/categories/:id
  async update(req, res, next) {
    try {
      const updated = await Category.findOneAndUpdate(
        { MATHELOAI: req.params.id },
        { TENTHELOAI: req.body.TENTHELOAI },
        { new: true }
      );

      if (!updated) {
        return next(new ApiError(404, "Không tìm thấy thể loại để cập nhật"));
      }

      return res.send({
        status: "success",
        message: "Cập nhật thể loại thành công",
        data: updated,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật thể loại"));
    }
  }

  // [DELETE] /api/categories/:id
  async delete(req, res, next) {
    try {
      const category = await Category.findOne({ MATHELOAI: req.params.id });
      if (!category) {
        return next(new ApiError(404, "Không tìm thấy thể loại"));
      }

      await Category.deleteOne({ MATHELOAI: req.params.id });

      return res.send({
        status: "success",
        message: "Xóa thể loại thành công",
        data: null,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Đã xảy ra lỗi khi xóa thể loại"));
    }
  }

  // [DELETE] /api/categories
  async deleteAll(req, res, next) {
    try {
      const result = await Category.deleteMany({});
      return res.send({
        status: "success",
        message: `${result.deletedCount} thể loại đã được xóa`,
        data: null,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả thể loại"));
    }
  }
}

export default new CategoryController();
