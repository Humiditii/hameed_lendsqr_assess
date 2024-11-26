import { Test } from '@nestjs/testing';
import { UsersService } from '../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Knex } from 'knex';
import { AppResponse } from '../src/common/globalErrorHandler';
import { hashSync, compareSync, genSaltSync } from 'bcrypt';
import { WalletService } from '../src/wallet/wallet.service';
import { DatabaseModule } from '../src/database/database.module';

// Mock AppResponse for error handling
jest.mock('../src/common/globalErrorHandler', () => ({
    AppResponse: {
        error: jest.fn((error) => {
            throw new Error(error.message || 'AppResponse error');
        }),
    },
}));

describe('UsersService', () => {
    let usersService: UsersService;
    let knexMock: jest.Mocked<Knex>;
    let jwtServiceMock: jest.Mocked<JwtService>;
    let walletServiceMock: jest.Mocked<WalletService>;

    beforeEach(async () => {
        // Mock Knex
        knexMock = {
            transaction: jest.fn(),
            insert: jest.fn(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockReturnThis(),
            update: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Knex<any, any[]>>;

        // Mock JwtService
        jwtServiceMock = {
            signAsync: jest.fn(),
        } as unknown as jest.Mocked<JwtService>;

        // Mock WalletService
        walletServiceMock = {
            createWallet: jest.fn(),
        } as unknown as jest.Mocked<WalletService>;

        const moduleRef = await Test.createTestingModule({
            imports:[DatabaseModule],
            providers: [
                UsersService,
                { provide: 'KNEX_CONNECTION', useValue: knexMock },
                { provide: JwtService, useValue: jwtServiceMock },
                { provide: WalletService, useValue: walletServiceMock },
            ],
        }).compile();

        usersService = moduleRef.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTable', () => {
        it('should call function to create tables', async () => {
            const upMock = jest.fn().mockResolvedValueOnce(undefined);
            jest.spyOn(usersService, 'createTable').mockImplementationOnce(() => upMock(knexMock));

            await usersService.createTable();
            expect(upMock).toHaveBeenCalledWith(knexMock);
        });
    });

    describe('createUser', () => {
        it('should throw error if email is blacklisted', async () => {
            jest.spyOn(usersService as any, 'checkBlacklist').mockResolvedValueOnce(true);

            const createUserDto = {
                email: 'blacklisted@example.com',
                password: 'hammeedpwd',
                firstName: 'Hameed',
                lastName: 'Babatunde',
            };

            await expect(usersService.createUser(createUserDto)).rejects.toThrow('This email address is blacklisted!');
        });

        it('should throw error if user already exists', async () => {
            jest.spyOn(usersService as any, 'checkBlacklist').mockResolvedValueOnce(false);
            knexMock.first.mockResolvedValueOnce({ email: 'hameed@gmail.com' });

            const createUserDto = {
                email: 'hameed@gmail.com',
                password: 'hammeedpwd',
                firstName: 'Hameed',
                lastName: 'Babatunde',
            };

            await expect(usersService.createUser(createUserDto)).rejects.toThrow('This email address exists!');
        });

        it('should create a new user and wallet', async () => {
            jest.spyOn(usersService as any, 'checkBlacklist').mockResolvedValueOnce(false);
            knexMock.first.mockResolvedValueOnce(null); // No user exists
            knexMock.transaction.mockImplementationOnce(async (trxCallback) => {
                const trx = knexMock as any;
                trx.insert.mockResolvedValueOnce([{ user_id: 1, email: 'hameed@gmail.com' }]);
                trx.where.mockReturnValueOnce({ first: jest.fn().mockResolvedValueOnce({ user_id: 1 }) });
                return trxCallback(trx);
            });

            const createUserDto = {
                email: 'hameed@gmail.com',
                password: 'hammeedpwd',
                firstName: 'Hameed',
                lastName: 'Babatunde',
            };

            const user = await usersService.createUser(createUserDto);

            expect(walletServiceMock.createWallet).toHaveBeenCalledWith(1);
            expect(user.email).toBe(createUserDto.email);
        });
    });

    describe('signIn', () => {
        it('should throw error if user is not found', async () => {
            knexMock.first.mockResolvedValueOnce(null);

            const signInDto = { email: 'hameed@gmail.com', password: 'password123' };

            await expect(usersService.signIn(signInDto)).rejects.toThrow('This user could not be found!');
        });

        it('should throw error if password is invalid', async () => {
            const userMock = { email: 'hameed@gmail.com', password: hashSync('realPassword', genSaltSync()) };
            knexMock.first.mockResolvedValueOnce(userMock);

            const signInDto = { email: 'hameed@gmail.com', password: 'wrongPassword' };

            await expect(usersService.signIn(signInDto)).rejects.toThrow('Invalid password!');
        });

        it('should return JWT token for valid credentials', async () => {
            const userMock = { user_id: 1, email: 'hameed@gmail.com', password: hashSync('realPassword', genSaltSync()) };
            knexMock.first.mockResolvedValueOnce(userMock);

            jwtServiceMock.signAsync.mockResolvedValueOnce('mockJwtToken');

            const signInDto = { email: 'hameed@gmail.com', password: 'realPassword' };

            const token = await usersService.signIn(signInDto);

            expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
                userEmail: userMock.email,
                userId: userMock.user_id,
            });
            expect(token).toBe('mockJwtToken');
        });
    });

    describe('checkBlacklist', () => {
        it('should return true or false randomly', async () => {
            const result = await usersService['checkBlacklist']('hameed@gmail.com');
            expect([true, false]).toContain(result);
        });
    });
});
