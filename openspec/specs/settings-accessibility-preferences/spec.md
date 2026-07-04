# settings-accessibility-preferences Specification

## Purpose
Define the local account/accessibility preference contract for theme, font size, and daltonism modes in PlanearIA.

## Requirements
### Requirement: Runtime theme preference
The system SHALL allow the local theme preference to change at runtime and expose the matching theme tokens to consumers.

#### Scenario: User switches to dark mode
- **WHEN** the theme preference is changed from light to dark
- **THEN** consumers receive `theme` as `dark`, `isDark` as true, and dark theme color tokens

#### Scenario: Stored theme is restored
- **WHEN** the app starts with a stored valid theme preference
- **THEN** the provider restores that preference for consumers without requiring a network connection

### Requirement: Runtime font size preference
The system SHALL allow the local font size preference to change at runtime and expose scaled text sizes to consumers.

#### Scenario: User selects a larger font size
- **WHEN** the font size preference is changed to `large`
- **THEN** consumers receive `fontSizeMode` as `large`, the large scale factor, and scaled text values

#### Scenario: Stored font size is restored
- **WHEN** the app starts with a stored valid font size preference
- **THEN** the provider restores that preference for consumers without requiring a network connection

### Requirement: Runtime daltonism preference
The system SHALL allow the local daltonism preference to change at runtime and expose adjusted color tokens to consumers.

#### Scenario: User selects a daltonism mode
- **WHEN** the daltonism preference is changed to `protanopia`
- **THEN** consumers receive `daltonismoMode` as `protanopia` and color tokens adjusted for that mode

#### Scenario: Stored daltonism mode is restored
- **WHEN** the app starts with a stored valid daltonism preference
- **THEN** the provider restores that preference for consumers without requiring a network connection

### Requirement: Local preference controls remain accessible and safe
The system SHALL keep account/accessibility preferences local, reversible, and compatible with accessibility expectations.

#### Scenario: Preferences work offline
- **WHEN** the device is offline or the backend is unavailable
- **THEN** theme, font size, and daltonism preferences can still be read from local storage and changed locally

#### Scenario: No empty or error state blocks preference use
- **WHEN** no stored preference exists or an invalid stored value is found
- **THEN** the providers expose safe defaults and the preference controls remain usable

#### Scenario: Future visible controls preserve accessibility
- **WHEN** a visible control is added or modified for these preferences
- **THEN** it MUST keep an accessible label, use theme tokens for contrast, and provide at least a 44pt touch target
