![SellSage Banner](https://github.com/user-attachments/assets/a50cfc85-1fee-4692-8900-b8a08286db1c)

# SellSage

**SellSage** is a Discord bot which helps cryptocurrency investors manage their exit strategies. Unlike simple price alert bots, SellSage manages sophisticated exit plans for the investor, including considerations such as cost basis and percentage based sell targets, and alerts them when the specified sell targets are met. This makes life easier for investors because they no longer have to constantly watch prices or pull up spreadsheets to figure out when or how much of their holdings to sell. Simply tell SellSage the details of your exit plan and enjoy being able to relax while you wait for the notifications.

Add **SellSage** to your Discord server using [this link](https://discord.com/oauth2/authorize?client_id=1317638256564633634). Use `/help` to see all commands and descriptions at once.

## Getting Started

This project was built with Node.js, Typescript, and SQLite.

Pull the repo and install dependencies using `npm install`.

### .env

Setup a `.env` file in the base directory with

- `DISCORD_BOT_TOKEN` - found in the [Discord Developer Portal](https://discord.com/developers/applications) -> Application -> Bot
- `COINGEKKO_API_KEY` - found in the [CoinGekko Developer Portal](https://www.coingecko.com/en/developers/dashboard) -> My API Keys

You should be able to set everything up for free - at the time of writing this CoinGekko has a demo tier for their API.

### Database

You can setup the database for development using `npm run init-db-dev`. There are also extra utility functions / npm scripts to help manage the database in `src/database`.

### Running SellSage

Once the steps above are complete, simply use `npm run dev` to start the development server.

## Notes for Your Development

### Additional Tickers

Adding support for additional tickers is trivial - simply add to the `SUPPORTED_TICKERS` constant and re-run the `seed.ts` database script (you might have to run `wipe.ts` first to avoid conflicts).

### Market Update Frequency

The cron job which watches price changes in the market is set up to run every 5 minutes in order to stay under the demo tier limits of the CoinGekko API. In the case you have a premium account, you can update the frequency of the job in `src/cron/watcher.ts`.

### Resyncing Slash Commands

If you make changes in `src/commands/register.ts` which defines the slash commands you see on discord, you can use the `npm run register-discord-commands` to push the updates.
