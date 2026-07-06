## ADDED Requirements

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
