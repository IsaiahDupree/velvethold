import { CheckCircle2, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type VerificationStatus = "unverified" | "pending" | "verified";

interface VerificationBadgeProps {
  status: VerificationStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerificationBadge({
  status,
  showLabel = true,
  size = "md",
  className,
}: VerificationBadgeProps) {
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const paddingSizes = {
    sm: "px-2 py-0.5",
    md: "px-2.5 py-1",
    lg: "px-3 py-1.5",
  };

  if (status === "verified") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-800 font-medium",
          paddingSizes[size],
          className
        )}
      >
        <CheckCircle2 className={iconSizes[size]} />
        {showLabel && <span className={textSizes[size]}>Verified</span>}
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 font-medium",
          paddingSizes[size],
          className
        )}
      >
        <Clock className={iconSizes[size]} />
        {showLabel && <span className={textSizes[size]}>Pending</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-yellow-100 text-yellow-800 font-medium",
        paddingSizes[size],
        className
      )}
    >
      <Shield className={iconSizes[size]} />
      {showLabel && <span className={textSizes[size]}>Unverified</span>}
    </div>
  );
}
