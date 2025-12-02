import React, { FormEvent, useMemo, useState } from 'react';
import { Platform, uploadUnifiedPost } from '../services/posts';

const PLATFORM_LABELS: Record<Platform, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'Tiktok',
};

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [platforms, setPlatforms] = useState<Record<Platform, boolean>>({
    FACEBOOK: true,
    INSTAGRAM: true,
    TIKTOK: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const selectedPlatforms = useMemo(
    () => Object.entries(platforms).filter(([, value]) => value).map(([key]) => key as Platform),
    [platforms],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadUnifiedPost({
        content,
        mediaUrl: mediaUrl || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        platforms: selectedPlatforms,
      });

      setResult(response.data);
      setContent('');
      setMediaUrl('');
      setScheduledAt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upload once, share everywhere</h3>
        <p className="text-sm text-gray-500">
          Soạn nội dung và chọn nền tảng để gửi ngay hoặc lên lịch.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Thông điệp bạn muốn đăng..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media URL (tùy chọn)</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lịch đăng (tùy chọn)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Nền tảng</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
              <label
                key={platform}
                className="flex items-center space-x-2 rounded-md border border-gray-200 p-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={platforms[platform]}
                  onChange={(e) =>
                    setPlatforms((prev) => ({
                      ...prev,
                      [platform]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-800">{PLATFORM_LABELS[platform]}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && result.platforms && (
          <div className="rounded-md border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Kết quả:</p>
            <ul className="space-y-1 text-sm text-gray-600">
              {result.platforms.map((platform: any) => (
                <li key={platform.id} className="flex justify-between">
                  <span>{PLATFORM_LABELS[platform.platform as Platform]}</span>
                  <span
                    className={
                      platform.status === 'SUCCESS'
                        ? 'text-green-600'
                        : platform.status === 'FAILED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }
                  >
                    {platform.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !content || !selectedPlatforms.length}
          className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Đang đăng...' : 'Đăng lên tất cả'}
        </button>
      </form>
    </div>
  );
}


