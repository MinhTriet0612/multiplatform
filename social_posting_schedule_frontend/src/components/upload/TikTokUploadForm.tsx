import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadTikTokPost, CreateTikTokPostPayload, getTikTokPostById } from '../../services/tiktok';

export default function TikTokUploadForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPostData();
    }
  }, [id]);

  const loadPostData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await getTikTokPostById(id);
      const post = response.data;
      setContent(post.content);
      setVideoUrl(post.videoUrl || '');
      setTitle(post.title || '');
      if (post.scheduledAt) {
        const date = new Date(post.scheduledAt);
        setScheduledAt(date.toISOString().slice(0, 16));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateTikTokPostPayload = {
        content,
        videoUrl,
        title: title || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      };

      await uploadTikTokPost(payload);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {id ? 'Republish TikTok Video' : 'Upload TikTok Video'}
        </h2>
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading post data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Video title..."
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/150 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={2200}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter video description..."
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !content || !videoUrl}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : id ? 'Republish' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

