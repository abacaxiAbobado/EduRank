import { 
  User, Quiz, QuizSubmissionResult, EducationalContent, AdminLog 
} from '../types.js';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('edurank_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    // If the account has been suspended, the API will output standard details
    if (response.status === 403 && data.suspended) {
      throw {
        suspended: true,
        message: data.error || 'Sua conta está suspensa.',
        reason: data.reason,
        endsAt: data.endsAt,
      };
    }
    throw new Error(data.error || 'Ocorreu um erro inesperado de comunicação.');
  }
  
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  // Users / Profile
  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  async updateProfile(name?: string, avatar?: string | null, removeAvatar?: boolean): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, avatar, removeAvatar }),
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  async getRanking(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/ranking`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Quiz[]>(res);
  },

  async getQuizById(id: string): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Quiz>(res);
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'authorName' | 'authorId' | 'createdAt'>): Promise<{ message: string; quizId: string }> {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(quiz),
    });
    return handleResponse<{ message: string; quizId: string }>(res);
  },

  async editQuiz(id: string, quiz: Partial<Quiz>): Promise<{ message: string; quizId: string }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(quiz),
    });
    return handleResponse<{ message: string; quizId: string }>(res);
  },

  async deleteQuiz(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async submitQuizAnswers(id: string, answers: (number | null)[]): Promise<QuizSubmissionResult> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers }),
    });
    return handleResponse<QuizSubmissionResult>(res);
  },

  // Educational Content
  async getContents(): Promise<EducationalContent[]> {
    const res = await fetch(`${API_BASE}/contents`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<EducationalContent[]>(res);
  },

  async createContent(content: Omit<EducationalContent, 'id' | 'authorName' | 'authorId' | 'createdAt' | 'htmlContent'>): Promise<{ message: string; contentId: string }> {
    const res = await fetch(`${API_BASE}/contents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse<{ message: string; contentId: string }>(res);
  },

  async editContent(id: string, content: Partial<EducationalContent>): Promise<{ message: string; contentId: string }> {
    const res = await fetch(`${API_BASE}/contents/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse<{ message: string; contentId: string }>(res);
  },

  async deleteContent(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/contents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Admin Dashboard Controls
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  async suspendUser(userId: string, reason: string, endsAt?: string | null): Promise<{ message: string; user: any }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, endsAt }),
    });
    return handleResponse<{ message: string; user: any }>(res);
  },

  async unsuspendUser(userId: string): Promise<{ message: string; user: any }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/unsuspend`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string; user: any }>(res);
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    const res = await fetch(`${API_BASE}/admin/logs`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<AdminLog[]>(res);
  }
};
