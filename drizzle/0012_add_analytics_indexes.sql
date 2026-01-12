-- Add performance indexes for analytics_events table
-- These indexes are critical for fast analytics queries

-- Index for date range queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_timestamp
ON analytics_events(store_id, timestamp DESC);

-- Index for event type filtering with date ranges
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_type_timestamp
ON analytics_events(store_id, event_type, timestamp DESC);

-- Index for product analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_product_timestamp
ON analytics_events(store_id, product_id, timestamp DESC)
WHERE product_id IS NOT NULL;

-- Index for session-based queries (funnel analysis)
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_session
ON analytics_events(store_id, session_id, timestamp DESC);

-- Index for order-based revenue queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_store_order
ON analytics_events(store_id, order_id, timestamp DESC)
WHERE order_id IS NOT NULL;
