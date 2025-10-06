import mongoose from "mongoose";

const Schema = mongoose.Schema;

const publisherSchema = new Schema({
  MANXB: { 
    type: String,
    required: true,
    unique: true,
  },
  TENNXB: { 
    type: String,
    required: true, 
  },
  DIACHI: { 
    type: String,
  }
}, {
  optimisticConcurrency: true,
  timestamps: true,
})

export default mongoose.model('Publisher', publisherSchema, 'publishers');
