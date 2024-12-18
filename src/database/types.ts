export interface USER {
    id: number;
    discord_id: string;
    channel_id: string;
    username: string;
    linked_at: string;
}
export interface USER_CREATE {
    discord_id: string;
    channel_id: string;
    username: string;
}

export interface CRYPTO {
    id: number;
    name: string;
    symbol: string;
    api_id: string;
    added_at: string;
}
export interface CRYPTO_CREATE {
    name: string;
    symbol: string;
    api_id: string;
}

export interface BASIS {
    id: number;
    user_id: number;
    crypto_id: number;
    dollars: number;
    price: number;
    added_at: string;
}
export interface BASIS_CREATE {
    user_id: number;
    crypto_id: number;
    dollars: number;
    price: number;
}

export interface TARGET {
    id: number;
    user_id: number;
    crypto_id: number;
    price: number;
    percentage: number;
    created_at: string;
    was_notified: boolean;
}
export interface TARGET_CREATE {
    user_id: number;
    crypto_id: number;
    price: number;
    percentage: number;
}

export interface TARGET_USER_CRYPTO_JOIN extends TARGET, USER, CRYPTO {}
