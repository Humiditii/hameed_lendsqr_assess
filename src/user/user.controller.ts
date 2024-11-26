import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import {Response} from 'express';
import { AppResponse } from 'src/common/globalErrorHandler';
import { Public } from 'src/common/decorator/public.decorator';

const { success } = AppResponse;

@Public(true)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('migrate')
    async createTable(@Res() res: Response){
        await this.usersService.createTable()

        return res.status(201).json(success('created!', 200))
    }

    @Post('create')
    async createUser( 
        @Res() res: Response,
        @Body() createUserDto:CreateUserDto
    ) {
        const data =  await this.usersService.createUser(createUserDto);

        return res.status(201).json(success('New user created!', 201, data))
    }

    @Post('signin')
    async signIn(
        @Res() res: Response,
        @Body() signInDto: Partial<CreateUserDto>
    ):Promise<Response>{

        const token: string = await this.usersService.signIn(signInDto)

        return res.status(200).json(success('Signin success', 200, { token }))
    }
}
