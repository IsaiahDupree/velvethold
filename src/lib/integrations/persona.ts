/**
 * Persona API Configuration
 */
const PERSONA_API_URL = "https://withpersona.com/api/v1";
const PERSONA_API_KEY = process.env.PERSONA_API_KEY;
const PERSONA_TEMPLATE_ID = process.env.PERSONA_TEMPLATE_ID;

if (!PERSONA_API_KEY) {
  console.warn("PERSONA_API_KEY is not set in environment variables");
}

if (!PERSONA_TEMPLATE_ID) {
  console.warn("PERSONA_TEMPLATE_ID is not set in environment variables");
}

/**
 * Get the verification template ID from environment
 */
export const getVerificationTemplateId = (): string => {
  if (!PERSONA_TEMPLATE_ID) {
    throw new Error("PERSONA_TEMPLATE_ID is not configured");
  }
  return PERSONA_TEMPLATE_ID;
};

/**
 * Make a request to the Persona API
 */
async function personaFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!PERSONA_API_KEY) {
    throw new Error("PERSONA_API_KEY is not configured");
  }

  const response = await fetch(`${PERSONA_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PERSONA_API_KEY}`,
      "Persona-Version": "2023-01-05",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Persona API error:", response.status, errorText);
    throw new Error(`Persona API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new verification inquiry for a user
 */
export async function createVerificationInquiry(
  userId: string,
  referenceId?: string
) {
  try {
    const inquiry = await personaFetch("/inquiries", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "inquiry",
          attributes: {
            "inquiry-template-id": getVerificationTemplateId(),
            "reference-id": referenceId || userId,
          },
        },
      }),
    });

    return inquiry;
  } catch (error) {
    console.error("Error creating Persona inquiry:", error);
    throw error;
  }
}

/**
 * Retrieve an inquiry by ID
 */
export async function getInquiry(inquiryId: string) {
  try {
    const inquiry = await personaFetch(`/inquiries/${inquiryId}`);
    return inquiry;
  } catch (error) {
    console.error("Error retrieving Persona inquiry:", error);
    throw error;
  }
}

/**
 * Check if an inquiry is approved/verified
 */
export function isInquiryApproved(inquiry: any): boolean {
  return inquiry.data?.attributes?.status === "approved";
}

/**
 * Check if an inquiry is pending
 */
export function isInquiryPending(inquiry: any): boolean {
  const status = inquiry.data?.attributes?.status;
  return status === "pending" || status === "created";
}

/**
 * Check if an inquiry is declined
 */
export function isInquiryDeclined(inquiry: any): boolean {
  const status = inquiry.data?.attributes?.status;
  return status === "declined" || status === "failed";
}
