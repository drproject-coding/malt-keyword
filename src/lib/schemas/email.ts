import { z } from "zod";

// Subscribe endpoint schemas
export const SubscribeRequest = z.object({
  email: z.string().email("Please provide a valid email address"),
  name: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "You must consent to receive updates",
  }),
});

export const SubscribeResponse = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  verificationEmailSent: z.boolean().optional(),
});

// Verify endpoint schemas
export const VerifyRequest = z.object({
  token: z.string().min(1, "Token is required"),
});

export const VerifyResponse = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  redirectUrl: z.string().optional(),
});

// Type exports for use in API routes
export type SubscribeRequestType = z.infer<typeof SubscribeRequest>;
export type SubscribeResponseType = z.infer<typeof SubscribeResponse>;
export type VerifyRequestType = z.infer<typeof VerifyRequest>;
export type VerifyResponseType = z.infer<typeof VerifyResponse>;
