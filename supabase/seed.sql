-- Development Seed Data
-- Designed for local testing. Run via `supabase db reset`.

-- ── 1. Create Auth Users (Local Dev Only) ──────────────────────────────────
-- Hashed password is 'password123' for all accounts
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'agent@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'lead@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('adadadad-adad-adad-adad-adadadadadad', 'admin@helix.com', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- ── 2. Create Public User Profiles ──────────────────────────────────────────
insert into public."user" (id, name, email, role)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Sarah Agent', 'agent@helix.com', 'agent'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Marcus Lead', 'lead@helix.com', 'lead'),
  ('adadadad-adad-adad-adad-adadadadadad', 'Alice Admin', 'admin@helix.com', 'admin')
on conflict (id) do nothing;

-- ── 3. Create Customers ─────────────────────────────────────────────────────
insert into public.customer (id, name, email, metadata)
values
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Acme Corp (John Doe)', 'john@acme.com', '{"tier": "enterprise", "country": "US"}'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Globex Corp (Jane Smith)', 'jane@globex.com', '{"tier": "pro", "country": "CA"}'),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Initech (Peter Gibbons)', 'peter@initech.com', '{"tier": "free", "country": "US"}'),
  ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'Umbrella Corp (Albert)', 'albert@umbrella.com', '{"tier": "enterprise", "country": "DE"}'),
  ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'Hooli (Gavin Belson)', 'gavin@hooli.com', '{"tier": "pro", "country": "US"}')
on conflict (id) do nothing;

