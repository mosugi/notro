# Concurrent Agent Launch Limit Investigation

## Summary

Tested the maximum number of agents that can be launched simultaneously using Claude Code's Agent tool.

## Test Methodology

Launched background agents in batches using `run_in_background: true`, escalating the count:

| Round | Agents launched (cumulative) | Batch size | Result |
|-------|------------------------------|------------|--------|
| 1     | 5                            | 5          | All succeeded |
| 2     | 10                           | 5          | All succeeded |
| 3     | 15                           | 5          | All succeeded |
| 4     | 20                           | 5          | All succeeded |
| 5     | 30                           | 10         | All succeeded |
| 6     | 50                           | 20         | All succeeded |
| 7     | 100                          | 50         | All succeeded |

## Findings

- **No hard limit was observed** up to **100 concurrent background agents**
- All 100 agents were launched successfully with zero errors
- The largest single-batch launch was **50 agents simultaneously** — all succeeded
- The `run_in_background: true` flag allows the parent agent to continue while subagents execute
- Each agent was assigned a unique `agentId` and an output file under `/tmp/claude-0/`

## Conclusion

Within the scope of this test (up to 100 agents), **no concurrent agent limit was hit**. The system appears to accept an arbitrary number of background agent launches without enforcing a hard cap at the API level. Actual execution concurrency may be throttled at a lower level (API rate limits, compute resources), but the launch/queue mechanism does not reject requests.

**Test date:** 2026-03-19
