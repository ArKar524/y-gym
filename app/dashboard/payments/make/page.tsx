import { MakePaymentForm } from "@/components/user/MakePaymentForm";

export default function MakePaymentPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Make a Payment</h1>
        <p className="text-muted-foreground mt-1">Select a program and complete your payment</p>
      </div>
      
      <MakePaymentForm />
    </div>
  );
}
