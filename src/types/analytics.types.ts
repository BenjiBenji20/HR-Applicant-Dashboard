// ---- Reusable shape for any "label: count" breakdown ----
// Matches your "Senior Software Engineer: 1" example directly —
// this is what both the bar/donut charts AND the table view render from.
export interface CategoryCount {
    label: string;
    count: number;
}

// ---- Two-value breakdown (for stacked/grouped bars like interview vs no-show) ----
export interface CategoryCountPair {
    label: string;       // e.g. position name
    primary: number;      // e.g. interviewed
    secondary: number;    // e.g. no_show
}

// ---- Funnel stage ----
export interface FunnelStage {
    stage: string;        // "Applied" | "Test Finished" | "Interviewed" | "Hired"
    count: number;
}

// ---- Full analytics payload returned by the GAS endpoint ----
export interface AnalyticsSummary {
    totalApplicants: number;
    applyCountByPosition: CategoryCount[];        // bar chart
    applicationOutcome: CategoryCount[];           // donut: successful / unsuccessful / pending
    testCompletion: {
        completed: number;
        notCompleted: number;
    };
    interviews: {
        totalInterviewed: number;
        totalNoShow: number;
        byPosition: CategoryCountPair[];             // stacked/grouped bar
    };
    hiringFunnel: FunnelStage[];                    // funnel chart
    generatedAt: string;                            // ISO timestamp, useful for cache-busting/display
}

// ---- Generic wrapper so every chart card can share one render path ----
export type ChartKind = "bar" | "stackedBar" | "donut" | "funnel";

export interface ChartCardData<T> {
    id: string;
    title: string;
    chartKind: ChartKind;
    data: T;
    total?: number;
}