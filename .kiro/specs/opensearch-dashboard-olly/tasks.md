# Implementation Plan: OpenSearch Dashboard with Olly AI Assistant

## Overview

Incrementally build the OpenSearch Dashboard demo with Olly AI chatbot. Start with project scaffolding and shared state, then build the Home page, Workspace page, and wire everything together. Each task builds on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Project scaffolding, color system, and core types
  - [x] 1.1 Initialize Vite + React + TypeScript project and install dependencies
    - Scaffold with `npm create vite@latest -- --template react-ts`
    - Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `shadcn/ui`, `lucide-react`, `react-router-dom`
    - Initialize shadcn/ui via `npx shadcn-ui@latest init`
    - Add required shadcn components: Button, Card, Sheet, Dialog, ScrollArea, Tabs, Tooltip, DropdownMenu, Toast
    - _Requirements: N/A (infrastructure)_

  - [x] 1.2 Configure Tailwind CSS with OUI color tokens and fonts
    - Define CSS custom properties for light/dark OUI tokens in `src/index.css`
    - Extend `tailwind.config.ts` with `oui` color mappings and Source Sans 3 / Source Code Pro font families
    - Add Google Fonts links to `index.html` for Source Sans 3 and Source Code Pro
    - _Requirements: Design Color System section_

  - [x] 1.3 Create data model types and service interfaces
    - Create `src/types/index.ts` with all TypeScript interfaces: `Workspace`, `Conversation`, `ChatMessage`, `CanvasPage`, `Alert`, `DataSource`, `SuggestedPrompt`, `FeedItem`, `OllyState`, `ChatResponse`
    - Create `src/services/olly-service.ts`, `src/services/workspace-service.ts`, `src/services/alert-service.ts` with stub implementations
    - _Requirements: 8.3, 8.4, 9.1, 12.1, 15.4, 16.4_

  - [x] 1.4 Implement OllyStateProvider context with priority-based state machine
    - Create `src/contexts/OllyStateContext.tsx` with `OllyState`, `OllyStateContext`, and `OllyStateProvider`
    - Enforce priority rules: `investigating` > `thinking` > `normal`
    - Block lower-priority transitions while a higher-priority state is active
    - Provide `transitionTo`, `canTransition`, and `completeInvestigation` methods
    - _Requirements: 1.5, 2.1, 2.2_

  - [ ]* 1.5 Write property test for Olly state priority (Property 2)
    - **Property 2: Investigating state blocks lower-priority transitions**
    - Generate random sequences of state transitions starting from 'investigating' → verify state remains 'investigating' until explicit completion
    - **Validates: Requirements 2.1, 2.2**

  - [x] 1.6 Implement WorkspaceProvider context
    - Create `src/contexts/WorkspaceContext.tsx` managing workspace list, CRUD operations, and privacy state
    - Implement `createWorkspace`, `shareWorkspace`, `listPublicWorkspaces` methods
    - New workspaces default to `privacy: 'private'`
    - _Requirements: 8.1, 11.3, 17.1, 17.2, 17.3_

  - [ ]* 1.7 Write property tests for workspace privacy (Properties 9, 12)
    - **Property 9: New workspaces default to private**
    - Generate random prompts → verify created workspace has `privacy='private'`
    - **Validates: Requirements 8.1, 17.1**
    - **Property 12: Share transitions workspace from private to public**
    - Generate random private workspaces → verify share action sets `privacy` to `'public'`
    - **Validates: Requirements 11.3, 17.3**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. OllyIcon component and shared UI
  - [x] 3.1 Implement OllyIcon component with state-driven visuals
    - Create `src/components/OllyIcon.tsx` rendering the OpenSearch logo SVG
    - Normal state: static logo with `text-oui-primary`, no animation
    - Thinking state: logo with `text-oui-primary` and circling animation on bottom-right outline
    - Investigating state: logo with animation and `text-oui-danger` color change
    - Accept `size` prop ('small' | 'medium' | 'large')
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write property test for OllyIcon state-visual mapping (Property 1)
    - **Property 1: OllyIcon state-visual mapping**
    - Generate random OllyState values → verify OllyIcon renders correct visual variant (classes and animation)
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 3.3 Implement SuggestedPrompts component
    - Create `src/components/SuggestedPrompts.tsx` rendering prompt chips as shadcn `Button` (variant="outline")
    - Include action-based prompts ("What happened during last deployment", "Create alert") and workspace-based prompts ("Create an observability workspace", "Create a security analytics workspace")
    - Clicking a prompt populates the associated text area with the prompt text
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 3.4 Write property test for suggested prompt population (Property 7)
    - **Property 7: Suggested prompt populates text area**
    - Generate random SuggestedPrompt objects → verify text area value matches prompt text exactly
    - **Validates: Requirements 7.4**

