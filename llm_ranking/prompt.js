module.exports = {
    prompt_compare: "Compare two commits from github and tell me which of the two is more significant (1) or (2)",
    prompt_summarize: `Explain and summarize what changes this commit makes`,
    prompt_aggregate: "Aggregate previous LLM response into one without losing details and insights",
    systemPrompt_compare: "Respond with a single digit",
    examples_comparison: JSON.parse(`[
      {
        "message_id": 2,
        "role": "user",
        "content": "Compare two commits from github and tell me which of the two is more significant (1) or (2). Respond with a single digit. COMMIT 1: ... COMMIT 2: ..."
      },
      {
        "message_id": 3,
        "role": "system",
        "content": "1"
      },
      {
        "message_id": 4,
        "role": "user",
        "content": "Compare two commits from github and tell me which of the two is more significant (1) or (2). Respond with a single digit. COMMIT 1: ... COMMIT 2: ..."
      },
      {
        "message_id": 5,
        "role": "system",
        "content": "2"
      },
      {
        "message_id": 6,
        "role": "user",
        "content": "Compare two commits from github and tell me which of the two is more significant (1) or (2). Respond with a single digit. COMMIT 1: ... COMMIT 2: ..."
      },
      {
        "message_id": 7,
        "role": "system",
        "content": "2"
      },
      {
        "message_id": 8,
        "role": "user",
        "content": "Compare two commits from github and tell me which of the two is more significant (1) or (2). Respond with a single digit. COMMIT 1: ... COMMIT 2: ..."
      },
      {
        "message_id": 9,
        "role": "system",
        "content": "1"
      }
    ]`)
};

// prompt_summarize: `You are given a commit from Github. Summarize it in a way to show its complexity, sophistication, depth, and length. 

// Criteria for Comparison:

// Significance:
// - Number of Files Changed: More files changed might indicate a more significant commit.
// - Type of Changes: Major feature additions, bug fixes, or refactoring.
// - Commit Message: Analyze the commit message for keywords indicating significance (e.g., "feature", "fix", "refactor").

// Complexity:
// - Lines of Code (LoC) Added/Removed: More lines might indicate higher complexity.
// - Cyclomatic Complexity: Measure the complexity of the code changes.
// - Code Structure Changes: Changes in the architecture or design patterns.

// Size:
// - Total Lines of Code Changed: Sum of lines added and removed.
// - Number of Commits: If comparing a range of commits, the total number of commits can indicate size.
    