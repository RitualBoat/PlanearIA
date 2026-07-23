# Third-party notices

The published package has one development-only dependency:

| Package | Version | License | Runtime |
| --- | --- | --- | --- |
| `ajv` | `8.20.0` | MIT | No; tests and schema verification only |

Generated repositories pin `@fission-ai/openspec` `1.6.0`, licensed under MIT. It is installed in the
consumer repository as a development dependency and is the exclusive owner of generated OPSX workflows.

No third-party source is vendored in the npm package. The release gate verifies this inventory against
the lockfile and stops on an unknown or incompatible license.
