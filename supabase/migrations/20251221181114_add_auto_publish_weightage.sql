CREATE OR REPLACE FUNCTION public.auto_publish_runner()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  settings RECORD;
  state RECORD;
  picked RECORD;
  last_store TEXT;
  base_time TIMESTAMP;
BEGIN
  /* ---------------------------------------------------------
     Load settings and state
  --------------------------------------------------------- */
  SELECT * INTO settings
  FROM auto_publish_settings
  WHERE id = 1;

  SELECT * INTO state
  FROM auto_publish_state
  WHERE id = 1;

  /* ---------------------------------------------------------
     Guardrails
  --------------------------------------------------------- */
  IF settings.enabled IS FALSE THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'Auto-publish disabled.');
    RETURN;
  END IF;

  IF state.next_run IS NOT NULL AND state.next_run > NOW() THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'Too early. Next run: ' || state.next_run);
    RETURN;
  END IF;

  /* ---------------------------------------------------------
     Find last published store (for diversity)
  --------------------------------------------------------- */
  SELECT store_name
  INTO last_store
  FROM deals
  WHERE status = 'Published'
  ORDER BY published_at DESC
  LIMIT 1;

  /* ---------------------------------------------------------
     Pick ONE eligible Draft (store-aware, weighted)
  --------------------------------------------------------- */
  SELECT *
  INTO picked
  FROM deals
  WHERE status = 'Draft'
    AND exclude_from_auto = FALSE
    AND superseded_by_id IS NULL
    AND (
      store_name <> last_store
      OR NOT EXISTS (
        SELECT 1
        FROM deals d2
        WHERE d2.status = 'Draft'
          AND d2.exclude_from_auto = FALSE
          AND d2.superseded_by_id IS NULL
          AND d2.store_name <> last_store
      )
    )
  ORDER BY
    (
      random() *
      (
        100
        + CASE WHEN is_affiliate THEN 20 ELSE 0 END
        + affiliate_priority * 10
      )
    ) DESC,
    created_at ASC
  LIMIT 1;

  IF picked.id IS NULL THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'No eligible draft deals found.');
    RETURN;
  END IF;

  /* ---------------------------------------------------------
     Publish selected deal
  --------------------------------------------------------- */
  UPDATE deals
  SET
    status = 'Published',
    published_at = NOW(),
    feed_at = NOW()
  WHERE id = picked.id;

  /* ---------------------------------------------------------
     Update scheduler state
  --------------------------------------------------------- */
  base_time := date_trunc('minute', NOW());

  UPDATE auto_publish_state
  SET
    last_run = NOW(),
    last_count = 1,
    next_run = base_time + (settings.interval_minutes || ' minutes')::interval,
    updated_at = NOW()
  WHERE id = 1;

  /* ---------------------------------------------------------
     Log success
  --------------------------------------------------------- */
  INSERT INTO auto_publish_logs(action, message)
  VALUES (
    'runner',
    'Published deal ID ' || picked.id ||
    ' (store=' || COALESCE(picked.store_name, 'n/a') || ')'
  );

END;
$$;
