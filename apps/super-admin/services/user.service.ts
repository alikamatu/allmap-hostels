import {
  User,
  UserFilters,
  UserStats,
  UserResponse,
  CreateUserData,
  UpdateUserData,
  UserRole,
  UserStatus,
} from "@/types/user.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1000";

function buildQueryString(params?: object): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

class UserService {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  }

  private getAuthHeaders(accept = "application/json") {
    const token = this.getAccessToken();
    return {
      "Content-Type": "application/json",
      Accept: accept,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private handleUnauthorized() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");
      window.location.href = "/sign-in";
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed (${response.status})`,
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    const qs = buildQueryString(filters);
    return this.request<UserResponse>(`/admin/users${qs ? `?${qs}` : ""}`);
  }

  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>("/admin/users/stats");
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}`);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.request<User>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.request<User>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    return this.request<User>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async verifyUser(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}/verify`, {
      method: "PATCH",
    });
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    return this.request<User>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  async sendVerificationEmail(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/admin/users/${id}/send-verification`,
      {
        method: "POST",
      },
    );
  }

  async bulkVerifyUsers(
    userIds: string[],
  ): Promise<{ verified: number; failed: string[] }> {
    return this.request<{ verified: number; failed: string[] }>(
      "/admin/users/bulk-verify",
      {
        method: "POST",
        body: JSON.stringify({ userIds }),
      },
    );
  }

  async bulkDeleteUsers(
    userIds: string[],
  ): Promise<{ deleted: number; failed: string[] }> {
    return this.request<{ deleted: number; failed: string[] }>(
      "/admin/users/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify({ userIds }),
      },
    );
  }

  async exportUsers(filters: UserFilters = {}): Promise<string> {
    const qs = buildQueryString(filters);
    return this.request<string>(`/admin/users/export${qs ? `?${qs}` : ""}`, {
      headers: this.getAuthHeaders("text/csv"),
    });
  }
}

export const userService = new UserService();
