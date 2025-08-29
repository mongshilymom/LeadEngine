import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { createLeadSchema, type CreateLead } from "@shared/schema";
import { api } from "@/lib/api";

interface NewLeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewLeadForm({ open, onOpenChange }: NewLeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateLead>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      channel: "",
      volume: "M",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: api.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateLead) => {
    createLeadMutation.mutate({
      ...data,
      origin: data.origin ? { address: data.origin } : undefined,
      dest: data.dest ? { address: data.dest } : undefined,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter customer name"
                data-testid="input-customer-name"
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...form.register("phone")}
                placeholder="010-1234-5678"
                data-testid="input-phone-number"
              />
              {form.formState.errors.phone && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select onValueChange={(value) => form.setValue("channel", value)}>
              <SelectTrigger data-testid="select-channel">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kakao">Kakao</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.channel && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.channel.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origin Address</Label>
              <Input
                id="origin"
                {...form.register("origin" as any)}
                placeholder="Current address"
                data-testid="input-origin-address"
              />
            </div>
            <div>
              <Label htmlFor="dest">Destination Address</Label>
              <Input
                id="dest"
                {...form.register("dest" as any)}
                placeholder="New address"
                data-testid="input-destination-address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="floorFrom">Origin Floor</Label>
              <Input
                id="floorFrom"
                type="number"
                {...form.register("floorFrom", { valueAsNumber: true })}
                placeholder="Floor"
                data-testid="input-origin-floor"
              />
            </div>
            <div>
              <Label htmlFor="floorTo">Dest Floor</Label>
              <Input
                id="floorTo"
                type="number"
                {...form.register("floorTo", { valueAsNumber: true })}
                placeholder="Floor"
                data-testid="input-dest-floor"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elevFrom"
                {...form.register("elevFrom")}
                data-testid="checkbox-origin-elevator"
              />
              <Label htmlFor="elevFrom" className="text-sm">Origin Elevator</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="elevTo"
                {...form.register("elevTo")}
                data-testid="checkbox-dest-elevator"
              />
              <Label htmlFor="elevTo" className="text-sm">Dest Elevator</Label>
            </div>
          </div>

          <div>
            <Label>Volume Size</Label>
            <RadioGroup
              defaultValue="M"
              onValueChange={(value) => form.setValue("volume", value as "S" | "M" | "L")}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              <div className="flex items-center p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <RadioGroupItem value="S" id="volume-s" className="mr-2" data-testid="radio-volume-small" />
                <Label htmlFor="volume-s" className="cursor-pointer">
                  <div className="font-medium text-foreground">Small</div>
                  <div className="text-xs text-muted-foreground">원룸/오피스텔</div>
                </Label>
              </div>
              <div className="flex items-center p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <RadioGroupItem value="M" id="volume-m" className="mr-2" data-testid="radio-volume-medium" />
                <Label htmlFor="volume-m" className="cursor-pointer">
                  <div className="font-medium text-foreground">Medium</div>
                  <div className="text-xs text-muted-foreground">투룸/쓰리룸</div>
                </Label>
              </div>
              <div className="flex items-center p-3 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors">
                <RadioGroupItem value="L" id="volume-l" className="mr-2" data-testid="radio-volume-large" />
                <Label htmlFor="volume-l" className="cursor-pointer">
                  <div className="font-medium text-foreground">Large</div>
                  <div className="text-xs text-muted-foreground">포룸 이상</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="preferredTime">Preferred Date & Time</Label>
            <Input
              id="preferredTime"
              type="datetime-local"
              {...form.register("preferredTime" as any)}
              data-testid="input-preferred-time"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-lead"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLeadMutation.isPending}
              data-testid="button-create-lead"
            >
              {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
