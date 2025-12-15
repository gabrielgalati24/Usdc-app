-- =============================================
-- USDC App - Database Schema Initialization
-- =============================================
-- Run this SQL script to create all tables in production
-- Only needed on first deployment

-- Enable UUID extension (required for PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "walletAddress" VARCHAR(255),
    "encryptedPrivateKey" TEXT,
    "usdcBalance" DECIMAL(18, 6) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- Table: transactions
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "fromUserId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "toUserId" UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(18, 6) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('internal', 'deposit', 'withdraw')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'completed', 'failed')),
    "txHash" VARCHAR(255),
    "externalAddress" VARCHAR(255),
    notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_from_user ON transactions("fromUserId");
CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON transactions("toUserId");
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions("createdAt");

-- =============================================
-- Table: agent_tasks
-- =============================================
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "taskType" VARCHAR(50) NOT NULL CHECK ("taskType" IN ('financial_analysis', 'market_data', 'risk_assessment', 'portfolio_review')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    input JSONB,
    result JSONB,
    error TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user ON agent_tasks("userId");
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);

-- =============================================
-- Verify tables were created
-- =============================================
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'transactions', 'agent_tasks')
ORDER BY table_name;
