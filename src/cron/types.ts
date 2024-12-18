import { BASIS } from "../database/types";

// https://api.coingecko.com/api/v3/simple/price
export interface CoinGekkoSimplePriceResponse {
    [key: string]: {
        usd: number;
    };
}

export interface Alert {
    targetId: number;
    userId: number;
    cryptoId: number;
    channelId: string;
    username: string;
    symbol: string;
    targetPrice: number;
    percentage: number;
    currentPrice: number;
    basis?: BASIS;
}
