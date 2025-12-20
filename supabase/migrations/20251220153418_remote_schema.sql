


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."auto_publish_runner"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  settings RECORD;
  state RECORD;
  published_ids TEXT := '';
  published_count INT := 0;
  base_time TIMESTAMP;
BEGIN
  -- Load settings
  SELECT * INTO settings FROM auto_publish_settings WHERE id = 1;
  SELECT * INTO state FROM auto_publish_state WHERE id = 1;

  -- If disabled → skip
  IF settings.enabled = FALSE THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'Auto-publish disabled.');
    RETURN;
  END IF;

  -- If next_run is in the future → skip
  IF state.next_run IS NOT NULL AND state.next_run > NOW() THEN
    INSERT INTO auto_publish_logs(action, message)
    VALUES ('runner_skip', 'Too early. Next run: ' || state.next_run);
    RETURN;
  END IF;

  -- Publish deals
  WITH picked AS (
    SELECT id
    FROM deals
    WHERE status = 'Draft'
      AND exclude_from_auto = FALSE
    ORDER BY random()
    LIMIT settings.deals_per_cycle
  ),
  updated AS (
    UPDATE deals
    SET 
      status = 'Published',
      published_at = NOW()
    WHERE id IN (SELECT id FROM picked)
    RETURNING id
  )
  SELECT string_agg(id::text, ','), COUNT(*)
  INTO published_ids, published_count
  FROM updated;

  -- Calculate next aligned time (minute precision)
  base_time := date_trunc('minute', NOW());

  -- Update state
  UPDATE auto_publish_state
  SET 
    last_run = NOW(),
    last_count = published_count,
    next_run = base_time + (settings.interval_minutes || ' minutes')::interval,
    updated_at = NOW()
  WHERE id = 1;

  -- Log result
  INSERT INTO auto_publish_logs(action, message)
  VALUES (
    'runner',
    'Published ' || COALESCE(published_count,0) || ' deals: [' || COALESCE(published_ids,'') || ']'
  );

END;$$;


ALTER FUNCTION "public"."auto_publish_runner"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."deals" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "current_price" numeric(12,2),
    "old_price" numeric(12,2),
    "price_diff" numeric(12,2),
    "percent_diff" numeric(5,2),
    "image_link" "text",
    "product_link" "text",
    "review_link" "text",
    "coupon_code" "text",
    "shipping_cost" "text",
    "notes" "text",
    "expire_date" "date",
    "category" "text",
    "store_name" "text",
    "deal_level" "text",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'Draft'::"text",
    "holiday_tag" "text",
    "exclude_from_auto" boolean DEFAULT false NOT NULL,
    "description_es" "text",
    "slug_es" "text",
    "slug" "text",
    "notes_es" "text",
    "ai_status" "text" DEFAULT 'pending'::"text",
    "ai_error" "text",
    "ai_generated_at" timestamp with time zone,
    "product_link_norm" "text",
    "product_key" "text",
    "image_key" "text",
    "feed_at" timestamp with time zone,
    "superseded_by_id" bigint,
    "superseded_at" timestamp with time zone,
    "canonical_to_id" bigint,
    "bump_count" integer DEFAULT 0 NOT NULL,
    "last_bumped_at" timestamp with time zone,
    "is_affiliate" boolean DEFAULT false NOT NULL,
    "affiliate_source" "text",
    "affiliate_priority" smallint DEFAULT 0 NOT NULL,
    "publish_action" "text" DEFAULT 'insert'::"text" NOT NULL,
    "asin" "text",
    "upc" "text"
);


ALTER TABLE "public"."deals" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_deals"() RETURNS SETOF "public"."deals"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select * from public.deals order by id;
$$;


ALTER FUNCTION "public"."get_all_deals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_published_deals"() RETURNS SETOF "public"."deals"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select * from deals where status = 'Published' order by id;
$$;


ALTER FUNCTION "public"."get_all_published_deals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_social_scheduler"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  perform net.http_post(
    url := 'https://www.dealswindfall.com/api/social/hourly',
    headers := jsonb_build_object(
      'x-cron-secret', '9f3e7c29f8a94e4bb9dae34234591e95',
      'Content-Type', 'application/json'
    )
  );

  -- Optional logging
  raise notice 'Social scheduler trigger executed.';
end;
$$;


ALTER FUNCTION "public"."run_social_scheduler"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics" (
    "id" bigint NOT NULL,
    "event_name" "text",
    "page" "text",
    "referrer" "text",
    "device" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deal_id" bigint,
    "user_agent" "text",
    "ip_address" "text",
    "event_type" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "store" "text",
    "category" "text",
    "is_bot" boolean DEFAULT false,
    "visitor_id" "text"
);


ALTER TABLE "public"."analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "event_type" "text",
    "page" "text",
    "store" "text",
    "deal_id" "uuid",
    "user_id" "text",
    "referrer" "text",
    "device" "text",
    "country" "text",
    "ip" "text"
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


