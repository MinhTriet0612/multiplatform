import { useEffect, useState } from 'react';
import {
  getFacebookPageInsights,
  getInstagramAccountInsights,
  type PlatformInsightsResponse,
} from '../services/platform-insights';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';

// Default labels for each platform (to maintain consistent chart structure)
const DEFAULT_FACEBOOK_LABELS = ['Page Fans', 'Page Views', 'Engaged Users', 'Total Actions'];
const DEFAULT_INSTAGRAM_LABELS = ['Profile Visits', 'Website Link Taps', 'Reach'];

export default function PlatformInsights() {
  const [facebookInsights, setFacebookInsights] = useState<PlatformInsightsResponse | null>(null);
  const [instagramInsights, setInstagramInsights] = useState<PlatformInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fbError, setFbError] = useState<string | null>(null);
  const [igError, setIgError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFbError(null);
      setIgError(null);
      try {
        const [fbRes, igRes] = await Promise.allSettled([
          getFacebookPageInsights(),
          getInstagramAccountInsights(),
        ]);

        if (fbRes.status === 'fulfilled') {
          setFacebookInsights(fbRes.value.data);
        } else {
          console.error('Failed to load Facebook insights:', fbRes.reason);
          setFbError(fbRes.reason?.message || 'Failed to load');
        }

        if (igRes.status === 'fulfilled') {
          setInstagramInsights(igRes.value.data);
        } else {
          console.error('Failed to load Instagram insights:', igRes.reason);
          setIgError(igRes.reason?.message || 'Failed to load');
        }
      } catch (err) {
        console.error('Error loading platform insights:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const prepareChartData = (
    insights: PlatformInsightsResponse | null,
    defaultLabels: string[],
  ) => {
    // Always return default labels structure, fill with actual data if available
    const values = defaultLabels.map(() => 0);

    if (insights?.data && insights.data.length > 0) {
      // Create a map of metric names to their values
      const metricMap = new Map<string, number>();
      
      insights.data.forEach((m) => {
        let value = 0;
        // Handle total_value metrics (profile_views, website_clicks)
        if (m.total_value?.value !== undefined) {
          value = m.total_value.value;
        }
        // Handle time_series metrics (reach) - use latest value
        else if (m.values && m.values.length > 0) {
          const v = m.values[m.values.length - 1]?.value;
          if (typeof v === 'number') {
            value = v;
          } else if (v && typeof v === 'object') {
            value = Object.values(v).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
          }
        }
        
        // Store by both name and title for flexible matching
        metricMap.set(m.name, value);
        metricMap.set(m.title || m.name, value);
      });

      // Match metrics to default labels (case-insensitive partial match)
      defaultLabels.forEach((defaultLabel, index) => {
        for (const [key, value] of metricMap.entries()) {
          if (
            key.toLowerCase().includes(defaultLabel.toLowerCase()) ||
            defaultLabel.toLowerCase().includes(key.toLowerCase())
          ) {
            values[index] = value;
            break;
          }
        }
      });
    }

    return {
      labels: defaultLabels,
      values,
    };
  };

  const fbData = prepareChartData(facebookInsights, DEFAULT_FACEBOOK_LABELS);
  const igData = prepareChartData(instagramInsights, DEFAULT_INSTAGRAM_LABELS);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
        Loading platform insights...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900">Platform Insights</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your Facebook Page and Instagram Account performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        {/* Facebook Page Insights */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            Facebook Page
            {fbError && (
              <span className="text-xs text-red-500 ml-auto">(Error)</span>
            )}
          </h3>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <BarChart
              xAxis={[
                {
                  scaleType: 'band',
                  data: fbData.labels,
                },
              ]}
              series={[
                {
                  data: fbData.values,
                  label: 'Value',
                },
              ]}
              width={300}
              height={250}
            />
          </Box>
        </div>

        {/* Instagram Account Insights */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-600"></span>
            Instagram Account
            {igError && (
              <span className="text-xs text-red-500 ml-auto">(Error)</span>
            )}
          </h3>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <BarChart
              xAxis={[
                {
                  scaleType: 'band',
                  data: igData.labels,
                },
              ]}
              series={[
                {
                  data: igData.values,
                  label: 'Value',
                },
              ]}
              width={300}
              height={250}
            />
          </Box>
        </div>

        {/* TikTok - Unavailable */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-black"></span>
            TikTok
          </h3>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <Typography variant="body2" color="text.secondary" className="mb-2">
                Unavailable
              </Typography>
              <Typography variant="caption" color="text.secondary">
                TikTok insights will be available soon
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

