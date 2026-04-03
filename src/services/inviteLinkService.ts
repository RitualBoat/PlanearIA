import { Linking, Platform, Share } from "react-native";

// ─── Configuration ───

const APP_SCHEME = "planearia";
const WEB_BASE_URL = "https://planearia.app";
const INVITE_PATH = "/invite";
const INVITE_EXPIRY_DAYS = 7;

// ─── Types ───

export interface InviteLink {
  token: string;
  url: string;
  webUrl: string;
  deepUrl: string;
  expiresAt: string;
}

export interface ParsedInvite {
  token: string;
  fromUserId?: string;
}

// ─── Token Generation ───

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const segments = [8, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    )
    .join("-");
}

// ─── Service ───

/**
 * Generate an invitation link with a unique token.
 * Returns both web URL (for sharing) and deep link URL (for native).
 */
export function createInviteLink(fromUserId?: string): InviteLink {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const queryParam = fromUserId ? `?from=${fromUserId}` : "";
  const webUrl = `${WEB_BASE_URL}${INVITE_PATH}/${token}${queryParam}`;
  const deepUrl = `${APP_SCHEME}://${INVITE_PATH.slice(1)}/${token}${queryParam}`;

  return {
    token,
    url: webUrl, // Default shareable URL
    webUrl,
    deepUrl,
    expiresAt,
  };
}

/**
 * Parse an invite URL (web or deep link) to extract the token and optional fromUserId.
 */
export function parseInviteUrl(url: string): ParsedInvite | null {
  try {
    // Match deep link: planearia://invite/TOKEN?from=ID
    const deepMatch = url.match(
      new RegExp(`^${APP_SCHEME}://${INVITE_PATH.slice(1)}/([^?]+)(?:\\?from=(.+))?$`)
    );
    if (deepMatch) {
      return { token: deepMatch[1], fromUserId: deepMatch[2] };
    }

    // Match web URL: https://planearia.app/invite/TOKEN?from=ID
    const webMatch = url.match(
      new RegExp(`${WEB_BASE_URL.replace(/\./g, "\\.")}${INVITE_PATH}/([^?]+)(?:\\?from=(.+))?$`)
    );
    if (webMatch) {
      return { token: webMatch[1], fromUserId: webMatch[2] };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Copy text to clipboard (cross-platform).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // On native, we'll rely on the Share API as a fallback since
    // expo-clipboard is not installed. The UI will show the link for manual copy.
    return false;
  } catch {
    return false;
  }
}

/**
 * Open the native share sheet with an invitation message.
 */
export async function shareInviteLink(url: string, senderName?: string): Promise<boolean> {
  try {
    const message = senderName
      ? `${senderName} te invita a conectarse en PlanearIA. Únete aquí: ${url}`
      : `Te invito a conectarte conmigo en PlanearIA. Únete aquí: ${url}`;

    const result = await Share.share(Platform.OS === "ios" ? { url, message } : { message });
    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}

/**
 * Register a listener for incoming deep links.
 * Returns an unsubscribe function.
 */
export function onIncomingLink(callback: (parsed: ParsedInvite) => void): () => void {
  const handler = ({ url }: { url: string }) => {
    const parsed = parseInviteUrl(url);
    if (parsed) callback(parsed);
  };

  const subscription = Linking.addEventListener("url", handler);

  // Also check if the app was opened via a link
  Linking.getInitialURL().then((url) => {
    if (url) {
      const parsed = parseInviteUrl(url);
      if (parsed) callback(parsed);
    }
  });

  return () => subscription.remove();
}
