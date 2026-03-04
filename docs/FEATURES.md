# PLN Insurance DMS - Features & Demo Guide

## Overview

PLN Insurance Document Management System (DMS) is a web application for managing, digitizing, and searching legacy insurance documents. Built with Next.js 16, Supabase, and OpenAI GPT-4o OCR.

**Live URL:** https://pln-insurance-dms.vercel.app

---

## Test Accounts

| Email | Password | Role | Access Level |
|-------|----------|------|-------------|
| `manager@pln.co.id` | `password123` | Manager | Full access (all pages) |
| `gudang@pln.co.id` | `password123` | PIC Gudang | Upload, view, edit documents |
| `klaim@pln.co.id` | `password123` | PIC Klaim | Claims, OCR review, view documents |

---

## Pages & Features

### 1. Login (`/login`)
- Email + password authentication
- Password visibility toggle (eye icon)
- "Remember for 30 days" checkbox
- "Forgot password" sends reset email
- Split layout with purple illustration panel

### 2. Dashboard (`/`)
- **4 stat cards** (clickable, navigate to relevant pages):
  - Total Documents -> `/documents`
  - Pending Upload -> `/documents/upload`
  - OCR Completed -> `/documents?status=indexed`
  - Needs Validation -> `/ocr-validation`
- **Recent Documents** - clickable rows link to document detail, "View All" link
- **Digitization Progress** - per-warehouse progress bars
- **OCR Performance** - avg confidence, process time, failure rate
- **Search & Compliance** - search metrics

### 3. Document Ingestion (`/documents/upload`)
- Drag-and-drop file upload zone (PDF, TIFF, JPG, PNG, max 50MB)
- Bulk upload support
- Metadata form: title, type, warehouse, policy number, tags, description
- Processing queue with real-time status: uploading -> processing OCR -> completed/failed
- Retry button for failed uploads
- Remove file button

### 4. Documents (`/documents`)
- Searchable, filterable document table (20 per page)
- **Filters:** search text, document type, status, warehouse, date range, policy number
- **Reset Filters** button clears all filters at once
- **"More Filters"** expands advanced filter panel
- Row actions: View, Download, Audit log
- Upload button (role-dependent)
- Pagination with page numbers

### 5. Document Detail (`/documents/{id}`)
- Full document metadata display
- File info (name, size, type, page count)
- OCR text preview
- Tags display
- Link to document audit trail

### 6. OCR Validation (`/ocr-validation`)
- 3-panel layout: Queue | Document Preview | Extracted Fields
- Queue shows documents pending OCR review, sorted by confidence
- Color-coded confidence indicators (green >= 90%, yellow >= 70%, red < 70%)
- Editable extracted fields (policy number, policyholder, dates, amounts, etc.)
- Per-field approval toggle
- **3 actions:** Approve & Index, Reprocess OCR, Reject

### 7. Advanced Search (`/search`)
- Full-text search across document content and metadata
- Recent searches (click to re-search)
- Filter panel (type, status, warehouse, date range)
- Results show relevance score, match highlighting
- Search time metric displayed

### 8. Claims (`/claims`)
- Claims listing table with status badges
- **New Claim** form: claim number, policy number, claimant, date, description, amount
- Claim detail page with linked documents
- Link documents to claims

### 9. Version Control (`/version-control`)
- Document selector dropdown
- Version timeline (newest first) with description, author, file size
- Per-version actions: View, Download, Restore
- Lock/Unlock documents
- **Compare Versions** dialog - select two versions to compare side-by-side

### 10. Access Control (`/access-control`)
- **Roles & Permissions tab:** role cards with permission badges, edit role permissions
- **User Assignments tab:** user table with search, edit user, deactivate user
- Add User dialog
- Edit Role dialog with permission checkboxes

### 11. Audit Trail (`/audit`)
- Global activity log with timeline display
- **Filters:** search by user/action, filter by action type category
- Action categories: View/Download, Create/Upload, Update/Edit, Security, OCR/Validation, Delete/Archive
- **Export CSV** downloads all visible audit data
- Pagination (25 per page)

### 12. Warehouses (`/warehouses`)
- Summary stats: total warehouses, documents, digitized, overall progress
- Warehouse cards with: name, location, progress bar, document count, storage size, monthly rate, estimated completion

