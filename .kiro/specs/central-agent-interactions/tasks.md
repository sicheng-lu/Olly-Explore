# Tasks

## Task 1: Set up mock data and TypeScript types

- [x] 1.1 Create `src/data/agent-mock-dialogs.ts` with TypeScript interfaces: `ArtifactType`, `ChartArtifactData`, `DiagramNode`, `DiagramEdge`, `DiagramArtifactData`, `CodeArtifactData`, `MarkdownArtifactData`, `ArtifactData`, `DialogMessage`, `MockDialog`
- [x] 1.2 Define 3 mock dialogs in `MOCK_DIALOGS` array — each with a unique `id`, `promptLabel`, `promptDescription`, and a `turns` array containing multi-turn conversations with artifact references
  - Dialog 1: System architecture analysis — includes a system diagram artifact and a chart artifact
  - Dialog 2: Performance investigation — includes chart artifacts (line, bar) and a code artifact
  - Dialog 3: Security audit — includes a markdown artifact, a code artifact, and a diagram artifact
- [x] 1.3 Export all interfaces and the `MOCK_DIALOGS` constant for use across components

## Task 2: Create the ThinkingRobot component

- [x] 2.1 Create `src/components/agent/ThinkingRobot.tsx` — a minimal geometric animated SVG robot with:
  - Rectangular body with rounded corners
  - Circular eyes with blink animation (opacity keyframes)
  - Antenna with pulsing circle on top
  - Subtle floating animation (translateY oscillation via CSS keyframes)
- [x] 2.2 Accept a `size` prop (default 48) to control the SVG dimensions

## Task 3: Create the ResizableSplitLayout component

- [x] 3.1 Create `src/components/agent/ResizableSplitLayout.tsx` with props: `left`, `right`, `defaultLeftWidth` (percentage), `minLeftWidth` (px), `minRightWidth` (px)
- [x] 3.2 Implement drag handle with `onMouseDown`/`onMouseMove`/`onMouseUp` event handling on `document` for smooth dragging
- [x] 3.3 Enforce minimum width constraints — clamp left panel width so neither panel goes below its minimum
- [x] 3.4 Style the drag handle: 4–6px wide vertical bar, `col-resize` cursor on hover, subtle highlight on active drag

## Task 4: Create artifact renderer components

- [x] 4.1 Install `recharts` dependency: `npm install recharts`
- [x] 4.2 Create `src/components/agent/ChartArtifact.tsx` — renders `ChartArtifactData` using recharts (`BarChart`, `LineChart`, `AreaChart`, `PieChart`) based on `chartType`, with dark-theme-compatible colors
- [x] 4.3 Create `src/components/agent/DiagramArtifact.tsx` — renders `DiagramArtifactData` as SVG nodes and edges with:
  - Zoom via mouse wheel (scale transform, clamped to min/max bounds)
  - Pan via pointer drag (translate transform)
  - Zoom controls: zoom in, zoom out, reset buttons
  - Node rendering based on `type` (service, database, external, queue) with status colors
  - Edge rendering with optional labels and solid/dashed styles
- [x] 4.4 Create `src/components/agent/CodeArtifact.tsx` — renders `CodeArtifactData` in a `<pre><code>` block with monospace font, dark background, and language label header
- [x] 4.5 Create `src/components/agent/MarkdownArtifact.tsx` — renders `MarkdownArtifactData` with headings, paragraphs, lists, and inline code using Tailwind typography classes
- [x] 4.6 Create `src/components/agent/ArtifactPanel.tsx` — routes `ArtifactData | null` to the correct renderer component, or shows empty state placeholder when null

## Task 5: Create the AgentChatPanel component

- [x] 5.1 Create `src/components/agent/AgentChatPanel.tsx` with props: `messages`, `isThinking`, `hasActiveDialog`, `onPromptClick`, `onSendMessage`
- [x] 5.2 Implement SuggestedPromptChips — display 3 prompt chips from mock data, hidden when `hasActiveDialog` is true
- [x] 5.3 Implement message list — scrollable conversation view, user messages right-aligned, agent messages left-aligned, with dark navy theme styling
- [x] 5.4 Integrate ThinkingRobot — show when `isThinking` is true, positioned at the bottom of the message list
- [x] 5.5 Implement text input area with send button, styled for dark navy theme

## Task 6: Create the CentralAgentPage

- [x] 6.1 Create `src/pages/CentralAgentPage.tsx` — manages `DialogState` (activeDialogId, currentTurnIndex, isThinking, activeArtifact, isArtifactPanelOpen, messages) via `useState`
- [x] 6.2 Implement dialog flow logic: when a prompt is clicked, iterate through the mock dialog turns with simulated delays, setting `isThinking` before each agent turn and updating `activeArtifact` when a turn has an artifact
- [x] 6.3 Default layout: chat panel centered with `max-width: 720px` and `margin: 0 auto`, no artifact panel visible
- [x] 6.4 Implement animated split-screen transition: when user clicks an artifact card, set `isArtifactPanelOpen: true`, animate chat panel left (CSS `transition: all 300ms ease`) and reveal artifact panel on the right using `ResizableSplitLayout`
- [x] 6.5 Implement close artifact: when user closes the artifact panel, animate back to centered chat layout
- [x] 6.6 Apply dark navy theme: `bg-slate-900` page background, `text-slate-100` text, `border-slate-700` borders, slightly lighter artifact panel background (`bg-slate-800`)
- [x] 6.7 Add home navigation button (lucide-react `Home` or `ArrowLeft` icon) in the top-left corner

## Task 7: Add route and navigation

- [ ] 7.1 Add `/agent` route to `src/App.tsx` pointing to `CentralAgentPage`
- [ ] 7.2 Add a navigation link to the Central Agent page from the Home page (e.g., in the LeftNav or as a button)
