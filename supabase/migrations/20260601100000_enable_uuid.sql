-- Migration: 20260601100000_enable_uuid
-- Purpose: Enable uuid-ossp extension for legacy compatibility
-- Affected tables: none

-- ── Up ────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Rollback (manual) ─────────────────────────────────────────────────────────
-- drop extension if exists "uuid-ossp";
