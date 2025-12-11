const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});

const upload = multer({
  storage: storage
});

// support multiple fields + multiple files each
exports.multiUpload = upload.fields([
  { name: "referenceImages", maxCount: 10 },
  { name: "momFiles", maxCount: 10 },
  { name: "targetAttachments", maxCount: 10 }
]);
