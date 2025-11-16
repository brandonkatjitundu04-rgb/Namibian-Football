# Namibian Premier Football League Web App

A modern, mobile-first web application for the Namibian Premier Football League and lower-division leagues. Features live league tables, team pages, squad/staff management, statistics, sponsors, and a comprehensive CMS for administrators.

## Features

### Public Features
- **Live League Tables**: Real-time standings with sortable columns
- **Team Pages**: Detailed team information including squad, staff, and recent fixtures
- **Player Profiles**: Individual player statistics and match logs
- **Fixtures & Results**: Complete fixture list with filters and status tracking
- **Statistics Dashboard**: Top scorers, assists, clean sheets with charts and CSV export
- **Sponsor Pages**: Sponsor directory with tier-based organization
- **About Page**: League history, mission, and contact information

### Admin CMS
- **Authentication**: Secure admin login with role-based access (Admin/Editor)
- **Fixture Management**: Create, edit, and update fixtures with automatic table recalculation
- **Team Management**: CRUD operations for teams
- **Player Management**: Add and manage players with positions and statistics
- **Sponsor Management**: Manage sponsor information and tiers
- **Audit Logging**: Track all admin actions with timestamps

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 20+ 
- PostgreSQL 15+
- npm or yarn

## Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd namibian-football-league
```

2. Create a `.env` file:
```bash
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/namibian_football?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

3. Start the application:
```bash
docker-compose up
```

The app will be available at `http://localhost:3000`

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:push

# Seed the database
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Default Admin Credentials

- **Email**: admin@namibianfootball.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin CMS pages
│   ├── api/                # API routes
│   ├── fixtures/           # Fixtures page
│   ├── league/             # League pages
│   ├── player/             # Player pages
│   ├── stats/              # Statistics page
│   ├── team/               # Team pages
│   └── ...
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── stats/              # Statistics components
│   └── ui/                 # UI components
├── lib/                    # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── table-calculator.ts # League table calculation
│   └── utils.ts            # Helper functions
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── public/                 # Static assets
```

## Database Schema

The application uses the following main models:
- **League**: League information and rules
- **Team**: Team details and metadata
- **Player**: Player information and statistics
- **Staff**: Team staff members
- **Fixture**: Match fixtures and results
- **MatchEvent**: Goals, assists, cards, substitutions
- **TableRow**: Pre-calculated league table positions
- **Sponsor**: Sponsor information
- **User**: Admin users for CMS
- **AuditLog**: Admin action tracking

## League Table Calculation

The league table is automatically recalculated when a fixture is marked as finished. The calculation algorithm:

1. Processes all finished fixtures
2. Calculates points based on league rules (default: 3 for win, 1 for draw, 0 for loss)
3. Sorts by:
   - Points (descending)
   - Goal difference (descending)
   - Goals scored (descending)
4. Updates the `TableRow` table with positions

## API Endpoints

### Public Endpoints
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id/table` - Get league table
- `GET /api/teams/:id` - Get team details
- `GET /api/players/:id` - Get player details

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/fixtures` - Create fixture
- `PUT /api/admin/fixtures/:id` - Update fixture
- `POST /api/admin/import/csv` - Import data from CSV

## Testing

Run the test suite:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

Make sure to:
- Set up a PostgreSQL database
- Configure environment variables
- Run migrations: `npm run db:migrate`
- Seed initial data: `npm run db:seed`

## Live Score Integration (Future)

The application is designed with hooks for real-time score integration:

1. **Webhook Endpoint**: Create `/api/webhooks/live-scores` to receive score updates
2. **WebSocket Support**: Add WebSocket server for real-time updates
3. **Match Simulation**: Admin panel includes a "Simulate Match" feature for testing

See the architecture notes in the codebase for implementation details.

## Design System

The application uses a custom color palette:

- **Primary**: `hsl(225, 83%, 41%)` - #1E5CD6
- **Accent**: `hsl(214, 100%, 64%)` - #5CB3FF
- **Gold**: `hsl(43, 96%, 56%)` - #FCD34D
- **Background**: `hsl(240, 30%, 5%)` - #0A0D1A
- **Card**: `hsl(240, 25%, 8%)` - #111318

All design tokens are defined in `tailwind.config.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for Namibian Football

