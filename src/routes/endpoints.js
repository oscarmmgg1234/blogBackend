const express = require("express");
const router = express.Router();
const { controller } = require("../controller");
const sharp = require("sharp");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const rateLimit = require("express-rate-limit");

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Try again later.",
  },
});

const Controller = controller.getInstance();

router.get("/entries", async (req, res) => {
  try {
    res.send(await Controller._getEntries());
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/entry/:id", async (req, res) => {
  try {
    const param = req.params.id;
    res.send(await Controller._getEntry(param));
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * ✅ UPDATED UPLOAD ROUTE
 * Accepts:
 * - thumbnail (file)
 * - content JSON string
 * - content_image_0..N (files)
 *
 * Converts:
 * - thumbnail -> base64 (500x500)
 * - each content image file -> base64 (NO forced resize)
 *
 * Preserves:
 * - block.align, block.spacing, block.widthPct, block.caption, block.language
 */
router.post("/upload", upload.any(), async (req, res) => {
  try {
    const { author, title, content, summary } = req.body;

    // Parse content JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid content format." });
    }

    if (!author || !title || !Array.isArray(parsedContent)) {
      return res.status(400).json({
        error: "Author, title, and content array are required.",
      });
    }

    // Build file lookup table for speed
    const fileMap = {};
    for (const f of req.files || []) {
      fileMap[f.fieldname] = f;
    }

    // Thumbnail required
    const thumbnailFile = fileMap["thumbnail"];
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail image is required." });
    }

    // Resize/compress thumbnail
    const thumbnailBuffer = await sharp(thumbnailFile.buffer)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toBuffer();

    const thumbnailBase64 = thumbnailBuffer.toString("base64");

    // Process content blocks (images)
    const processedContent = await Promise.all(
      parsedContent.map(async (block) => {
        if (block.type === "image" && typeof block.content === "string") {
          // block.content contains key like "content_image_0"
          const imageFile = fileMap[block.content];

          if (!imageFile) {
            return { ...block, content: null };
          }

          // ✅ Don't resize content images (diagrams need resolution)
          // Optional: compress to jpeg to reduce size (or keep original)
          // If you want to KEEP PNG, skip sharp and base64 the raw buffer.
          const isPng = imageFile.mimetype === "image/png";
          const isJpeg = imageFile.mimetype === "image/jpeg" || imageFile.mimetype === "image/jpg";
          const isWebp = imageFile.mimetype === "image/webp";

          let outBuffer = imageFile.buffer;
          let outMime = imageFile.mimetype;

          // Convert everything to JPEG for consistency (smaller), but NO resize
          // If you prefer to preserve PNG, comment this section out.
          if (isPng || isWebp) {
            outBuffer = await sharp(imageFile.buffer)
              .jpeg({ quality: 90 })
              .toBuffer();
            outMime = "image/jpeg";
          } else if (isJpeg) {
            outBuffer = await sharp(imageFile.buffer)
              .jpeg({ quality: 90 })
              .toBuffer();
            outMime = "image/jpeg";
          }

          return {
            ...block,
            content: outBuffer.toString("base64"),
            mimetype: outMime, // ✅ helps frontend render correctly
          };
        }

        return block;
      })
    );

    const blogEntry = {
      author,
      title,
      content: processedContent,
      thumbnail: thumbnailBase64,
      summary: summary || "",
    };

    await Controller._uploadEntry(blogEntry);

    res.status(201).json({
      message: "Blog post uploaded successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error uploading blog post:", error);
    res.status(500).json({ status: "error" });
  }
});

router.post("/verify", verifyLimiter, async (req, res) => {
  const { pass } = req.body;

  if (pass === "Omariscool1234!") {
    return res.status(200).json({
      success: true,
      message: "Verification successful",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Unauthorized",
  });
});

router.post("/comment", async (req, res) => {
  try {
    const { id, author, comment } = req.body;
    const result = await Controller.pushComment(id, { author, comment });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

