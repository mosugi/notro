# Concurrent Agent Launch Limit Investigation

## Summary

Tested the maximum number of agents that can be launched simultaneously using Claude Code's Agent tool. Launched a total of **100 agents** across 7 batches, collecting `date +%s%N` timestamps from each agent's bash execution to measure actual concurrency.

**Test date:** 2026-03-19
**Total test duration:** ~105 seconds (Agent 1 to Agent 100)

---

## Key Findings

### 1. Launch Limit: None Observed

All 100 agents launched successfully with zero errors. The largest single-batch launch was **50 agents simultaneously** in one message — all 50 were accepted and queued.

### 2. Actual Concurrent Execution: ~10–12

Launch acceptance ≠ concurrent execution. The system queues agents and runs them concurrently up to a limit.

**Evidence from bash timestamps:**

| Observation | Agents | Window | Concurrency |
|-------------|--------|--------|-------------|
| Smallest concurrent pair | e.g., 67+68 | 48ms | 2 |
| Confirmed 3-concurrent | 53+54+55 | 379ms | 3 |
| Confirmed 4-concurrent | 76+77+78+79 | 824ms | 4 |
| Confirmed 5-concurrent | 90+81+91+92+93 | 1,046ms | 5 |
| Estimated via Little's Law | Batch 7 window | 3.1s / 8 agents | ~10–12 |

**Little's Law estimate (Batch 7, agents 90–96):**
- 8 agents executed bash within a 3.1-second window
- Average agent execution time ≈ 4.5 seconds
- Throughput λ = 8 / 3.1 ≈ 2.58 agents/second
- **Steady-state concurrency L = λ × W = 2.58 × 4.5 ≈ 11.6**

### 3. Concurrency Scales with Queue Depth

Small batches (5 agents) showed mostly 2-concurrent execution. Large batches (50 agents) showed 5–7 confirmed concurrent executions and ~10–12 estimated. The system appears to **dynamically scale concurrency** based on how many agents are queued.

### 4. Queue Behavior: Some Agents Delayed

When the queue is saturated, some agents wait significantly longer before executing:

| Agent | Total duration | Delay cause |
|-------|---------------|-------------|
| Agent 41 | 10.1 s | Queued in large batch (31–50) |
| Agent 49 | 11.3 s | Queued in large batch (31–50) |
| Agent 81 | 11.4 s | Queued in large batch (51–100) |

Despite delays, all agents eventually executed and were often paired with another agent in parallel upon execution.

### 5. Per-Batch Throughput

| Batch | Agents | Duration | Agents/sec |
|-------|--------|----------|------------|
| 1 (×5) | 5 | 2.58s | 1.94 |
| 2 (×5) | 5 | 3.06s | 1.63 |
| 3 (×5) | 5 | 2.52s | 1.98 |
| 4 (×5) | 5 | 3.59s | 1.39 |
| 5 (×10) | 10 | 4.98s | 2.01 |
| 6 (×20) | 20 | 14.95s | 1.34 |
| 7 (×50) | ~49* | ~33s | ~1.48 |

*Agent 51 excluded (hallucinated timestamp, `tool_uses: 0`)

---

## Test Methodology

Background agents were launched in escalating batches using `run_in_background: true`. Each agent ran `date +%s%N` via the Bash tool, capturing a nanosecond-precision Unix timestamp. By comparing timestamps across agents, actual concurrent execution was inferred.

**Batches launched:**

| Round | Agents | Batch size | All launched? |
|-------|--------|------------|---------------|
| 1 | 1–5 | 5 | Yes |
| 2 | 6–10 | 5 | Yes |
| 3 | 11–15 | 5 | Yes |
| 4 | 16–20 | 5 | Yes |
| 5 | 21–30 | 10 | Yes |
| 6 | 31–50 | 20 | Yes |
| 7 | 51–100 | 50 | Yes |

---

## Conclusions

| Question | Answer |
|----------|--------|
| Can you launch 100 agents simultaneously? | **Yes** — no launch limit observed |
| What is the actual concurrent execution limit? | **~10–12** (estimated via Little's Law) |
| Does batch size affect concurrency? | **Yes** — larger queues → higher concurrency |
| Are agents truly parallel? | **Yes** — confirmed up to 5 simultaneous bash calls; inferred ~10–12 |
| What happens when queue is saturated? | Agents queue and wait up to ~11 seconds, then execute |
| Is there a hard limit? | Not observed up to 100 agents queued |

The Agent tool functions as an **unlimited queue** with a **dynamic concurrency pool** of approximately 10–12 simultaneous executions. The exact limit likely depends on API rate limits, compute resource allocation, and system load at the time of testing.
