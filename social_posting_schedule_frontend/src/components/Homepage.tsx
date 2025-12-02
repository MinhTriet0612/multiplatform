import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFacebookPosts, FacebookPost } from '../services/facebook';
import { getInstagramPosts, InstagramPost } from '../services/instagram';
import { getTikTokPosts, TikTokPost } from '../services/tiktok';

type Platform = 'facebook' | 'instagram' | 'tiktok';

interface PostRow {
  id: string;
  platform: Platform;
  content: string;
  status: string;
  createdAt: string;
  externalId?: string;
}

export default function Homepage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Platform | 'all'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const [fbRes, igRes, ttRes] = await Promise.all([
        getFacebookPosts().catch(() => ({ data: [] })),
        getInstagramPosts().catch(() => ({ data: [] })),
        getTikTokPosts().catch(() => ({ data: [] })),
      ]);

      const allPosts: PostRow[] = [
        ...(fbRes.data as FacebookPost[]).map((p) => ({
          id: p.id,
          platform: 'facebook' as Platform,
          content: p.content,
          status: p.status,
          createdAt: p.createdAt,
          externalId: p.externalId,
        })),
        ...(igRes.data as InstagramPost[]).map((p) => ({
          id: p.id,
          platform: 'instagram' as Platform,
          content: p.content,
          status: p.status,
          createdAt: p.createdAt,
          externalId: p.externalId,
        })),
        ...(ttRes.data as TikTokPost[]).map((p) => ({
          id: p.id,
          platform: 'tiktok' as Platform,
          content: p.content,
          status: p.status,
          createdAt: p.createdAt,
          externalId: p.externalId,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts =
    activeTab === 'all'
      ? posts
      : posts.filter((p) => p.platform === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'text-green-600 bg-green-50';
      case 'SCHEDULED':
        return 'text-blue-600 bg-blue-50';
      case 'QUEUED':
        return 'text-yellow-600 bg-yellow-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPlatformLabel = (platform: Platform) => {
    const labels: Record<Platform, string> = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
    };
    return labels[platform];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
            <div className="flex gap-2">
              <Link
                to="/upload/facebook"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                + Facebook
              </Link>
              <Link
                to="/upload/instagram"
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
              >
                + Instagram
              </Link>
              <Link
                to="/upload/tiktok"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
              >
                + TikTok
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['all', 'facebook', 'instagram', 'tiktok'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === tab
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab === 'all' ? 'All Posts' : getPlatformLabel(tab as Platform)}
                  </button>
                ))}
              </nav>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No posts found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        External ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <tr key={`${post.platform}-${post.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {getPlatformLabel(post.platform)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">
                            {post.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              post.status,
                            )}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.externalId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/upload/${post.platform}/${post.id}`}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Republish
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

