export class FundWalletDto {
    readonly walletId:number
    readonly amount:number
}


export enum TransactionStatusEnum {
    Approved = 'approved',
    Pending = 'pending',
}

export enum TransactionTypeEnum {
    Withdrawal = 'withdrawal',
    Transfer = 'transfer',
    Funding = 'funding'
}

export class GetTransactionsDto {
    readonly walletId:string
    readonly type?: TransactionTypeEnum
    readonly status?:TransactionStatusEnum
    readonly amount?: RangeI
    readonly created_at?:RangeI
    readonly sort?: SortType
    readonly batch?:number

}

export interface RangeI {
    readonly lte?: number,
    readonly gte?: number
}

export class WithdrawDto {
    userId: number
    readonly amount: number
}

export type SortType = 'asc' | 'desc'