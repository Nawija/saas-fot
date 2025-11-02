-- Support Tickets Table
-- Stores contact form submissions and bug reports

CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'contact' or 'bug'
    
    -- Contact form fields
    subject TEXT,
    message TEXT,
    
    -- Bug report fields
    title TEXT,
    steps TEXT,
    expected TEXT,
    actual TEXT,
    
    -- Metadata
    user_agent TEXT,
    referer TEXT,
    ip_address VARCHAR(45),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON support_tickets(type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE support_tickets IS 'Stores all support requests including contact forms and bug reports';
COMMENT ON COLUMN support_tickets.type IS 'Either contact (general inquiry) or bug (bug report)';
COMMENT ON COLUMN support_tickets.status IS 'Ticket status: open, in_progress, resolved, closed';
