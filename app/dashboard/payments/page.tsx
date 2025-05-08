import { UserPaymentHistory } from "@/components/user/UserPaymentHistory";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
      <UserPaymentHistory />
    </div>
  );
}
