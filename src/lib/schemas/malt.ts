import { z } from "zod";

export const MaltAutocompleteRequestSchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
});

export const MaltSuggestionSchema = z.object({
  label: z.string(),
  occurrences: z.number().optional(),
});

// Raw array format returned by the Malt API
const MaltRawSuggestionSchema = z.object({
  label: z.string(),
  occurrences: z.number().optional(),
  universe: z.string().optional(),
  tag: z.unknown().nullable().optional(),
});

export const MaltAutocompleteRawSchema = z.array(MaltRawSuggestionSchema);

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
