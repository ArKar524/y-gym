"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Logout failed");
        }

        // Redirect to login page after successful logout
        router.push("/login");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred during logout");
        // Still redirect to login after a short delay even if there's an error
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Signing Out...</h1>
        {error ? (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          </div>
        ) : (
          <p className="text-gray-600">Please wait while we log you out.</p>
        )}
      </div>
    </div>
  );
}
