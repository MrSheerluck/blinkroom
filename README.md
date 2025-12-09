# BlinkRoom

**Ephemeral, anonymous chat rooms that disappear in 24 hours.**

BlinkRoom is a self-hostable, open-source real-time chat application where privacy meets simplicity. Create temporary chat rooms, share the link, and chat freely—no signup, no tracking, no permanence.

## Features

- **Completely Anonymous** - No accounts, no emails, no personal data
- **Auto-Expiring Rooms** - All rooms automatically delete after 24 hours
- **Human-Readable Usernames** - Get fun names like "BraveWolf" or "QuickFox"
- **Real-time Messaging** - Instant WebSocket-powered chat
- **Short Room IDs** - Easy-to-share 6-character room codes (e.g., `aB3xK9`)
- **Expiry Warnings** - 1-hour countdown before room deletion
- **Self-Hostable** - Deploy anywhere with Docker Compose

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Room metadata storage
- **Redis** - Real-time message caching
- **WebSockets** - Native real-time communication
- **Alembic** - Database migrations

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Bun** - Fast JavaScript runtime

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Bun (for local development)

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/yourusername/blinkroom.git
cd blinkroom

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Access the app
open http://localhost:3000
```

### Local Development

**Backend:**
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd web
bun install
bun run dev
```

## Project Structure

```
blinkroom/
├── api/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py        # Application entry point
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── schemas/       # Pydantic schemas
│   └── alembic/           # Database migrations
├── web/                    # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   └── lib/               # Utilities & API client
└── docker-compose.yml     # Multi-container setup
```

## Configuration

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=blinkroom
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=blinkroom
DATABASE_URL=postgresql://blinkroom:your_secure_password@postgres:5432/blinkroom

# Redis
REDIS_URL=redis://redis:6379/0

# Backend
CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## How It Works

1. **Create a Room** - Generate a unique 6-character room ID
2. **Share the Link** - Send the room code to friends
3. **Join & Chat** - Get assigned a random username, start chatting
4. **Auto-Delete** - Room and all messages disappear after 24 hours
5. **1-Hour Warning** - Countdown banner appears before expiry

## Privacy & Security

- **No Data Retention** - Messages are stored only in Redis and deleted with the room
- **No User Tracking** - No cookies, no analytics, no fingerprinting
- **Ephemeral by Design** - Everything disappears automatically
- **Self-Hosted** - You control the data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

Built with modern web technologies and a focus on privacy-first design.

---

**Made with ❤️ for ephemeral conversations**
