-- ========================================
-- AI Fruit Identification Assistant
-- Database Seed Data
-- PostgreSQL
-- ========================================

-- ========================================
-- Insert Admin User
-- Password: Admin@123 (will be hashed by application)
-- ========================================

INSERT INTO users (name, email, hashed_password, role, is_email_verified, is_active)
VALUES (
    'Admin User',
    'admin@fruitai.com',
    'temp_hash_will_be_replaced_by_app',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- Insert Demo Users
-- ========================================

INSERT INTO users (name, email, hashed_password, role, is_email_verified, is_active)
VALUES 
    ('John Farmer', 'farmer@fruitai.com', 'temp_hash_will_be_replaced_by_app', 'farmer', TRUE, TRUE),
    ('Jane Vendor', 'vendor@fruitai.com', 'temp_hash_will_be_replaced_by_app', 'vendor', TRUE, TRUE),
    ('Demo User', 'demo@fruitai.com', 'temp_hash_will_be_replaced_by_app', 'general', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- Insert Fruits Data
-- ========================================

INSERT INTO fruits (name, scientific_name, category, emoji, nutrition, season, peak_months, benefits, storage_tips, fun_facts, origin_countries, popularity) VALUES
(
    'Apple', 'Malus domestica', 'Pome Fruits', '🍎',
    '{"calories": 52, "carbs": "14g", "protein": "0.3g", "fat": "0.2g", "fiber": "2.4g", "vitaminC": "4.6mg"}',
    'Fall', '[9,10,11]',
    '["Rich in antioxidants", "Supports heart health", "Good for digestion"]',
    'Store in refrigerator for longer freshness',
    '["Apples float in water because they are 25% air"]',
    '["China", "USA", "Poland"]',
    100
),
(
    'Banana', 'Musa acuminata', 'Tropical', '🍌',
    '{"calories": 89, "carbs": "23g", "protein": "1.1g", "fat": "0.3g", "fiber": "2.6g", "potassium": "358mg"}',
    'Year-round', '[1,2,3,4,5,6,7,8,9,10,11,12]',
    '["High in potassium", "Good for energy", "Supports digestive health"]',
    'Store at room temperature, refrigerate when ripe',
    '["Bananas are technically berries"]',
    '["India", "China", "Indonesia"]',
    95
),
(
    'Orange', 'Citrus sinensis', 'Citrus', '🍊',
    '{"calories": 47, "carbs": "12g", "protein": "0.9g", "fat": "0.1g", "fiber": "2.4g", "vitaminC": "53mg"}',
    'Winter', '[12,1,2,3]',
    '["Excellent source of Vitamin C", "Boosts immune system", "Good for skin health"]',
    'Store at room temperature or refrigerate',
    '["Oranges are actually modified berries"]',
    '["Brazil", "USA", "Mexico"]',
    90
),
(
    'Mango', 'Mangifera indica', 'Tropical', '🥭',
    '{"calories": 60, "carbs": "15g", "protein": "0.8g", "fat": "0.4g", "fiber": "1.6g", "vitaminA": "1080IU"}',
    'Summer', '[5,6,7,8]',
    '["Rich in Vitamin A", "Boosts immunity", "Good for eye health"]',
    'Ripen at room temperature, then refrigerate',
    '["Mangoes are the national fruit of India"]',
    '["India", "China", "Thailand"]',
    85
),
(
    'Strawberry', 'Fragaria × ananassa', 'Berries', '🍓',
    '{"calories": 32, "carbs": "7.7g", "protein": "0.7g", "fat": "0.3g", "fiber": "2g", "vitaminC": "59mg"}',
    'Spring', '[4,5,6]',
    '["High in Vitamin C", "Rich in antioxidants", "Good for heart health"]',
    'Refrigerate and eat within a few days',
    '["Strawberries are the only fruit with seeds on the outside"]',
    '["USA", "Mexico", "Spain"]',
    88
),
(
    'Watermelon', 'Citrullus lanatus', 'Melons', '🍉',
    '{"calories": 30, "carbs": "8g", "protein": "0.6g", "fat": "0.2g", "fiber": "0.4g", "vitaminC": "8mg"}',
    'Summer', '[6,7,8]',
    '["Hydrating", "Low in calories", "Good source of lycopene"]',
    'Store whole at room temperature, refrigerate after cutting',
    '["Watermelons are 92% water"]',
    '["China", "Turkey", "Iran"]',
    82
),
(
    'Grapes', 'Vitis vinifera', 'Berries', '🍇',
    '{"calories": 69, "carbs": "18g", "protein": "0.7g", "fat": "0.2g", "fiber": "0.9g", "vitaminC": "3.2mg"}',
    'Fall', '[8,9,10]',
    '["Rich in antioxidants", "Good for heart health", "Contains resveratrol"]',
    'Refrigerate and wash before eating',
    '["Grapes can be turned into raisins, wine, and juice"]',
    '["China", "Italy", "USA"]',
    80
),
(
    'Pineapple', 'Ananas comosus', 'Tropical', '🍍',
    '{"calories": 50, "carbs": "13g", "protein": "0.5g", "fat": "0.1g", "fiber": "1.4g", "vitaminC": "48mg"}',
    'Spring', '[3,4,5,6]',
    '["Contains bromelain", "Good for digestion", "Rich in Vitamin C"]',
    'Store at room temperature, refrigerate after cutting',
    '["Pineapples take about 18 months to grow"]',
    '["Costa Rica", "Brazil", "Philippines"]',
    78
)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- Insert Sample Identifications (for demo user)
-- ========================================

-- Get demo user ID (will be populated by application)
-- INSERT INTO identifications (user_id, fruit_name, confidence, created_at)
-- VALUES (1, 'Apple', 0.96, NOW() - INTERVAL '2 days');

-- ========================================
-- Verification
-- ========================================

-- Check counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Fruits', COUNT(*) FROM fruits;