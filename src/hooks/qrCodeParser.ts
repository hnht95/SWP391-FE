// utils/qrCodeParser.ts

export interface ParsedQRCode {
  accountNumber: string | null;
  content: string | null;
  isValid: boolean;
}

/**
 * Parse VietQR code to extract account number and payment content
 * @param qrCode - The QR code string from PayOS
 * @returns Parsed account number and content
 */
export const parseVietQRCode = (qrCode: string): ParsedQRCode => {
  const result: ParsedQRCode = {
    accountNumber: null,
    content: null,
    isValid: false,
  };

  if (!qrCode || typeof qrCode !== "string") {
    return result;
  }

  try {
    // Extract account number: ví dụ vị trí 48-61 (13 ký tự)
    // Điều chỉnh nếu bạn biết chắc chắn QR của bạn dạng khác, thông thường là 13 ký tự bắt đầu từ vị trí 48
    if (qrCode.length >= 61) {
      result.accountNumber = qrCode.substring(48, 61).trim();
    }

    // Extract content/description (tag 08 within tag 62)
    // Format: 62{length}...08{length}{value}...
    const contentMatch = qrCode.match(/62\d{2}.*?08(\d{2})([^63]+)/);
    if (contentMatch) {
      const length = parseInt(contentMatch[1], 10);
      const value = contentMatch[2];
      // Remove all whitespace, lấy đủ số ký tự thực sự của message
      const rawContent = value.substring(0, length).replace(/\s+/g, "").trim();
      result.content = formatContentForDisplay(rawContent);
    }

    result.isValid = !!(result.accountNumber && result.content);
  } catch (error) {
    console.error("Failed to parse QR code:", error);
  }

  return result;
};

/**
 * Format content: 3-6-3 (3 ký tự, space, 6 ký tự, space, 3 ký tự, phần còn lại)
 */
export const formatContentForDisplay = (content: string): string => {
  if (!content) return "";
  const g1 = content.substring(0, 3);
  const g2 = content.substring(3, 9);
  const g3 = content.substring(9, 12);
  const rest = content.substring(12);
  return [g1, g2, g3].filter(Boolean).join(" ") + (rest ? " " + rest : "");
};

/**
 * Format account number for display (no spaces, just raw)
 */
export const formatAccountNumber = (accountNumber: string): string => {
  return (accountNumber || "").replace(/\s+/g, "");
};
