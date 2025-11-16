# New Features Added

## Overview
This document summarizes the new features added to the Namibian Live Football admin panel.

## 1. Image Upload Functionality

### Image Upload Component (`components/admin/ImageUpload.tsx`)
- Reusable component for uploading images throughout the admin panel
- Features:
  - Image preview after upload
  - File validation (type and size)
  - Maximum file size: 5MB
  - Supports: PNG, JPG, GIF
  - Remove image capability

### Image Upload API (`app/api/upload/route.ts`)
- Secure endpoint for handling image uploads
- Requires authentication
- Validates file size and type
- Stores images in `/public/uploads`
- Returns public URL path for database storage

## 2. League Management

### Create New League
- **Page:** `/admin/leagues/new`
- **Features:**
  - League name input
  - Season input (e.g., 2024/25)
  - Tier selection (Premier, Division 1, Division 2)
  - Customizable points system:
    - Win points (default: 3)
    - Draw points (default: 1)
    - Loss points (default: 0)

### League API
- **Endpoint:** `POST /api/admin/leagues`
- Creates new league in database
- Logs admin action in audit log

## 3. Sponsor Management

### Create New Sponsor
- **Page:** `/admin/sponsors/new`
- **Features:**
  - Sponsor name input
  - Logo upload (using ImageUpload component)
  - Tier selection (Gold, Silver, Bronze)
  - Website URL (optional)

### Sponsor API
- **Endpoint:** `POST /api/admin/sponsors`
- Creates new sponsor in database
- Logs admin action in audit log

## 4. Enhanced Team Management

### Updated Team Form
- Added team logo upload field
- Logo is stored in `crestUrl` field in database
- Updated API to handle `crestUrl` parameter

## 5. Enhanced Player Management

### Updated Player Form
- Added player photo upload field
- Photo is stored in `photoUrl` field in database
- Updated API to handle `photoUrl` parameter

## Database Fields Updated

### Team Model
- `crestUrl` - URL to team logo image

### Player Model
- `photoUrl` - URL to player photo

### Sponsor Model
- `logoUrl` - URL to sponsor logo

## Navigation Updates

All admin pages now have "Add New" buttons:
- **Manage Leagues** → Add New League button
- **Manage Sponsors** → Add New Sponsor button
- **Manage Teams** → Add New Team button (existing, now with image upload)
- **Manage Players** → Add New Player button (existing, now with image upload)

## File Structure

```
app/
├── admin/
│   ├── leagues/
│   │   ├── page.tsx (updated with Add New button)
│   │   └── new/
│   │       └── page.tsx (new - create league form)
│   ├── sponsors/
│   │   ├── page.tsx (updated with Add New button)
│   │   └── new/
│   │       └── page.tsx (new - create sponsor form)
│   ├── teams/
│   │   └── new/
│   │       └── page.tsx (updated with image upload)
│   └── players/
│       └── new/
│           └── page.tsx (updated with image upload)
├── api/
│   ├── upload/
│   │   └── route.ts (new - image upload endpoint)
│   └── admin/
│       ├── leagues/
│       │   └── route.ts (new - create league endpoint)
│       ├── sponsors/
│       │   └── route.ts (new - create sponsor endpoint)
│       ├── teams/
│       │   └── route.ts (updated with crestUrl)
│       └── players/
│           └── route.ts (updated with photoUrl)
components/
└── admin/
    └── ImageUpload.tsx (new - image upload component)
public/
└── uploads/ (new - directory for uploaded images)
```

## Usage Instructions

### Creating a League
1. Navigate to `/admin/leagues`
2. Click "Add New League" button
3. Fill in league details
4. Set points system (defaults provided)
5. Click "Create League"

### Creating a Sponsor
1. Navigate to `/admin/sponsors`
2. Click "Add New Sponsor" button
3. Enter sponsor name
4. Upload sponsor logo (optional)
5. Select tier (Gold/Silver/Bronze)
6. Enter website URL (optional)
7. Click "Create Sponsor"

### Adding Team Logo
1. Navigate to `/admin/teams`
2. Click "Add New Team" button
3. Fill in team details
4. Use "Upload Logo" button to add team crest
5. Click "Create Team"

### Adding Player Photo
1. Navigate to `/admin/players`
2. Click "Add New Player" button
3. Fill in player details
4. Use "Upload Photo" button to add player photo
5. Click "Create Player"

## Security

- All upload and create endpoints require authentication
- File uploads are validated for:
  - File type (images only)
  - File size (max 5MB)
- All admin actions are logged in the audit log
- Uploaded files are stored in `/public/uploads` (excluded from Git)

## Notes

- Uploaded images are stored locally in `/public/uploads`
- The uploads directory is excluded from Git version control
- Images are served publicly at `/uploads/[filename]`
- For production, consider using cloud storage (S3, Cloudinary, etc.)

