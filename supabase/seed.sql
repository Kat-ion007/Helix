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
  ('f1010101-1111-1111-1111-111111111111', 'Unable to configure Google OAuth login integration', 'We are getting a redirect URI mismatch error when trying to authenticate users using Google OAuth. Standard email login works fine.', 'open', 'high', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', null, now() - interval '2 hours', now() - interval '2 hours', now() + interval '2 hours'),
  ('f1020202-2222-2222-2222-222222222222', 'API endpoint returning 504 Gateway Timeout on large batch queries', 'When we try to fetch more than 10,000 records using /v1/records, we get a 504 gateway timeout from Cloudflare. Pagination works, but batch fails.', 'open', 'urgent', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', null, now() - interval '1 hour', now() - interval '1 hour', now() + interval '15 minutes'),
  ('f1030303-3333-3333-3333-333333333333', 'Typos and grammatical errors in custom domain docs', 'There are some minor typos under the "Configuring Cloudflare Proxy" section of your setup documentation.', 'open', 'low', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', null, now() - interval '6 hours', now() - interval '6 hours', now() + interval '48 hours'),
  
  -- Assigned Pending Tickets (Sarah Agent)
  ('f2010101-1111-1111-1111-111111111111', 'Stripe invoice double charge investigation', 'I was charged twice on my card ending in 4242 on June 15th for the Pro subscription. I see two identical invoices INV-5060 and INV-5061 in Stripe. Please refund one.', 'pending', 'high', 'c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '4 hours', now() - interval '1 hour', now() + interval '1 hour'),
  ('f2020202-2222-2222-2222-222222222222', 'Requesting help with CSV user export format', 'Is it possible to customize the columns exported in the user CSV data? Currently it exports everything, but we only need name, email and tier.', 'pending', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '8 hours', now() - interval '2 hours', now() + interval '8 hours'),
  ('f2030303-3333-3333-3333-333333333333', 'SSL handshake failed on secondary custom domain', 'We added api.globex.com as a secondary domain, but we are getting SSL_ERROR_BAD_CERT_DOMAIN when trying to curl it. Main domain is fine.', 'pending', 'high', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '5 hours', now() - interval '2 hours', now() - interval '10 minutes'), -- SLA breached!
  ('f3010101-1111-1111-1111-111111111111', 'SMTP configuration testing returns 535 Authentication Failed', 'We are trying to integrate our custom SES SMTP credentials, but when testing connection from the dashboard, it fails with code 535. Verified passwords are correct.', 'pending', 'high', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '3 hours', now() - interval '1 hour', now() + interval '3 hours'),
  ('f3020202-2222-2222-2222-222222222222', 'GDPR Delete Request - Account Deactivation', 'Please delete all personal data associated with our testing account test-user@umbrella.com. Let us know when completed.', 'pending', 'medium', 'c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '10 hours', now() - interval '3 hours', now() + interval '12 hours'),

  -- Escalated Tickets (Marcus Lead)
  ('f4010101-1111-1111-1111-111111111111', 'Enterprise Data Processing Agreement (DPA) amendments', 'Our legal team has requested standard custom amendments to Section 4 of the DPA regarding data retention. Attaching the redline document.', 'escalated', 'medium', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '12 hours', now() - interval '4 hours', now() + interval '6 hours'),
  ('f4020202-2222-2222-2222-222222222222', 'Database replication lag exceeding 10 seconds', 'Our read replicas are lagging behind the write primary database by over 10 seconds, causing stale data reads for our users in Europe. Completely blocking.', 'escalated', 'urgent', 'c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', now() - interval '4 hours', now() - interval '1 hour', now() - interval '30 minutes'), -- SLA breached!

  -- Assigned Tickets (Alice Admin)
  ('f5010101-1111-1111-1111-111111111111', 'Security Alert: Multiple failed login attempts from unrecognized IP', 'We received an automated alert showing 50+ failed login attempts within 2 minutes for user account ops@hooli.com. Need security audit logs.', 'open', 'urgent', 'c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'adadadad-adad-adad-adad-adadadadadad', now() - interval '1 hour', now() - interval '1 hour', now() + interval '1 hour'),
  ('f5020202-2222-2222-2222-222222222222', 'Requesting custom SSO domain configuration', 'We want to enforce Okta SAML SSO for all users on our @acme.com domain. Can you enable the enterprise SSO flag for our organization?', 'pending', 'high', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'adadadad-adad-adad-adad-adadadadadad', now() - interval '6 hours', now() - interval '2 hours', now() + interval '4 hours'),

  -- Resolved Tickets
  ('f6010101-1111-1111-1111-111111111111', 'How to upgrade plan to add new members', 'Where in the dashboard can I add 3 more seats to our Pro subscription? The button is disabled.', 'resolved', 'low', 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', now() - interval '2 days', now() - interval '1 day', now() - interval '1 day'),
  ('f6020202-2222-2222-2222-222222222222', 'Wrong email entered during sign up', 'I typoed our primary billing email as billling@initech.com (three l''s). Please change it to billing@initech.com.', 'resolved', 'medium', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'adadadad-adad-adad-adad-adadadadadad', now() - interval '3 days', now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;

-- ── 5. Create Message Threads ───────────────────────────────────────────────
insert into public.message (id, ticket_id, sender_type, sender_id, content, is_internal, created_at)
values
  -- Thread for Google OAuth issue (f1010101)
  ('e1010101-1111-1111-1111-111111111111', 'f1010101-1111-1111-1111-111111111111', 'customer', null, 'Hi support team, I am trying to enable Google OAuth for our team. However, after going through the Google consent screen, we get redirected back to a page saying "Redirect URI mismatch" with error code 400. Standard email/password logins work, but we need OAuth. Please help.', false, now() - interval '2 hours'),
  
  -- Thread for Stripe invoice issue (f2010101)
  ('e2010101-1111-1111-1111-111111111111', 'f2010101-1111-1111-1111-111111111111', 'customer', null, 'Hello, our credit card ending in 4242 was charged twice for the Enterprise subscription this month. We got two receipts, invoice INV-5060 and INV-5061, both for $49.00. We only have one workspace. Could you please check and refund the duplicate charge?', false, now() - interval '4 hours'),
  ('e2010202-2222-2222-2222-222222222222', 'f2010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi Gavin, thank you for reaching out. I am taking a look at our Stripe dashboard now to check on these transactions. I will verify if both charges have been finalized or if one is a temporary auth hold.', false, now() - interval '3 hours'),
  ('e2010303-3333-3333-3333-333333333333', 'f2010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Note to self: Stripe dashboard does show two pending charges. Looks like a webhook retry duplicate. Need to verify database did not create two accounts.', true, now() - interval '2 hours'),
  ('e2010404-4444-4444-4444-444444444444', 'f2010101-1111-1111-1111-111111111111', 'customer', null, 'Thank you Sarah, standing by.', false, now() - interval '1 hour'),

  -- Thread for SMTP issue (f3010101)
  ('e3010101-1111-1111-1111-111111111111', 'f3010101-1111-1111-1111-111111111111', 'customer', null, 'Hello, we are attempting to set up custom SMTP integration for our emails. We are using AWS SES credentials. However, when we hit "Test Connection", we get "535 Authentication Credentials Invalid". We double checked the credentials and they work from a separate script. Is there anything special needed on your end?', false, now() - interval '3 hours'),
  ('e3010202-2222-2222-2222-222222222222', 'f3010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi Albert, I am looking into our SMTP logs for Umbrella Corp. I see the authentication attempt was rejected by the mail server. Let me double check if there are port/TLS mismatch requirements for SES.', false, now() - interval '1 hour'),

  -- Thread for DPA amendments (f4010101)
  ('e4010101-1111-1111-1111-111111111111', 'f4010101-1111-1111-1111-111111111111', 'customer', null, 'Hi, we are standardizing our compliance documents and need a signed copy of the Data Processing Agreement (DPA) with our custom retention schedule added as an annex. Let us know who to send the document to.', false, now() - interval '12 hours'),
  ('e4010202-2222-2222-2222-222222222222', 'f4010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi John, custom DPAs require legal approval from our executive team. I am escalating this ticket to Marcus, our Lead, who coordinates document execution.', false, now() - interval '4 hours'),
  ('e4010303-3333-3333-3333-333333333333', 'f4010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Note to self: Escalating to Marcus for legal review. The customer is Acme Corp (John Doe), enterprise tier.', true, now() - interval '4 hours'),

  -- Thread for Database replication lag (f4020202)
  ('e4020101-1111-1111-1111-111111111111', 'f4020202-2222-2222-2222-222222222222', 'customer', null, 'Urgent! Our European users are reporting that updates take more than 10 seconds to reflect. We verified our database primary is responding fine, but the read replica in eu-west-1 seems to have significant replication lag. We need immediate engineering review.', false, now() - interval '4 hours'),
  ('e4020202-2222-2222-2222-222222222222', 'f4020202-2222-2222-2222-222222222222', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Internal Note: High replication lag confirmed in AWS CloudWatch. Escalated to Marcus Lead for server operations.', true, now() - interval '1 hour'),

  -- Thread for resolved seat limit issue (f6010101)
  ('e6010101-1111-1111-1111-111111111111', 'f6010101-1111-1111-1111-111111111111', 'customer', null, 'Hello, we want to add 3 more members to our workspace, but the "Add User" button is greyed out. We are on the Pro plan.', false, now() - interval '2 days'),
  ('e6010202-2222-2222-2222-222222222222', 'f6010101-1111-1111-1111-111111111111', 'agent', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Hi Jane, the seat count is controlled by your subscription tier. You have hit the default limit of 5 seats. I have unlocked 3 additional seats in your plan. You can now add the new members from your dashboard settings. Let me know if you run into any issues.', false, now() - interval '1 day'),
  ('e6010303-3333-3333-3333-333333333333', 'f6010101-1111-1111-1111-111111111111', 'customer', null, 'Got it! Added them successfully. Thank you for the quick help!', false, now() - interval '1 day')
on conflict (id) do nothing;

-- ── 6. Create Escalation Records ─────────────────────────────────────────────
insert into public.escalation (id, ticket_id, from_user, to_user, reason, status, created_at)
values
  ('e1010101-1111-1111-1111-111111111111', 'f4010101-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Requires legal department document execution and signature approval.', 'open', now() - interval '4 hours'),
  ('e2020202-2222-2222-2222-222222222222', 'f4020202-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Database replication lag eu-west-1 read replica exceeds 10s SLA.', 'open', now() - interval '1 hour')
on conflict (id) do nothing;

-- ── 7. Create Ticket Activity Logs ───────────────────────────────────────────
insert into public.ticket_activity (id, ticket_id, actor_id, action, previous_value, new_value, created_at)
values
  ('a1010101-1111-1111-1111-111111111111', 'f6010101-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "resolved"}', now() - interval '1 day'),
  ('a2010101-1111-1111-1111-111111111111', 'f4010101-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "escalated"}', now() - interval '4 hours'),
  ('a2020202-2222-2222-2222-222222222222', 'f4010101-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'assignment_change', '{"assigned_to": null}', '{"assigned_to": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"}', now() - interval '4 hours'),
  ('a3010101-1111-1111-1111-111111111111', 'f4020202-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'status_change', '{"status": "open"}', '{"status": "escalated"}', now() - interval '1 hour'),
  ('a3020202-2222-2222-2222-222222222222', 'f4020202-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'assignment_change', '{"assigned_to": null}', '{"assigned_to": "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2"}', now() - interval '1 hour')
on conflict (id) do nothing;
