import type { DashboardSummary } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";

interface SummaryCardsProps {
  data: DashboardSummary;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total secrets"
        value={data.total_secrets}
        description="Registered metadata rows across environments."
      />
      <StatCard
        title="Dev"
        value={data.dev_secrets}
        description="Non-production workload scope."
      />
      <StatCard
        title="Staging"
        value={data.staging_secrets}
        description="Pre-production validation footprint."
      />
      <StatCard
        title="Production"
        value={data.prod_secrets}
        description="Highest sensitivity tier in this registry."
        severity="warn"
      />
      <StatCard
        title="High risks"
        value={data.high_risks}
        description="Rule findings that need prompt review."
        severity="danger"
      />
      <StatCard
        title="Medium risks"
        value={data.medium_risks}
        description="Schedule remediation with owners."
        severity="warn"
      />
      <StatCard
        title="Low risks"
        value={data.low_risks}
        description="Informational or hygiene items."
      />
    </div>
  );
}
