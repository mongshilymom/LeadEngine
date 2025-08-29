import { apiRequest } from "./queryClient";

export interface LeadData {
  name: string;
  phone: string;
  channel: string;
  origin?: string;
  dest?: string;
  floorFrom?: number;
  floorTo?: number;
  elevFrom?: boolean;
  elevTo?: boolean;
  volume?: "S" | "M" | "L";
  preferredTime?: Date;
}

export interface QuoteResponse {
  min: number;
  max: number;
}

export const api = {
  // Leads
  createLead: async (leadData: LeadData) => {
    const response = await apiRequest("POST", "/api/leads", leadData);
    return response.json();
  },

  generateQuote: async (leadId: string): Promise<QuoteResponse> => {
    const response = await apiRequest("POST", "/api/quote", { leadId });
    return response.json();
  },

  // Bookings
  confirmBooking: async (bookingId: string) => {
    const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
      status: "confirmed"
    });
    return response.json();
  },

  // Payments
  createPayment: async (paymentData: any) => {
    const response = await apiRequest("POST", "/api/payments", paymentData);
    return response.json();
  },
};
