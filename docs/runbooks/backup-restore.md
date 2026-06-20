# Backup and restore runbook

- Enable managed PostgreSQL point-in-time recovery in production.
- Take a manual snapshot before destructive migrations.
- Test restores at least quarterly into an isolated environment.
- Validate restored tenant counts, patient counts, and audit event continuity.
- Document RPO and RTO results after every restore exercise.
