const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

function pdfFileFilter(req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter: pdfFileFilter }); // disk storage and filter are standard Multer patterns. [web:21][web:22][web:31]

app.post("/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded or invalid file type" });
  }

  const { originalname, filename, size } = req.file;
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO documents (original_name, stored_name, size, created_at)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [originalname, filename, size, createdAt], function (err) {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({
      id: this.lastID,
      filename: originalname,
      size,
      created_at: createdAt
    });
  });
});

app.get("/documents", (req, res) => {
  db.all(
    "SELECT id, original_name AS filename, size, created_at FROM documents",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});

app.get("/documents/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM documents WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadDir, row.stored_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing on disk" });
    }

    res.download(filePath, row.original_name);
  });
});

app.delete("/documents/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM documents WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Document not found" });

    const filePath = path.join(uploadDir, row.stored_name);
    fs.unlink(filePath, (fsErr) => {
      if (fsErr && fsErr.code !== "ENOENT") {
        return res.status(500).json({ error: "Error deleting file from disk" });
      }
      db.run("DELETE FROM documents WHERE id = ?", [id], (dbErr) => {
        if (dbErr) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Document deleted successfully" });
      });
    });
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
