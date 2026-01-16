import { z } from 'zod';

// 네이밍 타입 enum
export const NamingTypeSchema = z.enum([
  'Screen',
  'Section',
  'Card',
  'ListItem',
  'Container',
  'Button',
  'Icon',
  'Image',
  'TopBar',
  'TabBar',
  'TabItem',
  'Header',
  'Frame',
]);

export type NamingType = z.infer<typeof NamingTypeSchema>;

// 네이밍 아이템 스키마
export const NamingItemSchema = z.object({
  id: z.string().min(1),
  type: NamingTypeSchema,
  suggestedName: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export type NamingItem = z.infer<typeof NamingItemSchema>;

// 네이밍 응답 스키마 (배열)
export const NamingResponseSchema = z.array(NamingItemSchema);

export type NamingResponse = z.infer<typeof NamingResponseSchema>;

// 검증 함수
export function validateNamingResponse(data: unknown): { success: true; data: NamingResponse } | { success: false; error: z.ZodError } {
  const result = NamingResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