- [x] 4. Home Page
  - [x] 4.1 Implement LeftNav component (expanded mode)
    - Create `src/components/LeftNav.tsx` supporting `expanded` and `collapsed` modes
    - Expanded mode: display public workspaces list in shadcn `ScrollArea`, utility links (Dev Tools, Keyboard Shortcuts, Help, User) with Lucide icons at bottom
    - Clicking a workspace navigates to the Workspace page
    - _Requirements: 3.1, 4.1, 4.2, 4.3_

  - [ ]* 4.2 Write property tests for LeftNav (Properties 3, 4)
    - **Property 3: LeftNav displays only public workspaces**
    - Generate random sets of workspaces with mixed privacy → verify list contains only public ones
    - **Validates: Requirements 4.1, 11.4, 17.2**
    - **Property 4: LeftNav workspace click navigates correctly**
    - Generate random public workspaces → verify click handler receives correct workspace ID
    - **Validates: Requirements 4.3**

  - [x] 4.3 Implement Home Page layout with greeting, OllyIcon, feed, and text area
    - Create `src/pages/HomePage.tsx` composing LeftNav (expanded), greeting headline, OllyIcon, Feed area, ViewToggle (shadcn `Tabs` with Feed/Application Map/Service), SuggestedPrompts, and text area
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_

  - [ ]* 4.4 Write property tests for Feed and ViewToggle (Properties 5, 6)
    - **Property 5: Feed filters items by last visit timestamp**
    - Generate random FeedItem sets and timestamps → verify only post-timestamp items displayed
    - **Validates: Requirements 5.1**
    - **Property 6: View toggle switches displayed view**
    - Generate random view toggle selections → verify correct view component is rendered
    - **Validates: Requirements 5.3**

  - [x] 4.5 Implement ConfigPanel (Alert/Goal configuration)
    - Create `src/components/ConfigPanel.tsx` using shadcn `Sheet` sliding in from the right
    - Triggered by a button in the Home page main content area
    - Contains editing controls for Alerts and Olly goals
    - _Requirements: 6.1, 6.2_

  - [x] 4.6 Implement workspace creation from Home page prompt submission
    - When user submits a prompt from the Home page text area, create a new private workspace via WorkspaceService
    - Generate workspace name by summarizing the prompt, auto-assign an icon
    - Navigate to the new Workspace page after creation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 17.1_

  - [ ]* 4.7 Write property tests for workspace creation (Properties 8, 10)
    - **Property 8: Workspace creation produces valid workspace metadata**
    - Generate random non-empty prompt strings → verify workspace has non-empty name and icon
    - **Validates: Requirements 8.3, 8.4**
    - **Property 10: Workspace creation triggers navigation**
    - Generate random prompts → verify navigation is called with the new workspace ID
    - **Validates: Requirements 8.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Workspace Page - Chat Panel
  - [x] 6.1 Implement ChatPanel component with multi-conversation support
    - Create `src/components/ChatPanel.tsx` with header (conversation name, new conversation button, view all button, collapse button using Lucide icons)
    - Chat body using shadcn `ScrollArea` for message history
    - Text area with SuggestedPrompts for user input
    - Send button with Lucide `Send` icon
    - Support multiple conversations per workspace, switchable via header controls
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 6.2 Write property tests for ChatPanel (Properties 13, 14, 15)
    - **Property 13: Multiple conversations per workspace**
    - Generate random N (2–10) → verify creating N conversations results in N distinct conversations
    - **Validates: Requirements 12.1**
    - **Property 14: Chat panel header shows active conversation name**
    - Generate random conversation names → verify header displays active conversation's name
    - **Validates: Requirements 12.2**
    - **Property 15: Chat message send/receive round trip**
    - Generate random user messages → verify chat body contains both sent message and response
    - **Validates: Requirements 12.6**

  - [x] 6.3 Implement ChatPanel collapse/reopen behavior
    - Collapse button hides the ChatPanel
    - Clicking Olly icon in collapsed LeftNav reopens the ChatPanel
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]* 6.4 Write property test for ChatPanel collapse/reopen (Property 16)
    - **Property 16: Chat panel collapse/reopen round trip**
    - Start with visible ChatPanel → collapse → reopen via Olly icon → verify visible state restored
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [x] 7. Workspace Page - Canvas and ViewList
  - [x] 7.1 Implement Canvas component with scrollable page containers
    - Create `src/components/Canvas.tsx` displaying the active page as main content
    - Wrap each page in a container element
    - Support infinite scrolling via shadcn `ScrollArea` for multiple page containers
    - Support standard OpenSearch page types (Discover, Dashboard, etc.)
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ]* 7.2 Write property tests for Canvas (Properties 19)
    - **Property 19: Canvas displays active page in a container**
    - Generate random CanvasPage sets with an active page → verify active page is main content and all pages are in containers
    - **Validates: Requirements 15.1, 15.2**

  - [x] 7.3 Implement ViewList (timeline) component
    - Create `src/components/ViewList.tsx` showing all opened pages as a scrollable timeline
    - Click a page entry to set it as active on the Canvas
    - Close button (Lucide `X`) removes a page from the list and Canvas
    - Plus button (Lucide `Plus`) opens shadcn `DropdownMenu` with available OpenSearch page types
    - Selecting from the menu adds the page to ViewList and Canvas
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 7.4 Write property tests for ViewList (Properties 20, 21, 22)
    - **Property 20: ViewList reflects all opened pages**
    - Generate random CanvasPage sets → verify ViewList has exactly one entry per page
    - **Validates: Requirements 16.1**
    - **Property 21: ViewList click selects active page**
    - Generate random page selections → verify Canvas active page matches selection
    - **Validates: Requirements 16.2**
    - **Property 22: ViewList add/close round trip**
    - Generate random initial page sets, add a page, close it → verify ViewList returns to original set
    - **Validates: Requirements 16.3, 16.5**

