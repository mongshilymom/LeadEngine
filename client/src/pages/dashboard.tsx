import { useState } from "react";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentLeadsTable from "@/components/dashboard/recent-leads-table";
import ActivityFeed from "@/components/dashboard/activity-feed";
import IntegrationStatus from "@/components/dashboard/integration-status";
import NewLeadForm from "@/components/forms/new-lead-form";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Manage your leads and bookings"
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
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentLeadsTable />
          <ActivityFeed />
        </div>

        <IntegrationStatus />
      </div>

      <NewLeadForm
        open={showNewLeadForm}
        onOpenChange={setShowNewLeadForm}
      />
    </>
  );
}
