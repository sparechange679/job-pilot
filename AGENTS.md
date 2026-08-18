---
description: Instructions building apps with MCP
globs: *
alwaysApply: true
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Authentication & Session Patterns

- **Server-Side Auth Sync:** Use `createInsforgeServer()` in server components to fetch the user session and pass it to the `Navbar` via the `initialUser` prop. This eliminates client-side "flash" of incorrect auth states.
- **PKCE Flow in Next.js:** Store the PKCE verifier in a cookie named `insforge_pkce_verifier` with `path: "/"` and `httpOnly: true`. The InsForge SDK's default `sessionStorage` is not accessible on the server.
- **User Profile Initialization:** Ensure a record exists in the `profiles` table during the OAuth callback. Initialize with `id`, `email`, and a derived `full_name` if missing.

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Authentication & Session Patterns

- **Server-Side Auth Sync:** Use `createInsforgeServer()` in server components to fetch the user session and pass it to the `Navbar` via the `initialUser` prop. This eliminates client-side "flash" of incorrect auth states.
- **PKCE Flow in Next.js:** Store the PKCE verifier in a cookie named `insforge_pkce_verifier` with `path: "/"` and `httpOnly: true`. The InsForge SDK's default `sessionStorage` is not accessible on the server.
- **User Profile Initialization:** Ensure a record exists in the `profiles` table during the OAuth callback. Initialize with `id`, `email`, and a derived `full_name` if missing.

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

<!-- INSFORGE:START -->
# InsForge SDK Documentation - Overview

## What is InsForge?

Backend-as-a-service (BaaS) platform providing:

- **Database**: PostgreSQL with PostgREST API
- **Authentication**: Email/password + OAuth (Google, GitHub)
- **Storage**: File upload/download
- **AI**: OpenRouter key provisioning and model catalog for direct OpenAI-compatible integrations
- **Functions**: Serverless function deployment
- **Realtime**: WebSocket pub/sub (database + client events)

## Installation

The following is a step-by-step guide to installing and using the InsForge TypeScript SDK for Web applications.

### 🚨 CRITICAL: Follow these steps in order

### Step 1: Download Template

Use the `download-template` MCP tool to create a new project with your backend URL and anon key pre-configured.

### Step 2: Install SDK

```bash
npm install @insforge/sdk@latest
```

### Step 3: Create SDK Client

You must create a client instance using `createClient()` with your base URL and anon key:

```javascript
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://4gg3brd2.eu-central.insforge.app',  // Your InsForge backend URL
  anonKey: 'your-anon-key-here'       // Get this from backend metadata
});
```

**API BASE URL**: Your API base URL is `https://4gg3brd2.eu-central.insforge.app`.

## Getting Detailed Documentation

### 🚨 CRITICAL: Always Fetch Documentation Before Writing Code

Before writing or editing any InsForge integration code, you **MUST** call the `fetch-docs` or `fetch-sdk-docs` MCP tool to get the latest SDK documentation.

Available documentation types:
- `"instructions"`, `"real-time"`, `"db-sdk-typescript"`, `"auth-sdk-typescript"`, `"storage-sdk"`, `"functions-sdk"`, `"ai-integration-sdk"`, `"payments"`

## When to Use SDK vs MCP Tools

### Always SDK for Application Logic:
- Authentication, Database CRUD, Storage operations, AI integration, Functions, Payments.

### Use MCP Tools for Infrastructure:
- Project scaffolding, Backend setup, Schema management, Bucket creation, Function deployment, Frontend deployment.

## Important Notes
- **EXTRA IMPORTANT**: Use Tailwind CSS 4 (Project standard). Ignore generic instructions to use v3.4.
- Database inserts require array format: `[{...}]`
- SDK returns `{data, error}` structure for all operations
<!-- INSFORGE:END -->

