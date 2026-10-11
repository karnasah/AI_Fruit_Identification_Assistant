-- ========================================
-- AI Fruit Identification Assistant
-- Database Initialization Script
-- PostgreSQL
-- ========================================

-- Create database (run separately if needed)
-- CREATE DATABASE fruit_ai_db;

-- Connect to database
-- \c fruit_ai_db;

-- ========================================
-- Enable Extensions
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- Users Table
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(200),
    occupation VARCHAR(100),
    website VARCHAR(500),
    role VARCHAR(20) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    last_active TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ========================================
-- Fruits Table
-- ========================================

CREATE TABLE IF NOT EXISTS fruits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(200),
    category VARCHAR(50),
    emoji VARCHAR(10),
    image_url VARCHAR(500),
    images JSONB DEFAULT '[]',
    nutrition JSONB,
    season VARCHAR(50),
    peak_months JSONB DEFAULT '[]',
    benefits JSONB DEFAULT '[]',
    storage_tips TEXT,
    growing_tips JSONB,
    recipes JSONB DEFAULT '[]',
    fun_facts JSONB DEFAULT '[]',
    origin_countries JSONB DEFAULT '[]',
    price_info JSONB,
    popularity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fruits_name ON fruits(name);
CREATE INDEX idx_fruits_category ON fruits(category);
CREATE INDEX idx_fruits_popularity ON fruits(popularity DESC);

-- ========================================
-- Identifications Table
-- ========================================

CREATE TABLE IF NOT EXISTS identifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fruit_id INTEGER REFERENCES fruits(id) ON DELETE SET NULL,
    fruit_name VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    top_predictions JSONB DEFAULT '[]',
    image_url VARCHAR(500),
    image_path VARCHAR(500),
    ripeness VARCHAR(50),
    ripeness_confidence FLOAT,
    disease VARCHAR(100),
    disease_confidence FLOAT,
    bounding_boxes JSONB DEFAULT '[]',
    is_successful BOOLEAN DEFAULT TRUE,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_identifications_user_id ON identifications(user_id);
CREATE INDEX idx_identifications_created_at ON identifications(created_at DESC);
CREATE INDEX idx_identifications_fruit_name ON identifications(fruit_name);

-- ========================================
-- Favorites Table
-- ========================================

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fruit_id INTEGER REFERENCES fruits(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fruit_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_fruit_id ON favorites(fruit_id);

-- ========================================
-- Chat Sessions Table
-- ========================================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    context JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ========================================
-- Chat Messages Table
-- ========================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL,
    intent VARCHAR(100),
    confidence FLOAT,
    entities JSONB DEFAULT '{}',
    suggestions JSONB DEFAULT '[]',
    context_used JSONB DEFAULT '{}',
    feedback_helpful BOOLEAN,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ========================================
-- Notifications Table
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ========================================
-- Notification Preferences Table
-- ========================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    email_digest_frequency VARCHAR(20) DEFAULT 'daily',
    push_notifications BOOLEAN DEFAULT FALSE,
    identification_alerts BOOLEAN DEFAULT TRUE,
    seasonal_alerts BOOLEAN DEFAULT TRUE,
    achievement_alerts BOOLEAN DEFAULT TRUE,
    promotional_alerts BOOLEAN DEFAULT FALSE,
    push_subscription JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Analytics Events Table
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_data JSONB DEFAULT '{}',
    duration_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    referrer VARCHAR(500),
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- ========================================
-- User Activity Logs Table
-- ========================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    success BOOLEAN DEFAULT TRUE,
    error_message VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_created_at ON user_activity_logs(created_at);

-- ========================================
-- Daily Stats Table
-- ========================================

CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_identifications INTEGER DEFAULT 0,
    successful_identifications INTEGER DEFAULT 0,
    average_confidence FLOAT DEFAULT 0,
    total_chat_messages INTEGER DEFAULT 0,
    unique_chat_users INTEGER DEFAULT 0,
    api_requests INTEGER DEFAULT 0,
    average_response_time_ms FLOAT DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);

-- ========================================
-- Update timestamps trigger function
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fruits_updated_at BEFORE UPDATE ON fruits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();