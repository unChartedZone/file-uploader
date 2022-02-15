import mongoose, { Schema } from "mongoose";

class DbManager {
  static async connectDb() {
    try {
      await mongoose.connect("mongodb://localhost:27017/", {
        dbName: "file-uploader",
      });
    } catch (e) {
      console.log("Error connecting to database: ", e);
    }
  }
}

const PostSchema = new Schema({
  title: String,
  description: String,
  imageUrl: String,
});

const Post = mongoose.model("posts", PostSchema);

export default DbManager;
export { Post };
