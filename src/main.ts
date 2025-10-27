import * as core from "@actions/core";
import * as github from "@actions/github";
import { updatePRComment } from "./pr-updater";
import { generateReport } from "./report-generator";
import { RunnerData, RunnerResults } from "./types";

export async function run(): Promise<void> {
  try {
    const token = core.getInput("token");
    const runners = core.getInput("runners");
    const updateComment = core.getInput("update-comment") === "true";

    const runnerResults: RunnerData[] = runners.split(",").map((runner) => {
      const encodedResults =
        process.env[`${runner.trim().toUpperCase()}_RESULTS`];
      if (!encodedResults) {
        throw new Error(`Results not found for runner: ${runner}`);
      }
      const json = Buffer.from(encodedResults, "base64").toString("utf-8");
      return {
        runner: runner.trim(),
        results: JSON.parse(json) as RunnerResults,
      };
    });

    const report = generateReport(runnerResults);

    const octokit = github.getOctokit(token);
    await updatePRComment(octokit, github.context, report, updateComment);

    console.log("Report updated in feedback PR");
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

if (require.main === module) {
  void run();
}
