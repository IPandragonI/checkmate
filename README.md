# Checkmate

Checkmate is a turn-based online chess project developed as part of a Master 2 (M2) academic project. The goal of the project was to design and implement a multiplayer, turn-based game using WebSockets for real-time communication, with a focus on reliability (reconnection), persistence and simple AI opponents.

## Technologies

The application is built using a modern TypeScript/React/Next.js stack:
- Next.js (app router) – React framework for the frontend and server integration
- Socket.IO – WebSocket-like real-time communication between client and server
- Prisma + PostgreSQL (or other supported DB) – ORM and persistence for games, moves and chats
- chess.js – chess rules and FEN handling
- react-chessboard / chessboard wrapper – board UI
- BetterAuth – authentication
- Tailwind CSS – styling

## What is Checkmate?

Checkmate is a simple, turn-based chess application where users can:
- Create a new game or join an existing game with a code
- Play online against another human player in real-time
- Play against built-in bots with configurable difficulty/ELO

## Quick start (development)

1. Install dependencies:

```bash
npm install
```

2. Create a database and configure your environment variables (for example in `.env`):
- DATABASE_URL
- NEXT_PUBLIC_SOCKET_URL (optional, defaults to http://localhost:3000)
- BETTER_AUTH_SECRET (your BetterAuth secret key)
- BETTER_AUTH_URL (your BetterAuth instance URL)

3. Run database migrations and seed (if applicable):

```bash
npx prisma migrate dev
npm run seed
```

4. Start the development server (the project uses a custom `server.js` that integrates Next.js and Socket.IO):

```bash
npm run dev
```

5. Open your browser at http://localhost:3000

Notes:
- The project exposes a custom server entry (`server.js`) which starts Next.js and a Socket.IO server on the same process. In production you can run `npm run start` after building the app.

## Project structure (high level)

- `src/` – front-end and API routes
- `server.js` – custom Next.js + Socket.IO server
- `prisma/` – schema, migrations and seed script
- `public/` – static assets (pieces, icons, images)

## License

This repository is provided for academic purposes. If you want to reuse the code publicly, please add a suitable open-source license (e.g. MIT) and attribute the original author.
