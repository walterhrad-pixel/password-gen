# Operations and Maintenance

## Release verification

Before releasing a change, install dependencies and create a production build:

```bash
npm install
npm run build
```

Then exercise the main flows in a browser:

| Area | Verification |
| --- | --- |
| Guest access | Enter as guest, generate each mode, copy a result, and confirm no save flow is available. |
| Registration | Register with a new email and confirm the generator opens after authentication. |
| Login persistence | Refresh after login and confirm the session is restored. |
| Random mode | Toggle character classes, exclude-similar, and must-contain behavior. |
| Other modes | Test pronounceable and passphrase generation at minimum and maximum controls. |
| Vault setup | Create a vault passphrase, acknowledge the no-recovery warning, and save a labeled entry. |
| Vault unlock | Refresh or sign out, unlock with the correct passphrase, and verify the entry decrypts. |
| Wrong passphrase | Enter an incorrect passphrase and confirm the vault remains locked. |
| Deletion | Confirm that one delete requires a second click and that clear-all behaves the same way. |
| Responsive layout | Check a narrow viewport, including approximately 375px wide. |

## Common issues

### Supabase configuration errors

If the application cannot authenticate or load data, verify that `.env.local` contains the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` values and that the development server was restarted after changing them.

### Tables or policies are missing

Run `migration.sql` in the correct Supabase project. Confirm that both tables exist and that Row Level Security is enabled. Do not blindly rerun the migration against a production database because it drops the `passwords` table first.

### Vault entries do not appear

The vault loads only when a user is authenticated and the vault key is unlocked. Confirm that the correct account is active, the vault passphrase is correct, and the browser console does not report a Supabase or decryption error.

### Copy does not work

Clipboard writes depend on browser permissions and secure context rules. Test from HTTPS or the local development origin and inspect browser permission settings if copying fails.

### Build failures

Delete and reinstall dependencies if the lockfile and installed modules are out of sync. Then run `npm run build` again. Review the first compiler error rather than only the final summary.

## Maintenance rules

Keep the encryption format stable unless a migration strategy exists for old rows. Any change to PBKDF2 parameters, salt encoding, AES-GCM payload structure, or stored field names must preserve the ability to decrypt existing entries or explicitly version and migrate them.

Review changes to Supabase policies with the same care as application code. A policy regression can expose or block records independently of the React implementation.

Avoid adding telemetry that captures generated passwords, labels, vault entries, passphrases, or decrypted data. Keep error messages useful without including sensitive values.