ALTER TABLE "public"."analytics" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."analytics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."auto_publish_logs" (
    "id" integer NOT NULL,
    "run_time" timestamp with time zone DEFAULT "now"(),
    "action" "text",
    "deals_published" integer DEFAULT 0,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auto_publish_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auto_publish_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."auto_publish_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."auto_publish_logs_id_seq" OWNED BY "public"."auto_publish_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."auto_publish_platforms" (
    "id" integer NOT NULL,
    "x" boolean DEFAULT true,
    "telegram" boolean DEFAULT true,
    "facebook" boolean DEFAULT false,
    "instagram" boolean DEFAULT false,
    "reddit" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auto_publish_platforms" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auto_publish_platforms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."auto_publish_platforms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."auto_publish_platforms_id_seq" OWNED BY "public"."auto_publish_platforms"."id";



CREATE TABLE IF NOT EXISTS "public"."auto_publish_settings" (
    "id" bigint NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "deals_per_cycle" integer DEFAULT 5 NOT NULL,
    "interval_minutes" integer DEFAULT 60 NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "social_enabled" boolean DEFAULT true,
    "social_interval_minutes" integer DEFAULT 60,
    "allowed_stores" "text"[] DEFAULT ARRAY['Amazon'::"text", 'Walmart'::"text"]
);


ALTER TABLE "public"."auto_publish_settings" OWNER TO "postgres";


ALTER TABLE "public"."auto_publish_settings" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auto_publish_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."auto_publish_state" (
    "id" integer NOT NULL,
    "last_run" timestamp with time zone,
    "next_run" timestamp with time zone,
    "last_count" integer,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "social_last_run" timestamp with time zone,
    "social_next_run" timestamp with time zone,
    "social_last_count" integer DEFAULT 0,
    "social_last_deal" bigint
);


ALTER TABLE "public"."auto_publish_state" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auto_publish_state_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."auto_publish_state_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."auto_publish_state_id_seq" OWNED BY "public"."auto_publish_state"."id";



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" bigint NOT NULL,
    "slug" "text" NOT NULL,
    "title_en" "text" NOT NULL,
    "title_es" "text",
    "content_en" "text" NOT NULL,
    "content_es" "text",
    "meta_title_en" "text",
    "meta_title_es" "text",
    "meta_description_en" "text",
    "meta_description_es" "text",
    "cover_image_url" "text",
    "tags" "text"[],
    "published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


ALTER TABLE "public"."blog_posts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."blog_posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."catalogs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "store_name" "text",
    "start_date" "date",
    "end_date" "date",
    "catalog_link" "text",
    "screenshot_link" "text",
    "published_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."catalogs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."catalogs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."catalogs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."catalogs_id_seq" OWNED BY "public"."catalogs"."id";



CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "store_name" "text",
    "coupon_link" "text",
    "expiration_date" "date",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "category" "text"
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."coupons_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."coupons_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."coupons_id_seq" OWNED BY "public"."coupons"."id";



CREATE TABLE IF NOT EXISTS "public"."deal_related_links" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "url" "text" NOT NULL,
    "title" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."deal_related_links" OWNER TO "postgres";


ALTER TABLE "public"."deal_related_links" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."deal_related_links_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."deals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."deals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."deals_id_seq" OWNED BY "public"."deals"."id";



CREATE TABLE IF NOT EXISTS "public"."holiday_events" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active" boolean DEFAULT true
);


ALTER TABLE "public"."holiday_events" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."holiday_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."holiday_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."holiday_events_id_seq" OWNED BY "public"."holiday_events"."id";



ALTER TABLE ONLY "public"."auto_publish_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."auto_publish_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."auto_publish_platforms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."auto_publish_platforms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."auto_publish_state" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."auto_publish_state_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."catalogs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."catalogs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."coupons" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."coupons_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."deals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."deals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."holiday_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."holiday_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics"
    ADD CONSTRAINT "analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auto_publish_logs"
    ADD CONSTRAINT "auto_publish_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auto_publish_platforms"
    ADD CONSTRAINT "auto_publish_platforms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auto_publish_settings"
    ADD CONSTRAINT "auto_publish_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auto_publish_state"
    ADD CONSTRAINT "auto_publish_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."catalogs"
    ADD CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_related_links"
    ADD CONSTRAINT "deal_related_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."holiday_events"
    ADD CONSTRAINT "holiday_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."holiday_events"
    ADD CONSTRAINT "holiday_events_slug_key" UNIQUE ("slug");



CREATE INDEX "blog_posts_published_idx" ON "public"."blog_posts" USING "btree" ("published");



CREATE INDEX "blog_posts_slug_idx" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "deal_related_links_deal_idx" ON "public"."deal_related_links" USING "btree" ("deal_id");



CREATE INDEX "deals_active_product_key_idx" ON "public"."deals" USING "btree" ("product_key") WHERE (("status" = ANY (ARRAY['Published'::"text", 'Scheduled'::"text"])) AND ("superseded_by_id" IS NULL));



CREATE INDEX "deals_feed_at_idx" ON "public"."deals" USING "btree" ("feed_at" DESC);



CREATE INDEX "deals_product_key_idx" ON "public"."deals" USING "btree" ("product_key");



