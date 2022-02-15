import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import "dotenv/config";
import AWS from "aws-sdk";

import DbManager, { Post } from "./dbManager";
import { isValidObjectId } from "mongoose";

const app = express();
app.use(express.json());
app.use(fileUpload());

DbManager.connectDb();

// Initialize S3 Client
const s3Client = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "us-west-1",
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
});

app.get("/posts/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Error: Missing post id." });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send({ message: "Error: Invalid Post ID" });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).send({ message: "Error: Post not found" });
  }

  res.send(post);
});

app.post("/posts", async (req, res) => {
  const postBody = req.body as { title: string; description: string };

  if (!postBody.title || !postBody.description) {
    return res.status(400).send({ message: "Error: Missing post details" });
  }

  const post = new Post(postBody);
  const savedPost = await post.save();

  res.status(201).send(savedPost);
});

app.post("/upload/:postId", async (req, res) => {
  if (!req.params.postId) {
    return res.status(400).send({ message: "Error: Missing Post ID" });
  }

  if (!req.files) {
    console.log("we dont have an image");
    return res.status(400).send({ message: "Error: No image passed" });
  }

  if (!isValidObjectId(req.params.postId)) {
    return res.status(400).send({ message: "Error: Invalid Post ID" });
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).send({ message: "Error: Post not found." });
  }

  const image = req.files.image as fileUpload.UploadedFile;

  const bucketName = process.env.BUCKET_NAME;

  let data;
  try {
    data = await s3Client
      .upload({ Bucket: bucketName!, Key: image.name, Body: image.data })
      .promise();
  } catch (e) {
    console.log("Error: ", e);
  }

  post.imageUrl = data?.Location;
  await post.save();

  res.send(post);
});

app.listen(8081, () => {
  console.log("Listening on port:8081");
});
