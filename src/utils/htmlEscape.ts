export const escapeHtml = (value: unknown): string => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const openHtmlForPrint = (html: string): boolean => {
  if (typeof window === "undefined") return false;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(url);
    return false;
  }

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
};
