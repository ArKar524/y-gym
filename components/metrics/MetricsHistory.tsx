"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MetricsForm } from "./MetricsForm";

type Metric = {
  id: string;
  key: string;
  value: number;
  unit: string | null;
  notes: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};

export function MetricsHistory() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetricType, setSelectedMetricType] = useState<string | null>(null);
  const [uniqueMetricTypes, setUniqueMetricTypes] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const url = selectedMetricType 
        ? `/api/users/me/metrics?key=${selectedMetricType}` 
        : '/api/users/me/metrics';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      // Check if data has metrics property (from our updated API)
      const metricsData = data.metrics || data;
      setMetrics(Array.isArray(metricsData) ? metricsData : []);
      
      // Extract unique metric types if not already set
      if (uniqueMetricTypes.length === 0 && Array.isArray(metricsData) && metricsData.length > 0) {
        const types = Array.from(new Set(metricsData.map((metric: Metric) => metric.key)));
        setUniqueMetricTypes(types);
        
        // Set default selected type if available
        if (types.length > 0 && !selectedMetricType) {
          setSelectedMetricType(types[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMetrics();
  }, [selectedMetricType]);
  
  const handleDeleteMetric = async (id: string) => {
    try {
      const response = await fetch(`/api/users/me/metrics/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete metric');
      }
      
      // Remove the deleted metric from the state
      setMetrics(metrics.filter(metric => metric.id !== id));
    } catch (err) {
      console.error('Error deleting metric:', err);
      setError('Failed to delete metric. Please try again.');
    }
  };
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchMetrics();
  };
  
  const handleEditSuccess = () => {
    setShowEditForm(false);
    setSelectedMetric(null);
    fetchMetrics();
  };
  
  const formatChartData = (data: Metric[]) => {
    // Ensure data is an array before filtering
    if (!Array.isArray(data)) {
      console.error('Expected metrics data to be an array, got:', data);
      return [];
    }
    
    return data
      .filter(metric => metric.key === selectedMetricType)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .map(metric => ({
        date: format(new Date(metric.recordedAt), 'MMM dd'),
        value: metric.value,
        unit: metric.unit || ''
      }));
  };
  
  const getMetricDisplayName = (key: string) => {
    const metricMap: Record<string, string> = {
      'WEIGHT': 'Weight',
      'HEIGHT': 'Height',
      'BODY_FAT': 'Body Fat',
      'CHEST': 'Chest',
      'WAIST': 'Waist',
      'HIPS': 'Hips',
      'BICEPS': 'Biceps',
      'THIGHS': 'Thighs'
    };
    
    return metricMap[key] || key;
  };
  
  const chartData = formatChartData(metrics);
  const currentUnit = metrics.find(m => m.key === selectedMetricType)?.unit || '';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Your Metrics</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedMetricType || ''} onValueChange={setSelectedMetricType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {uniqueMetricTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {getMetricDisplayName(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>Record New Metric</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Record New Measurement</DialogTitle>
              </DialogHeader>
              <MetricsForm onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metrics.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No metrics recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your progress by recording your first measurement
              </p>
              <Button onClick={() => setShowAddForm(true)}>Record Your First Metric</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>
                  {getMetricDisplayName(selectedMetricType || '')} Progress
                  {currentUnit && <span className="text-sm font-normal ml-2">({currentUnit})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} ${currentUnit}`, 'Value']} />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">No data available for this metric type</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 bg-muted/50 p-4 text-sm font-medium">
                    <div className="col-span-3">Date</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Value</div>
                    <div className="col-span-3">Notes</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  <div className="divide-y">
                    {metrics
                      .filter(metric => !selectedMetricType || metric.key === selectedMetricType)
                      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                      .map(metric => (
                        <div key={metric.id} className="grid grid-cols-12 p-4 text-sm items-center">
                          <div className="col-span-3">{format(new Date(metric.recordedAt), 'MMM dd, yyyy')}</div>
                          <div className="col-span-2">{getMetricDisplayName(metric.key)}</div>
                          <div className="col-span-2">
                            {metric.value} {metric.unit}
                          </div>
                          <div className="col-span-3 truncate">{metric.notes || '-'}</div>
                          <div className="col-span-2 flex justify-end gap-2">
                            <Dialog open={showEditForm && selectedMetric?.id === metric.id} onOpenChange={(open) => {
                              setShowEditForm(open);
                              if (!open) setSelectedMetric(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedMetric(metric)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] bg-white">
                                <DialogHeader>
                                  <DialogTitle>Edit Measurement</DialogTitle>
                                </DialogHeader>
                                {selectedMetric && (
                                  <MetricsForm
                                    onSuccess={handleEditSuccess}
                                    initialData={{
                                      key: selectedMetric.key,
                                      value: selectedMetric.value,
                                      unit: selectedMetric.unit || undefined,
                                      notes: selectedMetric.notes || undefined,
                                      recordedAt: new Date(selectedMetric.recordedAt)
                                    }}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Measurement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this measurement? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMetric(metric.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
