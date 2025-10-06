import mongoose from "mongoose";
import config from "../config/index.js";

const URI = config.db.uri;
async function connect() {
	try {
    await mongoose.connect(`${URI}`);
    console.log("Database connected successfully!");
  } catch (error){
    console.log("error! ", error);
  }
}

export default { connect };