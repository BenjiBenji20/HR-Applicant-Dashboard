export const classifications = [
  'Low',
  'Below Average',
  'Low Average',
  'Average',
  'High Average',
  'Above Average',
  'Superior'
] as const;

export type Classification = typeof classifications[number];

// Shared structures
export interface SharedMetadata {
  timestamp: string;
  supervisoryTest: boolean; // Yes | No
  emailAddress: string;
  fullName: string;
  age: number | string; // posible received a number or string ([No Answer])
  education: string;
  contactNumber: string;
  company?: string;
}

export interface SharedIntent {
  positionAppliedFor: string;
  date: string;
}

// 1. MOCK DATASET TYPE ONE: Optimized for the main Dashboard Table View
export interface ApplicantSummary {
  id: string;
  metadata: SharedMetadata;
  intent: SharedIntent;
  scores: {
    cfit: Classification;
    comprehension: Classification;
    planning: Classification;
    supervisoryTotalEvaluation: Classification;
  };
}

// 2. MOCK DATASET TYPE TWO: Optimized for the Slide-out Profile Modal
export interface ApplicantDetail {
  id: string; // Matches the summary ID perfectly
  detailed16pf: {
    emotionalStability: Classification;
    senseOfResponsibility: Classification;
    conscientiousness: Classification;
    assertiveness: Classification;
    confidence: Classification;
    flexibility: Classification;
    openMindedness: Classification;
    selfReliance: Classification;
    sociability: Classification;
    trustAcceptance: Classification;
    objectivity: Classification;
    optimismLiveliness: Classification;
  };
  supervisory: {
    management: Classification;
    supervision: Classification;
    employeeRelations: Classification;
    humanRelationsPractices: Classification;
  };
  mentalAbility: string; // Truncated or full overview text (ai generated)
  supervisoryIndexesAI: {
    index1Assessment: string; // Long form AI text block
    index2Assessment: string; // Long form AI text block
    index3Assessment: string; // Long form AI text block
    index4Assessment: string; // Long form AI text block
  };
  overAllAssessment: string; // not ai generated
  aiGenPersonalityAssessment: string;
  allTestTimeConsumed: AllTestTimeConsumed;
}

// Compatibility interface for AnalyticsTab.tsx, which we must not modify
export interface ApplicantFinalResult extends ApplicantSummary {
  scores: ApplicantSummary['scores'] & {
    "16pf": string;
    supervisory?: {
      management: string;
      supervision: string;
      employee: string;
      humanRels: string;
      totalEvaluation: string;
    };
  };
  psychometric: string;
}


// time consumed types
export interface TestTime {
  consumedTime: string; // 1m 32s
  timeFrame: string; // 4 mins
  testAnswered: number;
  testItem: number;
}

export interface AllTestTimeConsumed {
  cfitTestTime?: {
    test1: TestTime, test2: TestTime, test3: TestTime, test4: TestTime
  },
  jcTestTime?: {
    test1: TestTime
  },
  fitPlanningTestTime?: {
    test1: TestTime
  },
  "16pfTestTime"?: {
    test1: TestTime, test2: TestTime, test3: TestTime
  },
  supervTestTime?: {
    test1: TestTime
  }
}
