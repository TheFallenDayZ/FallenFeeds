# DayZ Discord Bot with Web Dashboard

A fully-featured Discord bot with a web dashboard for managing DayZ servers through Nitrado API, complete with moderation tools, economy system, and gambling games.

## Features

### Discord Bot Features
- **Moderation Commands**: Ban, kick, warn, timeout, purge messages
- **Economy System**: Daily rewards, work commands, pay other users, leaderboard
- **Gambling Games**: Coinflip, dice, slots
- **DayZ Server Management**: Start/stop/restart servers, manage ban lists, view logs
- **PSN Device ID Lookup**: Lookup and track PlayStation Network device IDs
- **Comprehensive Logging**: All moderation actions are logged

### Web Dashboard Features
- **Server Status Monitoring**: Real-time server status and player counts
- **Moderation Logs**: View all moderation actions
- **Economy Leaderboard**: Track top users by balance
- **Server Control Panel**: Manage DayZ servers from the web
- **Secure Authentication**: Email/password authentication via Supabase

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Bot**: Discord.js (Node.js)
- **Database**: Supabase (PostgreSQL)
- **APIs**: Nitrado API for DayZ server management
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- Supabase Account ([Supabase](https://supabase.com))
- Nitrado Server and API Token ([Nitrado](https://nitrado.net))

## Setup Instructions

### 1. Database Setup

The database schema is already created in Supabase with the following tables:
- `discord_users` - User economy and profile data
- `guilds` - Server configurations
- `moderation_logs` - Moderation action logs
- `warnings` - User warnings
- `economy_transactions` - Economy transaction history
- `gambling_history` - Gambling game history
- `dayz_servers` - DayZ server information

### 2. Discord Bot Setup

1. Navigate to the bot directory:
```bash
cd bot
npm install
```

2. Create a `.env` file based on `.env.example`:
```env
DISCORD_BOT_TOKEN=your_discord_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Start the bot:
```bash
npm start
```

### 3. Web Dashboard Setup

1. Navigate to the project root directory
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Build and run the dashboard:
```bash
npm run build
npm run preview
```

## Discord Bot Commands

### Moderation Commands
- `/ban [user] [reason]` - Ban a user from the server
- `/kick [user] [reason]` - Kick a user from the server
- `/warn [user] [reason]` - Warn a user
- `/warnings [user]` - View warnings for a user
- `/clearwarnings [user]` - Clear all warnings for a user
- `/timeout [user] [duration] [reason]` - Timeout a user
- `/purge [amount]` - Delete multiple messages
- `/modlogs [limit]` - View moderation logs

### Economy Commands
- `/balance [user]` - Check your or another user's balance
- `/daily` - Claim your daily reward (1000 coins)
- `/work` - Work to earn money (100-500 coins)
- `/pay [user] [amount]` - Pay another user
- `/leaderboard` - View the server economy leaderboard

### Gambling Commands
- `/coinflip [amount] [heads/tails]` - Flip a coin (2x payout)
- `/dice [amount]` - Roll dice (1x-4x payout based on roll)
- `/slots [amount]` - Play slots (2x-10x payout)

### Server Management Commands
- `/setup [nitrado_token] [server_id]` - Configure Nitrado integration
- `/server` - View DayZ server status
- `/startserver` - Start the DayZ server
- `/stopserver` - Stop the DayZ server
- `/restartserver` - Restart the DayZ server
- `/logs` - View server logs
- `/banlist` - View the server ban list
- `/addban [identifier] [reason]` - Add a player to the ban list
- `/removeban [identifier]` - Remove a player from the ban list
- `/psnlookup [deviceid]` - Lookup PSN Device ID information

### Utility Commands
- `/help` - View all available commands

## Web Dashboard Usage

1. Navigate to the dashboard URL
2. Sign up or log in with your email and password
3. Access the following sections:
   - **Overview**: Server status and quick stats
   - **Server Control**: Manage your DayZ servers
   - **Moderation**: View moderation logs
   - **Economy**: View economy leaderboard
   - **Settings**: Bot configuration

## Nitrado API Integration

The bot integrates with Nitrado's API to provide:
- Server start/stop/restart functionality
- Real-time server status monitoring
- Player count tracking
- Ban list management
- Server log access

### Setting Up Nitrado Integration

1. Get your Nitrado API token from [Nitrado Dashboard](https://server.nitrado.net)
2. Run `/setup [your_token] [your_server_id]` in Discord
3. The bot will verify the connection and store your settings

## Security Features

- Row Level Security (RLS) enabled on all database tables
- Secure authentication via Supabase
- Encrypted Nitrado tokens in database
- Permission-based command access
- Ephemeral responses for sensitive commands

## Project Structure

```
.
├── bot/                  # Discord bot
│   ├── commands/         # Command modules
│   │   ├── economy.js
│   │   ├── gambling.js
│   │   ├── moderation.js
│   │   ├── register.js
│   │   ├── server.js
│   │   └── utility.js
│   ├── index.js          # Bot entry point
│   └── package.json
├── src/                  # Web dashboard
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard sub-components
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   └── supabase.ts
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

## Development

### Bot Development
```bash
cd bot
npm run dev  # Runs with --watch flag for auto-reload
```

### Dashboard Development
```bash
npm run dev  # Starts Vite dev server
```

## Troubleshooting

### Bot Not Responding
1. Check if the bot is online in Discord
2. Verify the bot token in `.env`
3. Ensure the bot has the required permissions in your Discord server
4. Check console logs for errors

### Dashboard Login Issues
1. Verify Supabase credentials in `.env`
2. Check browser console for errors
3. Ensure you've signed up with a valid email

### Nitrado Integration Not Working
1. Verify your Nitrado API token is valid
2. Check if the server ID is correct
3. Ensure your Nitrado account has active services

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues and questions, please create an issue in the repository.
