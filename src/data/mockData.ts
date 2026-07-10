import { ApplicantFinalResult, ApplicantRawScore } from "../types";

export const initialFinalResults: ApplicantFinalResult[] = [
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
      cfit: "High (IQ ~125)",
      comprehension: "Excellent",
      planning: "Highly Organized",
      "16pf": "Sten 8 (Extroverted & Analytic)",
      supervisory: {
        management: "Excellent",
        supervision: "Above Average",
        employee: "Superior",
        humanRels: "Superior",
        totalEvaluation: "Highly Recommended"
      }
    },
    psychometric: "The candidate demonstrates exceptional fluid intelligence (CFIT) and robust planning mechanisms. In interpersonal parameters, John shows a solid propensity for leading large teams, marked by superior employee relations and highly recommended overall supervisory capabilities."
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
      cfit: "Average (IQ ~104)",
      comprehension: "Superior",
      planning: "Outstanding",
      "16pf": "Sten 9 (Warm & Socially Bold)",
      supervisory: {
        management: "Above Average",
        supervision: "Excellent",
        employee: "Outstanding",
        humanRels: "Superior",
        totalEvaluation: "Highly Recommended"
      }
    },
    psychometric: "Sarah displays phenomenal verbal comprehension and exceptional organizational design abilities. Her 16PF profile identifies her as warm and highly sociable. This translates directly to outstanding score ratings in Employee and Human Relations, suggesting she is highly suited for people-focused administration roles."
  },
  {
    id: "4c3f5e2a-1100-24bc-7212-d9b882da114e",
    metadata: {
      timestamp: "2026-07-06T14:22:00Z",
      supervisoryTest: false,
      emailAddress: "michael.chen@example.com",
      fullName: "Michael Chen"
    },
    intent: {
      positionAppliedFor: "Data Analyst",
      date: "2026-07-06"
    },
    scores: {
      cfit: "Very High (IQ ~138)",
      comprehension: "Highly Satisfactory",
      planning: "Methodical",
      "16pf": "Sten 4 (Reserved & Serious)",
      supervisory: undefined
    },
    psychometric: "Michael displays superior cognitive logic (CFIT Very High) paired with a reserved and analytical personality (Sten 4 on 16PF). While not tested for supervisory responsibilities, his methodical planning and high-focused attention to data patterns make him an exceptional analyst for complex, individual tasks."
  },
  {
    id: "9f8e7d6c-5500-43ba-9812-a1b2c3d4e5f6",
    metadata: {
      timestamp: "2026-07-05T11:05:00Z",
      supervisoryTest: false,
      emailAddress: "emily.rodriguez@example.com",
      fullName: "Emily Rodriguez"
    },
    intent: {
      positionAppliedFor: "UX/UI Designer",
      date: "2026-07-05"
    },
    scores: {
      cfit: "High Average (IQ ~112)",
      comprehension: "Excellent",
      planning: "Flexible",
      "16pf": "Sten 7 (Creative & Imaginative)",
      supervisory: undefined
    },
    psychometric: "Emily shows a strong balance between logical processing (CFIT High Average) and highly imaginative personality traits (16PF Sten 7). Her comprehension is excellent, indicating high adaptability and capacity to convert user feedback into polished designs with creative independence."
  },
  {
    id: "3d5c4b3a-2200-99aa-88bb-ccdd11223344",
    metadata: {
      timestamp: "2026-07-04T16:40:00Z",
      supervisoryTest: true,
      emailAddress: "david.kim@example.com",
      fullName: "David Kim"
    },
    intent: {
      positionAppliedFor: "Operations Director",
      date: "2026-07-04"
    },
    scores: {
      cfit: "High (IQ ~122)",
      comprehension: "Excellent",
      planning: "Excellent",
      "16pf": "Sten 8 (Rule-Conscious & Dominant)",
      supervisory: {
        management: "Superior",
        supervision: "Excellent",
        employee: "Average",
        humanRels: "Above Average",
        totalEvaluation: "Recommended"
      }
    },
    psychometric: "David's cognitive scores are robust, particularly in structural planning and executive comprehension. Personality-wise, he is assertive and rule-bound (Sten 8), making him very effective at driving management discipline and strict process supervision, though employee relation warmth is average."
  },
  {
    id: "5a6b7c8d-9900-1111-2222-333344445555",
    metadata: {
      timestamp: "2026-07-03T10:00:00Z",
      supervisoryTest: false,
      emailAddress: "amanda.taylor@example.com",
      fullName: "Amanda Taylor"
    },
    intent: {
      positionAppliedFor: "Marketing Executive",
      date: "2026-07-03"
    },
    scores: {
      cfit: "Average (IQ ~98)",
      comprehension: "Above Average",
      planning: "Strategic",
      "16pf": "Sten 8 (Bold & Expressive)",
      supervisory: undefined
    },
    psychometric: ""
  }
];

