# Patient Portal

Full-stack patient document management system with PDF upload, list, download, and delete functionality. Modern Twitter-inspired dark UI.

## ✨ Project Overview

- *Frontend*: React + Vite (Twitter-like dark theme)
- *Backend*: Express + Multer + SQLite 
- *Storage*: Local uploads/ folder + SQLite metadata
- *API*: REST endpoints on http://localhost:4000

## 🚀 Run Locally

### Backend
cd backend
npm install
npm run dev

*Runs on:* http://localhost:4000

### Frontend
cd frontend
npm install
npm run dev
*Runs on:* http://localhost:5173

## 🧪 Example API Calls
1. List all documents
curl http://localhost:4000/documents

2. Upload PDF
curl -X POST http://localhost:4000/documents/upload
-F "file=@test.pdf"

3. Download file (ID 1)
curl -O http://localhost:4000/documents/1

## 📱 Test Flow
1. Start both servers
2. Open http://localhost:5173
3. Upload PDF → appears in list
4. Test Download/Delete buttons

5. Delete file (ID 1)
curl -X DELETE http://localhost:4000/documents/1
