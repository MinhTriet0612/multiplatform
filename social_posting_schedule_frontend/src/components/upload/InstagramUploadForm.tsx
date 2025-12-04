import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { uploadInstagramPost, CreateInstagramPostPayload, getInstagramPostById, repostInstagramPost } from '../../services/instagram';

export default function InstagramUploadForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') || undefined;
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  const [mediaType, setMediaType] = useState<'CAROUSEL' | 'REELS' | 'STORIES'>('CAROUSEL');
  const [coverUrl, setCoverUrl] = useState('');
  const [shareToFeed, setShareToFeed] = useState(true);
  const [locationId, setLocationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

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
      setMediaType((post.mediaType as 'CAROUSEL' | 'REELS' | 'STORIES') || 'CAROUSEL');
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
        mediaType,
        groupId,
        coverUrl: coverUrl.trim() || undefined,
        shareToFeed: mediaType === 'REELS' ? shareToFeed : undefined,
        locationId: locationId.trim() || undefined,
      };

      if (id) {
        await repostInstagramPost(id, payload);
      } else {
        await uploadInstagramPost(payload);
      }
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
    setErrors((prevErrors) => prevErrors.filter((_, i) => i !== index));

    if (mediaUrls.length > 1) {
      setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newUrls = [...mediaUrls];
    const updatedUrl = e.target.value;
    const newErrors = [...errors];

    if (newUrls.includes(updatedUrl) && newUrls[index] !== updatedUrl) {
      newErrors[index] = 'This URL is already added.';
    } else {
      newErrors[index] = '';
      newUrls[index] = updatedUrl;
      setMediaUrls(newUrls);
    }

    setErrors(newErrors);
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="CAROUSEL">Carousel (Images Only)</option>
                <option value="REELS">Reels (Video)</option>
                <option value="STORIES">Stories (Video)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {mediaType === 'CAROUSEL' && 'Can contain single or multiple images (max 10). For videos, use Reels.'}
                {mediaType === 'REELS' && 'Single video for Reels feed'}
                {mediaType === 'STORIES' && 'Single video for Stories'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs</label>
              {mediaUrls.map((url, index) => (
                <div>
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleInputChange(e, index)}
                      required={index === 0}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 block"
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
                  {errors[index] && (
                    <div className="error-message text-red-500 text-sm mt-1 flex justify-center">{errors[index]}</div>
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

            {/* Reels Cover URL */}
            {mediaType === 'REELS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">Cover image for your Reel</p>
              </div>
            )}

            {/* Reels Share to Feed */}
            {mediaType === 'REELS' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shareToFeed"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="shareToFeed" className="ml-2 block text-sm text-gray-700">
                  Share to main feed
                </label>
              </div>
            )}

            {/* Location ID */}
            {mediaType !== 'STORIES' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location ID (Optional)
                </label>
                <input
                  type="text"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="213385402"
                />
                <p className="text-xs text-gray-500 mt-1">Instagram location ID for tagging</p>
              </div>
            )}

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

