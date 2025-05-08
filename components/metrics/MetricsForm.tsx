"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the form schema with zod
const metricFormSchema = z.object({
  key: z.string({
    required_error: "Please select a metric type",
  }),
  value: z.coerce.number({
    required_error: "Please enter a value",
    invalid_type_error: "Value must be a number",
  }).positive("Value must be positive"),
  unit: z.string().default(""),
  notes: z.string().default(""),
  recordedAt: z.date({
    required_error: "Please select a date",
  }),
});

// Infer the form values type from the schema
type MetricFormValues = z.infer<typeof metricFormSchema>;

type MetricFormProps = {
  onSuccess?: () => void;
  initialData?: {
    key?: string;
    value?: number;
    unit?: string;
    notes?: string;
    recordedAt?: Date;
  };
  userId?: string; // Optional userId for admin to create metrics for specific users
  isAdmin?: boolean; // Flag to indicate if the form is being used by an admin
};

export function MetricsForm({ onSuccess, initialData, userId, isAdmin = false }: MetricFormProps) {
  // Define the form with react-hook-form and zod validation
  const form = useForm<MetricFormValues>({
    resolver: zodResolver(metricFormSchema),
    defaultValues: {
      key: initialData?.key || "",
      value: initialData?.value || 0,
      unit: initialData?.unit || "",
      notes: initialData?.notes || "",
      recordedAt: initialData?.recordedAt || new Date(),
    },
    mode: "onChange",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const metricTypes = [
    { value: "WEIGHT", label: "Weight", defaultUnit: "kg" },
    { value: "HEIGHT", label: "Height", defaultUnit: "cm" },
    { value: "BODY_FAT", label: "Body Fat", defaultUnit: "%" },
    { value: "CHEST", label: "Chest", defaultUnit: "cm" },
    { value: "WAIST", label: "Waist", defaultUnit: "cm" },
    { value: "HIPS", label: "Hips", defaultUnit: "cm" },
    { value: "BICEPS", label: "Biceps", defaultUnit: "cm" },
    { value: "THIGHS", label: "Thighs", defaultUnit: "cm" },
    { value: "CUSTOM", label: "Custom", defaultUnit: "" },
  ];

  // Handle metric type change to set the default unit
  const handleMetricTypeChange = (selectedKey: string) => {
    const selectedType = metricTypes.find(type => type.value === selectedKey);
    if (selectedType) {
      form.setValue("key", selectedKey);
      form.setValue("unit", selectedType.defaultUnit);
    }
  };

  // Dialog state for success message
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Use client-side only for date initialization to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle form submission with proper type handling
  const onSubmit = async (data: MetricFormValues) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Use the appropriate endpoint based on whether it's an admin creating for a user or a user creating for themselves
      const endpoint = isAdmin && userId 
        ? `/api/admin/users/${userId}/metrics` 
        : "/api/users/me/metrics";
        
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: data.key,
          value: data.value,
          unit: data.unit,
          notes: data.notes,
          recordedAt: data.recordedAt,
          ...(isAdmin && userId && { userId })
        }),
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to record metric");
      }
      
      setSuccess("Metric recorded successfully!");
      setShowSuccessDialog(true);
      
      // Reset form if not editing
      if (!initialData) {
        form.reset({
          key: data.key, // Keep the same metric type selected
          value: 0,
          unit: data.unit, // Keep the same unit
          notes: "",
          recordedAt: new Date()
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent aria-describedby="metric-success-description" className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription id="metric-success-description">
              Metric recorded successfully!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
              {success}
            </div>
          )}
        
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Metric Type</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => handleMetricTypeChange(value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a metric type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {metricTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter value"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., kg, cm, %"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="recordedAt"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Date Recorded</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {mounted && field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start" side="bottom">
                  {mounted && (
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="rounded-md border"
                    />
                  )}
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Metric" : "Record Metric"}
        </Button>
      </form>
    </Form>
    </>
  );
}
