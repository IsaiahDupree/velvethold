import { Badge } from "@/components/ui/badge";

interface ReportStatusBadgeProps {
  status: "pending" | "under_review" | "resolved" | "dismissed";
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  dismissed: {
    label: "Dismissed",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
