import mongoose from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
  MATHELOAI: {
      type: String,
      required: true,
  },
  TENTHELOAI: {
      type: String,
      required: true,
  },
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);

export default mongoose.model('Category', categorySchema, 'categories');
