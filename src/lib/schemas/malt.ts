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

// ── Profile search schemas ────────────────────────────────────────────────────

const MaltProfileSkillSchema = z.object({
  label: z.string(),
  certified: z.boolean().default(false),
  level: z.string().optional(),
});

const MaltProfilePhotoSchema = z.object({
  absoluteUrl: z.string().optional(),
});

const MaltProfileLocationSchema = z.object({
  locationType: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
});

const MaltProfilePriceSchema = z.object({
  visibility: z.string().optional(),
  value: z
    .object({
      amount: z.number(),
      currency: z.string(),
    })
    .optional(),
});

const MaltProfileAvailabilitySchema = z.object({
  status: z.string().optional(), // AVAILABLE_AND_VERIFIED | AVAILABLE | UNAVAILABLE
  workAvailability: z.string().optional(),
  frequency: z.string().optional(),
});

const MaltProfileStatsSchema = z.object({
  rating: z.number().optional(),
  missionsCount: z.number().optional(),
  recommendationsCount: z.number().optional(),
  appraisalsWithRatesCount: z.number().optional(),
});

const MaltPortfolioItemSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
});

export const MaltProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  headline: z.string().optional(),
  photo: MaltProfilePhotoSchema.optional(),
  location: MaltProfileLocationSchema.optional(),
  price: MaltProfilePriceSchema.optional(),
  availability: MaltProfileAvailabilitySchema.optional(),
  stats: MaltProfileStatsSchema.optional(),
  badges: z.array(z.string()).default([]),
  skills: z.array(MaltProfileSkillSchema).default([]),
  portfolio: z.array(MaltPortfolioItemSchema).default([]),
  url: z.string().optional(),
});

const MaltPaginationSchema = z.object({
  current: z.number(),
  total: z.number(),
  totalElements: z.number(),
  firstItem: z.number(),
  lastItem: z.number(),
});

export const MaltProfilesResponseSchema = z.object({
  searchId: z.string().optional(),
  searchType: z.string().optional(),
  profiles: z.array(MaltProfileSchema),
  pagination: MaltPaginationSchema.optional(),
});

export type MaltProfile = z.infer<typeof MaltProfileSchema>;
export type MaltProfilesResponse = z.infer<typeof MaltProfilesResponseSchema>;
