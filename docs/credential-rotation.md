# Rotate deployment credentials

History cleanup does not revoke credentials. Use a maintenance window and the
actual production database; keep generated values in your secret manager.

1. Back up the database and verify recovery. Inventory all dashboard replicas,
   CLI ingest clients and local password accounts. Stop dashboard replicas and
   pause ingest clients for the cutover.
2. Replace `DASH_SECRET` with a random value of at least 32 bytes on **every**
   replica. This invalidates session cookies and pending OAuth state after restart.
   Missing or short signing keys now prevent startup; there is no default key.
3. Replace `DASH_INGEST_TOKEN` on the server and authorized ingest clients together.
   Old tokens must return 401; missing server configuration returns 503. Check a
   new-token upload using synthetic data before resuming real clients.
4. Reset each affected existing local account from the application environment:

   ```sh
   uv run python reset_password.py admin
   ```

   Use an interactive terminal. The command prompts twice without echo, accepts
   no password argument, requires at least 16 characters, and only updates an
   existing local password account. It does not create users or enable password
   login for SSO-only accounts. Update the stored bootstrap credential too:
   **changing `DASH_ADMIN_PASSWORD` alone does not change an existing account**.
   Password changes alone do not revoke signed cookies; step 2 is required.
5. Restart all replicas with the new credentials. Verify old sessions and old
   passwords fail, new login works, and new ingest succeeds. Review access logs.
   Remove obsolete copies from deployment configuration and client secret stores.

Do not roll back to a compromised credential if cutover fails. Repair the new
configuration while keeping maintenance mode in place. Restored database backups
may contain old password hashes and need the reset repeated before serving traffic.
