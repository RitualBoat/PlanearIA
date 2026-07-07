# safe-html-export-sinks Specification

## Purpose
Ensure export and print flows escape or sanitize dynamic data before it reaches HTML sinks, without breaking offline-first local export.

## Requirements
### Requirement: Dynamic export values are escaped before HTML sinks
Export and print flows SHALL escape dynamic text values before inserting them into generated HTML.

#### Scenario: Alumno export contains HTML-like text
- **WHEN** an alumno, grupo, teacher, or report value contains `<script>`, HTML attributes, or special characters
- **THEN** the generated export renders the value as text
- **AND** the injected text does not execute as markup or script.

#### Scenario: Export service writes HTML
- **WHEN** an export service calls a browser, print, or HTML sink
- **THEN** dynamic values have passed through the shared escaping or sanitization helper near that sink.

### Requirement: HTML export escaping is covered by tests
Export services SHALL include focused tests for dangerous dynamic values.

#### Scenario: Test fixture includes dangerous characters
- **WHEN** export tests run with values containing `<`, `>`, `&`, quotes, and script-like payloads
- **THEN** the output contains escaped or sanitized text
- **AND** the test proves the original payload is not emitted as executable markup.

### Requirement: Safe export changes preserve offline-first behavior
Export safety changes SHALL NOT create a remote dependency for local exports.

#### Scenario: Teacher exports while offline
- **WHEN** the app has local export data but no network connection
- **THEN** export generation still works locally
- **AND** escaping/sanitization does not require a backend call.
