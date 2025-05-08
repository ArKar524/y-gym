"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricsForm } from "@/components/metrics/MetricsForm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
};

type Metric = {
  id: string;
  userId: string;
  key: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: Date;
  user?: {
    name: string;
    email: string;
  };
};

export function UserMetricsManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAllMetrics, setLoadingAllMetrics] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [metricSearchTerm, setMetricSearchTerm] = useState("");
  const [showAddMetricDialog, setShowAddMetricDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  const [metricToDelete, setMetricToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchUsers();
  }, []);
  
  // Fetch all metrics when the all metrics tab is active
  useEffect(() => {
    if (activeTab === "all") {
      fetchAllMetrics();
    }
  }, [activeTab]);
  
  // Function to fetch all metrics
  const fetchAllMetrics = async () => {
    setLoadingAllMetrics(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/metrics`);
      if (!response.ok) {
        throw new Error("Failed to fetch all metrics");
      }
      const data = await response.json();
      setAllMetrics(data.metrics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingAllMetrics(false);
    }
  };

  // Fetch metrics for selected user
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchUserMetrics = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/users/${selectedUserId}/metrics`);
        if (!response.ok) {
          throw new Error("Failed to fetch user metrics");
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
  }, [selectedUserId]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle metric deletion
  const handleDeleteMetric = async (metricId: string) => {
    if (!metricId) return;
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      const response = await fetch(`/api/admin/metrics/${metricId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete metric");
      }
      
      // Refresh metrics based on active tab
      if (activeTab === "individual" && selectedUserId) {
        const userMetricsResponse = await fetch(`/api/admin/users/${selectedUserId}/metrics`);
        if (userMetricsResponse.ok) {
          const data = await userMetricsResponse.json();
          setMetrics(data.metrics || []);
        }
      } else if (activeTab === "all") {
        fetchAllMetrics();
      }
      
      setMetricToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error deleting metric:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle metric form success
  const handleMetricAdded = () => {
    setShowAddMetricDialog(false);
    
    // Refresh metrics based on active tab
    if (activeTab === "individual" && selectedUserId) {
      const fetchUserMetrics = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/users/${selectedUserId}/metrics`);
          if (response.ok) {
            const data = await response.json();
            setMetrics(data.metrics || []);
          }
        } catch (error) {
          console.error("Error refreshing metrics:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserMetrics();
    } else if (activeTab === "all") {
      fetchAllMetrics();
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

  // Filter all metrics based on search term
  const filteredAllMetrics = allMetrics.filter(metric => {
    const userNameMatch = metric.user?.name?.toLowerCase().includes(metricSearchTerm.toLowerCase());
    const userEmailMatch = metric.user?.email?.toLowerCase().includes(metricSearchTerm.toLowerCase());
    const metricTypeMatch = getMetricDisplayName(metric.key).toLowerCase().includes(metricSearchTerm.toLowerCase());
    return metricSearchTerm === "" || userNameMatch || userEmailMatch || metricTypeMatch;
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual User</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-users">Search Users</Label>
                  <Input
                    id="search-users"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="select-user">Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger id="select-user" className="mt-1">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedUserId && (
            <Card className="bg-white mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Metrics</CardTitle>
                <Dialog open={showAddMetricDialog} onOpenChange={setShowAddMetricDialog}>
                  <DialogTrigger asChild>
                    <Button>Add Metric</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white" aria-describedby="add-metric-description">
                    <DialogHeader>
                      <DialogTitle>Add Metric for User</DialogTitle>
                      <DialogDescription id="add-metric-description">
                        Add a new metric measurement for this user.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <MetricsForm 
                        onSuccess={handleMetricAdded} 
                        userId={selectedUserId}
                        isAdmin={true}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
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
                    No metrics found for this user.
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
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All User Metrics</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search metrics or users"
                  value={metricSearchTerm}
                  onChange={(e) => setMetricSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button onClick={fetchAllMetrics} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAllMetrics ? (
                <div className="text-center py-4">Loading all metrics...</div>
              ) : error ? (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              ) : filteredAllMetrics.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No metrics found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Metric Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Date Recorded</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllMetrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell className="font-medium">
                            {metric.user ? `${metric.user.name} (${metric.user.email})` : metric.userId}
                          </TableCell>
                          <TableCell>{getMetricDisplayName(metric.key)}</TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
