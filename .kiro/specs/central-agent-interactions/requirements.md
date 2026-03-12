# Requirements Document

## Introduction

This feature implements a new "Central Agent Interactions" page for the OpenSearch Dashboard demo. On page load, the chat is centered with a reasonable max-width. When the user clicks an artifact card in the chat, the page animates into a split-screen layout: the chat slides left and the artifact panel opens on the right. The page features 3 suggested prompts that each map to a pre-built mock dialog, a minimal geometric animated robot for the thinking state, a dark navy accent color theme, resizable split panels with a drag handle, and canvas zoom/pan only for system diagram artifacts. Charts and graphs use the recharts library.

## Glossary

- **Central_Agent_Page**: The new standalone page for AI agent interactions, centered chat by default with animated split-screen on artifact click
- **Chat_Panel**: The left side of the split screen displaying the conversation with the AI agent
- **Artifact_Panel**: The right side of the split screen displaying generated artifacts (diagrams, charts, code, etc.)
- **Mock_Dialog**: A pre-scripted conversation flow with typed mock data, triggered by a suggested prompt
- **Suggested_Prompt**: One of 3 clickable prompt chips that initiate a specific mock dialog
- **Thinking_Robot**: A minimal geometric animated SVG robot displayed while the agent is "thinking"
- **Drag_Handle**: A draggable divider between the chat and artifact panels for resizing
- **System_Diagram**: A node-and-edge architecture diagram artifact that supports canvas zoom/pan
- **Artifact**: A generated output displayed in the artifact panel (chart, diagram, code block, markdown, etc.)

## Requirements

### Requirement 1: Page Layout and Navigation

**User Story:** As a user, I want a dedicated Central Agent page accessible from the app navigation, so that I can interact with the AI agent in a focused environment.

#### Acceptance Criteria

1. THE Central_Agent_Page SHALL be accessible via a route in the application router
2. ON page load, THE Central_Agent_Page SHALL display the Chat_Panel centered horizontally with a reasonable max-width (e.g., 720px) and no Artifact_Panel visible
3. WHEN the user clicks an artifact card in the chat, THE Central_Agent_Page SHALL animate the Chat_Panel to the left and reveal the Artifact_Panel on the right in a split-screen layout
4. THE Central_Agent_Page SHALL include a navigation element to return to the Home page
5. THE Central_Agent_Page SHALL use a dark navy accent color theme distinct from the main dashboard theme

### Requirement 2: Resizable Split Panels

**User Story:** As a user, I want to resize the chat and artifact panels by dragging a handle, so that I can allocate screen space based on my current focus.

#### Acceptance Criteria

1. THE Central_Agent_Page SHALL display a Drag_Handle between the Chat_Panel and Artifact_Panel WHEN the split-screen layout is active
2. WHEN the user drags the Drag_Handle horizontally, THE Central_Agent_Page SHALL resize the Chat_Panel and Artifact_Panel proportionally
3. THE Drag_Handle SHALL enforce minimum width constraints on both panels to prevent either from collapsing completely
4. THE Drag_Handle SHALL provide visual feedback (cursor change, highlight) when hovered or actively dragged
5. WHEN the user closes the Artifact_Panel, THE Chat_Panel SHALL animate back to its centered, max-width layout

### Requirement 3: Chat Panel with Suggested Prompts

**User Story:** As a user, I want to see suggested prompts and send messages in the chat panel, so that I can start conversations with the AI agent quickly.

#### Acceptance Criteria

1. THE Chat_Panel SHALL display exactly 3 Suggested_Prompts when no conversation is active
2. WHEN the user clicks a Suggested_Prompt, THE Chat_Panel SHALL initiate the corresponding Mock_Dialog
3. THE Chat_Panel SHALL display a text input area for typing messages
4. THE Chat_Panel SHALL display messages in a scrollable conversation view with user messages right-aligned and agent messages left-aligned
5. WHEN a Suggested_Prompt is clicked, THE Chat_Panel SHALL hide the suggested prompts and begin the dialog flow

