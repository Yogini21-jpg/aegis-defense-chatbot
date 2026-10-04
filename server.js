const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Security Knowledge Base Logic
function generateSecurityResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    // 1. Airborne / Drone Keywords
    const uavKeywords = ['uav', 'drone', 'quadcopter', 'uas', 'multirotor', 'aircraft', 'aerial', 'copters'];
    
    // 2. Physical Perimeter Breach Keywords
    const breachKeywords = ['breach', 'infiltration', 'intrusion', 'fence', 'ridge', 'crossing', 'thermal', 'border', 'ground'];

    // 3. Cyber & Network Attack Keywords
    const cyberKeywords = ['cyber', 'hack', 'firewall', 'port', 'scan', 'server', 'unauthorized', 'exploit', 'malware', 'ddos', 'network'];

    // 4. Radar & Sensor Telemetry Keywords
    const radarKeywords = ['radar', 'sensor', 'coverage', 'array', 'telemetry', 'microwave'];

    // --- Intent Matching Engine ---

    // Airborne / Drone Threat
    if (uavKeywords.some(kw => query.includes(kw))) {
        return {
            reply: "ALERT ANALYSIS: Airborne threat detected (Quadcopter/UAV). Protocol Bravo activated. Anti-drone jamming frequency grid locked on coordinates. Recommend immediate deployment of interceptor counter-UAV units.",
            threat: "HIGH"
        };
    } 
    // Physical Perimeter Breach
    else if (breachKeywords.some(kw => query.includes(kw))) {
        return {
            reply: "CRITICAL BREACH REPORT: Ground sensors confirm unauthorized movement near border line. Rapid Response Force (RRF) Team-Alpha dispatched. Perimeter automated containment engaged.",
            threat: "CRITICAL"
        };
    } 
    // Cyber & Command Server Threat
    else if (cyberKeywords.some(kw => query.includes(kw))) {
        return {
            reply: "CYBER DEFENSE ALERT: Unauthorized port scanning / intrusion attempt detected on command server. Network isolation protocol engaged. IP blocked & quantum-resistant firewall locked.",
            threat: "MEDIUM"
        };
    } 
    // Radar / Sensor Status
    else if (radarKeywords.some(kw => query.includes(kw))) {
        return {
            reply: "SYSTEM STATUS: 360-degree phased array radar array operational. Microwave perimeter fences operating at 99.8% capacity. Zero blind spots detected across primary sectors.",
            threat: "NORMAL"
        };
    } 
    // General Defense Status
    else if (query.includes('status') || query.includes('summary') || query.includes('health')) {
        return {
            reply: "DEFENSE GRID SUMMARY: Defcon level: 3. All border outposts online. Active radar units: 24/24. Maritime patrol ships on grid: 6. Ground security status: OPTIMAL.",
            threat: "NORMAL"
        };
    } 
    // Fallback Default
    else {
        return {
            reply: "COMMAND ACKNOWLEDGED: Query cataloged into defense registry. Command copilot analyzing surveillance feeds for correlated anomalies.",
            threat: "NORMAL"
        };
    }
}

// REST API Endpoints
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message field is required." });
    }

    const botResponse = generateSecurityResponse(message);

    db.run(`INSERT INTO chat_logs (sender, message) VALUES (?, ?)`, ['USER', message], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`INSERT INTO chat_logs (sender, message, threat_level) VALUES (?, ?, ?)`, ['AEGIS_AI', botResponse.reply, botResponse.threat], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            res.json({
                userMessage: message,
                botReply: botResponse.reply,
                threatLevel: botResponse.threat,
                timestamp: new Date().toISOString()
            });
        });
    });
});

app.get('/api/history', (req, res) => {
    db.all(`SELECT * FROM chat_logs ORDER BY timestamp ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ history: rows });
    });
});

app.get('/api/alerts', (req, res) => {
    db.all(`SELECT * FROM threat_alerts ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ alerts: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  AEGIS SECURITY COMMAND CHATBOT SERVER ONLINE      `);
    console.log(`  Running on: http://localhost:${PORT}              `);
    console.log(`====================================================`);
});