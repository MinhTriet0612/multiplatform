import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGroups, Group } from '../services/groups';

export default function Homepage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPosts = (group: Group) => {
    if (!group._count) return 0;
    return (
      group._count.facebookPosts +
      group._count.instagramPosts +
      group._count.tiktokPosts
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Campaigns (Groups)</h1>
            <Link
              to="/groups/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              + New Campaign
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              Loading...
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No campaigns found</p>
              <Link
                to="/groups/new"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first campaign
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Posts:</span>
                      <span className="font-medium text-gray-900">
                        {getTotalPosts(group)}
                      </span>
                    </div>
                    {group._count && (
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>FB: {group._count.facebookPosts}</span>
                        <span>IG: {group._count.instagramPosts}</span>
                        <span>TT: {group._count.tiktokPosts}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

