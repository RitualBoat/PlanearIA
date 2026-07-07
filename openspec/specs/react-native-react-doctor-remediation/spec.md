# react-native-react-doctor-remediation Specification

## Purpose
Remediate React Native and maintainability findings from the top React Doctor pass (image imports, animation thread, barrel imports, oversized render units) without changing user-facing behavior.

## Requirements
### Requirement: React Native image imports use Expo Image where supported
Flagged React Native components in this change SHALL use `Image` from `expo-image` when rendering images in the Expo app.

#### Scenario: Flagged component renders an image
- **WHEN** a flagged component renders a user, post, or contact image
- **THEN** the image component is imported from `expo-image`
- **AND** existing source, style, and accessibility behavior remains intact.

### Requirement: Toast animation runs through Reanimated
The Toast component SHALL use Reanimated primitives for its show/hide animation instead of React Native `Animated`.

#### Scenario: Toast appears or disappears
- **WHEN** a toast is shown or hidden
- **THEN** the animation state is driven through Reanimated shared values and animated styles.

### Requirement: Flagged barrel imports are replaced with direct imports
Files flagged for relative barrel imports SHALL import directly from the resolved source modules listed by React Doctor.

#### Scenario: App code imports a flagged symbol
- **WHEN** the symbol is imported from a local module
- **THEN** the import path points to the direct source file rather than the barrel index file.

### Requirement: Flagged JSX and component size are split into focused render units
Flagged JSX nesting and oversized component bodies SHALL be extracted into named components without changing user-facing behavior.

#### Scenario: App provider tree renders
- **WHEN** the app renders its global providers and navigator
- **THEN** the provider composition is split into named render units while preserving the same provider order.

#### Scenario: Alumno import screen renders
- **WHEN** the alumno import screen renders header, actions, preview, errors, and results
- **THEN** those sections are represented by focused components and preserve loading, empty, error, and success states.

#### Scenario: Component accessibility remains intact
- **WHEN** interactive controls are moved into extracted components
- **THEN** existing labels, disabled states, and touch targets remain available to users.
