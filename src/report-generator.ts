import { RunnerData, RunnerResults } from "./types";

function getTestScore(results: RunnerResults): number {
  return results.tests.reduce((acc, test) => {
    return acc + (test.status === "pass" ? test.points ?? 0 : 0);
  }, 0);
}

function getMaxScoreForTest(results: RunnerResults): number {
  return results.tests.reduce((acc, test) => acc + (test.points ?? 0), 0);
}

export function generateReport(runnerResults: RunnerData[]): string {
  let totalScore = 0;
  let totalMaxScore = 0;
  let grandTotalPassedTests = 0;
  let grandTotalTests = 0;

  let tableRows =
    "| Test Runner Name | Test Score | Max Score |\n|---|---|---|\n";

  runnerResults.forEach(({ runner, results }) => {
    const score = getTestScore(results);
    const maxScore = getMaxScoreForTest(results);
    const passedTests = results.tests.filter(
      (test) => test.status === "pass"
    ).length;

    tableRows += `| ${runner} | ${score} | ${maxScore} |\n`;
    totalScore += score;
    totalMaxScore += maxScore;
    grandTotalPassedTests += passedTests;
    grandTotalTests += results.tests.length;
  });

  tableRows += `| **Total** | **${totalScore}** | **${totalMaxScore}** |`;

  const report = `## Classroom Grading Summary\n\n${tableRows}\n\n🏆 **Tests passed**: ${grandTotalPassedTests}/${grandTotalTests}`;

  return report;
}
