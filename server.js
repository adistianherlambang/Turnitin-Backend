const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS so the Next.js app can talk to it
app.use(cors());
app.use(express.json());

// Set up directory structure
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const FOLDERS = ['payments', 'documents', 'results'];

// Ensure all upload directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
FOLDERS.forEach((folder) => {
  const dirPath = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type;
    if (!FOLDERS.includes(type)) {
      return cb(new Error('Invalid upload type'), null);
    }
    cb(null, path.join(UPLOADS_DIR, type));
  },
  filename: (req, file, cb) => {
    // Sanitize filename and prepend timestamp to avoid duplicates
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max size
  }
});

// Serve files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Upload Endpoint
// Endpoint: POST /api/upload/:type
app.post('/api/upload/:type', (req, res) => {
  const type = req.params.type;
  if (!FOLDERS.includes(type)) {
    return res.status(400).json({ error: 'Invalid upload type. Must be payments, documents, or results.' });
  }

  // Multer middleware execution
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the static URL for the file
    const fileUrl = `http://localhost:${PORT}/uploads/${type}/${req.file.filename}`;
    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });
  });
});

// Delete Endpoint
// Endpoint: DELETE /api/delete
app.delete('/api/delete', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'File URL is required' });
  }

  try {
    // Extract local path from URL
    // Expected URL structure: http://localhost:5001/uploads/:type/:filename
    const marker = '/uploads/';
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) {
      return res.status(400).json({ error: 'Invalid file URL pattern' });
    }

    const relativePath = url.substring(markerIndex + marker.length); // type/filename
    const absolutePath = path.join(UPLOADS_DIR, relativePath);

    // Security check: ensure path is inside UPLOADS_DIR to prevent directory traversal
    if (!absolutePath.startsWith(UPLOADS_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return res.json({ success: true, message: 'File deleted successfully' });
    } else {
      return res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`[Turnitin Storage Server] running at http://localhost:${PORT}`);
});
