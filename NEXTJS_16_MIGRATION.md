# Next.js 16 Migration - Route Handler Params

## Issue

Next.js 16 requires route handler `params` to be async (Promise-based). All route handlers with dynamic params need to be updated.

## Pattern to Fix

### Before (Next.js 15 and earlier):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = await firestore.article.findUnique(params.id)
  // ...
}
```

### After (Next.js 16):
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await firestore.article.findUnique(id)
  // ...
}
```

## Files That Need Updating

The following files still need to be updated:

1. `app/api/admin/users/[id]/route.ts` - GET, PUT, DELETE
2. `app/api/admin/leagues/[id]/route.ts` - GET
3. `app/api/admin/leagues/[id]/table/route.ts` - GET, POST
4. `app/api/admin/leagues/[id]/table/[rowId]/route.ts` - PUT, DELETE
5. `app/api/admin/leagues/[id]/table/recalculate/route.ts` - POST
6. `app/api/admin/fixtures/[id]/route.ts` - PUT
7. `app/api/articles/[slug]/route.ts` - GET
8. `app/api/teams/[id]/route.ts` - GET
9. `app/api/players/[id]/route.ts` - GET
10. `app/api/leagues/[id]/table/route.ts` - GET
11. `app/api/advertisements/[id]/click/route.ts` - POST

## Status

✅ Fixed:
- `app/api/admin/advertisements/[id]/route.ts` - All methods
- `app/api/admin/articles/[id]/route.ts` - All methods

⏳ Remaining: See list above

## Quick Fix Script

For each file, find:
```typescript
{ params }: { params: { id: string } }
```

Replace with:
```typescript
{ params }: { params: Promise<{ id: string }> }
```

And add at the start of the function:
```typescript
const { id } = await params
```

Then replace all `params.id` with `id`.

For routes with multiple params (e.g., `[id]/table/[rowId]`):
```typescript
{ params }: { params: Promise<{ id: string; rowId: string }> }
const { id, rowId } = await params
```

