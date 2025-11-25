import Reader from "../models/reader.model.js";
import Employee from "../models/employee.model.js";
import ApiError from "../api_error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_demo";

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

class AuthController {
  // [POST] /auth/register
  async register(req, res, next) {
    try {
      const MADOCGIA = await generateReaderCode();
      const { HOLOT, TEN, NGAYSINH, PHAI, DIACHI, DIENTHOAI, PASSWORD } =
        req.body;

      // Kiểm tra số điện thoại đã tồn tại chưa
      const existing = await Reader.findOne({ DIENTHOAI });
      if (existing) return next(new ApiError(404, "Số điện thoại đã tồn tại."));

      const hashedPassword = await bcrypt.hash(PASSWORD, 10);

      const newReader = new Reader({
        MADOCGIA,
        HOLOT,
        TEN,
        NGAYSINH,
        PHAI,
        DIACHI,
        DIENTHOAI,
        PASSWORD: hashedPassword,
      });

      await newReader.save();

      return res.send({
        status: "success",
        message: "Đăng ký thành công!",
        data: newReader,
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi trong quá trình đăng ký."));
    }
  }

  // [POST] /auth/login
  async login(req, res, next) {
    try {
      const { DIENTHOAI, PASSWORD } = req.body;

      // Tìm người dùng theo số điện thoại
      const reader = await Reader.findOne({ DIENTHOAI });
      if (!reader)
        return next(new ApiError(404, "Số điện thoại không tồn tại."));

      // So sánh mật khẩu
      const validPassword = await bcrypt.compare(PASSWORD, reader.PASSWORD);
      if (!validPassword)
        return next(
          new ApiError(400, "Tài khoản hoặc mật khẩu không chính xác.")
        );

      // Tạo JWT token
      const token = jwt.sign(
        { id: reader._id, DIENTHOAI: reader.DIENTHOAI },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      const readerData = reader.toObject();
      delete readerData.PASSWORD;

      return res.send({
        status: "success",
        message: "Đăng nhập thành công!",
        data: {
          reader: readerData,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi trong quá trình đăng nhập."));
    }
  }

  // [POST] /auth/loginAdmin
  async loginAdmin(req, res, next) {
    try {
      const { MSNV, PASSWORD } = req.body;

      // Tìm nhân viên theo mã số nhân viên
      const admin = await Employee.findOne({ MSNV });
      if (!admin)
        return next(new ApiError(404, "Mã số nhân viên không tồn tại."));

      // So sánh mật khẩu
      const validPassword = await bcrypt.compare(PASSWORD, admin.PASSWORD);
      if (!validPassword)
        return next(
          new ApiError(400, "Tài khoản hoặc mật khẩu không chính xác.")
        );

      // Tạo JWT token
      const token = jwt.sign(
        { id: admin._id, MSNV: admin.MSNV, role: "admin" },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      const adminData = admin.toObject();
      delete adminData.PASSWORD;

      return res.send({
        status: "success",
        message: "Đăng nhập thành công!",
        data: {
          admin: adminData,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      return next(new ApiError(500, "Lỗi trong quá trình đăng nhập."));
    }
  }
}



export default new AuthController();