- [x] 8. Workspace Page - Layout and Header
  - [x] 8.1 Implement WorkspaceHeader component
    - Create `src/components/WorkspaceHeader.tsx` with workspace icon, name, data sources list, Share button (Lucide `Share2`), Settings button (Lucide `Settings`)
    - Share button transitions workspace from private to public
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 8.2 Implement WorkspacePage layout
    - Create `src/pages/WorkspacePage.tsx` composing collapsed LeftNav (with Home button and Olly icon), WorkspaceHeader, ChatPanel, Canvas, and ViewList
    - LeftNav Home button navigates back to Home page
    - LeftNav Olly icon reflects current state and reopens ChatPanel when collapsed
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 8.3 Implement chat-driven canvas navigation
    - When a chat response contains `pageAction` of type 'open', add the page to the Canvas
    - When a chat response contains `pageAction` of type 'navigate' for an existing page, scroll/navigate Canvas to that page
    - _Requirements: 14.1, 14.2_

  - [ ]* 8.4 Write property tests for chat-canvas coupling (Properties 17, 18)
    - **Property 17: Chat response with open action adds page to canvas**
    - Generate random ChatResponses with 'open' pageAction → verify Canvas adds the page
    - **Validates: Requirements 14.1**
    - **Property 18: Chat response with navigate action scrolls to existing page**
    - Generate random ChatResponses with 'navigate' pageAction for existing pages → verify Canvas sets active page
    - **Validates: Requirements 14.2**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Alert-triggered investigations and routing
  - [x] 10.1 Implement alert-triggered investigation flow
    - Wire AlertService to OllyStateProvider: when an alert triggers, transition Olly to 'investigating' state
    - Create a new workspace for the investigation via WorkspaceService
    - Apply investigating visual state globally (dashboard background accent tint)
    - Allow user to click into the investigation to join the workspace
    - _Requirements: 9.1, 9.2, 9.3, 1.4_

  - [ ]* 10.2 Write property test for alert investigation (Property 11)
    - **Property 11: Alert triggers investigation and workspace creation**
    - Generate random Alert objects → verify Olly transitions to 'investigating' and a workspace is created
    - **Validates: Requirements 9.1, 9.2**

  - [x] 10.3 Set up React Router with Home and Workspace routes
    - Configure `react-router-dom` with routes: `/` → HomePage, `/workspace/:workspaceId` → WorkspacePage
    - Wrap app in OllyStateProvider, WorkspaceProvider, and Router
    - Handle navigation to non-existent workspace by redirecting to Home with toast
    - _Requirements: 4.3, 8.2, 10.3_

- [x] 11. Error handling and polish
  - [x] 11.1 Implement error handling across all components
    - OllyService failure: error message in ChatPanel with retry (max 3, exponential backoff), revert Olly state
    - Workspace creation failure: toast notification, preserve prompt text
    - Canvas page load failure: error placeholder with AlertTriangle icon and retry button
    - Share failure: toast notification, preserve privacy state
    - Message send failure: "failed to send" indicator with AlertCircle icon and retry button
    - Non-existent workspace: redirect to Home with toast
    - _Requirements: Design Error Handling section_

  - [x] 11.2 Wire App entry point with all providers and dark mode support
    - Update `src/App.tsx` to compose Router, OllyStateProvider, WorkspaceProvider, and shadcn ThemeProvider
    - Support dark mode via `.dark` class toggle on root element
    - _Requirements: Design Color System (dark mode)_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code uses TypeScript with React, Vite, shadcn/ui, Lucide React, and Tailwind CSS with OUI color tokens
