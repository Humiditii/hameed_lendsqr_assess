export interface UserI {
    readonly user_id:number
    readonly email: string
    readonly first_name:string
    readonly last_name:string
    readonly password: string
    readonly created_at: Date
    readonly updated_at: Date
}