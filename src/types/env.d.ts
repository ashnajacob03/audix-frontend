declare module '@/services/adminApi' {
  interface AdminUser {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    accountType: 'free' | 'premium' | 'family' | 'student';
    isEmailVerified: boolean;
    isAdmin: boolean;
    joinedAt: string;
    lastLogin: string;
    isActive: boolean;
  }

  interface AdminUsersData {
    users: AdminUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }

  const adminApi: {
    getUsers: (params?: { page?: number; limit?: number; search?: string }) => Promise<AdminUsersData>;
    updateUser: (userId: string, updates: any) => Promise<any>;
    getDashboardStats: () => Promise<any>;
    getAnalytics: (timeRange?: string) => Promise<any>;
    getSystemStatus: () => Promise<any>;
  };

  export default adminApi;
}
