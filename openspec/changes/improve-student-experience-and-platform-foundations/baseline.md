# Implementation baseline

Captured on 2026-10-22 before implementation changes for this OpenSpec change.

## Repository state

No cleanup, reset, checkout, formatter, lint fix, or migration command was run.

- `barbaraFront`: 55 pre-existing/non-change status entries at capture time (37 modified, 18 untracked). The OpenSpec directory is included among the untracked entries.
- `barbaraBackend`: 6 pre-existing status entries (4 modified workout schedule/session files and 2 untracked service specs).
- Git also reported that the user-level global ignore file was unreadable; this did not prevent repository status inspection.

## Frontend verification

Commands:

```text
npm.cmd run lint
npm.cmd run build
```

Results:

- Production build: passed with Vite 7.1.3; 3,996 modules transformed.
- PWA precache: 72 entries, approximately 1,603.26 KiB.
- Lint: failed with 26 findings (17 errors, 9 warnings). The errors are primarily explicit `any`; warnings include stale hook dependencies and unused disable comments.

Largest JavaScript chunks reported by the production build:

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
| Main index | 499.22 kB | 159.55 kB |
| Charts vendor | 392.95 kB | 107.88 kB |
| Motion vendor | 119.35 kB | 39.30 kB |
| Date picker | 56.68 kB | 18.30 kB |
| React vendor | 44.91 kB | 16.09 kB |
| DnD vendor | 43.71 kB | 14.68 kB |
| Personal student detail route | 34.34 kB | 9.05 kB |

Large raster assets present in the build output include `barbara.jpg` (2,768,114 bytes), `background.jpg` (2,257,155 bytes), and `Profile_pic.jpg` (1,054,031 bytes).

## Backend verification

Command:

```text
npm.cmd test -- --runInBand
```

Result: passed 4/4 suites and 21/21 tests, covering workout sessions, authentication, workout schedules, and students.

## Reproduction criteria

The baseline is considered reproduced when the backend suite still reports 21 passing tests, the frontend build passes, lint reports the same 17 errors/9 warnings before cleanup, and the main/chart/motion chunks remain within normal hash-only variation of the sizes above.
