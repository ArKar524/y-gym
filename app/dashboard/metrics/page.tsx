"use client";

import { MetricsHistory } from "@/components/metrics/MetricsHistory";

export default function UserMetricsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Body Metrics</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track and monitor your physical measurements over time</p>
      </div>
      
      <MetricsHistory />
    </div>
  );
}
