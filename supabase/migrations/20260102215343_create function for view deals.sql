CREATE OR REPLACE FUNCTION get_deal_views_last_hour(p_deal_id bigint)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)
  FROM deal_page_views
  WHERE deal_id = p_deal_id
    AND created_at >= NOW() - INTERVAL '1 hour';
$$;


create or replace function get_deal_views_last_hour(p_deal_id int)
returns int
language sql
stable
as $$
  select count(*)
  from deal_page_views
  where deal_id = p_deal_id
    and created_at >= now() - interval '1 hour';
$$;
