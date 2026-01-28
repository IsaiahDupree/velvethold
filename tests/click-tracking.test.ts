/**
 * Click Tracking Tests (GDP-006)
 *
 * Tests for the click redirect tracker that creates an attribution spine:
 * email → click → session → conversion
 */

import { generateTrackedUrl, getAttributionFromCookies } from "@/lib/click-tracking";

describe("Click Tracking", () => {
  describe("generateTrackedUrl", () => {
    it("should generate a tracked URL with all parameters", () => {
      const url = generateTrackedUrl({
        url: "https://velvethold.com/browse",
        personId: "person-123",
        emailId: "email-456",
        campaign: "welcome_email",
        source: "email",
      });

      expect(url).toContain("/api/track/click");
      expect(url).toContain("url=https%3A%2F%2Fvelvethold.com%2Fbrowse");
      expect(url).toContain("person_id=person-123");
      expect(url).toContain("email_id=email-456");
      expect(url).toContain("campaign=welcome_email");
      expect(url).toContain("source=email");
    });

    it("should generate a tracked URL with only required parameters", () => {
      const url = generateTrackedUrl({
        url: "https://velvethold.com/browse",
      });

      expect(url).toContain("/api/track/click");
      expect(url).toContain("url=https%3A%2F%2Fvelvethold.com%2Fbrowse");
    });

    it("should handle special characters in URLs", () => {
      const url = generateTrackedUrl({
        url: "https://velvethold.com/profile?id=123&name=John Doe",
      });

      expect(url).toContain("/api/track/click");
      expect(url).toContain("url=");
    });
  });

  describe("getAttributionFromCookies", () => {
    it("should extract session ID and attribution data from cookies", () => {
      const mockCookies = {
        get: (name: string) => {
          if (name === "vh_session_id") {
            return { value: "session-123" };
          }
          if (name === "vh_attribution") {
            return {
              value: JSON.stringify({
                source: "email",
                email_id: "email-456",
                campaign: "welcome_email",
                person_id: "person-123",
                clicked_at: "2026-01-27T00:00:00.000Z",
              }),
            };
          }
          return undefined;
        },
      };

      const result = getAttributionFromCookies(mockCookies);

      expect(result.sessionId).toBe("session-123");
      expect(result.attribution).toEqual({
        source: "email",
        email_id: "email-456",
        campaign: "welcome_email",
        person_id: "person-123",
        clicked_at: "2026-01-27T00:00:00.000Z",
      });
    });

    it("should handle missing cookies gracefully", () => {
      const mockCookies = {
        get: () => undefined,
      };

      const result = getAttributionFromCookies(mockCookies);

      expect(result.sessionId).toBeUndefined();
      expect(result.attribution).toBeUndefined();
    });

    it("should handle malformed attribution cookie", () => {
      const mockCookies = {
        get: (name: string) => {
          if (name === "vh_attribution") {
            return { value: "invalid-json" };
          }
          return undefined;
        },
      };

      const result = getAttributionFromCookies(mockCookies);

      expect(result.attribution).toBeUndefined();
    });
  });
});

/**
 * Manual Testing Guide
 * ====================
 *
 * 1. Test Click Tracking Redirect
 *    - Navigate to: http://localhost:3007/api/track/click?url=http://localhost:3007/browse&campaign=test&person_id=test-123
 *    - Expected: Redirects to /browse
 *    - Expected: Sets vh_session_id cookie
 *    - Expected: Sets vh_attribution cookie
 *    - Expected: Event tracked in database
 *
 * 2. Test Email Link Tracking
 *    - Send a test email with tracked URL
 *    - Click the link in the email
 *    - Expected: Click event tracked with email_id
 *    - Expected: Session cookie persists
 *    - Expected: Attribution data preserved
 *
 * 3. Test Attribution Persistence
 *    - Click a tracked email link
 *    - Navigate to other pages
 *    - Complete a conversion action (signup, purchase)
 *    - Expected: Attribution data from email still available
 *    - Expected: Can link conversion back to email campaign
 *
 * 4. Test Session Continuity
 *    - Click tracked link
 *    - Check vh_session_id cookie
 *    - Return to site later (within 30 days)
 *    - Expected: Same session ID maintained
 *    - Expected: Attribution data preserved
 *
 * Database Verification
 * =====================
 *
 * Check that events are tracked:
 *
 * SELECT * FROM event
 * WHERE event_name = 'email_link_clicked'
 * ORDER BY timestamp DESC
 * LIMIT 10;
 *
 * Check email click events:
 *
 * SELECT
 *   em.subject,
 *   em.template,
 *   ee.event_type,
 *   ee.link,
 *   ee.timestamp
 * FROM email_event ee
 * JOIN email_message em ON ee.email_message_id = em.id
 * WHERE ee.event_type = 'clicked'
 * ORDER BY ee.timestamp DESC;
 */
