-- Update auto_publish_runner function

create or replace function public.auto_publish_runner()
returns void
language plpgsql
as $func$
declare
  settings record;
  state record;

  inserted_ids text := '';
  bumped_ids text := '';
  inserted_count int := 0;
  bumped_count int := 0;

  base_time timestamp;
begin
  /* -------------------------------
     LOAD SETTINGS & STATE
  --------------------------------*/
  select * into settings
  from auto_publish_settings
  where id = 1;

  select * into state
  from auto_publish_state
  where id = 1;

  /* -------------------------------
     GUARDS
  --------------------------------*/
  if settings.enabled = false then
    insert into auto_publish_logs(action, message)
    values ('runner_skip', 'Auto-publish disabled.');
    return;
  end if;

  if state.next_run is not null and state.next_run > now() then
    insert into auto_publish_logs(action, message)
    values ('runner_skip', 'Too early. Next run: ' || state.next_run);
    return;
  end if;

  /* -------------------------------
     INSERT NEW DEALS
  --------------------------------*/
  with picked_insert as (
    select id
    from deals
    where status = 'Draft'
      and exclude_from_auto = false
      and (
        publish_action is null
        or publish_action = 'insert'
      )
    order by created_at asc
    limit settings.deals_per_cycle
  ),
  inserted as (
    update deals
    set
      status = 'Published',
      published_at = now(),
      feed_at = now()
    where id in (select id from picked_insert)
    returning id
  )
  select
    coalesce(string_agg(id::text, ','), ''),
    count(*)
  into inserted_ids, inserted_count
  from inserted;

  /* -------------------------------
     BUMP EXISTING DEALS
  --------------------------------*/
  with picked_bump as (
    select canonical_to_id
    from deals
    where status = 'Draft'
      and exclude_from_auto = false
      and publish_action = 'bump_existing'
    order by created_at asc
    limit settings.deals_per_cycle
  ),
  bumped as (
    update deals d
    set
      feed_at = now(),
      last_bumped_at = now(),
      bump_count = coalesce(d.bump_count, 0) + 1
    from picked_bump p
    where d.id = p.canonical_to_id
      and d.status = 'Published'
    returning d.id
  )
  select
    coalesce(string_agg(id::text, ','), ''),
    count(*)
  into bumped_ids, bumped_count
  from bumped;

  /* -------------------------------
     CLEANUP BUMP DRAFT ROWS
  --------------------------------*/
  delete from deals
  where status = 'Draft'
    and publish_action = 'bump_existing';

  /* -------------------------------
     UPDATE STATE
  --------------------------------*/
  base_time := date_trunc('minute', now());

  update auto_publish_state
  set
    last_run = now(),
    last_count = inserted_count + bumped_count,
    next_run = base_time + (settings.interval_minutes || ' minutes')::interval,
    updated_at = now()
  where id = 1;

  /* -------------------------------
     LOG RESULT
  --------------------------------*/
  insert into auto_publish_logs(action, message)
  values (
    'runner',
    'Inserted [' || inserted_ids || '] | Bumped [' || bumped_ids || ']'
  );

end;
$func$;
