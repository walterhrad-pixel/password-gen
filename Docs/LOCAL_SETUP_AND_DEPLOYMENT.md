# Local Setup and Deployment

## Prerequisites

Install Node.js with npm, create a Supabase project, and obtain the project URL and anonymous public API key. The application uses Vite and has no custom server process.

## Install dependencies

From the project root:

```bash
npm install
```

The available scripts are:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Produce the production bundle in `dist`. |
| `npm run preview` | Preview the built bundle locally. |

## Configure Supabase

Create a project at [Supabase](https://supabase.com). In Authentication settings, enable the Email provider. The default email/password behavior is compatible with the application.

Run the complete contents of `migration.sql` in the Supabase SQL Editor. The migration creates the `passwords` and `vault_meta` tables, enables Row Level Security, and creates policies limiting access to the authenticated owner.

The migration begins by dropping the `passwords` table. Treat it as a development or controlled migration script rather than an idempotent production migration, because rerunning it can delete stored password rows.

## Configure environment variables

Copy the example file and populate both values:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
```

Vite exposes variables prefixed with `VITE_` to browser code. The anonymous public key is therefore expected to be client-visible. Security depends on Supabase authentication and Row Level Security, not on hiding the anonymous key.

Do not commit `.env.local`. The project’s ignore file is intended to keep local environment files out of version control.

## Run locally

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Test both guest and authenticated paths. For the authenticated path, create a user, generate a password, create a vault passphrase, save an entry, refresh the page, sign in again, unlock the vault, and verify that the entry is restored.

## Build and deploy

Create a production bundle with:

```bash
npm run build
```

The output is a static `dist` directory and can be served by Vercel or another static hosting provider. Configure the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` values in the hosting provider’s build environment.

For Vercel, import the repository, use the detected Vite settings, and confirm that the build output is `dist`. Configure Supabase redirect and site URLs if the project’s authentication settings require them.
