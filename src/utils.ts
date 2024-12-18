import {
  SetBasisCommandParse,
  SetBasisError,
  AddTargetCommandParse,
  AddTargetError,
  RemoveTargetCommandParse,
  ViewTargetsCommandParse,
  RemoveTargetError,
  ViewTargetsError,
} from "./types";
import { SUPPORTED_TICKERS } from "./constants";

export function parseMarketCap(marketcap: string): number {
  const [value, unit] = [marketcap.slice(0, -1), marketcap.slice(-1)];
  switch (unit) {
    case "M":
      return parseFloat(value) * 1_000_000;
    case "B":
      return parseFloat(value) * 1_000_000_000;
    case "T":
      return parseFloat(value) * 1_000_000_000_000;
    default:
      return NaN;
  }
}

export function getReadableMarketCap(marketcap: number): string {
  if (marketcap < 1_000_000) {
    return `${marketcap}M`;
  } else if (marketcap < 1_000_000_000) {
    return `${marketcap / 1_000_000}B`;
  } else {
    return `${marketcap / 1_000_000_000}T`;
  }
}

export function parseDollarTarget(dollars: string): number {
  return parseFloat(dollars.replace(/,/g, ""));
}

export function parseSetBasisCommandArgs(
  message: string,
): SetBasisCommandParse {
  const args = message.split(" ").slice(1);
  if (args.length != 3) {
    return { success: false, error: SetBasisError.InvalidArgs };
  }
  const [ticker, dollars, price] = args;
  if (!Object.keys(SUPPORTED_TICKERS).includes(ticker)) {
    return { success: false, error: SetBasisError.InvalidTicker };
  }
  if (isNaN(parseFloat(dollars))) {
    return { success: false, error: SetBasisError.InvalidDollars };
  }
  if (isNaN(parseFloat(price))) {
    return { success: false, error: SetBasisError.InvalidPrice };
  }
  return {
    success: true,
    args: { ticker, dollars: parseFloat(dollars), buyPrice: parseFloat(price) },
  };
}

export function parseAddTargetCommandArgs(
  message: string,
): AddTargetCommandParse {
  const args = message.split(" ").slice(1);
  if (args.length != 3) {
    return { success: false, error: AddTargetError.InvalidArgs };
  }
  const [ticker, price, percentage] = args;
  if (!Object.keys(SUPPORTED_TICKERS).includes(ticker)) {
    return { success: false, error: AddTargetError.InvalidTicker };
  }
  if (isNaN(parseFloat(price))) {
    return { success: false, error: AddTargetError.InvalidMarketcap };
  }
  if (isNaN(parseFloat(percentage))) {
    return { success: false, error: AddTargetError.InvalidPercentage };
  }
  return {
    success: true,
    args: {
      ticker,
      price: parseFloat(price),
      percentage: parseFloat(percentage),
    },
  };
}

export function parseRemoveTargetCommandArgs(
  message: string,
): RemoveTargetCommandParse {
  const args = message.split(" ").slice(1);
  if (args.length != 2) {
    return { success: false, error: RemoveTargetError.InvalidArgs };
  }
  const [ticker, price] = args;
  if (!Object.keys(SUPPORTED_TICKERS).includes(ticker)) {
    return { success: false, error: RemoveTargetError.InvalidTicker };
  }
  if (isNaN(parseFloat(price))) {
    return { success: false, error: RemoveTargetError.InvalidPrice };
  }
  return {
    success: true,
    args: { ticker, price: parseFloat(price) },
  };
}

export function parseViewTargetsCommandArgs(
  message: string,
): ViewTargetsCommandParse {
  const args = message.split(" ").slice(1);
  if (args.length != 1) {
    return { success: false, error: ViewTargetsError.InvalidArgs };
  }
  const [ticker] = args;
  if (!Object.keys(SUPPORTED_TICKERS).includes(ticker)) {
    return { success: false, error: ViewTargetsError.InvalidTicker };
  }
  return { success: true, args: { ticker } };
}
