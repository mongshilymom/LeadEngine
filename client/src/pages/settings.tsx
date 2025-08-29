import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { PricingRule } from "@shared/schema";

const pricingRuleSchema = z.object({
  baseFee: z.number().min(0, "Base fee must be positive"),
  perKm: z.number().min(0, "Per km fee must be positive"),
  perFloor: z.number().min(0, "Per floor fee must be positive"),
  volumeCoeff: z.object({
    S: z.number().min(0),
    M: z.number().min(0),
    L: z.number().min(0),
  }),
});

type PricingRuleForm = z.infer<typeof pricingRuleSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Mock merchant ID - in real app this would come from auth context
  const DEFAULT_MERCHANT_ID = "default";

  const { data: pricingRule } = useQuery<PricingRule>({
    queryKey: ["/api/pricing-rules", DEFAULT_MERCHANT_ID],
    queryFn: async () => {
      // Mock API call - replace with actual API when available
      return {
        merchantId: DEFAULT_MERCHANT_ID,
        baseFee: 200000,
        perKm: 2000,
        perFloor: 10000,
        volumeCoeff: { S: 1, M: 1.15, L: 1.35 },
        surgeRules: {},
      };
    }
  });

  const pricingForm = useForm<PricingRuleForm>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      baseFee: pricingRule?.baseFee || 200000,
      perKm: pricingRule?.perKm || 2000,
      perFloor: pricingRule?.perFloor || 10000,
      volumeCoeff: {
        S: (pricingRule?.volumeCoeff as any)?.S || 1,
        M: (pricingRule?.volumeCoeff as any)?.M || 1.15,
        L: (pricingRule?.volumeCoeff as any)?.L || 1.35,
      },
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: PricingRuleForm) => {
      // Mock API call - replace with actual API when available
      console.log("Updating pricing rules:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing rules updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update pricing rules",
        variant: "destructive",
      });
    },
  });

  const onSubmitPricing = (data: PricingRuleForm) => {
    updatePricingMutation.mutate(data);
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your business configuration and integrations"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
            <TabsTrigger value="pricing" data-testid="tab-pricing">Pricing</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      defaultValue="Moving Pro Co."
                      data-testid="input-business-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      defaultValue="02-1234-5678"
                      data-testid="input-business-phone"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    defaultValue="서울시 강남구 테헤란로 123"
                    data-testid="input-business-address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    defaultValue="contact@movingpro.co.kr"
                    data-testid="input-business-email"
                  />
                </div>

                <Button data-testid="button-save-business-info">
                  Save Business Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Timezone</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure your business timezone
                    </p>
                  </div>
                  <select className="px-3 py-2 border border-input rounded-md bg-background" data-testid="select-timezone">
                    <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate quotes</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate quotes for new leads
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-auto-quotes" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-notifications" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Settings */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={pricingForm.handleSubmit(onSubmitPricing)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="baseFee">Base Fee (₩)</Label>
                      <Input
                        id="baseFee"
                        type="number"
                        {...pricingForm.register("baseFee", { valueAsNumber: true })}
                        data-testid="input-base-fee"
                      />
                      {pricingForm.formState.errors.baseFee && (
                        <p className="text-destructive text-sm mt-1">
                          {pricingForm.formState.errors.baseFee.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="perKm">Per Km Fee (₩)</Label>
                      <Input
                        id="perKm"
                        type="number"
                        {...pricingForm.register("perKm", { valueAsNumber: true })}
                        data-testid="input-per-km-fee"
                      />
                      {pricingForm.formState.errors.perKm && (
                        <p className="text-destructive text-sm mt-1">
                          {pricingForm.formState.errors.perKm.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="perFloor">Per Floor Fee (₩)</Label>
                      <Input
                        id="perFloor"
                        type="number"
                        {...pricingForm.register("perFloor", { valueAsNumber: true })}
                        data-testid="input-per-floor-fee"
                      />
                      {pricingForm.formState.errors.perFloor && (
                        <p className="text-destructive text-sm mt-1">
                          {pricingForm.formState.errors.perFloor.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Volume Multipliers</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adjust pricing based on move size
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="volumeS">Small (원룸/오피스텔)</Label>
                        <Input
                          id="volumeS"
                          type="number"
                          step="0.01"
                          {...pricingForm.register("volumeCoeff.S", { valueAsNumber: true })}
                          data-testid="input-volume-small"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="volumeM">Medium (투룸/쓰리룸)</Label>
                        <Input
                          id="volumeM"
                          type="number"
                          step="0.01"
                          {...pricingForm.register("volumeCoeff.M", { valueAsNumber: true })}
                          data-testid="input-volume-medium"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="volumeL">Large (포룸 이상)</Label>
                        <Input
                          id="volumeL"
                          type="number"
                          step="0.01"
                          {...pricingForm.register("volumeCoeff.L", { valueAsNumber: true })}
                          data-testid="input-volume-large"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updatePricingMutation.isPending}
                    data-testid="button-save-pricing"
                  >
                    {updatePricingMutation.isPending ? "Saving..." : "Save Pricing Rules"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-credit-card text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Toss Payments</p>
                      <p className="text-sm text-muted-foreground">Accept online payments</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <i className="fas fa-check mr-1"></i>
                    Connected
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tossApiKey">Toss API Secret Key</Label>
                  <Input
                    id="tossApiKey"
                    type="password"
                    placeholder="test_sk_***"
                    data-testid="input-toss-api-key"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your Toss Payments secret key for processing transactions
                  </p>
                </div>

                <Button data-testid="button-save-toss-settings">
                  Save Toss Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar text-green-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Sync appointments and availability</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <i className="fas fa-sync mr-1"></i>
                    Synced
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendarId">Calendar ID</Label>
                  <Input
                    id="calendarId"
                    defaultValue="primary"
                    data-testid="input-calendar-id"
                  />
                  <p className="text-sm text-muted-foreground">
                    Google Calendar ID to sync appointments with
                  </p>
                </div>

                <Button data-testid="button-reconnect-calendar">
                  Reconnect Google Calendar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messaging Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-comment text-yellow-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Kakao Business</p>
                      <p className="text-sm text-muted-foreground">Receive leads from Kakao channels</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <i className="fas fa-link mr-1"></i>
                    Configured
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kakaoToken">Kakao Verify Token</Label>
                  <Input
                    id="kakaoToken"
                    type="password"
                    placeholder="webhook_verify_token"
                    data-testid="input-kakao-token"
                  />
                  <p className="text-sm text-muted-foreground">
                    Token used to verify Kakao webhook requests
                  </p>
                </div>

                <Button data-testid="button-save-kakao-settings">
                  Save Kakao Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Lead Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new leads are created
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-new-lead-notifications" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when payments are completed
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-payment-notifications" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders before scheduled appointments
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-booking-reminders" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily activity summaries
                    </p>
                  </div>
                  <Switch data-testid="switch-daily-summary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Urgent Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS for urgent issues and failures
                    </p>
                  </div>
                  <Switch data-testid="switch-sms-urgent" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Customer Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS when customers send messages
                    </p>
                  </div>
                  <Switch data-testid="switch-sms-customer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsNumber">SMS Phone Number</Label>
                  <Input
                    id="smsNumber"
                    type="tel"
                    placeholder="010-1234-5678"
                    data-testid="input-sms-number"
                  />
                </div>

                <Button data-testid="button-save-sms-settings">
                  Save SMS Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
