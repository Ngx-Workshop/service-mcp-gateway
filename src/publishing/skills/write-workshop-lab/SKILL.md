---
name: write-workshop-lab
description: Coding-lab authoring for Ngx-Workshop generation and revision.
metadata:
  version: "1.0.0"
---

Design a task with explicit inputs, output, constraints and edge cases. The runner calls entryFnName(input) with exactly ONE JSON argument; use an object for multiple parameters. Generate IO tests only. No packages, imports, DOM, Angular runtime or Jest/Vitest. Reference solution must return finite JSON and pass every test. Starter must be syntactically valid and leave work for the learner. Include representative sample cases and distinct hidden edge cases; use unique test names and at most 50 total cases. Use deepEqual for arrays and objects. Ensure tests reject an incomplete solution and common wrong answers. Provide progressive hints without giving away the complete solution.
