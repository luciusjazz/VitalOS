"use client";

import { useEffect } from "react";
import { syncGoogleFit } from "@/lib/actions/fitness";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AutoSyncFit() {
    const router = useRouter();

    useEffect(() => {
        const lastSync = localStorage.getItem("vital_last_sync_fit");
        const now = Date.now();

        // Sync if > 15 minutes ago
        if (!lastSync || now - Number(lastSync) > 15 * 60 * 1000) {
            console.log("Auto-Syncing Google Fit...");
            syncGoogleFit().then((res) => {
                if (res.success) {
                    localStorage.setItem("vital_last_sync_fit", String(now));
                    console.log("Auto-Sync Success", res);
                    // Silent update, or minimal toast
                    if (res.sessionsCount && res.sessionsCount > 0) {
                        toast.success(`Google Fit: +${res.sessionsCount} treinos importados.`);
                    }
                    router.refresh(); // Refresh server components to show new steps
                } else {
                    console.error("Auto-Sync Failed", res.error);
                }
            });
        }
    }, [router]);

    return null; // Invisible component
}
