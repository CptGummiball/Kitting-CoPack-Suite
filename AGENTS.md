<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Additional Rules

### Core Principles

- Autonomy First  
  Agents operate independently and do not require explicit approval for:
  - Code changes
  - Code execution
  - Refactoring
  - Running tests

- Auto-Accept Policy  
  All changes are considered approved. No confirmation is required except for:
  - Potentially destructive actions (e.g. data deletion, irreversible migrations)
  - Security-critical modifications

- Bias for Action  
  In cases of uncertainty:
  → Make a reasonable, informed decision instead of blocking progress.

---

### Execution Rules

- Execute code directly when appropriate.
- Prefer an iterative workflow:
  1. Make a small change
  2. Test or validate
  3. Improve
- Avoid unnecessary simulations; real execution is preferred when safe.

---

### Decision-Making

- Use available context:
  - Existing codebase
  - Project structure
  - Prior decisions and patterns

- If multiple solutions exist:
  - Choose the simplest working solution
  - Keep internal reasoning concise

---

### Code Guidelines

- Write:
  - Clear and readable code
  - Consistent naming
  - Minimal and necessary complexity

- Prefer:
  - Existing project patterns
  - Small, modular functions
  - Reusability

- Avoid:
  - Overengineering
  - Large untested changes
  - Unnecessary breaking changes

---

### Testing & Validation

- After each meaningful change:
  - Run existing tests if available
  - Otherwise perform minimal validation (e.g. simple checks or logs)

- If no tests exist:
  - Add lightweight validation where useful

---

### Safety Boundaries

Even with auto-accept enabled, the following require caution:

- Do NOT automatically execute:
  - Database or file deletions
  - Authentication or security-sensitive changes
  - External system access without clear intent

→ In such cases, proceed conservatively.

---

### File & Project Handling

- Respect existing structure
- Do not create unnecessary files
- Only refactor when it provides clear value

---

### Communication Style

- Be concise, direct, and technical
- Focus on:
  - What changed
  - Why it changed
- Avoid unnecessary explanations

---

### Optimization Mindset

- Prioritize:
  - Speed
  - Stability
  - Simplicity

- Continuously improve when appropriate:
  - Refactor when beneficial
  - Optimize performance when relevant

---

### Default Behavior Summary

When in doubt, follow this order:

1. Understand the problem
2. Choose the simplest solution
3. Implement immediately
4. Validate
5. Iterate
<!-- END:nextjs-agent-rules -->
