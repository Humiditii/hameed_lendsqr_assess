export interface GlobalErrI {
    readonly message: string
    readonly status: number
    readonly data?: object
    readonly location?: string // the name of the function where the error occurred or any traceable desc
} 


export interface JwtPayloadI {
    readonly userId: number
    readonly userEmail:string
}