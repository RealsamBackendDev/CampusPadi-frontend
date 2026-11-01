import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  uploadStudyDocument,
  getStudyDocuments,
  searchStudy,
  deleteStudyDocument,
  askStudy,
  getStudyHistory,
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

  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('study');
  const [asking, setAsking] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const chatBottomRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', courseCode: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  const loadDocuments = async () => {
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

  const loadHistory = async () => {
    try {
      const res = await getStudyHistory();
      const history = res.data.data.slice().reverse();
      const mapped = [];
      history.forEach((q) => {
        mapped.push({ role: 'user', text: q.question, mode: q.mode });
        mapped.push({ role: 'ai', text: q.answer, sources: q.sources });
      });
      setChat(mapped);
      setUsage((u) => ({ ...u, used: res.data.data.length }));
    } catch (err) {
      console.error('History load failed:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
    loadHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.length]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const asked = question.trim();
    setQuestion('');
    setChat((c) => [...c, { role: 'user', text: asked, mode: mode.toUpperCase() }]);
    setAsking(true);
    setError('');

    try {
      const res = await askStudy({ question: asked, mode });
      setChat((c) => [...c, { role: 'ai', text: res.data.data.answer, sources: res.data.data.sources }]);
      setUsage({ used: res.data.data.questionsUsed, limit: res.data.data.weeklyLimit });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not get an answer';
      if (err.response?.status === 429) {
        setUsage((u) => ({ ...u, used: u.limit }));
      }
      setChat((c) => [...c, { role: 'ai', text: `⚠️ ${msg}`, sources: [] }]);
    } finally {
      setAsking(false);
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
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document and all its chunks?')) return;
    try {
      await deleteStudyDocument(id);
      loadDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <Link to="/app" className="text-sm" style={{ color: theme.primary }}>← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Study Buddy</h1>
        <p className="text-sm text-gray-500">
          {usage.used}/{usage.limit} free questions used this week
          {usage.used >= usage.limit && ' — limit reached'}
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {uploadMsg && <div className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">{uploadMsg}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('study')}
            className={`text-xs font-medium rounded-full px-3 py-1 cursor-pointer ${
              mode === 'study' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            📖 Study Mode
          </button>
          <button
            onClick={() => setMode('assignment')}
            className={`text-xs font-medium rounded-full px-3 py-1 cursor-pointer ${
              mode === 'assignment' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            ✍️ Assignment Mode
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3 mb-3">
          {chat.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              Ask a question about any course — answers come from your school's uploaded materials, with citations.
            </p>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={msg.role === 'user' ? { backgroundColor: theme.primary } : {}}
              >
                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {msg.sources.map((s, j) => (
                      <span key={j} className="text-[10px] bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">
                        [{j + 1}] {s.title}{s.courseCode ? ` · ${s.courseCode}` : ''} · {s.match}%
                      </span>
                    ))}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {asking && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500">Thinking...</div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={mode === 'study' ? 'Ask anything about your courses...' : 'Paste the assignment question — I\'ll guide you step by step'}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
            style={{ ['--tw-ring-color']: theme.primary }}
          />
          <button
            type="submit"
            disabled={asking || usage.used >= usage.limit}
            className="text-white font-medium rounded-lg px-5 py-2 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: theme.primary }}
          >
            Ask
          </button>
        </form>
      </div>

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
                    {r.courseCode && <span className="text-gray-400 font-normal"> · {r.courseCode}</span>}
                  </h3>
                  <span className="text-xs text-gray-400">{Math.round(r.score * 100)}% match</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{r.snippet}...</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="font-bold text-gray-900 mb-3">Upload Material</h2>
        <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
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
            No materials uploaded yet for your school. Upload the first past question.
          </p>
        )}
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {doc.title}
                  {doc.courseCode && <span className="text-gray-400 font-normal"> · {doc.courseCode}</span>}
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