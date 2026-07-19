import { ApplicantSummary, ApplicantDetail, classifications } from "../types/types";

export const initialSummaryResults: ApplicantSummary[] = [
  {
    id: "8a8d8eed-1600-41fa-9023-b7a687df816d",
    metadata: {
      timestamp: "2026-07-08T10:15:00Z",
      supervisoryTest: false, // Changed to non-supervisory!
      emailAddress: "john.doe@example.com",
      fullName: "John Doe",
      age: 28,
      education: "Bachelor of Science in Information Technology",
      contactNumber: "+1 (555) 019-2834"
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
      supervisoryTest: true, // Supervisory!
      emailAddress: "sarah.jenkins@example.com",
      fullName: "Sarah Jenkins",
      age: 34,
      education: "Master of Science in Human Resource Management",
      contactNumber: "+1 (555) 014-9876"
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
      index1Assessment: "",
      index2Assessment: "",
      index3Assessment: "",
      index4Assessment: ""
    },
    overAllAssessment: "",
    aiGenPersonalityAssessment: "The candidate exhibits below-average scores across most personality dimensions, particularly emotional stability and conscientiousness. He shows high self-reliance but low sociability, indicating a preference for solitary, highly focused technical roles rather than collaborative leadership. He handles routine tasks well but may require support in high-stress, rapidly changing environments.",
    allTestTimeConsumed: {
      cfitTestTime: {
        test1: { consumedTime: "1m 32s", timeFrame: "3 mins", testAnswered: 1, testItem: 13 },
        test2: { consumedTime: "2m 15s", timeFrame: "4 mins", testAnswered: 1, testItem: 14 },
        test3: { consumedTime: "1m 55s", timeFrame: "4 mins", testAnswered: 1, testItem: 13 },
        test4: { consumedTime: "2m 05s", timeFrame: "4 mins", testAnswered: 1, testItem: 10 }
      },
      jcTestTime: {
        test1: { consumedTime: "8m 45s", timeFrame: "15 mins", testAnswered: 1, testItem: 30 }
      },
      fitPlanningTestTime: {
        test1: { consumedTime: "12m 10s", timeFrame: "20 mins", testAnswered: 1, testItem: 40 }
      },
      "16pfTestTime": {
        test1: { consumedTime: "4m 10s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test2: { consumedTime: "5m 25s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test3: { consumedTime: "6m 12s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test4: { consumedTime: "4m 50s", timeFrame: "10 mins", testAnswered: 1, testItem: 50 }
      },
      supervTestTime: {
        test1: { consumedTime: "14m 15s", timeFrame: "25 mins", testAnswered: 1, testItem: 60 }
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
      index1Assessment: "Demonstrates strong administrative oversight with minimal micromanagement tendencies.",
      index2Assessment: "Highly empathetic leadership profile prioritizing long-term team retention.",
      index3Assessment: "Displays excellent competency in resolving worker grievances and fostering a collaborative space.",
      index4Assessment: "Maintains optimal human relations practices with strong focus on active feedback loops."
    },
    overAllAssessment: "Shows great potential for senior leadership tracks, exhibiting balanced management logic and human relations values.",
    aiGenPersonalityAssessment: "A highly resilient, conscientious, and open-minded profile. Exhibits above-average emotional stability and superior sense of responsibility, aligning perfectly with HR specialist expectations. She is communicative, collaborative, and handles stress with poise.",
    allTestTimeConsumed: {
      cfitTestTime: {
        test1: { consumedTime: "1m 20s", timeFrame: "3 mins", testAnswered: 1, testItem: 13 },
        test2: { consumedTime: "2m 05s", timeFrame: "4 mins", testAnswered: 1, testItem: 14 },
        test3: { consumedTime: "1m 40s", timeFrame: "4 mins", testAnswered: 1, testItem: 13 },
        test4: { consumedTime: "1m 58s", timeFrame: "4 mins", testAnswered: 1, testItem: 10 }
      },
      jcTestTime: {
        test1: { consumedTime: "7m 30s", timeFrame: "15 mins", testAnswered: 1, testItem: 30 }
      },
      fitPlanningTestTime: {
        test1: { consumedTime: "10m 15s", timeFrame: "20 mins", testAnswered: 1, testItem: 40 }
      },
      "16pfTestTime": {
        test1: { consumedTime: "3m 50s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test2: { consumedTime: "4m 55s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test3: { consumedTime: "5m 30s", timeFrame: "8 mins", testAnswered: 1, testItem: 45 },
        test4: { consumedTime: "4m 15s", timeFrame: "10 mins", testAnswered: 1, testItem: 50 }
      },
      supervTestTime: {
        test1: { consumedTime: "12m 45s", timeFrame: "25 mins", testAnswered: 1, testItem: 60 }
      }
    }
  }
};
