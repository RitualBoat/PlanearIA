import { createInviteLink, parseInviteUrl } from "../../services/inviteLinkService";

describe("inviteLinkService", () => {
  describe("createInviteLink", () => {
    it("generates a link with token, webUrl and deepUrl", () => {
      const link = createInviteLink();
      expect(link.token).toBeTruthy();
      expect(link.token.length).toBeGreaterThan(10);
      expect(link.webUrl).toContain("https://planearia.app/invite/");
      expect(link.deepUrl).toContain("planearia://invite/");
      expect(link.url).toBe(link.webUrl);
      expect(link.expiresAt).toBeTruthy();
    });

    it("includes fromUserId as query param when provided", () => {
      const link = createInviteLink("user42");
      expect(link.webUrl).toContain("?from=user42");
      expect(link.deepUrl).toContain("?from=user42");
    });

    it("omits query param when no fromUserId", () => {
      const link = createInviteLink();
      expect(link.webUrl).not.toContain("?from=");
    });

    it("sets expiry 7 days in the future", () => {
      const link = createInviteLink();
      const expiry = new Date(link.expiresAt).getTime();
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(expiry - now).toBeGreaterThan(sevenDaysMs - 1000);
      expect(expiry - now).toBeLessThan(sevenDaysMs + 1000);
    });

    it("generates unique tokens each time", () => {
      const link1 = createInviteLink();
      const link2 = createInviteLink();
      expect(link1.token).not.toBe(link2.token);
    });
  });

  describe("parseInviteUrl", () => {
    it("parses a web URL with token only", () => {
      const result = parseInviteUrl("https://planearia.app/invite/abc-123");
      expect(result).toEqual({ token: "abc-123", fromUserId: undefined });
    });

    it("parses a web URL with from param", () => {
      const result = parseInviteUrl("https://planearia.app/invite/abc-123?from=user1");
      expect(result).toEqual({ token: "abc-123", fromUserId: "user1" });
    });

    it("parses a deep link URL with token only", () => {
      const result = parseInviteUrl("planearia://invite/abc-123");
      expect(result).toEqual({ token: "abc-123", fromUserId: undefined });
    });

    it("parses a deep link URL with from param", () => {
      const result = parseInviteUrl("planearia://invite/abc-123?from=user42");
      expect(result).toEqual({ token: "abc-123", fromUserId: "user42" });
    });

    it("returns null for unrelated URLs", () => {
      expect(parseInviteUrl("https://google.com")).toBeNull();
      expect(parseInviteUrl("planearia://settings")).toBeNull();
      expect(parseInviteUrl("")).toBeNull();
    });

    it("roundtrips: parse(create().url) recovers the token", () => {
      const link = createInviteLink("usr5");
      const parsed = parseInviteUrl(link.webUrl);
      expect(parsed?.token).toBe(link.token);
      expect(parsed?.fromUserId).toBe("usr5");
    });

    it("roundtrips deep link: parse(create().deepUrl)", () => {
      const link = createInviteLink("usr9");
      const parsed = parseInviteUrl(link.deepUrl);
      expect(parsed?.token).toBe(link.token);
      expect(parsed?.fromUserId).toBe("usr9");
    });
  });
});
