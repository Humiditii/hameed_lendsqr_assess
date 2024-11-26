import { TransactionStatusEnum, TransactionTypeEnum } from "../do/wallet.dto"

export interface WalletI {
    readonly wallet_id: number
    readonly balance: number
    readonly user_id: number
    readonly created_at: Date
    readonly updated_at: Date
}


export interface TransactionI {
    readonly transaction_id:number
    readonly status:TransactionStatusEnum
    readonly type: TransactionTypeEnum
    readonly amount: number
    readonly recipient_wallet_id:number
    readonly wallet_id: number
    readonly created_at: Date
    readonly updated_at: Date
}