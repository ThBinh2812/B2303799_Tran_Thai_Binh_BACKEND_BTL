import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    MASACH: {
      type: String,
      required: true,
      unique: true,
    },
    TENSACH: {
      type: String,
      required: true,
    },
    DONGIA: {
      type: Number,
      required: true,
    },
    SOQUYEN: {
      type: Number,
      required: true,
    },
    CONLAI: {
      type: Number,
      required: true,
    },
    NAMXUATBAN: {
      type: Number,
      required: true,
    },
    MANXB: {
      type: String,
      required: true,
    },
    TACGIA: {
      type: String,
      required: true,
    },
    MOTA: {
      type: String,
    },
    cover: {
      type: String,
      required: false
    }
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);

export default mongoose.model('Book', bookSchema, 'books');