### 13. Admin Console (`/admin`)
- **Services tab:** 6 system services with status (running/warning/stopped), uptime, latency, restart button
- **Storage tab:** storage breakdown by document type with progress bars
- **Integration tab:** API call stats, live API log table with HTTP status codes
- **Settings tab:** 4 toggles (maintenance mode, auto OCR, email notifications, watermark) + 4 integration config fields

---

## Roles & Permissions

| Permission | PIC Gudang | PIC Klaim | Manager | Super Admin |
|-----------|:---:|:---:|:---:|:---:|
| Upload documents | Y | - | - | Y |
| View documents | Y | Y | Y | Y |
| Edit documents | Y | - | Y | Y |
| Download documents | Y | Y | Y | Y |
| Review OCR | - | Y | Y | Y |
| Approve documents | - | - | Y | Y |
| Create claims | - | Y | Y | Y |
| View claims | Y | Y | Y | Y |
| View audit trail | Y | Y | Y | Y |
| View global audit | - | - | Y | Y |
| Manage users | - | - | Y | Y |

---

## Demo Flow: End-to-End Document Lifecycle

Follow this flow to test the complete system. Login as **manager@pln.co.id / password123** for full access.

### Step 1: Login
1. Go to `/login`
2. Enter `manager@pln.co.id` / `password123`
3. Toggle password visibility with the eye icon
4. Click **Sign in**
5. You land on the Dashboard

### Step 2: Explore the Dashboard
1. Check the 4 stat cards - note the numbers
2. Click the **"Needs Validation"** card -> takes you to OCR Validation
3. Go back to Dashboard (click Dashboard icon in sidebar)
4. Click a document in **Recent Documents** -> takes you to document detail
5. Go back to Dashboard

### Step 3: Upload a Document
1. Click the **Upload** icon in the sidebar (arrow-up icon)
2. Drag a PDF file into the upload zone (or click to browse)
3. Fill in metadata:
   - Title: "Test Fire Insurance Policy"
   - Type: Policy
   - Select warehouse: Bekasi-A
   - Policy Number: "POL-TEST-001"
4. Click **Upload Document**
5. Watch the processing queue: uploading -> processing OCR -> completed
6. You're redirected to the Documents page

### Step 4: Find Your Document
1. On the Documents page, type "Test Fire" in the search box
2. Your uploaded document appears
3. Click the **...** menu -> View to see the detail page
4. Click **View Audit Log** to see the upload event logged

### Step 5: OCR Validation
1. Go to **OCR Validation** (sidebar icon)
2. Select a document from the queue (e.g., "Marine Cargo Policy")
3. Review the extracted fields on the right panel
4. Note the confidence percentages (color-coded)
5. Edit a field value if needed
6. Click the checkmark on a field to approve it
7. Click **Approve & Index** to approve the document
8. The document is removed from the queue

### Step 6: Search
1. Go to **Search** (sidebar icon)
2. Type "Fire Insurance" in the search bar and press Enter
3. View results with relevance scores
4. Click **Filters** to expand filter panel
5. Filter by Status: "Indexed"
6. Click a result to view the document

### Step 7: Version Control
1. Go to **Version Control** (sidebar icon)
2. Select "Fire Insurance Policy" from the dropdown
3. View the 3 versions in the timeline
4. Click **Download** on version 2
5. Click **View** on version 1 to open it
6. Click **Compare Versions** button
7. Select Version 1 and Version 3, click Compare

### Step 8: Claims Management
1. Go to **Claims** (if visible in sidebar)
2. Click **New Claim**
3. Fill in:
   - Claim Number: "CLM-2024-001"
   - Policy Number: "POL-FI-2023-04521"
   - Claimant: "PT Pembangkit Jawa Bali"
   - Amount: 50000000
4. Submit the claim
5. View the claim in the claims list

### Step 9: Access Control
1. Go to **Access Control** (sidebar icon)
2. **Roles & Permissions tab:** click Edit on a role, toggle permissions, save
3. **User Assignments tab:** search for "Budi" in the search box
4. Click the pencil icon to edit a user's role
5. Click **Add User** to see the add user dialog

