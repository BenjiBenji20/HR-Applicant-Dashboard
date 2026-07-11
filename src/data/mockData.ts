import { ApplicantSummary, ApplicantDetail, classifications } from "../types";

export const initialSummaryResults: ApplicantSummary[] = [
  {
    id: "8a8d8eed-1600-41fa-9023-b7a687df816d",
    metadata: {
      timestamp: "2026-07-08T10:15:00Z",
      supervisoryTest: true,
      emailAddress: "john.doe@example.com",
      fullName: "John Doe"
    },
    intent: {
      positionAppliedFor: "Senior Software Engineer",
      date: "2026-07-08"
    },
    scores: {
      cfit: classifications[1], // Below Average
      comprehension: classifications[1],
      planning: classifications[1],
      supervisoryTotalEvaluation: classifications[1],
    },
  },
  {
    id: "2b9a7c8d-3400-52ea-8134-c7a687df554a",
    metadata: {
      timestamp: "2026-07-07T09:30:00Z",
      supervisoryTest: true,
      emailAddress: "sarah.jenkins@example.com",
      fullName: "Sarah Jenkins"
    },
    intent: {
      positionAppliedFor: "HR Specialist",
      date: "2026-07-07"
    },
    scores: {
      cfit: classifications[3], // Average
      comprehension: classifications[6], // Superior
      planning: classifications[6], // Superior
      supervisoryTotalEvaluation: classifications[5], // Above Average
    },
  }
];

export const initialDetailedProfiles: Record<string, ApplicantDetail> = {
  "8a8d8eed-1600-41fa-9023-b7a687df816d": {
    id: "8a8d8eed-1600-41fa-9023-b7a687df816d",
    detailed16pf: {
      emotionalStability: classifications[1],
      senseOfResponsibility: classifications[1],
      conscientiousness: classifications[1],
      assertiveness: classifications[1],
      confidence: classifications[1],
      flexibility: classifications[1],
      openMindedness: classifications[1],
      selfReliance: classifications[1],
      sociability: classifications[1],
      trustAcceptance: classifications[1],
      objectivity: classifications[1],
      optimismLiveliness: classifications[2]
    },
    supervisory: {
      management: classifications[1],
      supervision: classifications[1],
      employeeRelations: classifications[1],
      humanRelationsPractices: classifications[2]
    },
    mentalAbility: "The candidate demonstrates exceptional fluid intelligence (CFIT) and robust planning mechanisms. In interpersonal parameters, John shows a solid propensity for leading large teams.",
    supervisoryIndexesAI: {
      index1Assessment: "Demonstrates strong administrative oversight with minimal micromanagement tendencies.",
      index2Assessment: "Highly empathetic leadership profile prioritizing long-term team retention."
    },
    allTestTimeConsumed: {
      cfitTestTime: {
        test1: { consumedTime: "1m 32s", testItem: 13, timeFrame: "3 mins" },
        test2: { consumedTime: "2m 15s", testItem: 14, timeFrame: "4 mins" },
        test3: { consumedTime: "1m 55s", testItem: 13, timeFrame: "4 mins" },
        test4: { consumedTime: "2m 05s", testItem: 10, timeFrame: "4 mins" }
      },
      jcTestTime: {
        test1: { consumedTime: "8m 45s", testItem: 30, timeFrame: "15 mins" }
      },
      fitPlanningTestTime: {
        test1: { consumedTime: "12m 10s", testItem: 40, timeFrame: "20 mins" }
      },
      "16pfTestTime": {
        test1: { consumedTime: "4m 10s", testItem: 45, timeFrame: "8 mins" },
        test2: { consumedTime: "5m 25s", testItem: 45, timeFrame: "8 mins" },
        test3: { consumedTime: "6m 12s", testItem: 45, timeFrame: "8 mins" },
        test4: { consumedTime: "4m 50s", testItem: 50, timeFrame: "10 mins" }
      },
      supervTestTime: {
        test1: { consumedTime: "14m 15s", testItem: 60, timeFrame: "25 mins" }
      }
    }
  },
  "2b9a7c8d-3400-52ea-8134-c7a687df554a": {
    id: "2b9a7c8d-3400-52ea-8134-c7a687df554a",
    detailed16pf: {
      emotionalStability: classifications[5], // Above Average
      senseOfResponsibility: classifications[6], // Superior
      conscientiousness: classifications[5],
      assertiveness: classifications[4], // High Average
      confidence: classifications[5],
      flexibility: classifications[4],
      openMindedness: classifications[6],
      selfReliance: classifications[3], // Average
      sociability: classifications[6],
      trustAcceptance: classifications[5],
      objectivity: classifications[4],
      optimismLiveliness: classifications[5]
    },
    supervisory: {
      management: classifications[5],
      supervision: classifications[5],
      employeeRelations: classifications[6],
      humanRelationsPractices: classifications[6]
    },
    mentalAbility: "Sarah displays phenomenal verbal comprehension and exceptional organizational design abilities. Her 16PF profile identifies her as warm and highly sociable. This translates directly to outstanding score ratings in Employee and Human Relations.",
    supervisoryIndexesAI: {
      index1Assessment: "Excellent at building team consensus and driving employee engagement.",
      index2Assessment: "Strong interpersonal focus, highly effective at managing complex employee disputes."
    },
    allTestTimeConsumed: {
      cfitTestTime: {
        test1: { consumedTime: "1m 20s", testItem: 13, timeFrame: "3 mins" },
        test2: { consumedTime: "2m 05s", testItem: 14, timeFrame: "4 mins" },
        test3: { consumedTime: "1m 40s", testItem: 13, timeFrame: "4 mins" },
        test4: { consumedTime: "1m 58s", testItem: 10, timeFrame: "4 mins" }
      },
      jcTestTime: {
        test1: { consumedTime: "7m 30s", testItem: 30, timeFrame: "15 mins" }
      },
      fitPlanningTestTime: {
        test1: { consumedTime: "10m 15s", testItem: 40, timeFrame: "20 mins" }
      },
      "16pfTestTime": {
        test1: { consumedTime: "3m 50s", testItem: 45, timeFrame: "8 mins" },
        test2: { consumedTime: "4m 55s", testItem: 45, timeFrame: "8 mins" },
        test3: { consumedTime: "5m 30s", testItem: 45, timeFrame: "8 mins" },
        test4: { consumedTime: "4m 15s", testItem: 50, timeFrame: "10 mins" }
      },
      supervTestTime: {
        test1: { consumedTime: "12m 45s", testItem: 60, timeFrame: "25 mins" }
      }
    }
  }
};
