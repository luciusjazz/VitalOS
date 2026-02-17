import { z } from "zod";

export const onboardingSchema = z.object({
    gender: z.enum(["male", "female"]),
    age: z.coerce.number().min(10).max(100),
    weight: z.coerce.number().min(30).max(300),
    height: z.coerce.number().min(100).max(250),
    goalWeight: z.coerce.number().min(30).max(300),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

export const profileSchema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    height: z.coerce.number().min(50).max(300),
    targetWeight: z.coerce.number().min(30).max(300),
    dietaryPreferences: z.string().optional(),
    workoutDays: z.coerce.number().min(0).max(7),
    workoutPreferences: z.string().optional(),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
    stepGoal: z.coerce.number().min(1000).max(50000),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
