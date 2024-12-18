import { BASIS } from "../database/types";

// https://api.coingecko.com/api/v3/simple/price
export interface CoinGekkoSimplePriceResponse {
  [key: string]: {
    usd: number;
  };
}

export interface Alert {
  userId: number;
  cryptoId: number;
  username: string;
  channelId: string;
  symbol: string;
  targetPrice: number;
  percentage: number;
  currentPrice: number;
  basis?: BASIS;
}
