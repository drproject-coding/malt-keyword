import { z } from "zod";

export const MaltAutocompleteRequestSchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
});

export const MaltSuggestionSchema = z.object({
  label: z.string(),
  volume: z.number().optional(),
});

export const MaltAutocompleteResponseSchema = z.object({
  suggestions: z.array(MaltSuggestionSchema),
});

export type MaltAutocompleteRequest = z.infer<
  typeof MaltAutocompleteRequestSchema
>;
export type MaltSuggestion = z.infer<typeof MaltSuggestionSchema>;
export type MaltAutocompleteResponse = z.infer<
  typeof MaltAutocompleteResponseSchema
>;
