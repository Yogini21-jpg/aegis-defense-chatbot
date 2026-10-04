const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'aegis_security.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('[DATABASE] Connected to SQLite database: aegis_security.db');
    }
});

// Initialize Tables
db.serialize(() => {
    // Chat History Table
    db.run(`
        CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            threat_level TEXT DEFAULT 'NORMAL',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tactical Alert Log Table
    db.run(`
        CREATE TABLE IF NOT EXISTS threat_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sector TEXT NOT NULL,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed initial security alerts if empty
    db.get(`SELECT COUNT(*) AS count FROM threat_alerts`, (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare(`INSERT INTO threat_alerts (sector, threat_type, severity, status) VALUES (?, ?, ?, ?)`);
            stmt.run('Sector 4 - Northern Ridge', 'Unidentified UAV Incursion', 'HIGH', 'ACTIVE');
            stmt.run('Sector 9 - Coastal Border', 'Unflagged Maritime Vessel', 'CRITICAL', 'INVESTIGATING');
            stmt.run('Sector 2 - Eastern Outpost', 'Perimeter Microwave Breach', 'MEDIUM', 'RESOLVED');
            stmt.finalize();
            console.log('[DATABASE] Initial threat alert telemetry seeded.');
        }
    });
});

module.exports = db;