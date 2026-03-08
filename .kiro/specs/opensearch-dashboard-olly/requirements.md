# Requirements Document

## Introduction

This feature is an OpenSearch Dashboard demo with an AI chatbot assistant called Olly. The dashboard provides three main views: a Home page with activity feeds and conversation starters, a Workspace page for collaborative investigation and chat, and dynamic visual states that reflect Olly's current activity (Normal, Thinking, Investigating). Alerts can trigger automatic investigations, and users can join workspaces to collaborate. Workspaces support multiple chat conversations, a canvas for viewing OpenSearch dashboard pages, and sharing capabilities.

## Glossary

- **Olly**: The AI chatbot assistant integrated into the OpenSearch Dashboard
- **Dashboard**: The OpenSearch Dashboard application hosting Olly and all pages
- **Home_Page**: The default landing page showing feeds, Olly status, and conversation starters
- **Workspace_Page**: A dedicated page for chat conversations, canvas views, and investigation collaboration
- **Workspace**: A container for conversations, canvas pages, and investigation context; can be Private or Public
- **Feed**: A stream of recent events and Olly's insights displayed on the Home Page
- **Canvas**: The main content area in a Workspace Page that displays OpenSearch dashboard pages in scrollable containers
- **Chat_Panel**: The conversational interface within a Workspace for interacting with Olly
- **View_List**: A timeline-style scrollable list of opened pages in the Canvas
- **Left_Nav**: The navigation sidebar present on both Home and Workspace pages
- **Alert**: A triggered event that can initiate an automatic investigation
- **Conversation**: A single chat thread within a Workspace; multiple Conversations can exist per Workspace
- **Suggested_Prompt**: Pre-defined prompt options displayed above the text area to guide user interaction
- **Data_Source**: An external data connection available within a Workspace

## Requirements

### Requirement 1: Olly Visual States

**User Story:** As a user, I want Olly's icon to visually reflect its current state, so that I can immediately understand what Olly is doing.

#### Acceptance Criteria

1. WHILE Olly is in Normal state, THE Dashboard SHALL display the static OpenSearch logo as the Olly icon
2. WHILE Olly is in Thinking state, THE Dashboard SHALL display the OpenSearch logo with a circling animation on the bottom-right outline
3. WHILE Olly is in Investigating state, THE Dashboard SHALL display the OpenSearch logo with a circling animation on the bottom-right outline and a distinct color change on the Olly icon
4. WHILE Olly is in Investigating state, THE Dashboard SHALL change the overall visual appearance of the dashboard including background color and Olly icon color
5. WHEN Olly transitions between states, THE Dashboard SHALL update the Olly icon visual within the current view without requiring a page reload

### Requirement 2: Olly State Priority

**User Story:** As a user, I want the Investigating state to take visual priority, so that I am always aware of active investigations.

#### Acceptance Criteria

1. WHILE Olly is in Investigating state and another state transition is requested, THE Dashboard SHALL maintain the Investigating state visual until the investigation completes
2. THE Dashboard SHALL apply the Investigating state as the highest priority visual state above Thinking and Normal states

### Requirement 3: Home Page Layout

**User Story:** As a user, I want a Home page with navigation, feeds, and conversation starters, so that I can quickly understand recent activity and interact with Olly.

#### Acceptance Criteria

1. THE Home_Page SHALL display a Left_Nav sidebar on the left side of the page
2. THE Home_Page SHALL display a main content area on the right side of the page
3. THE Home_Page SHALL display a headline greeting message at the top of the main content area
4. THE Home_Page SHALL display the Olly icon reflecting the current Olly state in the main content area
5. THE Home_Page SHALL display a text area at the bottom of the main content area for starting a conversation with Olly

### Requirement 4: Home Page Left Navigation

**User Story:** As a user, I want the left navigation to show public workspaces and utility links, so that I can quickly access shared workspaces and tools.

#### Acceptance Criteria

