## ADDED Requirements

### Requirement: Frontend public environment variables are not treated as secrets
Frontend code SHALL NOT depend on `EXPO_PUBLIC_*` variables as privileged secrets.

#### Scenario: Authenticated user calls the backend
- **WHEN** a logged-in teacher performs a normal authenticated API or sync request
- **THEN** the client authorizes the request with JWT/session state
- **AND** the request does not require a public API secret as a privileged credential.

#### Scenario: Public env variable is bundled into the client
- **WHEN** an Expo public environment variable is present in frontend code
- **THEN** its name and usage communicate that it is public configuration
- **AND** no code treats it as a secret, password, private key, or privileged API credential.

### Requirement: API-secret compatibility is server-side or explicitly non-secret
Any API secret used for privileged server-side or operational paths SHALL remain outside frontend bundles.

#### Scenario: Backend route needs privileged server-side authority
- **WHEN** a route requires a privileged API secret
- **THEN** the secret is read from backend/server environment only
- **AND** the frontend cannot provide that authority through `EXPO_PUBLIC_API_SECRET`.

#### Scenario: Demo compatibility header remains temporarily
- **WHEN** a compatibility header must remain for a transition
- **THEN** it is documented as non-secret compatibility
- **AND** JWT remains sufficient for authenticated user operations.

### Requirement: Stale browser artifacts do not preserve leaked env names
Generated browser artifacts SHALL be removed or rebuilt after public env cleanup.

#### Scenario: React Doctor scans security findings
- **WHEN** the security category is scanned after cleanup
- **THEN** `artifact-env-leak` no longer appears for stale `dist/**` bundles
- **AND** any previously exposed secret value is documented as rotated or pending rotation.
