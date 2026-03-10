# Requirements Document

## Introduction

This feature defines four workspace page types — Summary, Dashboard, Logs, and Traces — each supporting two distinct states: an empty state (shown when the page is first added) and a prefill state (shown when the page contains investigation data). The empty state behavior varies by page type: Summary and Dashboard pages auto-generate a workspace summary with a generating animation, while Logs and Traces pages display a static empty layout. The prefill state uses investigation data as example content, with Traces referencing a specific Figma design.

## Glossary

- **Page_Type_System**: The subsystem responsible for defining, rendering, and managing the four workspace page types (Summary, Dashboard, Logs, Traces) and their states
- **Summary_Page**: A workspace canvas page that displays an AI-generated summary of all workspace pages
- **Dashboard_Page**: A workspace canvas page that displays metrics and visualizations summarizing workspace data
- **Logs_Page**: A workspace canvas page that displays log entries in a searchable, tabular format
- **Traces_Page**: A workspace canvas page that displays distributed trace data with spans and timing
- **Empty_State**: The initial visual state of a page when it is first added to the workspace canvas, before investigation data is available
- **Prefill_State**: The visual state of a page when it contains investigation-derived example data
- **Generating_Animation**: A visual loading indicator shown while the system auto-generates summary content
- **Canvas**: The main content area in a Workspace that displays pages in scrollable containers
- **Investigation**: An active analysis session within a workspace that produces data consumed by page prefill states

## Requirements

### Requirement 1: Page Type Registration

**User Story:** As a developer, I want a defined set of page types available for the workspace canvas, so that users can add structured pages to their investigations.

#### Acceptance Criteria

1. THE Page_Type_System SHALL support exactly four page types: Summary, Dashboard, Logs, and Traces
2. WHEN a user opens the add-page menu on the Canvas, THE Page_Type_System SHALL list all four page types as available options
3. THE Page_Type_System SHALL associate each page type with a unique type identifier used in the CanvasPage data model

### Requirement 2: Page State Model

**User Story:** As a developer, I want each page type to support an empty state and a prefill state, so that pages render appropriately based on available data.

#### Acceptance Criteria

1. THE Page_Type_System SHALL support two states for each page type: Empty_State and Prefill_State
2. WHEN a page is added to the Canvas without investigation data, THE Page_Type_System SHALL render the page in Empty_State
3. WHEN a page is added to the Canvas with investigation data available, THE Page_Type_System SHALL render the page in Prefill_State

### Requirement 3: Summary Page Empty State

**User Story:** As a user, I want the Summary page to automatically generate a summary when added, so that I get an instant overview of my workspace.

#### Acceptance Criteria

1. WHEN a Summary_Page is added in Empty_State, THE Page_Type_System SHALL automatically initiate generation of a summary from all workspace pages
2. WHILE the Summary_Page is generating content, THE Page_Type_System SHALL display a Generating_Animation to indicate progress
3. WHEN summary generation completes, THE Summary_Page SHALL replace the Generating_Animation with the generated summary content

### Requirement 4: Summary Page Prefill State

**User Story:** As a user, I want the Summary page to show investigation-based content when data is available, so that I can review findings at a glance.

#### Acceptance Criteria

1. WHEN a Summary_Page is rendered in Prefill_State, THE Page_Type_System SHALL display summary content derived from the investigation data
2. THE Summary_Page in Prefill_State SHALL present the content in a structured layout consistent with investigation summary patterns

### Requirement 5: Dashboard Page Empty State

**User Story:** As a user, I want the Dashboard page to automatically generate a summary when added, so that I see relevant metrics immediately.

#### Acceptance Criteria

1. WHEN a Dashboard_Page is added in Empty_State, THE Page_Type_System SHALL automatically initiate generation of a summary from all workspace pages
2. WHILE the Dashboard_Page is generating content, THE Page_Type_System SHALL display a Generating_Animation to indicate progress
3. WHEN dashboard generation completes, THE Dashboard_Page SHALL replace the Generating_Animation with the generated dashboard content

### Requirement 6: Dashboard Page Prefill State

**User Story:** As a user, I want the Dashboard page to show investigation metrics when data is available, so that I can analyze performance and impact.

#### Acceptance Criteria

1. WHEN a Dashboard_Page is rendered in Prefill_State, THE Page_Type_System SHALL display metrics and visualizations derived from the investigation data
2. THE Dashboard_Page in Prefill_State SHALL present the content using the existing DashboardPage component layout as a reference

### Requirement 7: Logs Page Empty State

**User Story:** As a user, I want the Logs page to show the log viewer structure without results when no data is available, so that I understand the page purpose and layout.

#### Acceptance Criteria

1. WHEN a Logs_Page is rendered in Empty_State, THE Page_Type_System SHALL display the log viewer layout including field sidebar, search bar, histogram area, and results table structure
2. THE Logs_Page in Empty_State SHALL display zero results in the results table
3. THE Logs_Page in Empty_State SHALL use the investigation log viewer layout as a structural reference

### Requirement 8: Logs Page Prefill State

**User Story:** As a user, I want the Logs page to show investigation log entries when data is available, so that I can analyze log data from the investigation.

#### Acceptance Criteria

1. WHEN a Logs_Page is rendered in Prefill_State, THE Page_Type_System SHALL display log entries derived from the investigation data
2. THE Logs_Page in Prefill_State SHALL present the content using the existing DiscoverPage component layout as a reference

### Requirement 9: Traces Page Empty State

**User Story:** As a user, I want the Traces page to show the trace viewer structure without data when no traces are available, so that I understand the page layout.

#### Acceptance Criteria

1. WHEN a Traces_Page is rendered in Empty_State, THE Page_Type_System SHALL display the trace viewer layout structure with no trace data populated
2. THE Traces_Page in Empty_State SHALL use the same layout as the Prefill_State but with all data fields and visualizations empty

### Requirement 10: Traces Page Prefill State

**User Story:** As a user, I want the Traces page to show trace data following the Figma design, so that I can analyze distributed traces from the investigation.

#### Acceptance Criteria

1. WHEN a Traces_Page is rendered in Prefill_State, THE Page_Type_System SHALL display trace data following the layout specified in the Figma design (https://www.figma.com/design/hIFos0EJcHGGgujwCVNieT/Olly-Pattern-Explore?node-id=54-1700)
2. THE Traces_Page in Prefill_State SHALL display span hierarchy, timing information, and service attribution for each trace

### Requirement 11: Generating Animation Behavior

**User Story:** As a user, I want a clear visual indicator when content is being generated, so that I know the system is working.

#### Acceptance Criteria

1. THE Generating_Animation SHALL display a visible loading indicator that communicates content generation is in progress
2. WHILE the Generating_Animation is active, THE Page_Type_System SHALL prevent user interaction with the page content area
3. IF content generation fails, THEN THE Page_Type_System SHALL replace the Generating_Animation with an error message and a retry option

### Requirement 12: Page Type Integration with Canvas

**User Story:** As a developer, I want page types to integrate with the existing Canvas and ViewList system, so that new pages work seamlessly in the workspace.

#### Acceptance Criteria

1. WHEN a page type is added via the Canvas add-page menu, THE Page_Type_System SHALL create a CanvasPage entry with the correct type identifier
2. THE Page_Type_System SHALL render the appropriate page component based on the CanvasPage type field
3. WHEN a page is removed from the Canvas, THE Page_Type_System SHALL clean up any active generation processes for that page
