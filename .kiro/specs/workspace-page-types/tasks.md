# Implementation Plan: Workspace Page Types

## Overview

Implement four workspace page types (Summary, Dashboard, Logs, Traces) with Empty and Prefill states, integrating into the existing Canvas/ViewList system. Summary and Dashboard auto-generate content in empty state; Logs and Traces show static layouts. The implementation extends the existing React/TypeScript/Vite stack with shadcn/ui and Tailwind CSS.

## Tasks

- [x] 1. Define data models and page type registry
  - [x] 1.1 Extend `CanvasPage` interface in `src/types/index.ts` with `generationStatus`, `generationError` fields; add `TraceSpan`, `TraceData`, `InvestigationData`, `PageTypeConfig` interfaces
    - Add `generationStatus?: 'idle' | 'generating' | 'complete' | 'error'` and `generationError?: string` to `CanvasPage`
    - Define `TraceSpan` with `spanId`, `traceId`, `parentSpanId?`, `serviceName`, `operationName`, `startTime`, `duration`, `status`
    - Define `TraceData` with `traceId`, `rootSpan`, `spans`, `totalDuration`
    - Define `InvestigationData` with optional `summaryContent`, `dashboardMetrics`, `logEntries`, `traceData`
    - Define `PageTypeConfig` with `id`, `label`, `autoGenerates`
    - _Requirements: 1.3, 2.1_

  - [x] 1.2 Create page type registry in `src/components/pages/page-types.ts`
    - Define `PAGE_TYPES` constant with `summary`, `dashboard`, `logs`, `traces` entries
    - Export `PageTypeId` type as `keyof typeof PAGE_TYPES`
    - Export `resolvePageState` function that returns `'empty'` or `'prefill'` based on `hasInvestigationData` boolean
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3_

  - [ ]* 1.3 Write property tests for page type registry and state resolver
    - **Property 1: Unique page type identifiers** — verify all type IDs in `PAGE_TYPES` are distinct
    - **Validates: Requirements 1.3**
    - **Property 2: State resolution correctness** — for any page type and boolean, resolver returns `'empty'` when false and `'prefill'` when true
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create GeneratingAnimation and GenerationService
  - [x] 3.1 Create `GeneratingAnimation` component in `src/components/pages/GeneratingAnimation.tsx`
    - Accept `label` prop (e.g. "Generating summary...")
    - Render a pulsing/skeleton loading indicator with Tailwind animations
    - Include a `pointer-events-none` overlay to block interaction during generation
    - _Requirements: 11.1, 11.2_

  - [x] 3.2 Create `GenerationService` in `src/services/generation-service.ts`
    - Implement `generateSummary(workspacePages: CanvasPage[]): Promise<GenerationResult>`
    - Implement `generateDashboard(workspacePages: CanvasPage[]): Promise<GenerationResult>`
    - Implement `cancelGeneration(pageId: string): void` for cleanup on page removal
    - Simulate generation with a delay for the prototype; support cancellation via AbortController
    - _Requirements: 3.1, 5.1, 12.3_

  - [ ]* 3.3 Write property tests for generation interaction blocking and cleanup
    - **Property 4: Generation blocks interaction** — for any page with `generationStatus === 'generating'`, rendered output includes pointer-events overlay
    - **Validates: Requirements 11.2**
    - **Property 7: Generation cleanup on page removal** — removing a generating page invokes cancellation
    - **Validates: Requirements 12.3**

- [x] 4. Implement Summary page components
  - [x] 4.1 Create `SummaryPageEmpty` in `src/components/pages/SummaryPageEmpty.tsx`
    - On mount, trigger `GenerationService.generateSummary` with workspace pages
    - Show `GeneratingAnimation` with label "Generating summary..."
    - On completion, replace animation with generated summary content
    - On failure, show error message with retry button
    - _Requirements: 3.1, 3.2, 3.3, 11.3_

  - [x] 4.2 Create `SummaryPagePrefill` in `src/components/pages/SummaryPagePrefill.tsx`
    - Accept investigation summary data and render in a structured layout
    - Reuse existing `ParagraphPage`-style rendering for summary content
    - _Requirements: 4.1, 4.2_

  - [ ]* 4.3 Write unit tests for Summary page components
    - Test that empty state triggers generation on mount
    - Test that animation displays during generation
    - Test that content replaces animation on completion
    - Test error state shows retry button
    - _Requirements: 3.1, 3.2, 3.3, 11.3_