export const initialRawScores: ApplicantRawScore[] = [
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
      cfit: {
        test1: 12,
        test2: 11,
        test3: 13,
        test4: 10
      },
      comprehension: 88,
      planning: 82,
      "16pf": 8,
      supervisory: {
        management: 16,
        supervision: 14,
        employee: 18,
        humanRels: 17,
        scores: 16.25
      }
    }
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
      cfit: {
        test1: 9,
        test2: 8,
        test3: 10,
        test4: 8
      },
      comprehension: 94,
      planning: 91,
      "16pf": 9,
      supervisory: {
        management: 14,
        supervision: 17,
        employee: 19,
        humanRels: 18,
        scores: 17.0
      }
    }
  },
  {
    id: "4c3f5e2a-1100-24bc-7212-d9b882da114e",
    metadata: {
      timestamp: "2026-07-06T14:22:00Z",
      supervisoryTest: false,
      emailAddress: "michael.chen@example.com",
      fullName: "Michael Chen"
    },
    intent: {
      positionAppliedFor: "Data Analyst",
      date: "2026-07-06"
    },
    scores: {
      cfit: {
        test1: 14,
        test2: 13,
        test3: 14,
        test4: 12
      },
      comprehension: 76,
      planning: 85,
      "16pf": 4,
      supervisory: undefined
    }
  },
  {
    id: "9f8e7d6c-5500-43ba-9812-a1b2c3d4e5f6",
    metadata: {
      timestamp: "2026-07-05T11:05:00Z",
      supervisoryTest: false,
      emailAddress: "emily.rodriguez@example.com",
      fullName: "Emily Rodriguez"
    },
    intent: {
      positionAppliedFor: "UX/UI Designer",
      date: "2026-07-05"
    },
    scores: {
      cfit: {
        test1: 10,
        test2: 9,
        test3: 11,
        test4: 9
      },
      comprehension: 89,
      planning: 71,
      "16pf": 7,
      supervisory: undefined
    }
  },
  {
    id: "3d5c4b3a-2200-99aa-88bb-ccdd11223344",
    metadata: {
      timestamp: "2026-07-04T16:40:00Z",
      supervisoryTest: true,
      emailAddress: "david.kim@example.com",
      fullName: "David Kim"
    },
    intent: {
      positionAppliedFor: "Operations Director",
      date: "2026-07-04"
    },
    scores: {
      cfit: {
        test1: 11,
        test2: 12,
        test3: 11,
        test4: 11
      },
      comprehension: 85,
      planning: 88,
      "16pf": 8,
      supervisory: {
        management: 18,
        supervision: 16,
        employee: 11,
        humanRels: 14,
        scores: 14.75
      }
    }
  },
  {
    id: "5a6b7c8d-9900-1111-2222-333344445555",
    metadata: {
      timestamp: "2026-07-03T10:00:00Z",
      supervisoryTest: false,
      emailAddress: "amanda.taylor@example.com",
      fullName: "Amanda Taylor"
    },
    intent: {
      positionAppliedFor: "Marketing Executive",
      date: "2026-07-03"
    },
    scores: {
      cfit: {
        test1: 8,
        test2: 7,
        test3: 9,
        test4: 7
      },
      comprehension: 78,
      planning: 80,
      "16pf": 8,
      supervisory: undefined
    }
  }
];
