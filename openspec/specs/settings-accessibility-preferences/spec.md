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

### Requirement: Settings screen reflects theme, font size, and daltonism at runtime
The Configuration screen (CuentaScreen) SHALL render using the active theme, font size, and daltonism preferences at runtime, so that changing a preference visibly repaints the screen rather than only updating a status label.

#### Scenario: Dark mode repaints the whole screen
- **WHEN** the teacher enables "Modo oscuro" from the Configuration screen
- **THEN** the screen backgrounds, cards, and text repaint using dark theme tokens (not only the "Actualmente activado" subtitle)

#### Scenario: Font size scales the screen text
- **WHEN** the teacher selects "Grande" as font size
- **THEN** the text on the Configuration screen is rendered at the scaled size derived from the large scale factor

#### Scenario: Daltonism transforms state colors on the screen
- **WHEN** the teacher selects a daltonism mode (protanopia, deuteranopia, or tritanopia)
- **THEN** the state/accent color tokens shown on the Configuration screen are visibly adjusted for that mode

#### Scenario: Preferences apply offline
- **WHEN** the device is offline or the backend is unavailable
- **THEN** the Configuration screen still renders with the locally stored theme, font size, and daltonism preferences without requiring a network connection

#### Scenario: Safe default while stored preferences are still loading
- **WHEN** the screen mounts before any stored preference has been read
- **THEN** it renders with safe defaults (light theme, medium font, no daltonism) and updates once stored values load, without a blocking loading or error state

#### Scenario: Visible controls preserve accessibility
- **WHEN** a preference control is rendered on the Configuration screen
- **THEN** it keeps an accessible label, derives contrast from theme tokens, and provides at least a 44pt touch target

### Requirement: Local accessibility toggles persist with safe defaults
The system SHALL persist the "Contraste alto", "Lectura de voz", and "Reducir movimiento" preferences locally with a default of off, and SHALL either apply a real effect or honestly present the control as not-yet-available, never as a decorative switch that implies an effect it does not have.

#### Scenario: Defaults are off on first run
- **WHEN** the teacher opens the Configuration screen with no stored value for these preferences
- **THEN** "Contraste alto", "Lectura de voz", and "Reducir movimiento" are shown as off

#### Scenario: Toggle persists across restarts
- **WHEN** the teacher enables one of these toggles and later reopens the app
- **THEN** the toggle is restored to its enabled state from local storage without requiring a network connection

#### Scenario: Reduce motion disables screen entrance animation
- **WHEN** "Reducir movimiento" is enabled
- **THEN** the Configuration screen renders its top pill statically, skipping the scroll/entrance animation

#### Scenario: High contrast strengthens contrast via tokens
- **WHEN** "Contraste alto" is enabled
- **THEN** the Configuration screen reinforces secondary text and border contrast using theme tokens (no invented colors outside the token palette)

#### Scenario: Voice reading is presented honestly as upcoming
- **WHEN** "Lectura de voz" is toggled
- **THEN** the preference is persisted and the control communicates it is "Proximamente", without claiming or simulating text-to-speech behavior

#### Scenario: Invalid or missing stored value falls back to off
- **WHEN** no stored value exists or an invalid value is found for these preferences
- **THEN** the provider exposes the safe default (off) and the controls remain usable

