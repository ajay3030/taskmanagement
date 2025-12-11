exports.uploadMultipleFiles = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const response = {};

  // Loop through each field
  for (const fieldName in req.files) {
    const fileList = req.files[fieldName];

    response[fieldName] = fileList.map(file => ({
      fileName: file.filename,
      fileUrl: "/uploads/" + file.filename
    }));
  }

  return res.json({
    success: true,
    files: response
  });
};