- [x] 5. Implement Dashboard page components
  - [x] 5.1 Create `DashboardPageEmpty` in `src/components/pages/DashboardPageEmpty.tsx`
    - On mount, trigger `GenerationService.generateDashboard` with workspace pages
    - Show `GeneratingAnimation` with label "Generating dashboard..."
    - On completion, replace animation with generated dashboard content
    - On failure, show error message with retry button
    - _Requirements: 5.1, 5.2, 5.3, 11.3_

  - [x] 5.2 Create `DashboardPagePrefill` in `src/components/pages/DashboardPagePrefill.tsx`
    - Accept investigation metrics data and render using existing `DashboardPage` component layout as reference
    - _Requirements: 6.1, 6.2_

  - [ ]* 5.3 Write unit tests for Dashboard page components
    - Test that empty state triggers generation on mount
    - Test that animation displays during generation
    - Test that content replaces animation on completion
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Implement Logs page components
  - [x] 6.1 Create `LogsPageEmpty` in `src/components/pages/LogsPageEmpty.tsx`
    - Render log viewer layout: field sidebar, search bar, histogram area, results table structure
    - Display zero results in the results table
    - Use investigation log viewer layout as structural reference
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 6.2 Create `LogsPagePrefill` in `src/components/pages/LogsPagePrefill.tsx`
    - Accept investigation log entries and render using existing `DiscoverPage` component layout as reference
    - _Requirements: 8.1, 8.2_

  - [ ]* 6.3 Write unit tests for Logs page components
    - Test empty state renders all structural elements with zero results
    - Test prefill state renders provided log entries
    - _Requirements: 7.1, 7.2, 8.1_

- [x] 7. Implement Traces page components
  - [x] 7.1 Create `TracesPageEmpty` in `src/components/pages/TracesPageEmpty.tsx`
    - Render trace viewer layout structure with empty data fields
    - Mirror the prefill layout but with all data fields and visualizations empty
    - Include span waterfall area, service labels, duration/timestamp columns
    - _Requirements: 9.1, 9.2_

  - [x] 7.2 Create `TracesPagePrefill` in `src/components/pages/TracesPagePrefill.tsx`
    - Accept `TraceData[]` and render per Figma design (span hierarchy, timing bars, service attribution)
    - Display span waterfall visualization, duration columns, and service labels
    - _Requirements: 10.1, 10.2_

  - [ ]* 7.3 Write unit tests for Traces page components
    - Test empty state renders trace viewer structure with no data
    - Test prefill state renders span hierarchy and timing information
    - _Requirements: 9.1, 10.1, 10.2_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create PageTypeRouter and integrate with Canvas
  - [x] 9.1 Create `PageTypeRouter` component in `src/components/pages/PageTypeRouter.tsx`
    - Accept `page: CanvasPage`, `hasInvestigationData: boolean`, `onGenerationComplete`, `onGenerationError` props
    - Use `resolvePageState` to determine empty vs prefill
    - Route to the correct page component based on `page.type` and resolved state
    - Fall back to existing `PagePlaceholder` behavior for unregistered page types
    - _Requirements: 12.2, 2.2, 2.3_

  - [x] 9.2 Update `Canvas.tsx` to use `PageTypeRouter` instead of `PagePlaceholder` for registered page types
    - Import `PageTypeRouter` and `PAGE_TYPES`
    - For pages with types in `PAGE_TYPES`, render via `PageTypeRouter`; otherwise keep existing `PagePlaceholder`
    - Pass `hasInvestigationData` from workspace context
    - Wire `onGenerationComplete` to update page content and `generationStatus`
    - On page removal, call `GenerationService.cancelGeneration` for pages with active generation
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 9.3 Write property tests for page type routing and creation
    - **Property 5: Page creation assigns correct type** — for any page type selected, the CanvasPage entry has the matching type identifier
    - **Validates: Requirements 12.1**
    - **Property 6: Page type routing correctness** — for any CanvasPage with a registered type, PageTypeRouter renders the correct component for the resolved state
    - **Validates: Requirements 12.2**

- [x] 10. Update ViewList add-page menu
  - [x] 10.1 Update the add-page menu in `ViewList.tsx` to list all four page types from `PAGE_TYPES`
    - Import `PAGE_TYPES` from `page-types.ts`
    - Render Summary, Dashboard, Logs, and Traces as selectable options
    - On selection, create a `CanvasPage` entry with the correct type identifier and `generationStatus: 'idle'`
    - _Requirements: 1.2, 12.1_

- [ ] 11. Write property test for prefill data rendering
  - [ ]* 11.1 Write property test for prefill state data inclusion
    - **Property 3: Prefill state renders investigation data** — for any page type and valid investigation data, the prefill renderer includes the provided data in its output
    - **Validates: Requirements 4.1, 6.1, 8.1, 10.2**

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` and validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All page components use React/TypeScript with shadcn/ui and Tailwind CSS
