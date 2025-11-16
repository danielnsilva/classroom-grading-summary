export type TestResult = {
  name: string;
  status: "pass" | "fail" | "error";
  points?: number;
  score?: number;
  line_no?: number;
  message?: string;
  test_code?: string;
};

export type RunnerResults = {
  tests: TestResult[];
};

export type RunnerData = {
  runner: string;
  results: RunnerResults;
};
