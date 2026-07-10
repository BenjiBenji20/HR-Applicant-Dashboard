export interface ApplicantFinalResult {
  id: string;
  metadata: {
    timestamp: string;
    supervisoryTest: boolean;
    emailAddress: string;
    fullName: string;
  };
  intent: {
    positionAppliedFor: string;
    date: string;
  };
  scores: {
    cfit: string;
    comprehension: string;
    planning: string;
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

export interface ApplicantRawScore {
  id: string;
  metadata: {
    timestamp: string;
    supervisoryTest: boolean;
    emailAddress: string;
    fullName: string;
  };
  intent: {
    positionAppliedFor: string;
    date: string;
  };
  scores: {
    cfit: {
      test1: number;
      test2: number;
      test3: number;
      test4: number;
    };
    comprehension: number;
    planning: number;
    "16pf": number;
    supervisory?: {
      management: number;
      supervision: number;
      employee: number;
      humanRels: number;
      scores: number; // float
    };
  };
}
