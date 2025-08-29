import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { createLeadSchema, insertBookingSchema, insertPaymentSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get default merchant (for demo purposes)
  const DEFAULT_MERCHANT_ID = Array.from((storage as any).merchants.keys())[0] as string;

  // Lead management routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads(DEFAULT_MERCHANT_ID);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = createLeadSchema.parse({
        ...req.body,
        merchantId: DEFAULT_MERCHANT_ID,
      });
      
      const lead = await storage.createLead(leadData);
      
      // Create activity
      await storage.createActivity({
        merchantId: DEFAULT_MERCHANT_ID,
        type: "lead_created",
        description: `New lead from ${leadData.channel} channel`,
        entityId: lead.id,
        entityType: "lead",
      });

      res.json(lead);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid lead data" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  // Booking management routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings(DEFAULT_MERCHANT_ID);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      await storage.createActivity({
        merchantId: DEFAULT_MERCHANT_ID,
        type: "booking_created",
        description: `New booking created`,
        entityId: booking.id,
        entityType: "booking",
      });

      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid booking data" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const updates = req.body;
      const booking = await storage.updateBooking(req.params.id, updates);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Quote generation
  app.post("/api/quote", async (req, res) => {
    try {
      const { leadId } = req.body;
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const pricingRule = await storage.getPricingRule(lead.merchantId);
      if (!pricingRule) {
        return res.status(404).json({ error: "Pricing rule not found" });
      }

      // Calculate quote (simplified version)
      const floors = (lead.floorFrom || 0) + (lead.floorTo || 0) - 
                   (lead.elevFrom ? 1 : 0) - (lead.elevTo ? 1 : 0);
      const volumeCoeff = (pricingRule.volumeCoeff as any)[lead.volume || "M"] || 1;
      const distKm = 10; // Mock distance
      
      const basePrice = pricingRule.baseFee + 
                       (distKm * pricingRule.perKm) + 
                       (floors * pricingRule.perFloor);
      
      const finalPrice = basePrice * volumeCoeff;
      const quote = {
        min: Math.round(finalPrice * 0.9),
        max: Math.round(finalPrice * 1.15),
      };

      // Create or update booking
      const existingBooking = await storage.getBookingByLeadId(leadId);
      if (existingBooking) {
        await storage.updateBooking(existingBooking.id, {
          priceMin: quote.min,
          priceMax: quote.max,
          status: "quoted",
        });
      } else {
        await storage.createBooking({
          leadId,
          priceMin: quote.min,
          priceMax: quote.max,
          slotStart: new Date(),
          slotEnd: new Date(Date.now() + 2 * 3600 * 1000),
          status: "quoted",
          depositAmount: null,
          depositTxId: null,
        });
      }

      await storage.createActivity({
        merchantId: lead.merchantId,
        type: "quote_generated",
        description: `Quote generated for lead ${lead.name}`,
        entityId: leadId,
        entityType: "lead",
      });

      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getPayments(DEFAULT_MERCHANT_ID);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid payment data" });
    }
  });

  // Activities route
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities(DEFAULT_MERCHANT_ID);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Metrics route
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics(DEFAULT_MERCHANT_ID);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Calendar slots (mock implementation)
  app.get("/api/slots", async (req, res) => {
    try {
      const { date } = req.query;
      // Mock available slots
      const slots = [
        { start: "09:00", end: "11:00", available: true },
        { start: "11:00", end: "13:00", available: false },
        { start: "13:00", end: "15:00", available: true },
        { start: "15:00", end: "17:00", available: true },
      ];
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slots" });
    }
  });

  // Toss payment callback (mock)
  app.post("/api/payment/callback", async (req, res) => {
    try {
      const { paymentKey, orderId, amount } = req.body;
      
      // Mock payment processing
      console.log("Payment callback received:", { paymentKey, orderId, amount });
      
      // Update payment status
      const payments = Array.from((storage as any).payments.values()) as any[];
      const payment = payments.find((p: any) => p.tossOrderId === orderId);
      
      if (payment?.id) {
        await storage.updatePayment(payment.id, {
          status: "completed",
          tossPaymentKey: paymentKey,
        });

        await storage.createActivity({
          merchantId: DEFAULT_MERCHANT_ID,
          type: "payment_confirmed",
          description: `Payment confirmed for ₩${amount.toLocaleString()}`,
          entityId: payment.id,
          entityType: "payment",
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Payment callback failed" });
    }
  });

  // Kakao webhook (mock)
  app.post("/api/kakao/webhook", async (req, res) => {
    try {
      console.log("Kakao webhook received:", req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
