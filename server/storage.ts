import { 
  type Lead, type InsertLead, type Booking, type InsertBooking,
  type Payment, type InsertPayment, type Activity, type InsertActivity,
  type Merchant, type InsertMerchant, type PricingRule, type InsertPricingRule
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Merchants
  getMerchant(id: string): Promise<Merchant | undefined>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  
  // Pricing Rules
  getPricingRule(merchantId: string): Promise<PricingRule | undefined>;
  createPricingRule(rule: InsertPricingRule): Promise<PricingRule>;
  
  // Leads
  getLeads(merchantId: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined>;
  
  // Bookings
  getBookings(merchantId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingByLeadId(leadId: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  
  // Payments
  getPayments(merchantId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  
  // Activities
  getActivities(merchantId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Metrics
  getMetrics(merchantId: string): Promise<{
    totalLeads: number;
    confirmedBookings: number;
    revenue: number;
    conversionRate: number;
    leadsGrowth: number;
    bookingsGrowth: number;
    revenueGrowth: number;
    conversionChange: number;
  }>;
}

export class MemStorage implements IStorage {
  private merchants: Map<string, Merchant> = new Map();
  private pricingRules: Map<string, PricingRule> = new Map();
  private leads: Map<string, Lead> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private payments: Map<string, Payment> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default merchant
    const merchantId = randomUUID();
    const merchant: Merchant = {
      id: merchantId,
      name: "Moving Pro Co.",
      createdAt: new Date(),
    };
    this.merchants.set(merchantId, merchant);

    // Create pricing rule
    const pricingRule: PricingRule = {
      merchantId,
      baseFee: 200000,
      perKm: 2000,
      perFloor: 10000,
      volumeCoeff: { "S": 1, "M": 1.15, "L": 1.35 },
      surgeRules: {},
    };
    this.pricingRules.set(merchantId, pricingRule);

    // Create sample leads
    const lead1Id = randomUUID();
    const lead1: Lead = {
      id: lead1Id,
      merchantId,
      channel: "kakao",
      name: "김소영",
      phone: "010-1234-5678",
      origin: { address: "서울시 강남구" },
      dest: { address: "서울시 서초구" },
      floorFrom: 3,
      floorTo: 5,
      elevFrom: false,
      elevTo: true,
      volume: "M",
      preferredTs: new Date(),
      createdAt: new Date(),
    };
    this.leads.set(lead1Id, lead1);

    const lead2Id = randomUUID();
    const lead2: Lead = {
      id: lead2Id,
      merchantId,
      channel: "website",
      name: "이민수",
      phone: "010-9876-5432",
      origin: { address: "서울시 마포구" },
      dest: { address: "서울시 종로구" },
      floorFrom: 2,
      floorTo: 7,
      elevFrom: true,
      elevTo: true,
      volume: "L",
      preferredTs: new Date(),
      createdAt: new Date(),
    };
    this.leads.set(lead2Id, lead2);

    // Create bookings
    const booking1Id = randomUUID();
    const booking1: Booking = {
      id: booking1Id,
      leadId: lead1Id,
      priceMin: 320000,
      priceMax: 380000,
      slotStart: new Date(),
      slotEnd: new Date(Date.now() + 2 * 3600 * 1000),
      status: "quoted",
      depositAmount: null,
      depositTxId: null,
      createdAt: new Date(),
    };
    this.bookings.set(booking1Id, booking1);

    const booking2Id = randomUUID();
    const booking2: Booking = {
      id: booking2Id,
      leadId: lead2Id,
      priceMin: 450000,
      priceMax: 520000,
      slotStart: new Date(),
      slotEnd: new Date(Date.now() + 2 * 3600 * 1000),
      status: "confirmed",
      depositAmount: 50000,
      depositTxId: "toss_tx_123",
      createdAt: new Date(),
    };
    this.bookings.set(booking2Id, booking2);

    // Create activities
    const activities = [
      {
        id: randomUUID(),
        merchantId,
        type: "lead_created",
        description: "New lead from Kakao channel",
        entityId: lead1Id,
        entityType: "lead",
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: randomUUID(),
        merchantId,
        type: "payment_confirmed",
        description: "Payment confirmed for booking #1234",
        entityId: booking2Id,
        entityType: "booking",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: randomUUID(),
        merchantId,
        type: "calendar_blocked",
        description: "Calendar slot blocked for tomorrow",
        entityId: null,
        entityType: "calendar",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    ];

    activities.forEach(activity => {
      this.activities.set(activity.id, activity as Activity);
    });
  }

  async getMerchant(id: string): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async createMerchant(merchant: InsertMerchant): Promise<Merchant> {
    const id = randomUUID();
    const newMerchant: Merchant = { ...merchant, id, createdAt: new Date() };
    this.merchants.set(id, newMerchant);
    return newMerchant;
  }

  async getPricingRule(merchantId: string): Promise<PricingRule | undefined> {
    return this.pricingRules.get(merchantId);
  }

  async createPricingRule(rule: InsertPricingRule): Promise<PricingRule> {
    const pricingRule: PricingRule = {
      ...rule,
      baseFee: rule.baseFee ?? 200000,
      perKm: rule.perKm ?? 2000,
      perFloor: rule.perFloor ?? 10000,
      volumeCoeff: rule.volumeCoeff ?? { "S": 1, "M": 1.15, "L": 1.35 },
      surgeRules: rule.surgeRules ?? {}
    };
    this.pricingRules.set(rule.merchantId, pricingRule);
    return pricingRule;
  }

  async getLeads(merchantId: string): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(lead => lead.merchantId === merchantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const newLead: Lead = { 
      ...lead, 
      id, 
      createdAt: new Date(),
      name: lead.name ?? null,
      phone: lead.phone ?? null,
      origin: lead.origin ?? null,
      dest: lead.dest ?? null,
      floorFrom: lead.floorFrom ?? null,
      floorTo: lead.floorTo ?? null,
      elevFrom: lead.elevFrom ?? null,
      elevTo: lead.elevTo ?? null,
      volume: lead.volume ?? null,
      preferredTs: lead.preferredTs ?? null
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async getBookings(merchantId: string): Promise<Booking[]> {
    const merchantLeads = await this.getLeads(merchantId);
    const leadIds = new Set(merchantLeads.map(lead => lead.id));
    
    return Array.from(this.bookings.values())
      .filter(booking => booking.leadId && leadIds.has(booking.leadId))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingByLeadId(leadId: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(booking => booking.leadId === leadId);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date(),
      status: booking.status ?? "tentative",
      leadId: booking.leadId ?? null,
      priceMin: booking.priceMin ?? null,
      priceMax: booking.priceMax ?? null,
      slotStart: booking.slotStart ?? null,
      slotEnd: booking.slotEnd ?? null,
      depositAmount: booking.depositAmount ?? null,
      depositTxId: booking.depositTxId ?? null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getPayments(merchantId: string): Promise<Payment[]> {
    const merchantBookings = await this.getBookings(merchantId);
    const bookingIds = new Set(merchantBookings.map(booking => booking.id));
    
    return Array.from(this.payments.values())
      .filter(payment => bookingIds.has(payment.bookingId))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const newPayment: Payment = { 
      ...payment, 
      id, 
      createdAt: new Date(),
      status: payment.status ?? "pending",
      tossPaymentKey: payment.tossPaymentKey ?? null,
      tossOrderId: payment.tossOrderId ?? null
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getActivities(merchantId: string, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.merchantId === merchantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: new Date(),
      entityId: activity.entityId ?? null,
      entityType: activity.entityType ?? null
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getMetrics(merchantId: string) {
    const leads = await this.getLeads(merchantId);
    const bookings = await this.getBookings(merchantId);
    const payments = await this.getPayments(merchantId);

    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
    const revenue = payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalLeads: leads.length,
      confirmedBookings,
      revenue,
      conversionRate: leads.length > 0 ? Math.round((confirmedBookings / leads.length) * 100) : 0,
      leadsGrowth: 12,
      bookingsGrowth: 8,
      revenueGrowth: 23,
      conversionChange: -2,
    };
  }
}

export const storage = new MemStorage();