1. THE Left_Nav on the Home_Page SHALL display a list of public Workspaces in the top section
2. THE Left_Nav on the Home_Page SHALL display links to Dev Tools, Keyboard Shortcuts, Help, and User settings in the bottom section
3. WHEN a user clicks on a public Workspace in the Left_Nav, THE Dashboard SHALL navigate to the corresponding Workspace_Page

### Requirement 5: Home Page Feed and View Toggle

**User Story:** As a user, I want to see a feed of recent events and toggle between different views, so that I can monitor activity and explore the system from different perspectives.

#### Acceptance Criteria

1. THE Home_Page SHALL display a Feed showing events that occurred since the user's last visit and insights from Olly
2. THE Home_Page SHALL provide a view toggle with three options: Feed, Application Map, and Service
3. WHEN the user selects a view toggle option, THE Home_Page SHALL switch the main content area to display the selected view

### Requirement 6: Home Page Alert and Goal Configuration

**User Story:** As a user, I want to configure alerts and Olly's goals, so that I can customize Olly's monitoring behavior.

#### Acceptance Criteria

1. THE Home_Page SHALL display a button in the main content area that opens a right panel for editing Alert and Olly goal configuration
2. WHEN the user clicks the configuration button, THE Home_Page SHALL open a right panel with editing controls for Alerts and Olly goals

### Requirement 7: Home Page Suggested Prompts

**User Story:** As a user, I want to see suggested prompts above the text area, so that I can quickly start common actions or create workspaces.

#### Acceptance Criteria

1. THE Home_Page SHALL display Suggested_Prompts above the text area
2. THE Home_Page SHALL include action-based Suggested_Prompts such as "What happened during last deployment" and "Create alert"
3. THE Home_Page SHALL include workspace-based Suggested_Prompts such as "Create an observability workspace" and "Create a security analytics workspace"
4. WHEN the user clicks a Suggested_Prompt, THE Home_Page SHALL populate the text area with the selected prompt text

### Requirement 8: Workspace Creation from Conversation

**User Story:** As a user, I want sending a prompt to automatically create a private workspace, so that I can seamlessly start working with Olly.

#### Acceptance Criteria

1. WHEN the user submits a prompt from the Home_Page text area, THE Dashboard SHALL create a new private Workspace
2. WHEN a new Workspace is created from a prompt, THE Dashboard SHALL navigate the user to the Workspace_Page
3. WHEN a new Workspace is created, THE Dashboard SHALL generate a Workspace name by summarizing the initial prompt
4. WHEN a new Workspace is created, THE Dashboard SHALL automatically assign a Workspace icon

### Requirement 9: Alert-Triggered Investigation

**User Story:** As a user, I want investigations to start automatically when alerts are triggered, so that issues are addressed without manual intervention.

#### Acceptance Criteria

1. WHEN an Alert is triggered, THE Dashboard SHALL automatically start an investigation and transition Olly to the Investigating state
2. WHEN an automatic investigation starts, THE Dashboard SHALL create a new Workspace for the investigation
3. WHEN an investigation is active, THE Dashboard SHALL allow the user to click into the investigation to join the Workspace

### Requirement 10: Workspace Page Layout

**User Story:** As a user, I want the Workspace page to have a collapsed navigation, chat panel, and canvas, so that I can focus on investigation and collaboration.

#### Acceptance Criteria

1. THE Workspace_Page SHALL display a collapsed Left_Nav sidebar on the left side
2. THE Workspace_Page SHALL display a right panel containing a header, menu, Chat_Panel, and Canvas
3. THE Workspace_Page Left_Nav SHALL include a Home button that navigates back to the Home_Page
4. THE Workspace_Page Left_Nav SHALL include the Olly icon reflecting the current Olly state

### Requirement 11: Workspace Page Header

**User Story:** As a user, I want the workspace header to show workspace details and actions, so that I can manage the workspace effectively.

#### Acceptance Criteria

