# Security baseline

- Treat all patient data as PHI and store it only after vendor BAAs are complete.
- Enforce tenant-scoped authorization on every API route before production launch.
- Require MFA for administrators and production infrastructure access.
- Store secrets in managed secret stores; never commit `.env` files.
- Log audit events for patient, care plan, user, and billing data access.
- Encrypt data in transit with TLS and at rest with managed database encryption.
- Run dependency, SAST, and container scans in CI before production release.
