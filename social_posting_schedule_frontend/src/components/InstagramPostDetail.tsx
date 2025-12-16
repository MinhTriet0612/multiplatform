import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getInstagramPostById,
  getInstagramPostInsights,
  type InstagramPost,
  type InstagramInsightsResponse,
} from '../services/instagram';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

export default function InstagramPostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<InstagramPost | null>(null);
  const [insights, setInsights] = useState<InstagramInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postRes, insightsRes] = await Promise.all([
          getInstagramPostById(id),
          getInstagramPostInsights(id),
        ]);
        setPost(postRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post insights');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <p className="text-gray-500">Invalid post ID.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          Đang tải dữ liệu bài viết & insights...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || 'Không tìm thấy bài viết Instagram.'}
          </p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Quay lại chiến dịch
          </Link>
        </div>
      </div>
    );
  }

  const metrics = insights?.data || [];
  const labels = metrics.map((m) => m.title || m.name);
  const values = metrics.map((m) => (m.values[0]?.value as number) || 0);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="px-4 sm:px-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instagram Post Detail</h1>
          <p className="text-sm text-gray-500">
            Đang hiển thị dữ liệu bài viết và Instagram Insights từ Facebook Graph API.
          </p>
        </div>
        <Link
          to={post.groupId ? `/groups/${post.groupId}` : '/'}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Quay lại chiến dịch
        </Link>
      </div>

      <div className="px-4 sm:px-0 space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Thông tin bài viết
          </h2>
          <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
            {post.content}
          </p>
          <p className="text-xs text-gray-500 mb-1">
            Status: {post.status} •{' '}
            {new Date(post.createdAt).toLocaleString()}
          </p>
          {post.publishedAt && (
            <p className="text-xs text-gray-500">
              Published at: {new Date(post.publishedAt).toLocaleString()}
            </p>
          )}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.mediaUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Instagram media"
                  className="w-24 h-24 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Instagram Insights
          </h2>
          {!metrics.length ? (
            <p className="text-sm text-gray-500">
              Chưa có dữ liệu insights cho bài viết này.
            </p>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <BarChart
                xAxis={[
                  {
                    scaleType: 'band',
                    data: labels,
                  },
                ]}
                series={[
                  {
                    data: values,
                    label: 'Giá trị',
                  },
                ]}
                width={600}
                height={320}
              />
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}


