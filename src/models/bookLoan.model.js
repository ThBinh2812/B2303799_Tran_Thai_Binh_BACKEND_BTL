import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookLoansSchema = new Schema({
  LOANID: {
    type: String,
    unique: true
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
  }
}, {
  optimisticConcurrency: true,
  timestamps: true,
});

bookLoansSchema.index({ MADOCGIA: 1, MASACH: 1 }, { unique: true });

export default mongoose.model('BookLoan', bookLoansSchema, 'bookLoans');
