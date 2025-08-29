import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import NewLeadForm from "@/components/forms/new-lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead, Booking } from "@shared/schema";

export default function Leads() {
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const getLeadStatus = (lead: Lead) => {
    const booking = bookings?.find(b => b.leadId === lead.id);
    if (booking?.status === "confirmed") return "Booked";
    if (booking?.status === "quoted") return "Quoted";
    return "New";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Booked": return "bg-green-100 text-green-800";
      case "Quoted": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Header
        title="Leads"
        subtitle="Manage all your leads and inquiries"
        action={
          <Button
            onClick={() => setShowNewLeadForm(true)}
            data-testid="button-create-new-lead"
          >
            <i className="fas fa-plus mr-2"></i>
            New Lead
          </Button>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leads?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <i className="fas fa-users text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">No leads yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first lead to begin managing inquiries.
                </p>
                <Button onClick={() => setShowNewLeadForm(true)} data-testid="button-create-first-lead">
                  Create First Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads?.map((lead) => {
              const booking = bookings?.find(b => b.leadId === lead.id);
              const status = getLeadStatus(lead);
              
              return (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" data-testid={`text-lead-name-${lead.id}`}>
                        {lead.name || "Unknown Customer"}
                      </CardTitle>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-muted-foreground" data-testid={`text-lead-phone-${lead.id}`}>
                      {lead.phone || "No phone number"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Channel:</span>
                        <span className="font-medium capitalize">{lead.channel}</span>
                      </div>
                      {lead.volume && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-medium">{lead.volume}</span>
                        </div>
                      )}
                      {booking?.priceMin && booking?.priceMax && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Quote:</span>
                          <span className="font-medium" data-testid={`text-quote-${lead.id}`}>
                            ₩{booking.priceMin.toLocaleString()} - ₩{booking.priceMax.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-lead-${lead.id}`}>
                        View Details
                      </Button>
                      {status === "New" && (
                        <Button size="sm" className="flex-1" data-testid={`button-quote-lead-${lead.id}`}>
                          Generate Quote
                        </Button>
                      )}
                      {status === "Quoted" && (
                        <Button size="sm" className="flex-1" data-testid={`button-book-lead-${lead.id}`}>
                          Confirm Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <NewLeadForm
        open={showNewLeadForm}
        onOpenChange={setShowNewLeadForm}
      />
    </>
  );
}
