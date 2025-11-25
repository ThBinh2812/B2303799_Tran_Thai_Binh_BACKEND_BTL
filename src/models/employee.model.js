import mongoose from "mongoose";

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  MSNV: {
    type: String,
    unique: true,
    required: true,
  },
  HoTenNV: {
    type: String,
    required: true,
  },
  PASSWORD: {
    type: String,
    required: true,
  },
  ChucVu: {
    type: String,
    required: true,
  },
  DiaChi: {
    type: String,
  },
  SDT: {
    type: String,
  },
}, {
  optimisticConcurrency: true,
  timestamps: true,
});

export default mongoose.model('Employee', EmployeeSchema, 'employees');
