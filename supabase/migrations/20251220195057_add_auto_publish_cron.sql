-- Add auto publish cron job (production only)

do $do$
begin
  -- Only allow cron creation when running as postgres / service_role
  if current_user in ('postgres', 'service_role') then

    -- Prevent duplicate cron jobs
    if not exists (
      select 1
      from cron.job
      where jobname = 'auto_publish_runner_job'
    ) then

      perform cron.schedule(
        'auto_publish_runner_job',
        '*/10 * * * *',
        $cmd$select public.auto_publish_runner();$cmd$
      );

    end if;

  end if;
end
$do$;
