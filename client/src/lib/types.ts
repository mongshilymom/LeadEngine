export interface DashboardMetrics {
  totalLeads: number;
  confirmedBookings: number;
  revenue: number;
  conversionRate: number;
  leadsGrowth: number;
  bookingsGrowth: number;
  revenueGrowth: number;
  conversionChange: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
  entityId?: string;
  entityType?: string;
}

export interface LeadWithBooking {
  id: string;
  name?: string;
  phone?: string;
  channel: string;
  status: "new" | "quoted" | "booked" | "completed";
  priceMin?: number;
  priceMax?: number;
  createdAt: Date;
}
