import { generateReport } from "../src/report-generator";
import { RunnerData } from "../src/types";

describe("generateReport", () => {
  it("should generate report with single runner", () => {
    const runnerResults: RunnerData[] = [
      {
        runner: "test1",
        results: {
          tests: [
            { name: "Test 1", status: "pass", points: 10 },
            { name: "Test 2", status: "fail", points: 5 },
          ],
        },
      },
    ];

    const report = generateReport(runnerResults);

    expect(report).toContain("## Classroom Grading Summary");
    expect(report).toContain("| test1 | 10 | 15 |");
    expect(report).toContain("| **Total** | **10** | **15** |");
    expect(report).toContain("🏆 **Tests passed**: 1/2");
  });

  it("should generate report with multiple runners", () => {
    const runnerResults: RunnerData[] = [
      {
        runner: "test1",
        results: {
          tests: [{ name: "Test 1", status: "pass", points: 10 }],
        },
      },
      {
        runner: "test2",
        results: {
          tests: [
            { name: "Test 2", status: "pass", points: 20 },
            { name: "Test 3", status: "error", points: 15 },
          ],
        },
      },
    ];

    const report = generateReport(runnerResults);

    expect(report).toContain("| test1 | 10 | 10 |");
    expect(report).toContain("| test2 | 20 | 35 |");
    expect(report).toContain("| **Total** | **30** | **45** |");
    expect(report).toContain("🏆 **Tests passed**: 2/3");
  });

  it("should handle tests without points", () => {
    const runnerResults: RunnerData[] = [
      {
        runner: "test1",
        results: {
          tests: [
            { name: "Test 1", status: "pass" },
            { name: "Test 2", status: "fail" },
          ],
        },
      },
    ];

    const report = generateReport(runnerResults);

    expect(report).toContain("| test1 | 0 | 0 |");
    expect(report).toContain("🏆 **Tests passed**: 1/2");
  });
});
