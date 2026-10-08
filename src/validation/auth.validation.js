import {z} from 'zod'

export const authSchema = z.object({
    email : z.string().email("please enter a valid email adress"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});