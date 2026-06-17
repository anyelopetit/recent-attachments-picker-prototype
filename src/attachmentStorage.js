import { mockUserUploads } from './mockUserUploads.js'

const RECENT_UPLOADS_KEY = 'hellotext.prototype.recentUploads'
const DRAFT_ATTACHMENTS_KEY = 'hellotext.prototype.draftAttachments'

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getRecentUploads() {
  const localUploads = readJson(RECENT_UPLOADS_KEY, [])
  const byId = new Map([...localUploads, ...mockUserUploads].map((upload) => [upload.id, upload]))
  return [...byId.values()].sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
}

export function saveLocalUpload(upload) {
  const uploads = readJson(RECENT_UPLOADS_KEY, [])
  const nextUploads = [upload, ...uploads.filter((item) => item.id !== upload.id)]
  writeJson(RECENT_UPLOADS_KEY, nextUploads)
}

export function getDraftAttachments() {
  return readJson(DRAFT_ATTACHMENTS_KEY, [])
}

export function saveDraftAttachments(attachments) {
  writeJson(DRAFT_ATTACHMENTS_KEY, attachments)
}

export function markUploadsUsed(uploadIds) {
  const now = new Date().toISOString()
  const localUploads = readJson(RECENT_UPLOADS_KEY, [])
  const nextUploads = localUploads.map((upload) => {
    if (!uploadIds.includes(upload.id)) return upload
    return {
      ...upload,
      lastUsedAt: now,
      usageCount: upload.usageCount + 1
    }
  })

  writeJson(RECENT_UPLOADS_KEY, nextUploads)
}

export function resetPrototypeStorage() {
  window.localStorage.removeItem(RECENT_UPLOADS_KEY)
  window.localStorage.removeItem(DRAFT_ATTACHMENTS_KEY)
}
