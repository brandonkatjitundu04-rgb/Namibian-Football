# Player Positions and Squad Status Update

## Summary
Enhanced the player management system with detailed position types and squad categorization (First Team vs Reserve).

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)

#### New Position Types
Expanded from 4 basic positions (GK, DF, MF, FW) to 13 detailed positions:

**Goalkeepers:**
- GK - Goalkeeper

**Defenders:**
- CB - Center Back
- LB - Left Back
- RB - Right Back

**Midfielders:**
- CDM - Defensive Midfielder
- CM - Center Midfielder
- LM - Left Midfielder
- RM - Right Midfielder
- CAM - Attacking Midfielder

**Forwards:**
- LW - Left Winger
- RW - Right Winger
- CF - Center Forward
- ST - Striker

#### Squad Status
Added new `squadStatus` field to Player model:
- `FIRST_TEAM` - Players in the first team squad (default)
- `RESERVE` - Players in the reserve squad

### 2. Player Creation Form (`app/admin/players/new/page.tsx`)
- Added all 13 position options grouped by category (Goalkeeper, Defenders, Midfielders, Forwards)
- Added "Squad Status" dropdown to select First Team or Reserve
- Updated form state to include `squadStatus` field

### 3. Players Display Page (`app/players/page.tsx`)
- Updated position labels and colors for all new positions
- Added squad categorization showing First Team and Reserve squads separately
- Improved sorting: by squad status first, then position, then shirt number
- Added distinct visual styling for First Team (accent color) vs Reserves (muted color)

### 4. Team Page (`app/team/[teamId]/page.tsx`)
- Updated to show all new detailed positions
- Reorganized squad display into two sections:
  - **First Team Squad** - grouped by position category (Goalkeepers, Defenders, Midfielders, Forwards)
  - **Reserve Squad** - listed together
- Enhanced player cards with position labels and age display

### 5. Color Coding
Position colors organized by role:
- **Yellow** - Goalkeepers (GK)
- **Blue** - Defenders (CB, LB, RB)
- **Green** - Central/Wide Midfielders (CDM, CM, LM, RM)
- **Purple** - Attacking Midfielders (CAM)
- **Red** - Forwards (LW, RW, CF, ST)

## Implementation Notes

### Firestore Compatibility
Since this project uses Firestore (schema-less database), no database migration is required. The changes take effect immediately when creating or updating players with the new fields.

### Backward Compatibility
- Existing players without `squadStatus` will default to `FIRST_TEAM`
- All old position codes (GK, DF, MF, FW) are still supported but deprecated
- New players should use the detailed position codes

## Usage

### Creating a New Player
1. Navigate to Admin → Players → Add New Player
2. Select detailed position from grouped dropdown
3. Choose squad status (First Team or Reserve)
4. Fill in other details and submit

### Viewing Squad Organization
- Players page shows teams with First Team and Reserve squads separately
- Team pages display squad organized by position categories
- Each player card shows their specific position and squad status

## Testing Recommendations
1. Create players with various new positions
2. Assign some players to Reserve squad
3. Verify proper grouping on Players page
4. Check team page displays squads correctly
5. Ensure sorting works as expected (squad status → position → shirt number)

## Future Enhancements
- Add ability to promote/demote players between squads
- Add squad size limits and warnings
- Show squad statistics (players per position)
- Add position-specific statistics tracking

