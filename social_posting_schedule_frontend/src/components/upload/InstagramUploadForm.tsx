import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadInstagramPost, CreateInstagramPostPayload, getInstagramPostById } from '../../services/instagram';

export default function InstagramUploadForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'REELS' | 'STORIES' | 'CAROUSEL'>('IMAGE');
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
      const response = await getInstagramPostById(id);
      const post = response.data;
      setContent(post.content);
      setMediaUrls(post.mediaUrls.length > 0 ? post.mediaUrls : ['']);
      setMediaType((post.mediaType as 'IMAGE' | 'VIDEO' | 'REELS' | 'STORIES' | 'CAROUSEL') || 'IMAGE');
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
      const validUrls = mediaUrls.filter((url) => url.trim() !== '');
      if (validUrls.length === 0) {
        setError('At least one media URL is required');
        return;
      }

      const payload: CreateInstagramPostPayload = {
        content,
        mediaUrls: validUrls,
        mediaType: validUrls.length > 1 ? 'CAROUSEL' : mediaType,
      };

      await uploadInstagramPost(payload);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMediaUrl = () => {
    if (mediaUrls.length < 10) {
      setMediaUrls([...mediaUrls, '']);
    }
  };

  const removeMediaUrl = (index: number) => {
    if (mediaUrls.length > 1) {
      setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {id ? 'Republish Instagram Post' : 'Upload Instagram Post'}
        </h2>
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading post data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={2200}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter your caption..."
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              disabled={mediaUrls.length > 1}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="REELS">Reels</option>
              <option value="STORIES">Stories</option>
            </select>
            {mediaUrls.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">Multiple URLs = Carousel</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs</label>
            {mediaUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...mediaUrls];
                    newUrls[index] = e.target.value;
                    setMediaUrls(newUrls);
                  }}
                  required={index === 0}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="https://..."
                />
                {mediaUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMediaUrl(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {mediaUrls.length < 10 && (
              <button
                type="button"
                onClick={addMediaUrl}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                + Add another URL
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !content}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
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

