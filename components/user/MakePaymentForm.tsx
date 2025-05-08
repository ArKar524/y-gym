"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Program {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  active: boolean;
}

export function MakePaymentForm() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "PAYPAL">("CARD");
  const [transactionRef, setTransactionRef] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Fetch available programs
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoadingPrograms(true);
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
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Generate a random transaction reference
  useEffect(() => {
    const generateTransactionRef = () => {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `TXN-${timestamp.substring(timestamp.length - 6)}-${random}`;
    };

    setTransactionRef(generateTransactionRef());
  }, []);

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const programId = e.target.value;
    const program = programs.find(p => p.id === programId) || null;
    setSelectedProgram(program);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value as "CASH" | "CARD" | "PAYPAL");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProgram) {
      setError('Please select a program');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/me/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgram.id,
          amount: selectedProgram.price,
          method: paymentMethod,
          transactionRef,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      setSuccess(true);
      
      // Redirect to payments page after successful payment
      setTimeout(() => {
        router.refresh();
        router.push('/dashboard/payments');
      }, 2000);
    } catch (err) {
      console.error('Error making payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p>You will be redirected to the payments page shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>
          Select a program and payment method to proceed.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="program">Select Program</Label>
            <select
              id="program"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedProgram?.id || ""}
              onChange={handleProgramChange}
              disabled={isLoadingPrograms || isLoading}
            >
              <option value="" disabled>
                {isLoadingPrograms ? "Loading programs..." : "Select a program"}
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} - {formatCurrency(program.price)}
                </option>
              ))}
            </select>
          </div>

          {selectedProgram && (
            <div className="border rounded-md p-3 bg-muted/20">
              <h3 className="font-medium mb-1">{selectedProgram.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedProgram.description}
              </p>
              <div className="flex justify-between text-sm">
                <span>Duration: {selectedProgram.duration} days</span>
                <span className="font-medium">
                  {formatCurrency(selectedProgram.price)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <select
              id="paymentMethod"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              disabled={isLoading}
            >
              <option value="CARD">Credit/Debit Card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionRef">Transaction Reference</Label>
            <Input
              id="transactionRef"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              disabled={true}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This is a unique reference for your payment.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/payments')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedProgram || isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                Processing...
              </>
            ) : (
              `Pay ${selectedProgram ? formatCurrency(selectedProgram.price) : ""}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
