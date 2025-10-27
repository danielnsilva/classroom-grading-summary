import { updatePRComment } from "../src/pr-updater";
import { getOctokit } from "@actions/github";
import { Context } from "@actions/github/lib/context";

type Octokit = ReturnType<typeof getOctokit>;

describe("updatePRComment", () => {
  const mockOctokit = {
    rest: {
      pulls: {
        list: jest.fn(),
      },
      issues: {
        listComments: jest.fn(),
        updateComment: jest.fn(),
        createComment: jest.fn(),
      },
    },
  };

  const mockContext = {
    repo: {
      owner: "test-owner",
      repo: "test-repo",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  it("should skip when no feedback PR found", async () => {
    mockOctokit.rest.pulls.list.mockResolvedValue({ data: [] });

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report"
    );

    expect(console.log).toHaveBeenCalledWith(
      "Feedback PR not found. Skipping update."
    );
  });

  it("should create new comment when no existing comment", async () => {
    mockOctokit.rest.pulls.list.mockResolvedValue({
      data: [{ number: 1, title: "feedback", head: { ref: "main" } }],
    });
    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [] });
    mockOctokit.rest.issues.createComment.mockResolvedValue({});

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report"
    );

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      issue_number: 1,
      body: expect.stringContaining("CLASSROOM-GRADING-SUMMARY"),
    });
  });

  it("should update existing comment when updateExisting is true", async () => {
    mockOctokit.rest.pulls.list.mockResolvedValue({
      data: [{ number: 1, title: "feedback", head: { ref: "main" } }],
    });
    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [
        { id: 1, body: "other comment" },
        { id: 2, body: "<!-- CLASSROOM-GRADING-SUMMARY -->old report" },
      ],
    });
    mockOctokit.rest.issues.updateComment.mockResolvedValue({});

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report",
      true
    );

    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: "test-owner",
      repo: "test-repo",
      comment_id: 2,
      body: expect.stringContaining("CLASSROOM-GRADING-SUMMARY"),
    });
  });

  it("should create new comment when updateExisting is false", async () => {
    mockOctokit.rest.pulls.list.mockResolvedValue({
      data: [{ number: 1, title: "feedback", head: { ref: "main" } }],
    });
    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [{ id: 1, body: "<!-- CLASSROOM-GRADING-SUMMARY -->old report" }],
    });
    mockOctokit.rest.issues.createComment.mockResolvedValue({});

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report",
      false
    );

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalled();
    expect(mockOctokit.rest.issues.updateComment).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    mockOctokit.rest.pulls.list.mockRejectedValue(new Error("API Error"));

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report"
    );

    expect(console.log).toHaveBeenCalledWith(
      "Error fetching PRs:",
      "API Error"
    );
  });

  it("should handle comment update errors gracefully", async () => {
    mockOctokit.rest.pulls.list.mockResolvedValue({
      data: [{ number: 1, title: "feedback", head: { ref: "main" } }],
    });
    mockOctokit.rest.issues.listComments.mockRejectedValue(
      new Error("Comment API Error")
    );

    await updatePRComment(
      mockOctokit as unknown as Octokit,
      mockContext as unknown as Context,
      "test report"
    );

    expect(console.log).toHaveBeenCalledWith(
      "Error updating PR comment:",
      "Comment API Error"
    );
    expect(console.log).toHaveBeenCalledWith("Continuing without PR update...");
  });
});
