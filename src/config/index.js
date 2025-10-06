import dotenv from 'dotenv';
dotenv.config();

const config = {
  app: {
    port: process.env.PORT || 3000
  },
  db: {
    uri: process.env.URI || "mongodb://127.0.0.1:27017/library"
  }
} 
export default config;