import * as core from "@actions/core";
import * as github from "@actions/github";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../src/pr-updater");
jest.mock("../src/report-generator");

const mockCore = core as jest.Mocked<typeof core>;
const mockGithub = github as jest.Mocked<typeof github>;

describe("main", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {};
    mockCore.setFailed = jest.fn();
  });

  it("should process runner results successfully", async () => {
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "token":
          return "test-token";
        case "runners":
          return "test1";
        case "update-comment":
          return "true";
        default:
          return "";
      }
    });

    process.env.TEST1_RESULTS = Buffer.from(
      JSON.stringify({
        tests: [{ name: "Test 1", status: "pass", points: 10 }],
      })
    ).toString("base64");

    mockGithub.getOctokit.mockReturnValue(
      {} as ReturnType<typeof github.getOctokit>
    );
    Object.defineProperty(mockGithub, "context", {
      value: { repo: { owner: "test", repo: "test" } },
      writable: true,
    });

    const { updatePRComment } = require("../src/pr-updater");
    const { generateReport } = require("../src/report-generator");

    updatePRComment.mockResolvedValue(undefined);
    generateReport.mockReturnValue("test report");

    const { run } = await import("../src/main");
    await run();

    expect(mockCore.getInput).toHaveBeenCalledWith("token");
    expect(mockCore.getInput).toHaveBeenCalledWith("runners");
    expect(generateReport).toHaveBeenCalled();
    expect(updatePRComment).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      true
    );
  });

  it("should fail when runner results not found", async () => {
    mockCore.getInput.mockImplementation((name: string) => {
      switch (name) {
        case "token":
          return "test-token";
        case "runners":
          return "missing-runner";
        default:
          return "";
      }
    });

    const { run } = await import("../src/main");
    await run();

    expect(mockCore.setFailed).toHaveBeenCalledWith(
      "Results not found for runner: missing-runner"
    );
  });
});
