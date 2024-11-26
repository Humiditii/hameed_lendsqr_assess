import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { Knex } from 'knex';
import { AppResponse } from '../common/globalErrorHandler';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { GlobalErrI, JwtPayloadI } from '../common/interface/common.interface';
import { HttpService } from '@nestjs/axios';
import { UserI } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { WalletService } from '../wallet/wallet.service';
import { up } from '../database/db.service';

@Injectable()
export class UsersService {
    constructor(
        @Inject('KNEX_CONNECTION') private readonly knex:Knex,
        private jwtService: JwtService,
        private walletService: WalletService
    ) { }

    async createTable():Promise<void>{
        await up(this.knex)
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserI>{

        try {

            // Check Lendsqr Adjutor Karma API blacklist
            const isBlacklisted = await this.checkBlacklist(createUserDto.email);
            if (isBlacklisted) {

                const err: GlobalErrI = {
                    message: "This email address is blacklisted!",
                    status: 400
                }
                AppResponse.error(err)
            }

            const hashedPassword: string = hashSync(createUserDto.password, genSaltSync());

            const __userExist = await this.knex<UserI>('users').where({email:createUserDto.email}).first()

            if(__userExist){
                const err: GlobalErrI = {
                    message: "This email address exists!",
                    status: 400
                }
                AppResponse.error(err)
            }

            const user = await this.knex.transaction(async (trx:Knex.Transaction) => {
              

                const [_, user] = await Promise.all([
                    trx<UserI>('users').insert({
                        email: createUserDto.email,
                        first_name: createUserDto?.firstName,
                        last_name: createUserDto?.lastName,
                        password: hashedPassword
                    }).returning('*'),

                    trx<UserI>('users').where({ email: createUserDto.email }).first()

                ])


                return user
            });


            await this.walletService.createWallet(user.user_id)

            return user

        } catch (error) {
            error.location = `UsersService.${this.createUser.name} method`;
            AppResponse.error(error)
        }
    }

    async signIn(signInDto: Partial<CreateUserDto>):Promise<any>{
        try {
            
            const user = await this.knex<UserI>('users').where({email: signInDto?.email}).first();

            if(!user){
                const err: GlobalErrI = {
                    message: "This user could not be found!",
                    status: 404
                }
                AppResponse.error(err)
            }

            if (!compareSync(signInDto?.password, user?.password)){
                const err: GlobalErrI = {
                    message: "Invalid password!",
                    status: 400
                }
                AppResponse.error(err)
            }

            const payload: JwtPayloadI = {
                userEmail: user?.email,
                userId: user.user_id
            }

            return await this.jwtService.signAsync(payload);

        } catch (error) {
            error.location = `UsersService.${this.signIn.name} method`;
            AppResponse.error(error)
        }
    }

    // this is a mock, because the api requires KYC, and also is a paid request
    private async checkBlacklist(email: string): Promise<boolean> {
        
        try {
            
            const boolArray = [true, false];

            const randomIndex = Math.floor(Math.random() * boolArray.length);

            return boolArray[randomIndex];

        } catch (error) {
            error.location = `UsersService.${this.checkBlacklist.name} method`;
            AppResponse.error(error)
        }
    }
}
