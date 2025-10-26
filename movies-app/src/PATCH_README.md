# Patch: Staff Comments & Admin Staff Reports (CRUD + localStorage)

## What was added
- `src/store/useLocalStorageCRUD.ts` — reusable CRUD hook persisted to `localStorage`.
- `src/store/seedMock.ts` — seeds mock data **once** on first load.
- `src/ui/pages/staff/Comments.tsx` — Staff page to manage comments (add/edit/delete, show/hide).
- `src/ui/pages/admin/StaffReports.tsx` — Admin page to manage reports submitted by staff (add/edit/delete; approve/reject).

## Routes
- `/staff/comments` (requires role `staff`)
- `/admin/staff-reports` (requires role `admin`)

## How to test quickly
1. Run your dev server.
2. Login as staff → open `/staff/comments`.
3. Login as admin → open `/admin/staff-reports`.
4. All data persists in localStorage keys:
   - `staff_comments`
   - `admin_staff_reports`

You can reuse `useLocalStorageCRUD` for other pages to wire up Add/Edit/Delete quickly.