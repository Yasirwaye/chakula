-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GEOSPATIAL: Add location column to restaurants
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

UPDATE restaurants
  SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  WHERE location IS NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_location
  ON restaurants USING GIST(location);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FULL TEXT SEARCH: restaurants
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE restaurants
  SET search_vector =
    setweight(to_tsvector('english', unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(area, ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(city, ''))), 'C');

CREATE INDEX IF NOT EXISTS idx_restaurants_search_vector
  ON restaurants USING GIN(search_vector);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FULL TEXT SEARCH: menu items
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE menu_items
  SET search_vector =
    setweight(to_tsvector('english', unaccent(coalesce(name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'B');

CREATE INDEX IF NOT EXISTS idx_menu_items_search_vector
  ON menu_items USING GIN(search_vector);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIAL INDEXES for performance
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX IF NOT EXISTS idx_restaurants_active_approved
  ON restaurants(city, avg_rating DESC)
  WHERE status = 'APPROVED' AND is_verified = true;

CREATE INDEX IF NOT EXISTS idx_menu_items_available
  ON menu_items(restaurant_id, category_id, sort_order)
  WHERE is_available = true AND deleted_at IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ORDER NUMBER SEQUENCE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'CHK-' ||
    TO_CHAR(NOW(), 'YYYY') || '-' ||
    LPAD(nextval('order_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER: Auto-update restaurant search_vector
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.area, ''))), 'C') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.city, ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_restaurant_search_vector ON restaurants;
CREATE TRIGGER trigger_update_restaurant_search_vector
  BEFORE INSERT OR UPDATE OF name, description, area, city ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_search_vector();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER: Auto-update menu_items search_vector
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_menu_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_menu_item_search_vector ON menu_items;
CREATE TRIGGER trigger_update_menu_item_search_vector
  BEFORE INSERT OR UPDATE OF name, description ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_item_search_vector();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER: Auto-update restaurant location from lat/lng
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_restaurant_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(
    ST_MakePoint(NEW.longitude, NEW.latitude),
    4326
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_restaurant_location ON restaurants;
CREATE TRIGGER trigger_update_restaurant_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_location();