-- ── 4. Create Tickets ───────────────────────────────────────────────────────
insert into public.ticket (id, title, description, status, priority, customer_id, assigned_to, created_at, updated_at, sla_due)
values
  -- Unassigned Open Tickets
  ('f1010101-1101-1101-1101-110101010101', 'Unable to login to portal', 'Getting 500 error when clicking sign-in.', 'open', 'urgent', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', null, now() - interval '1 hour', now() - interval '1 hour', now() + interval '15 minutes'),
  ('f1020202-1102-1102-1102-110202020202', 'API webhook failures', 'Webhooks failing with timeout to our endpoints.', 'open', 'high', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', null, now() - interval '2 hours', now() - interval '2 hours', now() + interval '2 hours'),
  ('f1030303-1103-1103-1103-110303030303', 'Request to export customer data', 'Need full CSV dump of user records for audit.', 'open', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', null, now() - interval '3 hours', now() - interval '3 hours', now() + interval '8 hours'),
  ('f1040404-1104-1104-1104-110404040404', 'Broken link in docs footer', 'Typo in link to API reference.', 'open', 'low', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', null, now() - interval '5 hours', now() - interval '5 hours', now() + interval '48 hours'),
  
  -- Assigned Pending Tickets (Sarah Agent)
  ('f2010101-2201-2201-2201-220101010101', 'Billing billing discrepancy', 'Charged twice for subscription this month.', 'pending', 'high', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '4 hours', now() - interval '1 hour', now() + interval '1 hour'),
  ('f2020202-2202-2202-2202-220202020202', 'Custom domain verification failed', 'CNAME is set up but dashboard still says pending.', 'pending', 'medium', 'c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '1 day', now() - interval '2 hours', now() + interval '4 hours'),
  ('f2030303-2203-2203-2203-220303030303', 'SMTP integration failure', 'SMTP test email is not sending, error code 535.', 'pending', 'high', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '2 hours', now() - interval '30 minutes', now() - interval '10 minutes'), -- SLA Breached!
  
  -- Escalated Tickets
  ('f3010101-3301-3301-3301-330101010101', 'Database migration timeout', 'Customer DB upgrade timed out at 99%.', 'escalated', 'urgent', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '3 hours', now() - interval '10 minutes', now() - interval '2 hours'), -- SLA Breached!
  ('f3020202-3302-3302-3302-330202020202', 'Enterprise SLA inquiry', 'Clarification on availability guarantees.', 'escalated', 'medium', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '2 days', now() - interval '1 day', now() + interval '12 hours'),

  -- Resolved Tickets
  ('f4010101-4401-4401-4401-440101010101', 'Reset password link not received', 'Requested reset but got no email.', 'resolved', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '2 days', now() - interval '1 day', now() - interval '1 day'),
  ('f4020202-4402-4402-4402-440202020202', 'Upgrade plan inquiry', 'How to add 5 more seats to our plan.', 'resolved', 'low', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '3 days', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;

-- ── 5. Create Message Threads ───────────────────────────────────────────────
insert into public.message (id, ticket_id, sender_type, sender_id, content, is_internal, created_at)
values
  -- Thread for t101 (Login issue)
  ('e1010101-1101-1101-1101-110101010101', 'f1010101-1101-1101-1101-110101010101', 'customer', null, 'Hi, I cannot sign into the client portal. It keeps throwing a white screen and a 500 error. Please help.', false, now() - interval '1 hour'),

  -- Thread for t201 (Billing discrepancy)
  ('e2010101-2201-2201-2201-220101010101', 'f2010101-2201-2201-2201-220101010101', 'customer', null, 'Hello, I was charged twice for the Enterprise subscription this month. Invoice numbers are INV-4050 and INV-4051. I need one refunded.', false, now() - interval '4 hours'),
  ('e2010202-2201-2201-2201-220102020202', 'f2010101-2201-2201-2201-220101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi John, I am reviewing our stripe logs now to see why the double charge happened. I will get back to you in a few minutes.', false, now() - interval '3 hours'),
  ('e2010303-2201-2201-2201-220103030303', 'f2010101-2201-2201-2201-220101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Note to self: Stripe dashboard does show two pending charges. Looks like a webhook retry duplicate. Need to verify database did not create two accounts.', true, now() - interval '2 hours'),
  ('e2010404-2201-2201-2201-220104040404', 'f2010101-2201-2201-2201-220101010101', 'customer', null, 'Thank you Sarah, standing by.', false, now() - interval '1 hour'),

  -- Thread for t301 (Escalated Database upgrade issue)
  ('e3010101-3301-3301-3301-330101010101', 'f3010101-3301-3301-3301-330101010101', 'customer', null, 'Our database migration is stuck at 99%. It has been running for 45 minutes without progress. The app is completely offline.', false, now() - interval '3 hours'),
  ('e3010202-3301-3301-3301-330102020202', 'f3010101-3301-3301-3301-330101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'This looks like a database deadlock during the indexing phase. Escalating to engineering lead.', true, now() - interval '2 hours'),

  -- Thread for t401 (Resolved reset link issue)
  ('e4010101-4401-4401-4401-440101010101', 'f4010101-4401-4401-4401-440101010101', 'customer', null, 'I did not receive the reset link. I checked spam.', false, now() - interval '2 days'),
  ('e4010202-4401-4401-4401-440102020202', 'f4010101-4401-4401-4401-440101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi Peter, I checked our mail logs and it was blocked by Initechs inbound filter. I have manually whitelisted our domain. Please try triggering it now.', false, now() - interval '1 day'),
  ('e4010303-4401-4401-4401-440103030303', 'f4010101-4401-4401-4401-440101010101', 'customer', null, 'Got it! Password updated, thank you!', false, now() - interval '1 day'),
  ('e4010404-4401-4401-4401-440104040404', 'f4010101-4401-4401-4401-440101010101', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Glad to hear! Marking this ticket as resolved. Have a great day.', false, now() - interval '1 day')
on conflict (id) do nothing;

-- ── 6. Create Escalation Records ─────────────────────────────────────────────
insert into public.escalation (id, ticket_id, from_user, to_user, reason, status, created_at)
values
  ('e1010101-1101-1101-1101-110101010101', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Database upgrade lock deadlock during migration.', 'open', now() - interval '2 hours')
on conflict (id) do nothing;

-- ── 7. Create Ticket Activity Logs ───────────────────────────────────────────
insert into public.ticket_activity (id, ticket_id, actor_id, action, previous_value, new_value, created_at)
values
  ('a1010101-1101-1101-1101-110101010101', 'f4010101-4401-4401-4401-440101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "resolved"}', now() - interval '1 day'),
  ('a2010101-2201-2201-2201-220101010101', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "escalated"}', now() - interval '2 hours'),
  ('a2020202-2202-2202-2202-220202020202', 'f3010101-3301-3301-3301-330101010101', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'assignment_change', '{"assigned_to": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"}', '{"assigned_to": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"}', now() - interval '2 hours')
on conflict (id) do nothing;
