
import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFacebookPost, CreateFacebookPostPayload, getFacebookPostById } from '../../services/facebook';

export default function FacebookUploadForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'TEXT' | 'PHOTO' | 'VIDEO'>('TEXT');
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
      const response = await getFacebookPostById(id);
      const post = response.data;
      setContent(post.content);
      setMediaUrl(post.mediaUrl || '');
      setMediaType((post.mediaType as 'TEXT' | 'PHOTO' | 'VIDEO') || 'TEXT');
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
      const payload: CreateFacebookPostPayload = {
        content,
        mediaType: mediaType === 'TEXT' ? undefined : mediaType,
        mediaUrl: mediaUrl || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      };

      await uploadFacebookPost(payload);
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
          {id ? 'Republish Facebook Post' : 'Upload Facebook Post'}
        </h2>
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading post data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your post content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'TEXT' | 'PHOTO' | 'VIDEO')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TEXT">Text Only</option>
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>

          {mediaType !== 'TEXT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !content}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
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

