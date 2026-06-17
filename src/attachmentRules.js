export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatRelativeDate(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.round(diffMs / dayMs));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isDuplicateAttachment(attachments, candidate) {
  return attachments.some((attachment) => attachment.id === candidate.id);
}

export function validateFile(file) {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return `Unsupported file type: ${file.type || "unknown"}. Try PNG, JPG, WebP, PDF, DOCX, XLSX, or TXT.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${file.name} is too large. Demo limit is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`;
  }

  return null;
}

export function getFileType(mimeType) {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("spreadsheet")) return "Spreadsheet";
  if (mimeType.includes("wordprocessingml")) return "Document";
  if (mimeType === "text/plain") return "Text";
  return "File";
}

export function getFileColor(fileType) {
  if (fileType === "Image") return "#7c3aed";
  if (fileType === "PDF") return "#ef4444";
  if (fileType === "Spreadsheet") return "#16a34a";
  if (fileType === "Document") return "#2563eb";
  if (fileType === "Text") return "#0f766e";
  return "#0f766e";
}

export function makeLocalUpload(file) {
  const now = new Date().toISOString();
  const fileType = getFileType(file.type);
  const safeId = `${file.name}-${file.size}-${file.lastModified}`
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();

  return {
    id: `local_${safeId}`,
    filename: file.name,
    mimeType: file.type,
    fileType,
    sizeBytes: file.size,
    uploadedAt: now,
    lastUsedAt: now,
    usageCount: 1,
    color: getFileColor(fileType),
    source: "local",
  };
}
