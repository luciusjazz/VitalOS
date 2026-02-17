import { pgTable, text, timestamp, uuid, integer, real, date, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    gender: text("gender"),
    birthday: date("birthday"),
    height: integer("height"), // cm
    startWeight: real("start_weight"),
    targetWeight: real("target_weight"),
    activityLevel: text("activity_level"),
    tmb: integer("tmb"), // Basal Metabolic Rate
    // Heart Health Config
    maxHr: integer("max_hr"), // Manual override or calculated
    restingHr: integer("resting_hr"), // For Karvonen formula
    birthDate: date("birth_date"), // For Age calc

    // Cardiac Rehab Protocol Data
    protocolMethod: text("protocol_method").default("manual"), // manual, cpet, ergometry, no_test
    ft1Bpm: integer("ft1_bpm"), // Limiar 1 (Training Zone Start)
    ft2Bpm: integer("ft2_bpm"), // Limiar 2 (Training Zone End)
    metPeak: real("met_peak"), // Peak METs from Ergometry
    vo2Peak: real("vo2_peak"), // Peak VO2 from CPET (optional)

    aiModel: text("ai_model").default("free"), // free, paid
    dietaryPreferences: text("dietary_preferences"), // JSON string or text
    workoutDays: integer("workout_days"), // Days per week
    workoutPreferences: text("workout_preferences"), // e.g. Gym, Run, Home
    stepGoal: integer("step_goal").default(10000),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dailyMetrics = pgTable("daily_metrics", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    date: date("date").notNull(),
    weight: real("weight"),
    sleepHours: real("sleep_hours"),
    steps: integer("steps"),
    caloriesBurned: integer("calories_burned"), // From Google Fit (Active + BMR)
    waterMl: integer("water_ml"),
    mood: text("mood"), // happy, neutral, sad, stressed
    energyLevel: integer("energy_level"), // 1-10
    waistCm: real("waist_cm"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = pgTable("meals", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // breakfast, lunch, dinner, snack
    photoUrl: text("photo_url"),
    calories: integer("calories"),
    protein: integer("protein"),
    carbs: integer("carbs"),
    fat: integer("fat"),
    qualityScore: integer("quality_score"), // 1-10 (IA)
    aiFeedback: text("ai_feedback"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kitchenItems = pgTable("kitchen_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    category: text("category"), // Hortifruti, Carnes, Despensa, etc
    status: text("status").notNull().default("shopping_list"), // shopping_list, pantry, consumed
    quantity: text("quantity"), // 2kg, 3 un
    expiryDate: date("expiry_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deprecated: Migrating to kitchenItems
export const shoppingItems = pgTable("shopping_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    item: text("item").notNull(),
    category: text("category"), // veggie, protein, etc
    isChecked: boolean("is_checked").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    googleId: text("google_id").unique(), // To prevent duplicates
    activityName: text("activity_name").notNull(), // "Running", "Walking", etc.
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    durationMinutes: integer("duration_minutes"),
    calories: integer("calories"), // Active calories
    distanceMeters: real("distance_meters"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coachInsights = pgTable("coach_insights", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    date: date("date").notNull(), // YYYY-MM-DD
    message: text("message").notNull(),
    type: text("type").notNull(), // morning_brief, warning, celebration, welcome
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const exercises = pgTable("exercises", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // "Running", "Cycling", etc.
    source: text("source").default("manual"), // "manual", "live_tracking", "google_fit", "health_connect"
    externalId: text("external_id"), // For Google Fit or other integrations
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    avgHr: integer("avg_hr"),
    maxHr: integer("max_hr"),
    calories: integer("calories"),
    zones: text("zones"), // JSON string { z1: 10, z2: 20 }
    safetyAlerts: integer("safety_alerts").default(0),
    aiAnalysis: text("ai_analysis"),
    rpe: integer("rpe"), // Rate of Perceived Exertion (1-10)
    feeling: text("feeling"), // "Great", "Tired", "Pain", etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingPlans = pgTable("training_plans", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    weeklyGoalMetMinutes: integer("weekly_goal_met_minutes"), // Target volume (MET-min or pure minutes)
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
