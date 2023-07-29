module.exports = class Utils {
  static getFileTypeFromMimeType(mimeType) {
    const mimeToTypeMap = {
      "image/jpeg": "image",
      "image/png": "image",
      "image/gif": "image",
      "image/webp": "image",
      "image/bmp": "image",
      "image/svg+xml": "image",
      "video/mp4": "video",
      "video/mpeg": "video",
      "video/quicktime": "video",
      "application/pdf": "pdf",
      "application/msword": "word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "word",
      // Add more MIME types and their corresponding file types as needed
    };
    return mimeToTypeMap[mimeType] || null;
  }
};