### Requirement 4: Mock Dialog System

**User Story:** As a user, I want each suggested prompt to trigger a realistic multi-turn conversation with artifacts, so that I can experience the agent's capabilities.

#### Acceptance Criteria

1. THE system SHALL define exactly 3 Mock_Dialogs, each mapped to one Suggested_Prompt
2. EACH Mock_Dialog SHALL contain a sequence of typed mock messages and artifact references stored in a TypeScript data file
3. WHEN a Mock_Dialog is active, THE Chat_Panel SHALL display agent responses with a simulated typing delay
4. WHEN a Mock_Dialog message references an artifact, THE Artifact_Panel SHALL display the corresponding artifact
5. THE Mock_Dialog data SHALL be strongly typed with TypeScript interfaces

### Requirement 5: Thinking State Animation

**User Story:** As a user, I want to see a visual indicator when the agent is processing, so that I know the system is working on my request.

#### Acceptance Criteria

1. WHILE the agent is generating a response, THE Chat_Panel SHALL display the Thinking_Robot animation
2. THE Thinking_Robot SHALL be a minimal geometric animated SVG robot with simple shapes (circles, rectangles, lines)
3. THE Thinking_Robot animation SHALL include subtle movement (e.g., pulsing, rotating elements, blinking)
4. WHEN the agent response is ready, THE Thinking_Robot SHALL be replaced by the agent's message

### Requirement 6: Artifact Panel Display

**User Story:** As a user, I want the artifact panel to display various types of generated content, so that I can view the agent's outputs visually.

#### Acceptance Criteria

1. THE Artifact_Panel SHALL support displaying chart artifacts rendered with the recharts library
2. THE Artifact_Panel SHALL support displaying System_Diagram artifacts as node-and-edge diagrams
3. THE Artifact_Panel SHALL support displaying code block artifacts with syntax highlighting
4. THE Artifact_Panel SHALL support displaying markdown-formatted text artifacts
5. WHEN no artifact is active, THE Artifact_Panel SHALL display an empty state placeholder

### Requirement 7: System Diagram Zoom and Pan

**User Story:** As a user, I want to zoom and pan system diagram artifacts, so that I can explore complex architecture diagrams in detail.

#### Acceptance Criteria

1. WHEN a System_Diagram artifact is displayed, THE Artifact_Panel SHALL enable zoom via mouse wheel or pinch gesture
2. WHEN a System_Diagram artifact is displayed, THE Artifact_Panel SHALL enable pan via click-and-drag on the canvas
3. THE zoom/pan functionality SHALL only be available for System_Diagram artifacts, not for other artifact types
4. THE Artifact_Panel SHALL provide zoom controls (zoom in, zoom out, reset) for System_Diagram artifacts

### Requirement 8: Dark Navy Theme

**User Story:** As a user, I want the Central Agent page to have a distinctive dark navy visual theme, so that it feels like a focused, immersive agent experience.

#### Acceptance Criteria

1. THE Central_Agent_Page SHALL use a dark navy color palette for backgrounds, borders, and accents
2. THE Chat_Panel SHALL use light text on dark backgrounds for readability
3. THE Artifact_Panel SHALL use a slightly lighter navy background to distinguish it from the chat panel
4. THE Suggested_Prompts SHALL use accent colors that contrast with the dark navy background

### Requirement 9: Mock Data Structure

**User Story:** As a developer, I want the mock dialog data to be well-structured and typed, so that it is easy to maintain and extend.

#### Acceptance Criteria

1. THE mock data SHALL be stored in a dedicated TypeScript file with exported typed constants
2. EACH Mock_Dialog SHALL define a sequence of turns, where each turn has a sender, message text, optional artifact reference, and optional delay
3. EACH artifact reference SHALL specify the artifact type (chart, diagram, code, markdown) and the artifact content/configuration
4. THE TypeScript interfaces for mock data SHALL be exported for reuse across components
