// API Service Layer - Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Catch {
  id: number;
  species: string;
  weight: number;
  length: number;
  location: string;
  date: string;
  time: string;
  weather: string;
  baitUsed?: string;
  photoUrl?: string;
}

interface FishingSpot {
  id: number;
  name: string;
  catches: number;
  rating: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

interface Weather {
  temp: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  pressure: number;
  humidity: number;
  visibility: number;
  fishingCondition?: string;
  sunrise?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Catches API
  async getCatches(): Promise<Catch[]> {
    return this.request<Catch[]>('/catches');
  }

  async getCatch(id: number): Promise<Catch> {
    return this.request<Catch>(`/catches/${id}`);
  }

  async createCatch(data: Omit<Catch, 'id'>): Promise<Catch> {
    return this.request<Catch>('/catches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCatch(id: number, data: Partial<Catch>): Promise<Catch> {
    return this.request<Catch>(`/catches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCatch(id: number): Promise<void> {
    return this.request<void>(`/catches/${id}`, {
      method: 'DELETE',
    });
  }

  // Spots API
  async getSpots(): Promise<FishingSpot[]> {
    return this.request<FishingSpot[]>('/spots');
  }

  async getSpot(id: number): Promise<FishingSpot> {
    return this.request<FishingSpot>(`/spots/${id}`);
  }

  async createSpot(data: Omit<FishingSpot, 'id'>): Promise<FishingSpot> {
    return this.request<FishingSpot>('/spots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Weather API
  async getCurrentWeather(): Promise<Weather> {
    return this.request<Weather>('/weather/current');
  }

  async getWeatherForecast(): Promise<{ today: Weather; tomorrow: Weather; dayAfter: Weather }> {
    return this.request('/weather/forecast');
  }
}

export const api = new ApiService();
export type { Catch, FishingSpot, Weather };
