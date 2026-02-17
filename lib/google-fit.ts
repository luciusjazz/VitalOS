
import { toZonedTime } from 'date-fns-tz';

export async function getGoogleFitData(accessToken: string) {
    // 1. Define Time Range (Start of Day to Now) - Brazil Time
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const nowBrazil = toZonedTime(now, timeZone);
    const startOfDayBrazil = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate());

    // We need the startOfDay in UTC millis for the API
    // Since startOfDayBrazil was constructed from Brazil components (e.g. 2023-10-27 00:00:00), 
    // we need to find the UTC timestamp that corresponds to that Brazil time.
    // The previous line created a Date object treating the components as LOCAL system time (which is UTC in Vercel).
    // So `startOfDayBrazil` is actually 2023-10-27 00:00:00 UTC.
    // But we want 2023-10-27 00:00:00 Brazil (-3).
    // 00:00 Brazil is 03:00 UTC.
    // If we use date-fns-tz `fromZonedTime` it would be better, but we only have `toZonedTime`.
    // Actually, `toZonedTime` converts UTC date to a Date instance with the components of the target zone.

    // Let's use a simpler approach: Get Brazil YYYY-MM-DD string, then parse it.
    const brazilDateStr = now.toLocaleDateString('en-CA', { timeZone }); // YYYY-MM-DD
    // Create date from string, treating it as Brazil time
    // We can just add T00:00:00-03:00 (approx, better to use offset)
    // Or let's manually shift.

    // Better: use `getBrazilDate` from date-utils if possible, but avoiding circular deps?
    // Let's just do manual shift for now or rely on the offset.
    // We know Brazil is generally -03:00 (no DST in recent years).

    const startOfDay = new Date(brazilDateStr + 'T00:00:00-03:00'); // Valid ISO for 00:00 in -03:00 offset
    // Note: 'America/Sao_Paulo' is standard -03:00 usually. 

    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = now.getTime();

    // 2. Prepare Aggregation Request
    const body = {
        aggregateBy: [
            {
                dataTypeName: "com.google.step_count.delta",
                dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            },
            {
                dataTypeName: "com.google.calories.expended",
                dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended"
            }
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day bucket (we just want the total since start of day)
        startTimeMillis,
        endTimeMillis
    };

    // 3. Call Google Fit API
    const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        cache: "no-store"
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Google Fit API Error:", text);
        throw new Error(`Google Fit Error: ${response.status} - ${text}`);
    }

    const data = await response.json();

    // 4. Parse Response
    let steps = 0;
    let calories = 0;

    // The response has "bucket" array. Since we asked for 1 bucket covering the whole day, we just check bucket[0].
    const bucket = data.bucket?.[0];
    if (bucket && bucket.dataset) {
        // Steps (dataset[0])
        const stepPoints = bucket.dataset[0].point;
        if (stepPoints && stepPoints.length > 0) {
            steps = stepPoints[0].value[0].intVal || 0;
        }

        // Calories (dataset[1])
        const calPoints = bucket.dataset[1].point;
        if (calPoints && calPoints.length > 0) {
            calories = Math.round(calPoints[0].value[0].fpVal || 0);
        }
    }

    console.log(`Google Fit Sync: ${steps} steps, ${calories} kcal from ${startOfDay.toISOString()} to ${now.toISOString()}`);

    return {
        steps,
        calories,
        raw: bucket ? JSON.stringify(bucket) : "No Bucket Found"
    };
}

const ACTIVITY_MAP: Record<number, string> = {
    7: "Caminhada",
    8: "Corrida",
    1: "Ciclismo",
    97: "Musculação",
    72: "Dormindo",
    // Add more as needed
};

export async function getGoogleFitActivitySummary(accessToken: string) {
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const brazilDateStr = now.toLocaleDateString('en-CA', { timeZone });
    const startOfDay = new Date(brazilDateStr + 'T00:00:00-03:00');

    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = now.getTime();

    const body = {
        aggregateBy: [{
            dataTypeName: "com.google.activity.segment",
            dataSourceId: "derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments"
        }],
        bucketByActivityType: { minDurationMillis: 900000 }, // Only > 15 mins
        startTimeMillis,
        endTimeMillis
    };

    const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        cache: "no-store"
    });

    if (!response.ok) {
        console.error("Google Fit Activity Summary Error:", await response.text());
        return [];
    }

    const data = await response.json();
    const buckets = data.bucket || [];

    // Map bucket to activities
    return buckets.map((b: any) => {
        const activityId = b.activity;
        // For bucketByActivityType, the duration is in the dataset
        const durationMillis = b.dataset[0].point[0]?.value[0]?.intVal || 0;

        return {
            activityId,
            name: ACTIVITY_MAP[activityId] || "Atividade",
            durationMinutes: Math.round(durationMillis / 60000),
            calories: 0
        };
    }).filter((a: any) => a.durationMinutes > 0);
}

export async function getGoogleFitSessions(accessToken: string) {
    const timeZone = 'America/Sao_Paulo';
    const now = new Date();
    const brazilDateStr = now.toLocaleDateString('en-CA', { timeZone });
    const startOfDay = new Date(brazilDateStr + 'T00:00:00-03:00');

    // Convert to ISO-8601 for sessions endpoint
    const startTime = startOfDay.toISOString();
    const endTime = now.toISOString();

    const response = await fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${startTime}&endTime=${endTime}`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        cache: "no-store"
    });

    if (!response.ok) {
        console.error("Google Fit Sessions Error:", await response.text());
        return [];
    }

    const data = await response.json();
    const sessions = data.session || [];

    return sessions.map((s: any) => ({
        googleId: s.id,
        name: s.name || ACTIVITY_MAP[s.activityType] || "Exercício",
        activityType: ACTIVITY_MAP[s.activityType] || "Outro",
        startTime: new Date(Number(s.startTimeMillis)),
        endTime: new Date(Number(s.endTimeMillis)),
        durationMinutes: Math.round((Number(s.endTimeMillis) - Number(s.startTimeMillis)) / 60000),
        // Google Fit sessions don't always have calories directly in the session object, 
        // usually you have to fetch the dataset for that session.
        // For MVP, we'll leave calories null here or fetch if critical.
        // User asked for "Basic" import.
    }));
}
