---
name: Imported pnpm-workspace projects: artifacts not registered
description: What to do when a GitHub-imported PNPM_WORKSPACE project has real artifacts/<slug>/.replit-artifact/artifact.toml files on disk, but listArtifacts() and listWorkflows() come back empty and no workflows exist.
---

## Symptom

A project imported from GitHub already has the full Replit pnpm-workspace shape (`artifacts/<slug>/.replit-artifact/artifact.toml`, `lib/*`, root `package.json`, `.replit` with `stack = "PNPM_WORKSPACE"`), but:

- `listArtifacts()` returns `{ artifacts: [] }`
- `listWorkflows()` returns `[]`
- `WorkflowsRestart({ name: "artifacts/<slug>: <service>" })` fails with "workflow doesn't exist"
- `createArtifact()` for the same slug fails with `ARTIFACT_DIR_EXISTS` (correctly, since the directory is real)

## Fix

Run `pnpm install` first, then call the post-merge-setup skill's `runPostMergeSetup()` callback (even though nothing was actually merged). It re-discovers every `artifacts/<slug>/.replit-artifact/artifact.toml` on disk, registers each as a proper artifact, and creates+starts its managed workflow(s) — reported back as automatic-update events ("Added artifact: ...", "Configured workflows changed: ...").

**Why:** artifact/workflow registration for a PNPM_WORKSPACE project is driven by a discovery pass over `artifact.toml` files, and that pass is wired into the post-merge reconciliation step rather than exposed as its own standalone "sync/import" callback. `createArtifact()` is only for scaffolding brand-new artifacts, not adopting pre-existing ones.

**How to apply:** when setting up an imported repo that already has this pnpm-workspace/artifact structure, don't try to fake registration via `configureWorkflow` or move/recreate the artifact directories — just run `runPostMergeSetup()` and then use `WorkflowsRestart` / `Screenshot` as usual once the automatic-update events confirm registration.
