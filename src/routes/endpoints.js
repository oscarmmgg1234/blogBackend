const express = require("express");
const router = express.Router();
const { controller } = require("../controller");
const sharp = require("sharp");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

router.post("/upload", upload.any(), async (req, res) => {
  try {
    const { author, title, content } = req.body;

    // Parse content if it's a JSON string
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid content format." });
    }

    // Check for required fields
    if (!author || !title || !parsedContent) {
      return res
        .status(400)
        .json({ error: "Author, title, and content are required." });
    }

    // Find the thumbnail file
    const thumbnailFile = req.files.find(
      (file) => file.fieldname === "thumbnail"
    );
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail image is required." });
    }

    // Resize and compress the thumbnail image
    const thumbnailBuffer = await sharp(thumbnailFile.buffer)
      .resize(500, 500)
      .jpeg({ quality: 100 })
      .toBuffer();
    const thumbnailBase64 = thumbnailBuffer.toString("base64");

    // Process content array (handle images if needed)
    const processedContent = await Promise.all(
      parsedContent.map(async (section) => {
        if (section.type === "image" && section.content) {
          // Find the image file corresponding to this section
          const imageFile = req.files.find(
            (file) => file.fieldname === section.content
          );
          if (imageFile) {
            // Resize and compress the image
            const imageBuffer = await sharp(imageFile.buffer)
              .resize(300, 300)
              .jpeg({ quality: 90 })
              .toBuffer();
            section.content = imageBuffer.toString("base64"); // Convert image to base64
          } else {
            // Handle case where image is not provided
            section.content = null;
          }
        }
        return section;
      })
    );

    // Prepare the blog entry object
    const blogEntry = {
      author,
      title,
      content: processedContent,
      thumbnail: thumbnailBase64,
    };

    // Upload the entry to the database using the controller
    const result = await Controller._uploadEntry(blogEntry);

    res.status(201).json({
      message: "Blog post uploaded successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error uploading blog post:", error);
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
