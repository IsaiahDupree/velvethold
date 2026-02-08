/**
 * Deposit Forfeiture System
 * Handles partial deposit forfeiture based on cancellation timing and policies
 */

export enum CancellationPolicy {
  FLEXIBLE = "flexible",
  MODERATE = "moderate",
  STRICT = "strict",
}

export interface ForfeiturePolicy {
  policyType: CancellationPolicy;
  hoursBeforeDate: number;
  refundPercentage: number;
  description: string;
}

/**
 * Get forfeiture policies based on cancellation policy type
 */
export function getForfeiturePolicies(
  policyType: CancellationPolicy = CancellationPolicy.MODERATE
): ForfeiturePolicy[] {
  const policies: Record<CancellationPolicy, ForfeiturePolicy[]> = {
    [CancellationPolicy.FLEXIBLE]: [
      {
        policyType: CancellationPolicy.FLEXIBLE,
        hoursBeforeDate: 24,
        refundPercentage: 100,
        description: "Full refund if cancelled 24+ hours before date",
      },
      {
        policyType: CancellationPolicy.FLEXIBLE,
        hoursBeforeDate: 0,
        refundPercentage: 50,
        description: "50% refund if cancelled within 24 hours",
      },
      {
        policyType: CancellationPolicy.FLEXIBLE,
        hoursBeforeDate: -1, // After date (no-show)
        refundPercentage: 0,
        description: "No refund for no-shows",
      },
    ],
    [CancellationPolicy.MODERATE]: [
      {
        policyType: CancellationPolicy.MODERATE,
        hoursBeforeDate: 48,
        refundPercentage: 100,
        description: "Full refund if cancelled 48+ hours before date",
      },
      {
        policyType: CancellationPolicy.MODERATE,
        hoursBeforeDate: 0,
        refundPercentage: 0,
        description: "No refund if cancelled within 48 hours",
      },
      {
        policyType: CancellationPolicy.MODERATE,
        hoursBeforeDate: -1,
        refundPercentage: 0,
        description: "No refund for no-shows",
      },
    ],
    [CancellationPolicy.STRICT]: [
      {
        policyType: CancellationPolicy.STRICT,
        hoursBeforeDate: 72,
        refundPercentage: 100,
        description: "Full refund if cancelled 72+ hours before date",
      },
      {
        policyType: CancellationPolicy.STRICT,
        hoursBeforeDate: 48,
        refundPercentage: 50,
        description: "50% refund if cancelled 48-72 hours before date",
      },
      {
        policyType: CancellationPolicy.STRICT,
        hoursBeforeDate: 0,
        refundPercentage: 0,
        description: "No refund if cancelled within 48 hours",
      },
      {
        policyType: CancellationPolicy.STRICT,
        hoursBeforeDate: -1,
        refundPercentage: 0,
        description: "No refund for no-shows",
      },
    ],
  };

  return policies[policyType] || policies[CancellationPolicy.MODERATE];
}

/**
 * Calculate refund amount based on cancellation timing and policy
 */
export function calculateRefundAmount(
  depositAmount: number,
  dateTime: Date,
  cancellationTime: Date,
  policyType: CancellationPolicy = CancellationPolicy.MODERATE
): {
  refundAmount: number;
  forfeitureAmount: number;
  refundPercentage: number;
  reason: string;
} {
  const policies = getForfeiturePolicies(policyType);
  const hoursUntilDate = (dateTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);

  let applicablePolicy = policies[policies.length - 1]; // Default to no-show

  // Find applicable policy based on timing
  for (const policy of policies) {
    if (hoursUntilDate >= policy.hoursBeforeDate) {
      applicablePolicy = policy;
      break;
    }
  }

  const refundPercentage = applicablePolicy.refundPercentage;
  const refundAmount = Math.round((depositAmount * refundPercentage) / 100);
  const forfeitureAmount = depositAmount - refundAmount;

  return {
    refundAmount,
    forfeitureAmount,
    refundPercentage,
    reason: applicablePolicy.description,
  };
}

/**
 * Parse cancellation policy from text to enum
 */
export function parsePolicyType(policyText: string): CancellationPolicy {
  const lowercased = policyText.toLowerCase();

  if (lowercased.includes("72") || lowercased.includes("strict")) {
    return CancellationPolicy.STRICT;
  }

  if (lowercased.includes("24") || lowercased.includes("flexible")) {
    return CancellationPolicy.FLEXIBLE;
  }

  return CancellationPolicy.MODERATE;
}

/**
 * Get policy template with description
 */
export function getPolicyTemplate(
  policyType: CancellationPolicy
): { name: string; description: string; rules: string[] } {
  const templates: Record<CancellationPolicy, any> = {
    [CancellationPolicy.FLEXIBLE]: {
      name: "Flexible",
      description:
        "User-friendly policy allowing last-minute cancellations with reduced penalties",
      rules: [
        "Full refund if cancelled 24+ hours before",
        "50% refund if cancelled within 24 hours",
        "No refund for no-shows",
      ],
    },
    [CancellationPolicy.MODERATE]: {
      name: "Moderate",
      description: "Balanced policy encouraging commitment while allowing reasonable cancellations",
      rules: [
        "Full refund if cancelled 48+ hours before",
        "No refund if cancelled within 48 hours",
        "No refund for no-shows",
      ],
    },
    [CancellationPolicy.STRICT]: {
      name: "Strict",
      description: "High commitment policy to ensure reliable date attendance",
      rules: [
        "Full refund if cancelled 72+ hours before",
        "50% refund if cancelled 48-72 hours before",
        "No refund if cancelled within 48 hours",
        "No refund for no-shows",
      ],
    },
  };

  return templates[policyType] || templates[CancellationPolicy.MODERATE];
}
