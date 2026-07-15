import { z } from 'zod'

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
