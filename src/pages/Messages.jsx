import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getMessages,
  sendMessage,
  getListingMessages,
  sendListingMessage,
} from '../services/api';
import { getSchoolTheme } from '../config/schools';

export default function Messages() {
  const { requestId, listingId } = useParams();
  const isListing = Boolean(listingId);
  const threadId = requestId || listingId;

  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const res = isListing
        ? await getListingMessages(threadId)
        : await getMessages(threadId);
      setMessages(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load messages');
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setSending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('body', body);
      if (file) formData.append('file', file);
      if (isListing) {
        await sendListingMessage(threadId, formData);
      } else {
        await sendMessage(threadId, formData);
      }
      setBody('');
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-6 flex flex-col"
      style={{ height: 'calc(100vh - 2rem)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            to={isListing ? '/app/marketplace' : '/app/requests'}
            className="text-sm"
            style={{ color: theme.primary }}
          >
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-3 text-sm">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello and start the conversation.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? 'text-white' : 'bg-gray-100 text-gray-800'
                }`}
                style={mine ? { backgroundColor: theme.primary } : {}}
              >
                {!mine && <div className="text-xs opacity-70 mb-1">{m.sender.name}</div>}
                {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`block mt-1 text-xs underline ${
                      mine ? 'text-white' : 'text-blue-600'
                    }`}
                  >
                    📎 {m.fileName || 'Attachment'}
                  </a>
                )}
                <div
                  className={`text-[10px] mt-1 ${
                    mine ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="flex-1">
          {file && (
            <div className="text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-1 mb-1 inline-flex items-center gap-2">
              📎 {file.name}
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-500 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Type a message..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none"
            style={{ ['--tw-ring-color']: theme.primary }}
          />
        </div>
        <label
          className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl pb-2"
          title="Attach file"
        >
          📎
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>
        <button
          type="submit"
          disabled={sending || (!body.trim() && !file)}
          className="text-white font-medium rounded-lg px-5 py-2 disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: theme.primary }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}