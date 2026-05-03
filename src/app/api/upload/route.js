import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { image } = await req.json();

    const result = await cloudinary.uploader.upload(image, {
      folder: "uploads",
    });

    return Response.json({ url: result.secure_url });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}