1. THE Workspace_Page header SHALL display the Workspace icon and Workspace name on the left side
2. THE Workspace_Page header SHALL display a list of Data_Sources, a Share button, and a Settings button on the right side
3. WHEN the user clicks the Share button, THE Dashboard SHALL change the Workspace from Private to Public
4. WHEN a Workspace becomes Public, THE Dashboard SHALL make the Workspace visible in the Left_Nav public Workspaces list on the Home_Page

### Requirement 12: Chat Panel Functionality

**User Story:** As a user, I want a chat panel with multiple conversations and standard chatbot features, so that I can have organized interactions with Olly.

#### Acceptance Criteria

1. THE Chat_Panel SHALL support multiple Conversations within a single Workspace
2. THE Chat_Panel header SHALL display the current Conversation name
3. THE Chat_Panel header SHALL provide buttons to start a new Conversation, view all Conversations, and collapse the Chat_Panel
4. THE Chat_Panel SHALL display a standard chatbot interface in the chat body area
5. THE Chat_Panel SHALL display a text area with Suggested_Prompts above it for user input
6. WHEN the user submits a message in the Chat_Panel text area, THE Chat_Panel SHALL send the message to Olly and display the response in the chat body

### Requirement 13: Chat Panel Collapse and Reopen

**User Story:** As a user, I want to collapse and reopen the chat panel, so that I can maximize canvas space when needed.

#### Acceptance Criteria

1. WHEN the user clicks the collapse button in the Chat_Panel header, THE Workspace_Page SHALL collapse the Chat_Panel
2. WHILE the Chat_Panel is collapsed, THE Workspace_Page SHALL allow the user to click the Olly icon in the Left_Nav to reopen the Chat_Panel
3. WHEN the user clicks the Olly icon in the Left_Nav while the Chat_Panel is collapsed, THE Workspace_Page SHALL reopen the Chat_Panel

### Requirement 14: Chat-Driven Canvas Navigation

**User Story:** As a user, I want the chat to open or navigate to pages on the canvas, so that Olly can guide my investigation visually.

#### Acceptance Criteria

1. WHEN a chat response requires showing a new page, THE Chat_Panel SHALL open the page on the Canvas
2. WHEN a chat response references an already opened page, THE Chat_Panel SHALL navigate the Canvas to that page

### Requirement 15: Canvas Page Display

**User Story:** As a user, I want the canvas to display OpenSearch dashboard pages in scrollable containers, so that I can review multiple pages during an investigation.

#### Acceptance Criteria

1. THE Canvas SHALL display the current working page as the main content
2. THE Canvas SHALL wrap each displayed page in a container
3. THE Canvas SHALL support infinite scrolling for viewing multiple page containers
4. THE Canvas SHALL support displaying existing OpenSearch dashboard pages including Discover, Dashboard, and other standard workspace pages

### Requirement 16: Canvas View List (Timeline)

**User Story:** As a user, I want a timeline view list of opened pages, so that I can quickly switch between, close, or add pages.

#### Acceptance Criteria

1. THE Canvas SHALL display a View_List showing all opened pages as a scrollable timeline
2. WHEN the user clicks a page in the View_List, THE Canvas SHALL switch the main content to display the selected page
3. WHEN the user clicks the close action on a page in the View_List, THE Canvas SHALL remove the page from the View_List and close the page container
4. WHEN the user clicks the plus button at the top of the View_List, THE Canvas SHALL display a popup menu with a fixed list of available OpenSearch dashboard pages
5. WHEN the user selects a page from the popup menu, THE Canvas SHALL add the selected page to the View_List and display the page in a new container on the Canvas

### Requirement 17: Workspace Privacy Default

**User Story:** As a user, I want workspaces created from conversations to be private by default, so that my investigations remain confidential until I choose to share them.

#### Acceptance Criteria

1. WHEN a Workspace is created from a Conversation or prompt, THE Dashboard SHALL set the Workspace state to Private
2. WHILE a Workspace is in Private state, THE Dashboard SHALL exclude the Workspace from the public Workspaces list in the Left_Nav
3. WHEN the user shares a Private Workspace, THE Dashboard SHALL transition the Workspace state to Public
