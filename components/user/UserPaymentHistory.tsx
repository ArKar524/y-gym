"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: "CASH" | "CARD" | "PAYPAL";
  transactionRef: string;
  paidAt: string;
  createdAt: string;
}

export function UserPaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);

  // Fetch user payments
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users/me/payments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to load payment history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const viewPaymentDetails = (payment: Payment) => {
    setViewPayment(payment);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Membership & Payments</h1>
        <p className="text-muted-foreground mt-1">View your payment history and membership details</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Membership Status</CardTitle>
            <CardDescription>Your current membership details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-medium">{formatDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Payment</span>
                <span className="font-medium">{formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Overview of your payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payments</span>
                <span className="font-medium">{payments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Payment</span>
                <span className="font-medium">
                  {payments.length > 0 
                    ? formatDate(new Date(payments[0].paidAt)) 
                    : 'No payments yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                {payments.length > 0 ? (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${payments[0].method === 'CASH' ? 'bg-green-100 text-green-800' : 
                      payments[0].method === 'CARD' ? 'bg-blue-100 text-blue-800' : 
                      'bg-purple-100 text-purple-800'}`
                  }>
                    {payments[0].method}
                  </span>
                ) : (
                  <span className="font-medium">N/A</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Fee</span>
                <span className="font-medium">{formatCurrency(49.99)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">
                If you have any questions about your membership or payments, please contact our support team.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Call Support
                </Button>
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payment History</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard/payments/make'}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Make Payment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/10">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <h3 className="text-lg font-medium">No payment records found</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            You haven't made any payments yet. When you make a payment, it will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="rounded-md border overflow-hidden hidden md:block">
            <div className="grid grid-cols-5 bg-muted/50 p-4 font-medium">
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-1">Reference</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div>
              {payments.map(payment => (
                <div key={payment.id} className="grid grid-cols-5 p-4 border-t items-center">
                  <div className="col-span-1">
                    {formatDate(new Date(payment.paidAt))}
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
                  <div className="col-span-1 font-mono text-xs truncate">
                    {payment.transactionRef}
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
          </div>

          {/* Mobile view */}
          <div className="space-y-4 md:hidden">
            {payments.map(payment => (
              <div key={payment.id} className="border rounded-lg overflow-hidden bg-card">
                <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                  <div className="font-medium">{formatDate(new Date(payment.paidAt))}</div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => viewPaymentDetails(payment)}
                    className="h-8 w-8 -mr-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-2">
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
                    <span className="text-sm text-muted-foreground">Reference:</span>
                    <span className="font-mono text-xs truncate max-w-[150px]">{payment.transactionRef}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(viewPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p>{viewPayment.method}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Reference</p>
                <p className="font-mono text-sm break-all">{viewPayment.transactionRef}</p>
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
    </div>
  );
}
