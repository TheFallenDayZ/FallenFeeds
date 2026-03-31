# DayZ Discord Bot

Discord bot for managing DayZ servers, moderation, economy, and gambling.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DISCORD_BOT_TOKEN=your_discord_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Start the bot:
```bash
npm start
```

## Bot Invite Link

Create a bot invite link with these permissions:
- Read Messages/View Channels
- Send Messages
- Manage Messages
- Embed Links
- Read Message History
- Use Slash Commands
- Ban Members
- Kick Members
- Moderate Members

Permissions Integer: `1099511627782`

## Command Categories

### Moderation (7 commands)
- ban, kick, warn, warnings, clearwarnings, timeout, purge, modlogs

### Economy (5 commands)
- balance, daily, work, pay, leaderboard

### Gambling (3 commands)
- coinflip, dice, slots

### Server Management (9 commands)
- setup, server, startserver, stopserver, restartserver, logs, banlist, addban, removeban, psnlookup

### Utility (1 command)
- help

## Development

Run with auto-reload:
```bash
npm run dev
```

## Environment Variables

- `DISCORD_BOT_TOKEN` - Your Discord bot token from the Developer Portal
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for full database access)

## File Structure

```
bot/
├── commands/
│   ├── economy.js       # Economy system commands
│   ├── gambling.js      # Gambling game commands
│   ├── moderation.js    # Moderation commands
│   ├── register.js      # Slash command registration
│   ├── server.js        # DayZ server management
│   └── utility.js       # Utility commands
├── index.js             # Main bot file
├── package.json
└── .env.example
```

## Notes

- All commands are slash commands (no prefix needed)
- Commands are automatically registered when the bot starts
- Moderation actions are logged to the database
- Economy cooldowns are stored in memory (reset on bot restart)
