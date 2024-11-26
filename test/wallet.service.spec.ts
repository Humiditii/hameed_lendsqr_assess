import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../src/wallet/wallet.service';
import { Knex } from 'knex';
import { AppResponse } from '../src/common/globalErrorHandler';
import { DatabaseModule } from '../src/database/database.module';

jest.mock('../src/common/globalErrorHandler', () => ({
    AppResponse: {
        success: jest.fn((message, statusCode, data = {}) => ({
            message,
            statusCode,
            data,
        })),
        error: jest.fn((err) => {
            const message = err?.message || `internal server error @ ${err?.location}`;
            const status = err?.status || 500;
            throw new (class MockAppException extends Error {
                statusCode = status;
                constructor() {
                    super(message);
                }
            })();
        }),
    },
}));

describe('WalletService', () => {
    let walletService: WalletService;
    let knexMock: jest.Mocked<Knex>;

    beforeEach(async () => {
        // Mock Knex methods
        knexMock = {
            transaction: jest.fn(),
            insert: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ balance: 100 }), 
            update: jest.fn().mockResolvedValue([1]), 
            delete: jest.fn().mockResolvedValue([1]),
            select: jest.fn(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
        } as unknown as jest.Mocked<Knex>;

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [
                WalletService,
                { provide: 'KNEX_CONNECTION', useValue: knexMock }
            ],
        }).compile();

        walletService = moduleRef.get<WalletService>(WalletService);
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    describe('fundWallet', () => {
        it('should fund the wallet successfully', async () => {
            const walletData = { wallet_id: 1, user_id: 1, balance: 100 };

            // Mock transaction behavior for knexMock
            const trxMock = {
                insert: jest.fn().mockResolvedValue([{ wallet_id: 1 }]),
                where: jest.fn().mockResolvedValue([{ balance: 100 }]),
                update: jest.fn().mockResolvedValue([1]),
            } as unknown as Knex.Transaction<any, any[]>;

           
            knexMock.transaction.mockImplementationOnce((callback) => {
                return Promise.resolve(callback(trxMock));
            });

            const fundAmount = 50; // The amount to fund the wallet
            const result = await walletService.fundWallet({ walletId: walletData.user_id, amount: fundAmount });

            expect(trxMock.insert).toHaveBeenCalledWith([{ user_id: 1, balance: 150 }]); 
            expect(trxMock.update).toHaveBeenCalledWith({ balance: 150 }); 
            expect(result).toEqual({ wallet_id: 1, user_id: 1, balance: 150 });
        });
    });

    describe('getTransactions', () => {
        it('should return transactions for a wallet', async () => {
            const mockTransactions = [
                { transaction_id: 1, amount: 100 },
                { transaction_id: 2, amount: 200 },
            ];

            knexMock.select.mockResolvedValueOnce(mockTransactions);

            const result = await walletService.getTransactions({ walletId: '1', batch: 0 }, 1);

            expect(knexMock.select).toHaveBeenCalledWith('*');
            expect(knexMock.where).toHaveBeenCalledWith({ wallet_id: '1' });
            expect(knexMock.limit).toHaveBeenCalledWith(10); 
            expect(knexMock.offset).toHaveBeenCalledWith(0); 
            expect(result).toEqual(mockTransactions); 
        });
    });

    describe('withdraw', () => {
        it('should deduct balance from a wallet successfully', async () => {
            
            knexMock.where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce({ wallet_id: 1, balance: 200 }),
            } as any);

            knexMock.update.mockResolvedValueOnce(1);

            await walletService.withdraw({ userId: 1, amount: 100 });

            expect(knexMock.where).toHaveBeenCalledWith({ wallet_id: 1 });
            expect(knexMock.update).toHaveBeenCalledWith({ balance: 100 });
        });

        it('should throw an error if balance is insufficient', async () => {
            
            knexMock.where.mockReturnValueOnce({
                first: jest.fn().mockResolvedValueOnce({ wallet_id: 1, balance: 50 }),
            } as any);

            await expect(walletService.withdraw({ userId: 1, amount: 100 })).rejects.toThrow('Insufficient balance!');
            expect(AppResponse.error).toHaveBeenCalledWith({
                message: 'Insufficient balance!',
                status: 400,
            });
        });
    });
});
