import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getGroup, GroupWithPosts } from '../services/groups';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGroup(id);
    }
  }, [id]);

  const loadGroup = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getGroup(groupId);
      setGroup(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleReusePost = (
    platform: 'facebook' | 'instagram' | 'tiktok',
    postId: string,
  ) => {
    if (!group) return;
    const base =
      platform === 'facebook'
        ? '/upload/facebook'
        : platform === 'instagram'
          ? '/upload/instagram'
          : '/upload/tiktok';
    navigate(`${base}/${postId}?groupId=${group.id}`);
  };

  const handleCreatePost = (platform: 'facebook' | 'instagram' | 'tiktok') => {
    if (!group) return;
    const base =
      platform === 'facebook'
        ? '/upload/facebook'
        : platform === 'instagram'
          ? '/upload/instagram'
          : '/upload/tiktok';
    navigate(`${base}?groupId=${group.id}`);
  };

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <p className="text-gray-500">Invalid campaign ID.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          Loading campaign...
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-red-600 mb-4">
            {error || 'Campaign not found'}
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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-sm text-gray-500">
              Created on {new Date(group.createdAt).toLocaleString()}
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to campaigns
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex flex-wrap gap-3">
          <button
            onClick={() => handleCreatePost('facebook')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + Facebook Post
          </button>
          <button
            onClick={() => handleCreatePost('instagram')}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
          >
            + Instagram Post
          </button>
          <button
            onClick={() => handleCreatePost('tiktok')}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
          >
            + TikTok Post
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-0 space-y-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Facebook Posts
          </h2>
          {group.facebookPosts.length === 0 ? (
            <p className="text-sm text-gray-500">No Facebook posts in this campaign yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {group.facebookPosts.map((post: any) => (
                <li key={post.id} className="py-3">
                  <p className="text-sm text-gray-900 mb-1 truncate">
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {post.status} •{' '}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleReusePost('facebook', post.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      {post.status === 'FAILED' ? 'Repost' : 'Update & Repost'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Instagram Posts
          </h2>
          {group.instagramPosts.length === 0 ? (
            <p className="text-sm text-gray-500">No Instagram posts in this campaign yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {group.instagramPosts.map((post: any) => (
                <li key={post.id} className="py-3">
                  <p className="text-sm text-gray-900 mb-1 truncate">
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {post.status} •{' '}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleReusePost('instagram', post.id)}
                      className="text-xs font-medium text-pink-600 hover:text-pink-700"
                    >
                      {post.status === 'FAILED' ? 'Repost' : 'Update & Repost'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            TikTok Posts
          </h2>
          {group.tiktokPosts.length === 0 ? (
            <p className="text-sm text-gray-500">No TikTok posts in this campaign yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {group.tiktokPosts.map((post: any) => (
                <li key={post.id} className="py-3">
                  <p className="text-sm text-gray-900 mb-1 truncate">
                    {post.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {post.status} •{' '}
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleReusePost('tiktok', post.id)}
                      className="text-xs font-medium text-black hover:text-gray-800"
                    >
                      {post.status === 'FAILED' ? 'Repost' : 'Update & Repost'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


