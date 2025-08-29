import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pricingRules = pgTable("pricing_rules", {
  merchantId: uuid("merchant_id").references(() => merchants.id).notNull(),
  baseFee: integer("base_fee").notNull().default(200000),
  perKm: integer("per_km").notNull().default(2000),
  perFloor: integer("per_floor").notNull().default(10000),
  volumeCoeff: jsonb("volume_coeff").notNull().default({"S": 1, "M": 1.15, "L": 1.35}),
  surgeRules: jsonb("surge_rules").notNull().default({}),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: uuid("merchant_id").references(() => merchants.id).notNull(),
  channel: text("channel").notNull(),
  name: text("name"),
  phone: text("phone"),
  origin: jsonb("origin"),
  dest: jsonb("dest"),
  floorFrom: integer("floor_from"),
  floorTo: integer("floor_to"),
  elevFrom: boolean("elev_from"),
  elevTo: boolean("elev_to"),
  volume: text("volume"),
  preferredTs: timestamp("preferred_ts"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: uuid("lead_id").references(() => leads.id),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  slotStart: timestamp("slot_start"),
  slotEnd: timestamp("slot_end"),
  status: text("status").default("tentative"),
  depositAmount: integer("deposit_amount"),
  depositTxId: text("deposit_tx_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  tossPaymentKey: text("toss_payment_key"),
  tossOrderId: text("toss_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: uuid("merchant_id").references(() => merchants.id).notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  entityId: uuid("entity_id"),
  entityType: text("entity_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true, createdAt: true });
export const insertPricingRuleSchema = createInsertSchema(pricingRules);
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Types
export type Merchant = typeof merchants.$inferSelect;
export type PricingRule = typeof pricingRules.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended schemas for forms
export const createLeadSchema = insertLeadSchema.extend({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  channel: z.string().min(1, "Channel is required"),
});

export type CreateLead = z.infer<typeof createLeadSchema>;
