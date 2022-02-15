import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import { S3Client } from "@aws-sdk/client-s3";

const app = express();
app.use(express.json());
app.use(fileUpload());

// Initialize S3 Client
const s3Client = new S3Client({ region: "us-west-1" });

app.post("/upload", (req, res) => {
  if (!req.files) {
    console.log("we dont have an image");
    return res.status(400).send({ message: "Error: No image passed" });
  }

  let temp = req.files.image as fileUpload.UploadedFile;

  res.send("uploaded file!");
});

app.listen(8081, () => {
  console.log("Listening on port:8081");
});
