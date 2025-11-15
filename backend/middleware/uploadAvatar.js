const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make avatar directory if it doesn't exist
const avatarDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const filename = "avatar_" + req.user.id + ext;
    callback(null, filename);
}
});

// Upload middleware
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Must be an image file'));
    }
    cb(null, true);
  },
});

module.exports = upload;
