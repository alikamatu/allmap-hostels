import {
  BookingRecord,
  BookingStats,
  BookingFilters,
  BookingPagination,
} from "@/types/booking.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1000";

function buildQueryString(params?: object): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.append(key, String(v));
        }
      });
    } else {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

class BookingService {
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
      const errorData = await response.json().catch(() => null);
      const errorText =
        errorData?.message || (await response.text().catch(() => ""));
      throw new Error(errorText || `Request failed (${response.status})`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text() as unknown as T;
  }

  async getBookings(filters?: BookingFilters): Promise<{
    bookings: BookingRecord[];
    pagination: BookingPagination;
  }> {
    const qs = buildQueryString(filters);
    return this.request(`/admin/bookings${qs ? `?${qs}` : ""}`);
  }

  async getBookingStats(): Promise<BookingStats> {
    return this.request<BookingStats>("/admin/bookings/stats");
  }

  async getBookingById(id: string): Promise<BookingRecord> {
    return this.request<BookingRecord>(`/admin/bookings/${id}`);
  }

  async getUpcomingCheckIns(days: number = 7): Promise<BookingRecord[]> {
    const qs = buildQueryString({ days });
    return this.request<BookingRecord[]>(
      `/admin/bookings/upcoming/checkins?${qs}`,
    );
  }

  async getUpcomingCheckOuts(days: number = 7): Promise<BookingRecord[]> {
    const qs = buildQueryString({ days });
    return this.request<BookingRecord[]>(
      `/admin/bookings/upcoming/checkouts?${qs}`,
    );
  }

  async getOverdueBookings(): Promise<BookingRecord[]> {
    return this.request<BookingRecord[]>("/admin/bookings/overdue");
  }

  async updateBookingStatus(
    id: string,
    status: string,
    notes?: string,
  ): Promise<BookingRecord> {
    return this.request<BookingRecord>(`/admin/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
  ): Promise<BookingRecord> {
    return this.request<BookingRecord>(`/admin/bookings/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
  }

  async addPayment(
    id: string,
    data: {
      amount: number;
      paymentMethod: string;
      transactionRef: string;
      notes?: string;
    },
  ): Promise<{ booking: BookingRecord; payment: unknown }> {
    return this.request<{ booking: BookingRecord; payment: unknown }>(
      `/admin/bookings/${id}/payments`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async getBookingPayments(id: string): Promise<unknown[]> {
    return this.request<unknown[]>(`/admin/bookings/${id}/payments`);
  }

  async exportBookings(filters?: BookingFilters): Promise<string> {
    const qs = buildQueryString(filters);
    return this.request<string>(
      `/admin/bookings/export/csv${qs ? `?${qs}` : ""}`,
      {
        headers: this.getAuthHeaders("text/csv"),
      },
    );
  }
}

export const bookingService = new BookingService();
