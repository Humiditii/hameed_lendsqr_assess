import { Controller, Post, Body, Get, Req, Res, Query, Param, ParseIntPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {Response} from 'express';
import { FundWalletDto, GetTransactionsDto, RangeI, SortType, TransactionStatusEnum, TransactionTypeEnum, WithdrawDto } from './do/wallet.dto';
import { AppResponse } from 'src/common/globalErrorHandler';

const { success } = AppResponse;

@Controller('wallets')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Post('fund')
    async fundWallet(@Body() fundWalletDto: FundWalletDto ) {
        return await this.walletService.fundWallet(fundWalletDto);
    }

    @Get('transactions')
    async getTransaction(
        @Req() req: any,
        @Res() res: Response,
        @Query('type') type?: TransactionTypeEnum,
        @Query('status') status?:TransactionStatusEnum,
        @Query('amount') amount?: RangeI,
        @Query('created_at') created_at?:RangeI,
        @Query('sort') sort?: SortType,
        @Query('batch') batch?: number
    ):Promise<Response>{
        const payload: Partial<GetTransactionsDto> = {
            batch: batch ?? 1,
            ...( type ? {type}: null ),
            ...(status ? { status } : null),
            ...(amount ? { amount } : null),
            ...(created_at ? { created_at } : null),
            ...(sort ? { sort } : null)
        }

        const data = await this.walletService.getTransactions(payload, req.user.userId)

        return res.status(200).json(success('Transaction records fetched!', 200, data))
    }

    @Get('balance')
    async getBalance(
        @Req() req: any,
        @Res() res: Response
    ): Promise<Response> {

        const wallet = await this.walletService.getBalance(Number(req.user.userId))

        return res.status(200).json(success('Balance fetched!', 200, wallet))

    }

    @Post('withdraw')
    async withdraw(
        @Req() req: any,
        @Res() res: Response,
        @Body() withdrawDto: WithdrawDto
    ): Promise<Response> { 

        withdrawDto.userId = req.user.userId
        const data = await this.walletService.withdraw(withdrawDto)

        return res.status(201).json(success('Balance fetched!', 201, data))
    }


}
