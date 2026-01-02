CREATE TABLE IF NOT EXISTS deal_page_views (
  id BIGSERIAL PRIMARY KEY,
  deal_id BIGINT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast time-based queries
CREATE INDEX IF NOT EXISTS idx_deal_page_views_deal_time
ON deal_page_views (deal_id, created_at DESC);
