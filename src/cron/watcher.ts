import { fetchPrices, buildAlerts, sendAlerts } from "./utils";
import cron from "node-cron";

export function startPriceWatcher() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Fetching prices...");
    const prices = await fetchPrices();
    if (prices) {
      console.log("Building alerts...");
      const alerts = await buildAlerts(prices);
      if (alerts.length > 0) {
        console.log(`Sending ${alerts.length} alerts...`);
        await sendAlerts(alerts);
      } else {
        console.log("No alerts to send.");
      }
    }
  });
}
