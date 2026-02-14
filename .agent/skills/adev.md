# Agent Development for Claude Code

Build effective custom agents for Claude Code with proper delegation, tool access, and prompt design.

## Agent Description Pattern

The description field determines whether Claude will automatically delegate tasks.

### Strong Trigger Pattern

```yaml
---
name: agent-name
description: |
  [Role] specialist. MUST BE USED when [specific triggers].
  Use PROACTIVELY for [task category].
  Keywords: [trigger words]
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---
```

### Weak vs Strong Descriptions

| Weak (won't auto-delegate) | Strong (auto-delegates) |
|---------------------------|-------------------------|
| "Analyzes screenshots for issues" | "Visual QA specialist. MUST BE USED when analyzing screenshots. Use PROACTIVELY for visual QA." |
| "Runs Playwright scripts" | "Playwright specialist. MUST BE USED when running Playwright scripts. Use PROACTIVELY for browser automation." |

**Key phrases**:
- "MUST BE USED when..."
- "Use PROACTIVELY for..."
- Include trigger keywords

### Delegation Mechanisms

1. **Explicit**: `Task tool subagent_type: "agent-name"` - always works
2. **Automatic**: Claude matches task to agent description - requires strong phrasing

**Session restart required** after creating/modifying agents.

## Tool Access Principle

**If an agent doesn't need Bash, don't give it Bash.**

| Agent needs to... | Give tools | Don't give |
|-------------------|------------|------------|
| Create files only | Read, Write, Edit, Glob, Grep | Bash |
| Run scripts/CLIs | Read, Write, Edit, Glob, Grep, Bash | — |
| Read/audit only | Read, Glob, Grep | Write, Edit, Bash |

**Why?** Models default to `cat > file << 'EOF'` heredocs instead of Write tool. Each bash command requires approval, causing dozens of prompts per agent run.

### Allowlist Pattern

Instead of restricting Bash, allowlist safe commands in `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Write", "Edit", "WebFetch(domain:*)",
      "Bash(cd *)", "Bash(cp *)", "Bash(mkdir *)", "Bash(ls *)",
      "Bash(cat *)", "Bash(head *)", "Bash(tail *)", "Bash(grep *)",
      "Bash(diff *)", "Bash(mv *)", "Bash(touch *)", "Bash(file *)"
    ]
  }
}
```

## Model Selection (Quality First)

Don't downgrade quality to work around issues - fix root causes instead.

| Model | Use For |
|-------|---------|
| **Opus** | Creative work (page building, design, content) - quality matters |
| **Sonnet** | Most agents - content, code, research (default) |
| **Haiku** | Only script runners where quality doesn't matter |

## Memory Limits

### Root Cause Fix (REQUIRED)

Add to `~/.bashrc` or `~/.zshrc`:
```bash
export NODE_OPTIONS="--max-old-space-size=16384"
```

Increases Node.js heap from 4GB to 16GB.

### Parallel Limits (Even With Fix)

| Agent Type | Max Parallel | Notes |
|------------|--------------|-------|
| Any agents | 2-3 | Context accumulates; batch then pause |
| Heavy creative (Opus) | 1-2 | Uses more memory |

### Recovery

1. `source ~/.bashrc` or restart terminal
2. `NODE_OPTIONS="--max-old-space-size=16384" claude`
3. Check what files exist, continue from there

## Sub-Agent vs Remote API

**Always prefer Task sub-agents over remote API calls.**

| Aspect | Remote API Call | Task Sub-Agent |
|--------|-----------------|----------------|
| Tool access | None | Full (Read, Grep, Write, Bash) |
| File reading | Must pass all content in prompt | Can read files iteratively |
| Cross-referencing | Single context window | Can reason across documents |
| Decision quality | Generic suggestions | Specific decisions with rationale |
| Output quality | ~100 lines typical | 600+ lines with specifics |

```typescript
// ❌ WRONG - Remote API call
const response = await fetch('https://api.anthropic.com/v1/messages', {...})

// ✅ CORRECT - Use Task tool
// Invoke Task with subagent_type: "general-purpose"
```

## Declarative Over Imperative

Describe **what** to accomplish, not **how** to use tools.

### Wrong (Imperative)

```markdown
### Check for placeholders
```bash
grep -r "PLACEHOLDER:" build/*.html
```
```

### Right (Declarative)

```markdown
### Check for placeholders
Search all HTML files in build/ for:
- PLACEHOLDER: comments
- TODO or TBD markers
- Template brackets like [Client Name]

Any match = incomplete content.
```

### What to Include

| Include | Skip |
|---------|------|
| Task goal and context | Explicit bash/tool commands |
| Input file paths | "Use X tool to..." |
| Output file paths and format | Step-by-step tool invocations |
| Success/failure criteria | Shell pipeline syntax |
| Blocking checks (prerequisites) | Micromanaged workflows |
| Quality checklists | |

## Self-Documentation Principle

> "Agents that won't have your context must be able to reproduce the behaviour independently."

Every improvement must be encoded into the agent's prompt, not left as implicit knowledge.

### What to Encode

| Discovery | Where to Capture |
|-----------|------------------|
| Bug fix pattern | Agent's "Corrections" or "Common Issues" section |
| Quality requirement | Agent's "Quality Checklist" section |
| File path convention | Agent's "Output" section |
| Tool usage pattern | Agent's "Process" section |
| Blocking prerequisite | Agent's "Blocking Check" section |

### Test: Would a Fresh Agent Succeed?

Before completing any agent improvement:
1. Read the agent prompt as if you have no context
2. Ask: Could a new session follow this and produce the same quality?
3. If no: Add missing instructions, patterns, or references

### Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| "As we discussed earlier..." | No prior context exists |
| Relying on files read during dev | Agent may not read same files |
| Assuming knowledge from errors | Agent won't see your debugging |
| "Just like the home page" | Agent hasn't built home page |

## Agent Prompt Structure

Effective agent prompts include:

```markdown
## Your Role
[What the agent does]

## Blocking Check
[Prerequisites that must exist]

## Input
[What files to read]

## Process
[Step-by-step with encoded learnings]

## Output
[Exact file paths and formats]

## Quality Checklist
[Verification steps including learned gotchas]

## Common Issues
[Patterns discovered during development]
```

## Pipeline Agents

When inserting a new agent into a numbered pipeline (e.g., `HTML-01` → `HTML-05` → `HTML-11`):

| Must Update | What |
|-------------|------|
| New agent | "Workflow Position" diagram + "Next" field |
| **Predecessor agent** | Its "Next" field to point to new agent |

**Common bug**: New agent is "orphaned" because predecessor still points to old next agent.

**Verification**:
```bash
grep -n "Next:.*→\|Then.*runs next" .claude/agents/*.md
```

## The Sweet Spot

**Best use case**: Tasks that are **repetitive but require judgment**.

Example: Auditing 70 skills manually = tedious. But each audit needs intelligence (check docs, compare versions, decide what to fix). Perfect for parallel agents with clear instructions.

**Not good for**:
- Simple tasks (just do them)
- Highly creative tasks (need human direction)
- Tasks requiring cross-file coordination (agents work independently)

## Effective Prompt Template

```
For each [item]:
1. Read [source file]
2. Verify with [external check - npm view, API call, etc.]
3. Check [authoritative source]
4. Score/evaluate
5. FIX issues found ← Critical instruction
```

**Key elements**:
- **"FIX issues found"** - Without this, agents only report. With it, they take action.
- **Exact file paths** - Prevents ambiguity
- **Output format template** - Ensures consistent, parseable reports
- **Batch size ~5 items** - Enough work to be efficient, not so much that failures cascade

## Workflow Pattern

```
1. ME: Launch 2-3 parallel agents with identical prompt, different item lists
2. AGENTS: Work in parallel (read → verify → check → edit → report)
3. AGENTS: Return structured reports (score, status, fixes applied, files modified)
4. ME: Review changes (git status, spot-check diffs)
5. ME: Commit in batches with meaningful changelog
6. ME: Push and update progress tracking
```

**Why agents don't commit**: Allows human review, batching, and clean commit history.

## Signs a Task Fits This Pattern

**Good fit**:
- Same steps repeated for many items
- Each item requires judgment (not just transformation)
- Items are independent (no cross-item dependencies)
- Clear success criteria (score, pass/fail, etc.)
- Authoritative source exists to verify against

**Bad fit**:
- Items depend on each other's results
- Requires creative/subjective decisions
- Single complex task (use regular agent instead)
- Needs human input mid-process

## Quick Reference

### Agent Frontmatter Template

```yaml
---
name: my-agent
description: |
  [Role] specialist. MUST BE USED when [triggers].
  Use PROACTIVELY for [task category].
  Keywords: [trigger words]
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---
```

### Fix Bash Approval Spam

1. Remove Bash from tools if not needed
2. Put critical instructions FIRST (right after frontmatter)
3. Use allowlists in `.claude/settings.json`

### Memory Crash Recovery

```bash
export NODE_OPTIONS="--max-old-space-size=16384"
source ~/.bashrc && claude
```


---

# Agent Memory Limits

## Root Cause Fix (REQUIRED)

Add to `~/.bashrc` or `~/.zshrc`:
```bash
export NODE_OPTIONS="--max-old-space-size=16384"
```

This increases Node.js heap from default 4GB to 16GB. **With this set, you can run agents normally.**

## Model Selection (Quality First)

Don't downgrade model quality to work around memory - fix the heap limit instead.

| Model | Use For |
|-------|---------|
| **Opus** | Creative work (page building, design, content) - quality matters |
| **Sonnet** | Research, validation, synthesis - balanced |
| **Haiku** | Script runners, simple deployers - speed over quality |

## Parallel Limits (Even With Fix)

| Agent Type | Max Parallel | Notes |
|------------|--------------|-------|
| Any agents | 2-3 | Context accumulates; batch then pause |
| Heavy creative | 1-2 | Opus agents use more memory |

## Recovery

If crash occurs:
1. `source ~/.bashrc` or restart terminal
2. `NODE_OPTIONS="--max-old-space-size=16384" claude`
3. Check what files exist, continue from there


---

---
globs: ["**/*.ts", "**/*.tsx", ".claude/agents/*.md", "**/agents/*.md"]
---

# Agent Implementation Pattern

When building agent-like functionality in Claude Code projects, use Task sub-agents instead of remote API calls.

## Corrections

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| Script calling Claude/OpenAI API remotely | Task tool with `subagent_type: "general-purpose"` |
| `fetch('https://api.anthropic.com/v1/messages')` in script | Task sub-agent with comprehensive prompt |
| Remote agent with single-shot context | Sub-agent that can read files iteratively |

## Why Sub-Agents Are Superior

| Aspect | Remote API Call | Task Sub-Agent |
|--------|-----------------|----------------|
| Tool access | None | Full (Read, Grep, Write, Bash) |
| File reading | Must pass all content in prompt | Can read files iteratively |
| Cross-referencing | Single context window | Can reason across documents |
| Decision quality | Generic suggestions | Specific decisions with rationale |
| Output quality | ~100 lines typical | 600+ lines with specifics |

## Pattern

```typescript
// ❌ WRONG - Remote API call
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': ANTHROPIC_API_KEY },
  body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages: [...] })
});

// ✅ CORRECT - Use Task tool in Claude Code
// Invoke Task with subagent_type: "general-purpose"
// Sub-agent reads files, synthesizes, writes output
```

## When This Applies

- Creative Director agents (synthesizing discovery into briefs)
- Code review agents
- Documentation generators
- Any multi-file analysis task
- Content generation from multiple sources

## Real Example

**Task**: Generate Creative Brief from 6 discovery files + media catalog

**Remote API result**: Generic brief with placeholder suggestions
**Sub-agent result**: 610-line brief with specific hex codes, image IDs by filename, actual headlines, cross-referenced statistics with citations

The difference is dramatic because sub-agents can:
1. Read all 6 discovery files (3,600+ lines)
2. Read media catalog and reference specific images
3. Cross-reference facts between documents
4. Make informed decisions based on full context


---

---
globs: [".claude/agents/*.md", "**/agents/*.md", "**/teams/**/*.md", "**/prompts/**/*.md"]
---

# Agent Self-Documentation Principle

When building or improving agent systems, all changes must be captured IN the agent prompts/templates themselves. Future agent instances won't have your conversation context.

## The Principle

> "Agents that won't have your context must be able to reproduce the behaviour independently."

Every improvement, fix, or pattern discovered during development must be encoded into the agent's prompt, not left as implicit knowledge.

## Corrections

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| One-off fix in current session | Update the agent prompt/template |
| "Remember to do X" in conversation | Add X to agent's process section |
| Fixing output manually | Add quality check to agent's checklist |
| Explaining pattern verbally | Document pattern in agent's instructions |

## What to Encode

| Discovery | Where to Capture |
|-----------|------------------|
| Bug fix pattern | Agent's "Corrections" or "Common Issues" section |
| Quality requirement | Agent's "Quality Checklist" section |
| File path convention | Agent's "Output" section |
| Tool usage pattern | Agent's "Process" section |
| Blocking prerequisite | Agent's "Blocking Check" section |

## Example: Learning Becomes Instruction

**During development** (conversation context):
> "The grid was showing 3+1 orphan layout with 4 items. Fixed by using `:has(:nth-child(4):last-child)` to detect item count."

**Encoded in agent prompt**:
```markdown
### Grid Layout Rules
- Use `.services-grid` class - it auto-adapts to item count
- 4 items → 2x2 grid (not 3+1)
- See `teams/creative/layout-presets.md` for patterns
```

## Test: Would a Fresh Agent Succeed?

Before completing any agent system improvement:

1. **Read the agent prompt as if you have no context**
2. **Ask**: Could a new session follow this and produce the same quality?
3. **If no**: Add missing instructions, patterns, or references

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| "As we discussed earlier..." | No prior context exists |
| Relying on files read during dev | Agent may not read same files |
| Assuming knowledge from errors | Agent won't see your debugging |
| "Just like the home page" | Agent hasn't built home page |

## Agent Prompt Structure

Effective agent prompts include:

```markdown
## Your Role
[What the agent does]

## Blocking Check
[Prerequisites that must exist]

## Input
[What files to read]

## Process
[Step-by-step with encoded learnings]

## Output
[Exact file paths and formats]

## Quality Checklist
[Verification steps including learned gotchas]

## Common Issues
[Patterns discovered during development]
```

## Applies To

- Custom agents in `.claude/agents/`
- Team prompts in `teams/*/`
- Any reusable prompt or workflow
- MCP server tool definitions


---

---
globs: ["**/agents/*.md", "**/.claude/agents/*"]
---

# Custom Agent Description Pattern

When creating custom agents in `.claude/agents/`, the description field determines whether Claude will automatically delegate tasks to the agent.

## Corrections

| If Claude suggests... | Use instead... |
|----------------------|----------------|
| `description: "Analyzes screenshots for issues"` | `description: "Visual QA specialist. MUST BE USED when analyzing screenshots. Use PROACTIVELY for any visual QA task."` |
| `description: "Runs Playwright scripts"` | `description: "Playwright specialist. MUST BE USED when running Playwright scripts. Use PROACTIVELY for browser automation."` |
| Weak/passive descriptions | Strong trigger phrases with "MUST BE USED" and "Use PROACTIVELY" |

## Pattern

```yaml
---
name: agent-name
description: "[Role] specialist. MUST BE USED when [specific triggers]. Use PROACTIVELY for [task category]."
tools: [tool list]
model: sonnet
---
```

## Why This Matters

Claude Code has two delegation mechanisms:
1. **Explicit**: `Task tool subagent_type: "agent-name"` - always works
2. **Automatic**: Claude matches task descriptions to agent descriptions - requires strong phrasing

Without "MUST BE USED" and "Use PROACTIVELY", automatic delegation may not trigger even when the task matches.

## Session Restart Required

After creating or modifying agents, restart the Claude Code session. Agents are loaded at session start and won't appear in available subagent_types until restart.

## Pipeline Agents: Update Predecessor

When inserting a new agent into a numbered pipeline (e.g., `HTML-01` → `HTML-05` → `HTML-11`):

| Must Update | What |
|-------------|------|
| New agent | "Workflow Position" diagram + "Next" field |
| **Predecessor agent** | Its "Next" field to point to new agent |

**Common bug**: New agent has correct position, but predecessor still points to the old next agent. The new agent is "orphaned" and gets skipped.

**Verification**:
```bash
grep -n "Next:.*→\|Then.*runs next" .claude/agents/*.md
```

Every pipeline agent should point to exactly one successor.


---

---
globs: ["**/.claude/agents/*.md", "**/agents/*.md", "**/.claude/settings.json"]
---

# Custom Agent Design Principles

## 1. Declarative Over Imperative

Describe **what** to accomplish, not **how** to use tools.

Claude Code's harness already includes tool selection guidance - prescriptive instructions can conflict with it.

## 2. Give All Tools to All Agents

Don't micromanage tool lists per agent. Use a standard full toolset:

```yaml
tools: Read, Write, Edit, Glob, Grep, Bash
```

**Why**: Simpler config, more flexibility, trust the model to choose.

## 3. Use Allowlists for Bash Commands

Instead of restricting Bash access, allowlist safe commands in `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Write",
      "Edit",
      "WebFetch(domain:*)",
      "Bash(cd *)",
      "Bash(cp *)",
      "Bash(mkdir *)",
      "Bash(ls *)",
      "Bash(find *)",
      "Bash(cat *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(pwd)",
      "Bash(echo *)",
      "Bash(grep *)",
      "Bash(diff *)",
      "Bash(mv *)",
      "Bash(touch *)",
      "Bash(basename *)",
      "Bash(dirname *)",
      "Bash(sort *)",
      "Bash(uniq *)",
      "Bash(test *)",
      "Bash([ *)",
      "Bash(for *)",
      "Bash(cut *)",
      "Bash(file *)"
    ]
  }
}
```

This avoids permission prompts without limiting agent capabilities.

**Why these are included**:
- `Write`, `Edit` - Background agents can't prompt; without these, file ops fail silently
- `WebFetch(domain:*)` - Allow fetching from any domain without prompts
- `Bash(...)` - Safe read-only and file management commands

**Note**: `WebSearch` doesn't support wildcards - it requires exact search terms, so can't be blanket-allowed.

**Note**: Pattern matching is based on the **first token** - `for file in...` needs `Bash(for *)`, not just the commands inside the loop.

## Corrections

| If agent says... | Use instead... |
|------------------|----------------|
| `grep -r "PLACEHOLDER:" build/*.html` | "Find any PLACEHOLDER comments in build/*.html" |
| `ls build/` | "Check build/ folder exists and list its contents" |
| `cat discovery/report.json \| jq '.abn'` | "Read ABN from discovery/report.json" |
| "Use the Grep tool to..." | "Search for X in Y" |
| "Run this bash command:" | "Verify that X exists/matches/contains" |

## Pattern

**Imperative (avoid)**:
```markdown
### Check for placeholders
```bash
grep -r "PLACEHOLDER:" build/*.html
grep -ri "TODO\|TBD" build/*.html
```
```

**Declarative (prefer)**:
```markdown
### Check for placeholders
Search all HTML files in build/ for:
- PLACEHOLDER: comments
- TODO or TBD markers
- Template brackets like [Client Name]

Any match = incomplete content.
```

## What to Include in Agent Instructions

| Include | Skip |
|---------|------|
| Task goal and context | Explicit bash/tool commands |
| Input file paths | "Use X tool to..." |
| Output file paths and format | Step-by-step tool invocations |
| Success/failure criteria | Shell pipeline syntax |
| Blocking checks (prerequisites) | Micromanaged workflows |
| Quality checklists | |

## Exception

Bash commands in instructions are appropriate when:
- Running external CLIs (`jezpress-cli`, `npx tsx`, `wrangler`)
- Complex file operations that tools don't cover
- The specific command syntax matters (rare)

## Summary

**Philosophy**: Trust the model, simplify config, use allowlists.

| Instead of... | Do this... |
|---------------|------------|
| Curating tools per agent | Give all tools to all agents |
| Prescribing how to use tools | Describe what to accomplish |
| Restricting Bash access | Allowlist safe commands |
| Micromanaging workflows | Define inputs, outputs, criteria |