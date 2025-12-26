// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Client
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Specific endpoints
  async uploadDocuments(folderPath: string) {
    return this.post('/api/upload', { folder_path: folderPath });
  }

  async searchDocuments(query: string, topK: number = 10) {
    return this.post('/api/search', { query, top_k: topK });
  }

  async getAllDocuments() {
    return this.get('/api/documents');
  }

  async getDocumentDetail(docId: number) {
    return this.get(`/api/document/${docId}`);
  }

  async getTFIDFMatrix() {
    return this.get('/api/tfidf-matrix');
  }

  async getHealthCheck() {
    return this.get('/');
  }
}

export const api = new APIClient(API_BASE_URL);
