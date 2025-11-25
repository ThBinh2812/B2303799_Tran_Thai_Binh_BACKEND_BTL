import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookLoansSchema = new Schema(
  {
    LOANID: {
      type: String,
      unique: true,
    },
    MADOCGIA: {
      type: String,
      required: true,
    },
    MASACH: {
      type: String,
      required: true,
    },
    NGAYMUON: {
      type: String,
      required: true,
    },
    NGAYTRA: {
      type: String,
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["pending", "borrowed", "returned", "overdue", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    optimisticConcurrency: true,
    timestamps: true,
  }
);

// Một độc giả không thể mượn cùng 1 cuốn sách 2 lần cùng lúc
bookLoansSchema.index({ MADOCGIA: 1, MASACH: 1 }, { unique: true });

export default mongoose.model("BookLoan", bookLoansSchema, "bookLoans");
