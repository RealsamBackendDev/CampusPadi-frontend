import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  uploadStudyDocument,
  getStudyDocuments,
  searchStudy,
  deleteStudyDocument,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

export default function StudyBuddy() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', courseCode: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStudyDocuments();
      setDocuments(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setUploadMsg('');

    if (!form.title || !file) {
      setError('Title and file are required.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('file', file);
      const res = await uploadStudyDocument(data);
      setUploadMsg(res.data.message);
      setForm({ title: '', courseCode: '', description: '' });
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setResults(null);
    setError('');
    try {
      const res = await searchStudy(query.trim());
      setResults(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document and all its chunks?')) return;
    try {
      await deleteStudyDocument(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/app" className="text-sm" style={{ color: theme.primary }}>← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Study Buddy</h1>
        <p className="text-sm text-gray-500">
          Upload past questions and course materials — AI answers coming in the next update.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {uploadMsg && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">{uploadMsg}</div>}

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the knowledge base... (min 3 characters)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
          style={{ ['--tw-ring-color']: theme.primary }}
        />
        <button
          type="submit"
          className="text-white font-medium rounded-lg px-5 py-2 cursor-pointer"
          style={{ backgroundColor: theme.primary }}
        >
          Search
        </button>
      </form>

      {results && (
        <section className="mb-8">
          <h2 className="font-bold text-gray-900 mb-3">Top Matches</h2>
          {results.length === 0 && (
            <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
              No matches. Try different keywords or upload more materials.
            </p>
          )}
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">
                    {r.title}
                    {r.courseCode && (
                      <span className="text-gray-400 font-normal"> · {r.courseCode}</span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {Math.round(r.score * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{r.snippet}...</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="font-bold text-gray-900 mb-3">Upload Material</h2>
        <form
          onSubmit={handleUpload}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="MTH 101 Past Questions 2023"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{ ['--tw-ring-color']: theme.primary }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course Code (optional)</label>
              <input
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                placeholder="MTH 101"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{ ['--tw-ring-color']: theme.primary }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Contains 2019–2023 exam questions with solutions"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color']: theme.primary }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File (PDF or TXT, max 10MB)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files[0] || null)}
              required
              className="w-full text-sm text-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: theme.primary }}
          >
            {uploading ? 'Processing (this can take a minute)...' : 'Upload & Index'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-bold text-gray-900 mb-3">Knowledge Base ({documents.length})</h2>
        {loading && <p className="text-center text-gray-500 py-6">Loading...</p>}
        {!loading && documents.length === 0 && (
          <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-100 p-5">
            No materials uploaded yet for {theme.short}. Upload the first past question.
          </p>
        )}
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {doc.title}
                  {doc.courseCode && (
                    <span className="text-gray-400 font-normal"> · {doc.courseCode}</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {doc.fileType} · {doc._count.chunks} chunks · by {doc.uploadedBy.name}
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-xs border border-red-300 text-red-600 rounded-lg px-3 py-1.5 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}