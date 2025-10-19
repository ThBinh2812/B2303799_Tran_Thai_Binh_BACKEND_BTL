import mongoose from "mongoose";

const Schema = mongoose.Schema;

const readerSchema = new Schema({
  MADOCGIA: {
    type: String,
    unique: true,
    required: true,
  },
  HOLOT: {
    type: String,
    required: true,
  },
  TEN: {
    type: String,
    required: true,
  },
  NGAYSINH: {
    type: String,
  },
  PHAI: {
    type: String,
  },
  DIACHI: {
    type: String,
  },
  DIENTHOAI: {
    type: String,
  },
  PASSWORD: {
    type: String,
    required: true,
  }
}, {
  optimisticConcurrency: true,
  timestamps: true,
});

export default mongoose.model('Reader', readerSchema, 'readers');
