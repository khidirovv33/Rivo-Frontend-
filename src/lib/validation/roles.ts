import { z } from 'zod';

// Правила зеркалят Rivo.Application/Roles/Validators/RoleDtoValidators.cs
export const roleSchema = z.object({
  name: z.string().min(1, 'Введите название').max(100, 'Максимум 100 символов'),
  description: z.string().optional().or(z.literal('')),
});
export type RoleFormValues = z.infer<typeof roleSchema>;
