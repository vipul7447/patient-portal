import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

function App() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/documents`);
      setDocuments(res.data);
    } catch {
      setMessage("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setMessage("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API_BASE}/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage("Upload successful");
      setFile(null);
      e.target.reset();
      fetchDocuments();
    } catch (err) {
      const errorText = err.response?.data?.error || "Upload failed";
      setMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id) => {
    window.location.href = `${API_BASE}/documents/${id}`;
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/documents/${id}`);
      setMessage("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setMessage("Delete failed");
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="app-root">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <div className="logo-circle">H</div>
          <div>
            <div className="app-title">HealthStream</div>
            <div className="app-subtitle">Patient Portal</div>
          </div>
        </div>

        <div className="app-user">
          <div className="user-avatar" />
          <div>
            <div className="user-name">Jane Doe</div>
            <div className="user-handle">@patient01</div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <h2>Documents</h2>
        </header>

        <div className="app-content">
          <section className="card card-upload">
            <form className="upload-form" onSubmit={handleUpload}>
              <div className="upload-input-row">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {file && (
                <p className="text-muted">
                  Selected: {file.name} ({file.size} bytes)
                </p>
              )}
            </form>
            {message && <p className="status-text">{message}</p>}
          </section>

          <section className="card">
            {documents.length === 0 ? (
              <p className="text-muted">
                No documents yet. Upload a PDF to get started.
              </p>
            ) : (
              <ul className="doc-list">
                {documents.map((doc) => (
                  <li key={doc.id} className="doc-item">
                    <div className="doc-main">
                      <div className="doc-name">{doc.filename}</div>
                      <div className="doc-meta">
                        <span>{(doc.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                    <div className="doc-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleDownload(doc.id)}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
