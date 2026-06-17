# Recent Attachments Picker Prototype

A standalone Hellotext-style frontend prototype for a chat composer that can attach a new local file or reuse a previously uploaded file without reuploading it.

## Run Locally

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

The built static app is written to `dist/` and can be deployed to Vercel, Netlify, Cloudflare Pages, or any static host.

## What Is Included

- A simple interactive chat composer.
- Attachment button with two paths: upload from device or choose recent.
- Recent attachment picker with search, loading, empty, and error states.
- Draft attachment chips with remove actions.
- Duplicate prevention for files already attached to the current draft.
- File validation for unsupported types and files over 5 MB.
- Client-only persistence using `localStorage`.
- Mock `UserUpload` data in `src/mockUserUploads.js`.
- Behavior tests in `src/App.test.jsx`.

## Client-Side Storage Model

This demo intentionally has no backend. It simulates attachment storage with two sources:

- `src/mockUserUploads.js` acts like seeded database rows from a future `UserUpload` table.
- `src/attachmentStorage.js` uses `localStorage` to persist local demo uploads and draft attachments.

The mock records are shaped like a future API response:

```js
{
  id: 'upl_001',
  filename: 'spring-sizing-chart.png',
  mimeType: 'image/png',
  fileType: 'Image',
  sizeBytes: 842318,
  uploadedAt: '2026-06-04T14:30:00Z',
  lastUsedAt: '2026-06-16T19:12:00Z',
  usageCount: 18,
  source: 'recent'
}
```

Local files selected through the browser file picker are validated, converted to the same metadata shape, saved in `localStorage`, and added to the current draft. The file bytes are not uploaded or permanently stored.

## Future API Integration Notes

In production, replace `src/attachmentStorage.js` with an API client. The UI should be able to keep most of the same state and rendering logic.

Likely endpoints:

```http
GET /api/user_uploads?query=&limit=30
POST /api/uploads/direct_upload
POST /api/messages
POST /api/user_uploads/:id/mark_used
```

Recommended backend model:

```text
UserUpload
- id
- user_id
- account_id
- original_filename
- content_type
- byte_size
- checksum
- storage_key
- thumbnail_storage_key
- uploaded_at
- last_used_at
- usage_count
- status
- metadata
```

Recommended production storage:

- Store metadata in PostgreSQL or the app database.
- Store binary files in S3-compatible object storage.
- Generate short-lived signed URLs for download or preview.
- Use background jobs for virus scanning, thumbnails, metadata extraction, and cleanup.
- Enforce duplicate prevention on both client and server.

## Demo Deployment Recommendation

Use Vercel for the fastest shareable team demo:

```bash
npm run build
npx vercel
```

Vercel settings if connected through GitHub:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
