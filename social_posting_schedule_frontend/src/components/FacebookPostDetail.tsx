import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getFacebookPostById,
  getFacebookPostInsights,
  type FacebookPost,
  type FacebookInsightsResponse,
} from '../services/facebook';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

export default function FacebookPostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<FacebookPost | null>(null);
  const [insights, setInsights] = useState<FacebookInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postRes, insightsRes] = await Promise.all([
          getFacebookPostById(id),
          getFacebookPostInsights(id),
        ]);
        setPost(postRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Facebook insights');
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
          Loading Facebook post & insights...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || 'Facebook post not found.'}
          </p>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const metrics = insights?.data || [];
  const labels = metrics.map((m) => m.title || m.name);
  const values = metrics.map((m) => {
    const v = m.values[0]?.value;
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object') {
      return Object.values(v).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="px-4 sm:px-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facebook Post Detail</h1>
          <p className="text-sm text-gray-500">
            Displaying post data and Facebook Insights from Graph API.
          </p>
        </div>
        <Link
          to={post.groupId ? `/groups/${post.groupId}` : '/'}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to campaign
        </Link>
      </div>

      <div className="px-4 sm:px-0 space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Post Information
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
          {post.mediaUrl && (
            <div className="mt-3">
              {post.mediaType === 'VIDEO' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full max-w-md rounded-md border"
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt="Facebook media"
                  className="w-48 h-48 object-cover rounded-md border"
                />
              )}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Facebook Insights
          </h2>
          {!metrics.length ? (
            <p className="text-sm text-gray-500">
              No insights data available for this post yet.
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
                    label: 'Value',
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