### Step 10: Audit Trail
1. Go to **Audit Trail** (sidebar icon)
2. See all your actions logged (upload, validate, view, etc.)
3. Use the **action filter** dropdown to show only "Security" events
4. Type a user name in the search box to filter
5. Click **Export CSV** to download the audit log

### Step 11: Admin Console
1. Go to **Admin** (sidebar icon)
2. **Services tab:** see 6 services, click Restart on one
3. **Storage tab:** view storage breakdown by document type
4. **Integration tab:** see API logs with status codes
5. **Settings tab:** toggle "Auto OCR Processing" switch, change the API URL, click Save

### Step 12: Warehouses
1. Go to **Warehouses** (sidebar icon)
2. See 4 warehouse cards with digitization progress
3. Note Bekasi-A at ~90% digitized, Karawang-B at ~70%

---

## Document Approval Workflow

Documents follow a state machine with role-based transitions:

```
draft ──[Submit for Review]──> reviewed ──[Approve]──> approved ──[Archive]──> archived
                                   │
                                   └──[Reject]──> draft
```

| Current Status | Action | Who Can Do It | Next Status |
|---------------|--------|---------------|-------------|
| Draft | Submit for Review | PIC Klaim (`klaim@pln.co.id`) | Reviewed |
| Reviewed | Approve | Manager (`manager@pln.co.id`) | Approved |
| Reviewed | Reject | Manager (`manager@pln.co.id`) | Draft |
| Approved | Archive | Manager (`manager@pln.co.id`) | Archived |

Transition buttons appear automatically on the **Document Detail** page (`/documents/{id}`) based on the document's current status and your role.

---

## Multi-Account Demo: Role-Based Workflow

This demo shows how different roles collaborate on document processing. Use **3 browser windows** (or incognito tabs) to simulate the workflow.

### Window 1: PIC Gudang (Warehouse Officer)
**Login:** `gudang@pln.co.id` / `password123`

1. Go to **Upload** → drag a PDF file, fill metadata (title, type, warehouse, policy number)
2. Click **Upload Document** → watch the processing queue
3. Document is created with status **Draft**
4. PIC Gudang can view and edit documents but **cannot** submit for review or approve

**What PIC Gudang sees:** Upload, Documents, Search, Claims (view only), Version Control, Audit Trail, Warehouses

### Window 2: PIC Klaim (Claims Officer)
**Login:** `klaim@pln.co.id` / `password123`

1. Go to **Documents** → find the document uploaded by PIC Gudang
2. Click the document to open the detail page
3. You'll see a **"Submit for Review"** button (blue) — click it
4. Document status changes from **Draft** → **Reviewed**
5. Go to **OCR Validation** → review extracted fields, approve or reprocess
6. Go to **Claims** → create a new claim and link documents to it

**What PIC Klaim sees:** Documents (view only), OCR Validation, Search, Claims, Audit Trail

### Window 3: Manager
**Login:** `manager@pln.co.id` / `password123`

1. Go to **Documents** → find the document submitted for review
2. Click the document to open the detail page
3. You'll see **"Approve"** (green) and **"Reject"** (red) buttons
4. Click **Approve** → status changes from **Reviewed** → **Approved**
5. Open the document again → you'll see an **"Archive"** button (yellow)
6. Go to **Audit Trail** → see all actions logged (upload, submit, approve)
7. Go to **Access Control** → manage user roles and permissions
8. Go to **Admin** → monitor system services, storage, integrations

**What Manager sees:** All pages — full access to everything

### What to observe across accounts:
- **Sidebar differences:** Each role sees different navigation items based on their permissions
- **Action buttons:** Transition buttons only appear for authorized roles
- **Audit Trail:** Every action by every user is logged with timestamps
- **Permission enforcement:** Attempting to access unauthorized pages redirects to Dashboard

---

## Seed Data Summary

The database is pre-populated with:
- **9 users** (6 named employees + 3 test accounts)
- **4 warehouses** (Bekasi-A, Bekasi-C, Karawang-A, Karawang-B)
- **9 documents** across various statuses (indexed, ocr_review, processing, failed)
- **12 document versions** across 3 documents
- **8 roles** with complete permission sets
- **Audit log entries** tracking system activity
