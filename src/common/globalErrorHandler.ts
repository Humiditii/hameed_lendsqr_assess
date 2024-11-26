import { HttpException } from "@nestjs/common"
import { GlobalErrI } from "./interface/common.interface";


export class AppException extends HttpException {
    constructor(message: string, status: number, state: boolean = false) {
        super({ message, state, statusCode: status }, status);
    }
}

export const AppResponse = {

    success: (message: string, statusCode: number, data: object = {}) => {

        return {
            message,
            statusCode,
            data
        }
    },
    error: (err: GlobalErrI) => {

        const message = err?.message ? err.message : `internal server error @ ${err?.location}`;

        throw new AppException(message, err?.status ?? 500)
    }

}
