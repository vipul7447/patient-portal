# Patient Portal - Design Document

## 1. Tech Stack Choices

### Q1. Frontend Framework: React + Vite
*React* was chosen for its component-based architecture, making it ideal for building reusable UI elements like the upload form and document list. The virtual DOM ensures efficient updates when the document list changes after uploads/deletes.

*Vite* was used as the build tool for its lightning-fast development server (faster HMR than CRA) and optimized production builds. No heavy UI libraries were used to keep the bundle small and demonstrate vanilla React + CSS capabilities.

### Q2. Backend Framework: Node.js + Express
*Express* provides a minimal, flexible foundation for REST APIs with excellent middleware support. *Multer* handles multipart/form-data uploads cleanly, storing PDFs directly to disk while validating MIME types.

The full-stack JavaScript approach eliminates context-switching and aligns with modern web development practices. The server runs on port 4000 with CORS enabled for local frontend-backend communication.

### Q3. Database: SQLite
*SQLite* is perfect for this single-user, local development scenario. It's embedded (no separate server process), requires zero configuration, and creates a single database.sqlite file.

The schema stores essential metadata (id, original_name, stored_name, size, created_at) while actual PDFs live in an uploads/ folder. This separation allows easy file management while keeping metadata queryable.

### Q4. Scaling to 1,000 Users
For production with multiple users:

*Database & Storage:*
- Replace SQLite with *PostgreSQL* for concurrent connections and ACID compliance
- Move files to *AWS S3* or similar object storage (local disk doesn't scale)
- Add user_id foreign key to partition documents per patient

*Backend:*
- Add *JWT authentication* (Auth0/JWT) and per-user authorization middleware
- Rate limiting and file size validation (e.g., Multer limits)
- Input sanitization and comprehensive error logging (Winston/Sentry)

*Infrastructure:*
- Deploy on *Vercel* (frontend) + *Railway/DigitalOcean* (backend)
- CDN for file downloads, Redis caching for recent document lists
- Containerization (Docker) with health checks

## 2. Architecture Overview
Frontend (React + Vite) Backend (Express + Multer) SQLite DB Local Storage

| Upload Form | POST /documents/upload | INSERT | uploads/
| | ↓ | metadata | [PDF files]
| List View ------------> GET /documents | SELECT |
| Download Button --------> GET /documents/:id | SELECT | READ file
| Delete Button ----------> DELETE /documents/:id | DELETE | DELETE file

*Data Flow:*
1. User selects PDF → React FormData → POST /documents/upload
2. Multer validates/saves PDF to uploads/ → SQLite INSERT metadata → 201 response
3. Frontend calls GET /documents → SQLite SELECT → renders list
4. Download: GET /documents/:id → SQLite lookup → res.download()
5. Delete: DELETE /documents/:id → SQLite lookup → delete file + DB row

*File Storage:* PDFs saved as timestamp-originalname.pdf in uploads/ folder to avoid collisions.

## 3. API Specification

### Overview Table

| Endpoint              | Method | Description                  |
|----------------------|--------|------------------------------|
| /documents/upload  | POST   | Upload PDF file              |
| /documents         | GET    | List all documents (metadata)|
| /documents/:id     | GET    | Download specific file       |
| /documents/:id     | DELETE | Delete file + metadata       |

### 1. POST /documents/upload

*Description:* Accepts PDF via multipart/form-data, stores file, saves metadata, returns created record.

*Request:*
Content-Type: multipart/form-data
Body: file=<binary PDF>

*Success Response (201):*

{
"id": 1,
"filename": "blood-test.pdf",
"size": 123456,
"created_at": "2025-12-10T02:30:00.000Z"
}

*Error Response (400):*

{ "error": "Only PDF files are allowed" }

### 2. GET /documents

*Description:* Returns array of all document metadata.

*Success Response (200):*

{
"id": 1,
"filename": "blood-test.pdf",
"size": 123456,
"created_at": "2025-12-10T02:30:00.000Z"
}
]

### 3. GET /documents/:id

*Description:* Streams PDF file for download.

*Success:* 
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="blood-test.pdf"
- Body: binary PDF data

*Error (404):*

{ "error": "Document not found" }

### 4. DELETE /documents/:id

*Description:* Removes both database row and physical file.

*Success Response (200):*

{ "message": "Document deleted successfully" }

*Error (404):*

{ "error": "Document not found" }

## Folder Structure

patient-portal/
├── backend/
│ ├── index.js # Express server + routes
│ ├── db.js # SQLite setup
│ ├── uploads/ # PDF files
│ └── database.sqlite # Metadata
└── frontend/
├── src/
│ ├── App.jsx # Main React component
│ └── index.css # Twitter-like dark theme
└── vite.config.js

## Running the Application

Backend
cd patient-portal-backend
npm install
npm run dev # http://localhost:4000

Frontend (separate terminal)
cd patient-portal-frontend
npm install
npm run dev # http://localhost:5173

This design delivers a production-ready foundation that scales easily while meeting all assignment requirements with clean separation of concerns.
