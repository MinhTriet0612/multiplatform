import api from './api';

export interface PlatformInsightValue {
  value: number | Record<string, number>;
  end_time?: string;
}

export interface PlatformInsightMetric {
  name: string;
  period: string;
  values?: PlatformInsightValue[]; // Optional for total_value metrics
  total_value?: {
    value: number;
  }; // For metrics with metric_type=total_value
  title: string;
  description: string;
  id: string;
}

export interface PlatformInsightsResponse {
  data: PlatformInsightMetric[];
}

export const getFacebookPageInsights = () =>
  api.get<PlatformInsightsResponse>('/platform-insights/facebook');

export const getInstagramAccountInsights = () =>
  api.get<PlatformInsightsResponse>('/platform-insights/instagram');

