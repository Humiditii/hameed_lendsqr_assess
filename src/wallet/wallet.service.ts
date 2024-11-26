import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { FundWalletDto, GetTransactionsDto, TransactionStatusEnum, TransactionTypeEnum, WithdrawDto } from './do/wallet.dto';
import { GlobalErrI } from '../common/interface/common.interface';
import { AppResponse } from '../common/globalErrorHandler';
import { TransactionI, WalletI } from './interface/wallet.interface';

@Injectable()
export class WalletService {
    constructor(@Inject('KNEX_CONNECTION') private readonly knex:Knex) { }

    async createWallet(userId: number) {
        return await this.knex('wallets').insert({ user_id: userId });
    }

    async fundWallet(fundWalletDto: FundWalletDto) {
        try {
            if (!fundWalletDto?.amount || !fundWalletDto?.walletId) {
                const err: GlobalErrI = {
                    message: "Incomplete transaction details",
                    status: 400
                }
                AppResponse.error(err)
            }

            await this.knex.transaction(async (trx: Knex.Transaction) => {

                const { walletId, amount } = fundWalletDto

                const wallet = await trx('wallets').where({ wallet_id: walletId }).first();

                if (!wallet) {
                    const err: GlobalErrI = {
                        message: "Wallet not found!",
                        status: 404
                    }
                    AppResponse.error(err)
                }

                await Promise.all([
                    trx('wallets')
                        .where({ wallet_id: walletId })
                        .update({ balance: parseFloat(wallet?.balance) + Number(amount) }),

                    trx('transactions').insert({
                        wallet_id: walletId,
                        type: TransactionTypeEnum.Funding,
                        status:TransactionStatusEnum.Approved,
                        amount: Number(amount)
                    })

                ])
            });

            return await this.knex('wallets').where({ wallet_id: fundWalletDto?.walletId }).first();
        } catch (error) {
            error.location = `WalletService.${this.fundWallet.name} method`;
            AppResponse.error(error)
        }
    }

    async getTransactions(getTransactionsDto: Partial<GetTransactionsDto>, userId: number): Promise<{ transactions: TransactionI[] , count:number}> {
        try {
            const { type, status, amount, created_at, sort, batch } = getTransactionsDto;

            // get the user's wallet
            const wallet = await this.knex<WalletI>('wallets').where({ user_id: userId }).first();

            const walletId: number = wallet.wallet_id;

            if (!walletId) {
                const err: GlobalErrI = {
                    message: "WalletId is required!",
                    status: 400
                }
                AppResponse.error(err)
            }

            const query = this.knex<TransactionI>('transactions').where('wallet_id', walletId);

            // Add filters dynamically
            if (type) {
                query.andWhere('type', type); 
            }

            if (status) {
                query.andWhere('status', status);
            }

            if (amount) {
                if (amount?.lte !== undefined) {
                    query.andWhere('amount', '<=', Number(amount.lte));
                }
                if (amount?.gte !== undefined) {
                    query.andWhere('amount', '>=', Number(amount.gte));
                }
            }

            if (created_at) {
                if (created_at?.lte !== undefined) {
                    query.andWhere('created_at', '<=', new Date(created_at.lte));
                }
                if (created_at.gte !== undefined) {
                    query.andWhere('created_at', '>=', new Date(created_at.gte));
                }
            }

            // Add sorting if specified
            if (sort) {
                query.orderBy('created_at', sort);
            }

            // Add pagination if batch is specified
            if (batch !== undefined) {
                const limit = 10; 
                const offset = (batch - 1) * limit; 
                query.limit(limit).offset(offset);
            }

            const [transactions,count] = await Promise.all([
                query,
                this.knex<TransactionI>('transactions').count('* as totalCount').where({ wallet_id: walletId })
            ])

            return { transactions, count: count[0]?.['totalCount'] ?? 0 };
        } catch (error) {
            error.location = `WalletService.${this.getTransactions.name} method`;
            AppResponse.error(error)
        }
    }

    async getBalance(userId:number): Promise<any> { 
        try {
            const wallet =  await this.knex('wallets').where({user_id: userId}).first();

            if(!wallet){
                const err: GlobalErrI = {
                    message: "Wallet not found!",
                    status: 404
                }
                AppResponse.error(err)
            }

            return wallet;
        } catch (error) {
            error.location = `WalletService.${this.getBalance.name} method`;
            AppResponse.error(error)
        }
    }

    async withdraw(withdrawDto: WithdrawDto): Promise<WalletI> {

        const {amount, userId} = withdrawDto;

        if (amount <= 0) {
            const err: GlobalErrI = {
                message: "Withdrawal amount must be greater than zero.",
                status: 400
            }
            AppResponse.error(err)
        }

        // Retrieve the user's wallet
        const wallet: WalletI = await this.knex<WalletI>('wallets')
            .where('user_id', userId)
            .first();

        if (!wallet) {
            const err: GlobalErrI = {
                message: "Wallet not found!",
                status: 404
            }
            AppResponse.error(err)
        }

        if (wallet.balance <= 0) {
            const err: GlobalErrI = {
                message: "Insufficient balance.",
                status: 400
            }
            AppResponse.error(err)
        }

        if (wallet.balance < amount) {

            const err: GlobalErrI = {
                message: "Withdrawal amount exceeds wallet balance.",
                status: 400
            }
            AppResponse.error(err)
        }

        // Mock external bank withdrawal process
        const isBankWithdrawalSuccessful = await this.mockBankWithdrawal(userId, amount);

        if (!isBankWithdrawalSuccessful) {
            const err: GlobalErrI = {
                message: "Bank withdrawal failed. Please try again.",
                status: 400
            }
            AppResponse.error(err)
            
        }

        return await this.knex.transaction(async (trx:Knex.Transaction) => {
   
            const wallet = await trx<WalletI>('wallets')
                .where('user_id', userId)
                .first();

            if (!wallet) {
                const err: GlobalErrI = {
                    message: "Wallet not found!",
                    status: 404
                }
                AppResponse.error(err)
            }

            if (wallet.balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Deduct amount from wallet balance and update the wallet

            const [_,__, balance] = await Promise.all([
                trx<WalletI>('wallets')
                    .where('user_id', userId)
                    .update({
                        balance: wallet.balance - amount,
                        updated_at: this.knex.fn.now(),
                    }),
                trx<TransactionI>('transactions')
                    .insert({
                        wallet_id: wallet.wallet_id,
                        type: TransactionTypeEnum.Withdrawal,
                        status: TransactionStatusEnum.Approved,
                        amount,
                        created_at: this.knex.fn.now(),
                    }),
                trx<WalletI>('wallets')
                    .where('user_id', userId).first()
                
            ])

            return balance;
        });
    }

  
    private async mockBankWithdrawal(userId: number, amount: number): Promise<boolean> {
        // Simulating an external service or API call with a small delay
        console.log(`Mocking bank withdrawal: User ID = ${userId}, Amount = ${amount}`);
        return new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }

}
