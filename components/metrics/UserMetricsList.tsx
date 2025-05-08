"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Metric = {
  id: string;
  key: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: Date;
};

export function UserMetricsList() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metricToDelete, setMetricToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch user metrics on component mount
  useEffect(() => {
    const fetchUserMetrics = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/users/me/metrics");
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data.metrics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();
  }, []);

  // Handle metric deletion
  const handleDeleteMetric = async (metricId: string) => {
    if (!metricId) return;
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const response = await fetch(`/api/users/me/metrics/${metricId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete metric");
      }
      
      // Remove the deleted metric from the state
      setMetrics(metrics.filter(metric => metric.id !== metricId));
      setMetricToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error deleting metric:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get metric type display name
  const getMetricDisplayName = (key: string) => {
    const metricTypes: Record<string, string> = {
      "WEIGHT": "Weight",
      "HEIGHT": "Height",
      "BODY_FAT": "Body Fat",
      "CHEST": "Chest",
      "WAIST": "Waist",
      "HIPS": "Hips",
      "BICEPS": "Biceps",
      "THIGHS": "Thighs"
    };
    
    return metricTypes[key] || key;
  };

  return (
    <Card className="bg-white mt-6">
      <CardHeader>
        <CardTitle>Your Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading metrics...</div>
        ) : error ? (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No metrics recorded yet. Use the form above to add your first metric.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Date Recorded</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">{getMetricDisplayName(metric.key)}</TableCell>
                    <TableCell>{metric.value}</TableCell>
                    <TableCell>{metric.unit}</TableCell>
                    <TableCell>{format(new Date(metric.recordedAt), "PPP")}</TableCell>
                    <TableCell>{metric.notes || "-"}</TableCell>
                    <TableCell>
                      <AlertDialog open={metricToDelete === metric.id} onOpenChange={(open) => !open && setMetricToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setMetricToDelete(metric.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Metric</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this metric? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          {deleteError && (
                            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">
                              {deleteError}
                            </div>
                          )}
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteMetric(metric.id);
                              }}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
