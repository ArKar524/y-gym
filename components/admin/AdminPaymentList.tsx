"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Program {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  active: boolean;
}

interface Payment {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  programId?: string;
  program?: {
    id: string;
    name: string;
    price: number;
  };
  amount: number;
  method: "CASH" | "CARD" | "PAYPAL";
  transactionRef: string;
  paidAt: string;
  createdAt: string;
}

export function AdminPaymentList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for adding a new payment
  const [newPayment, setNewPayment] = useState({
    userId: '',
    programId: '',
    amount: '',
    method: 'CASH' as 'CASH' | 'CARD' | 'PAYPAL',
    transactionRef: '',
  });
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    }
  };

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = selectedUserId === 'all' 
        ? '/api/admin/payments' 
        : `/api/admin/payments?userId=${selectedUserId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      
      // Map user names to payments
      const paymentsWithUserDetails = data.map((payment: Payment) => {
        const user = users.find(u => u.id === payment.userId);
        return {
          ...payment,
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || 'No Email'
        };
      });
      
      setPayments(paymentsWithUserDetails);
    } catch (err) {
      console.log(err);
      setError('Failed to load payments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, users]);

  // Fetch all programs
  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      
      const data = await response.json();
      // Filter only active programs
      const activePrograms = data.filter((program: Program) => program.active);
      setPrograms(activePrograms);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs. Please try again later.');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchPayments();
    }
  }, [fetchPayments, users]);

  const viewPaymentDetails = (payment: Payment) => {
    setViewPayment(payment);
  };

  const handleProgramChange = (programId: string) => {
    
    const program = programs.find(p => p.id === programId) || null;
    setSelectedProgram(program);
    setNewPayment({
      ...newPayment,
      programId,
      amount: program ? program.price.toString() : newPayment.amount
    });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPayment.userId || !newPayment.programId || !newPayment.method || !newPayment.transactionRef) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newPayment.userId,
          programId: newPayment.programId,
          amount: parseFloat(newPayment.amount),
          method: newPayment.method,
          transactionRef: newPayment.transactionRef,
        }),
      });
      
      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to add payment');
      }
      
      // Reset form and close dialog
      setNewPayment({
        userId: '',
        programId: '',
        amount: '',
        method: 'CASH',
        transactionRef: '',
      });
      setSelectedProgram(null);
      setIsAddDialogOpen(false);
      
      // Refresh payments
      fetchPayments();
    } catch (err) {
      console.log(err)
      console.error('Error adding payment:', err);
      setError('Failed to add payment. Please try again.');
    }
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.userName?.toLowerCase().includes(searchLower) ||
      payment.userEmail?.toLowerCase().includes(searchLower) ||
      payment.transactionRef.toLowerCase().includes(searchLower) ||
      payment.amount.toString().includes(searchQuery)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="space-y-4 md:space-y-0 md:flex md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-row">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Users</SelectItem>
                {users?.length > 0 ? users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">No payments found</h3>
          <p className="text-muted-foreground mt-1">
            {selectedUserId === 'all' 
              ? 'No payments have been recorded yet' 
              : 'This user has no payment records'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop view */}
          <div className="rounded-md border hidden md:block">
            <div className="grid grid-cols-7 bg-muted/50 p-4 font-medium">
              <div className="col-span-1">User</div>
              <div className="col-span-2">Program</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {filteredPayments.map(payment => (
              <div key={payment.id} className="grid grid-cols-7 p-4 border-t items-center">
                <div className="col-span-1">
                  <div className="font-medium">{payment.userName}</div>
                  <div className="text-sm text-muted-foreground truncate">{payment.userEmail}</div>
                </div>
                <div className="col-span-2">
                  {payment.program ? (
                    <div className="space-y-1">
                      <div className="font-medium text-primary">{payment.program.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Program Price: {formatCurrency(payment.program.price)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">No program</span>
                  )}
                </div>
                <div className="col-span-1 text-right font-medium">
                  {formatCurrency(payment.amount)}
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${payment.method === 'CASH' ? 'bg-green-100 text-green-800' : 
                      payment.method === 'CARD' ? 'bg-blue-100 text-blue-800' : 
                      'bg-purple-100 text-purple-800'}`
                  }>
                    {payment.method}
                  </span>
                </div>
                <div className="col-span-1 text-sm">
                  {formatDate(new Date(payment.paidAt))}
                </div>
                <div className="col-span-1 text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => viewPaymentDetails(payment)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile view */}
          <div className="space-y-4 md:hidden">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="border rounded-lg overflow-hidden bg-card">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{payment.userName}</div>
                      <div className="text-sm text-muted-foreground">{payment.userEmail}</div>
                      {payment.program && (
                        <div className="text-xs text-primary-foreground bg-primary/80 rounded px-1.5 py-0.5 inline-block mt-1">
                          {payment.program.name}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => viewPaymentDetails(payment)}
                      className="h-8 w-8 -mt-1 -mr-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {payment.program && (
                    <div className="border-b pb-2 mb-2">
                      <div className="font-medium text-primary mb-1">{payment.program.name}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Program Price:</span>
                        <span>{formatCurrency(payment.program.price)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Method:</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${payment.method === 'CASH' ? 'bg-green-100 text-green-800' : 
                        payment.method === 'CARD' ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'}`
                    }>
                      {payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm">{formatDate(new Date(payment.paidAt))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Details Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={(open) => !open && setViewPayment(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          
          {viewPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="break-words">{viewPayment.userName}</p>
                  <p className="text-sm text-muted-foreground break-words">{viewPayment.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(viewPayment.amount)}</p>
                </div>
              </div>
              
              {viewPayment.program && (
                <div className="border rounded-md p-3 bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Program</p>
                  <p className="font-medium">{viewPayment.program.name}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Program Price:</span>
                    <span>{formatCurrency(viewPayment.program.price)}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p>{viewPayment.method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction Reference</p>
                  <p className="font-mono text-sm break-all">{viewPayment.transactionRef}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                  <p>{formatDate(new Date(viewPayment.paidAt))}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record Created</p>
                  <p>{formatDate(new Date(viewPayment.createdAt))}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddPayment}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">Member</Label>
                <Select 
                  value={newPayment.userId} 
                  onValueChange={(value) => setNewPayment({...newPayment, userId: value})}
                >
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {users.filter(user => user.role !== 'ADMIN').map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="programId">Program <span className="text-destructive">*</span></Label>
                <Select 
                  value={newPayment.programId} 
                  onValueChange={handleProgramChange}
                >
                  <SelectTrigger id="programId">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} - ${program.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  disabled={selectedProgram !== null}
                />
                {selectedProgram && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount is set to the program price.
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select 
                  value={newPayment.method} 
                  onValueChange={(value: 'CASH' | 'CARD' | 'PAYPAL') => 
                    setNewPayment({...newPayment, method: value})
                  }
                >
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transactionRef">Transaction Reference</Label>
                <Input 
                  id="transactionRef" 
                  placeholder="Enter transaction reference" 
                  value={newPayment.transactionRef}
                  onChange={(e) => setNewPayment({...newPayment, transactionRef: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
