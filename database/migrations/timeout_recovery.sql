create extension if not exists pg_cron;

-- Clean up pending resolution events that are older than 24 hours
update email_events
set
  pending_resolution = false,
  resolution_expected = null,
  pending_by = null,
  pending_since = null
where
  pending_resolution = true
  and current_state != 'handled'
  and pending_since < now() - interval '24 hours';

-- Schedule the cleanup job to run every 15 minutes
select cron.schedule(
  'cleanup_stale_pending_resolutions',
  '*/15 * * * *', -- every 15 minutes
  $$
  update email_events
  set
    pending_resolution = false,
    resolution_expected = null,
    pending_by = null,
    pending_since = null
  where
    pending_resolution = true
    and currrent_state != 'handled'
    and pending_since < now() - interval '24 hours';
  $$
);