CREATE INDEX "deals_status_idx" ON "public"."deals" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trg_holiday_events_updated_at" BEFORE UPDATE ON "public"."holiday_events" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."deal_related_links"
    ADD CONSTRAINT "deal_related_links_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE CASCADE;



CREATE POLICY "admin manage blog" ON "public"."blog_posts" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "admin_full_access_blog_posts" ON "public"."blog_posts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_full_access_catalogs" ON "public"."catalogs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_full_access_coupons" ON "public"."coupons" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "admin_full_access_holiday_events" ON "public"."holiday_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "allow_public_insert_analytics" ON "public"."analytics" FOR INSERT WITH CHECK (true);



CREATE POLICY "allow_service_role_insert" ON "public"."analytics" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "allow_service_role_insert_analytics" ON "public"."analytics" FOR INSERT TO "service_role" WITH CHECK (true);



ALTER TABLE "public"."analytics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "analytics_admin_read" ON "public"."analytics" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "analytics_admin_write" ON "public"."analytics" FOR INSERT TO "service_role" WITH CHECK (true);



ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "analytics_events_admin_read" ON "public"."analytics_events" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "analytics_events_service_insert" ON "public"."analytics_events" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "analytics_no_public_access" ON "public"."analytics" USING (false) WITH CHECK (false);



ALTER TABLE "public"."auto_publish_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auto_publish_platforms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auto_publish_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auto_publish_state" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "block_public_catalogs" ON "public"."catalogs" USING (false) WITH CHECK (false);



CREATE POLICY "block_public_coupons" ON "public"."coupons" USING (false) WITH CHECK (false);



ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."catalogs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_related_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deny all analytics" ON "public"."analytics" USING (false);



CREATE POLICY "deny all analytics events" ON "public"."analytics_events" USING (false);



CREATE POLICY "deny all deal links" ON "public"."deal_related_links" USING (false);



CREATE POLICY "deny all platforms" ON "public"."auto_publish_platforms" USING (false);



ALTER TABLE "public"."holiday_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public read blog" ON "public"."blog_posts" FOR SELECT USING (true);



CREATE POLICY "public read holidays" ON "public"."holiday_events" FOR SELECT USING (true);



CREATE POLICY "public_read_deals" ON "public"."deals" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "public_read_published_blog_posts" ON "public"."blog_posts" FOR SELECT USING (("published" = true));



CREATE POLICY "service role full access logs" ON "public"."auto_publish_logs" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role full access platforms" ON "public"."auto_publish_platforms" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role full access settings" ON "public"."auto_publish_settings" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role full access state" ON "public"."auto_publish_state" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage analytics" ON "public"."analytics" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage analytics_events" ON "public"."analytics_events" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage blog" ON "public"."blog_posts" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage catalogs" ON "public"."catalogs" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage coupons" ON "public"."coupons" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage deal links" ON "public"."deal_related_links" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service role manage holidays" ON "public"."holiday_events" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service_role_full_access_deals" ON "public"."deals" TO "service_role" USING (true) WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."auto_publish_runner"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_publish_runner"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_publish_runner"() TO "service_role";



GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."bytea_to_text"("data" "bytea") TO "service_role";



GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_deals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_deals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_deals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_published_deals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_published_deals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_published_deals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "postgres";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "anon";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."run_social_scheduler"() TO "anon";
GRANT ALL ON FUNCTION "public"."run_social_scheduler"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_social_scheduler"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."text_to_bytea"("data" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "service_role";
























GRANT ALL ON TABLE "public"."analytics" TO "anon";
GRANT ALL ON TABLE "public"."analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auto_publish_logs" TO "anon";
GRANT ALL ON TABLE "public"."auto_publish_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."auto_publish_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auto_publish_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auto_publish_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auto_publish_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auto_publish_platforms" TO "anon";
GRANT ALL ON TABLE "public"."auto_publish_platforms" TO "authenticated";
GRANT ALL ON TABLE "public"."auto_publish_platforms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auto_publish_platforms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auto_publish_platforms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auto_publish_platforms_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auto_publish_settings" TO "anon";
GRANT ALL ON TABLE "public"."auto_publish_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."auto_publish_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auto_publish_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auto_publish_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auto_publish_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auto_publish_state" TO "anon";
GRANT ALL ON TABLE "public"."auto_publish_state" TO "authenticated";
GRANT ALL ON TABLE "public"."auto_publish_state" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auto_publish_state_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auto_publish_state_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auto_publish_state_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."blog_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."blog_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."blog_posts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."catalogs" TO "anon";
GRANT ALL ON TABLE "public"."catalogs" TO "authenticated";
GRANT ALL ON TABLE "public"."catalogs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."catalogs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."catalogs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."catalogs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON SEQUENCE "public"."coupons_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."coupons_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."coupons_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deal_related_links" TO "anon";
GRANT ALL ON TABLE "public"."deal_related_links" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_related_links" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_related_links_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_related_links_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_related_links_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."holiday_events" TO "anon";
GRANT ALL ON TABLE "public"."holiday_events" TO "authenticated";
GRANT ALL ON TABLE "public"."holiday_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."holiday_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."holiday_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."holiday_events_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































