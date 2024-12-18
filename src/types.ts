export enum Command {
  Link = "link",
  Unlink = "unlink",
  SetBasis = "setbasis",
  AddTarget = "addtarget",
  RemoveTarget = "removetarget",
  ViewTargets = "viewtargets",
  Help = "help",
}

export interface SetBasisCommandParse {
  success: boolean;
  args?: SetBasisParams;
  error?: SetBasisError;
}
export interface SetBasisParams {
  ticker: string;
  dollars: number;
  buyPrice: number;
}
export enum SetBasisError {
  InvalidArgs = "Invalid arguments. Please use the following format: `!setbasis <crypto ticker - ie. BTC, ETH, SOL> <dollars in ie. 10.50, 275, 5000> <price per token ie. 0.5, 15.00>`",
  InvalidTicker = "Invalid ticker. Use !help to see a list of supported tickers.",
  InvalidDollars = "Invalid dollar amount ie. 10.50, 275, 5000.",
  InvalidPrice = "Invalid price per token ie. 0.5, 15.00.",
}

export interface AddTargetCommandParse {
  success: boolean;
  args?: AddTargetParams;
  error?: AddTargetError;
}
export interface AddTargetParams {
  ticker: string;
  price: number;
  percentage: number;
}
export enum AddTargetError {
  InvalidArgs = "Invalid arguments. Please use the following format: `!addtarget <crypto ticker - ie. BTC, ETH, SOL> <target price ie. 0.005, 1.60, 125499> <percentage ie. 5, 15, 50>`",
  InvalidTicker = "Invalid ticker. Use !help to see a list of supported tickers.",
  InvalidMarketcap = "Invalid price ie. 0.005, 1.60, 125499.",
  InvalidPercentage = "Invalid percentage ie. 5, 15, 50.",
}

export interface RemoveTargetCommandParse {
  success: boolean;
  args?: RemoveTargetParams;
  error?: RemoveTargetError;
}
export interface RemoveTargetParams {
  ticker: string;
  price: number;
}
export enum RemoveTargetError {
  InvalidArgs = "Invalid arguments. Please use the following format: `!removetarget <crypto ticker - ie. BTC, ETH, SOL> <target price ie. 0.005, 1.60, 125499>`",
  InvalidTicker = "Invalid ticker. Use !help to see a list of supported tickers.",
  InvalidPrice = "Invalid marketcap ie. 0.005, 1.60, 125499.",
}

export interface ViewTargetsCommandParse {
  success: boolean;
  args?: ViewTargetsParams;
  error?: ViewTargetsError;
}
export interface ViewTargetsParams {
  ticker: string;
}
export enum ViewTargetsError {
  InvalidArgs = "Invalid arguments. Please use the following format: `!viewtargets <crypto ticker - ie. BTC, ETH, SOL>`",
  InvalidTicker = "Invalid ticker. Use !help to see a list of supported tickers.",
}
