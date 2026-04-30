import apiClient from './client';
import { AIPrediction} from '@/lib/types';

export const aiAPI = {
  getSuggestions: async (genre?: string): Promise<{ suggestion: string; generic: boolean }> => {
    const params = genre ? `?genre=${genre}` : '';
    const response = await apiClient.get<{ suggestion: string; generic: boolean }>(
      `/ai/suggestions${params}`
    );
    return response;
  },

  predictViral: async (remixId: string): Promise<{ prediction: AIPrediction }> => {
    const response = await apiClient.post<{ prediction: AIPrediction }>('/ai/predict-viral', {
      remixId,
    });
    return response;
  },

  getTraderInsight: async (remixId: string): Promise<{ insight: string }> => {
    const response = await apiClient.get<{ insight: string }>(`/ai/insights/${remixId}`);
    return response;
  },

  getTrendingAnalysis: async (genre?: string): Promise<{ analysis: string; remixes: any[] }> => {
    const params = genre ? `?genre=${genre}` : '';
    const response = await apiClient.get<{ analysis: string; remixes: any[] }>(
      `/ai/trending${params}`
    );
    return response;
  },
};