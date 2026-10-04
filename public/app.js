document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const alertsContainer = document.getElementById('alertsContainer');

    // Fetch initial chat history and telemetry alerts from backend
    fetchHistory();
    fetchAlerts();

    // Form Submit Event
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Render User Message Instantly
        appendMessage('USER', message, 'NORMAL');
        userInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Render Bot Response
            appendMessage('AEGIS AI', data.botReply, data.threatLevel);
            fetchAlerts(); // Refresh alerts list
        } catch (err) {
            appendMessage('SYSTEM ERROR', 'Failed to connect to tactical command server.', 'CRITICAL');
        }
    });

    // Helper to send quick action commands
    window.quickSend = function(text) {
        userInput.value = text;
        chatForm.dispatchEvent(new Event('submit'));
    };

    // Render single chat message element
    function appendMessage(sender, text, threatLevel) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex flex-col ${sender === 'USER' ? 'items-end' : 'items-start'}`;

        let threatBadge = '';
        if (sender !== 'USER') {
            const badgeColors = {
                'CRITICAL': 'bg-red-950 text-red-400 border-red-800',
                'HIGH': 'bg-amber-950 text-amber-400 border-amber-800',
                'MEDIUM': 'bg-yellow-950 text-yellow-400 border-yellow-800',
                'NORMAL': 'bg-emerald-950 text-emerald-400 border-emerald-800'
            };
            const colorClass = badgeColors[threatLevel] || badgeColors['NORMAL'];
            threatBadge = `<span class="text-[10px] font-mono px-2 py-0.5 rounded border ${colorClass} mb-1">THREAT: ${threatLevel}</span>`;
        }

        msgDiv.innerHTML = `
            ${threatBadge}
            <div class="max-w-xl rounded-lg px-4 py-3 text-sm font-mono ${
                sender === 'USER' 
                    ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-700/50' 
                    : 'bg-slate-900 text-slate-200 border border-slate-800'
            }">
                <strong class="text-xs text-slate-400 block mb-1">${sender}</strong>
                <p class="leading-relaxed">${text}</p>
            </div>
        `;

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Fetch conversation history from SQLite
    async function fetchHistory() {
        try {
            const res = await fetch('/api/history');
            const data = await res.json();
            chatBox.innerHTML = '';
            
            if (data.history.length === 0) {
                appendMessage('AEGIS AI', 'Tactical Command Copilot active. Enter query or trigger alert protocol.', 'NORMAL');
            } else {
                data.history.forEach(log => {
                    appendMessage(log.sender, log.message, log.threat_level);
                });
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    }

    // Fetch alerts telemetry from backend
    async function fetchAlerts() {
        try {
            const res = await fetch('/api/alerts');
            const data = await res.json();
            alertsContainer.innerHTML = '';

            data.alerts.forEach(alert => {
                const alertCard = document.createElement('div');
                alertCard.className = 'bg-slate-800/60 border border-slate-700/60 p-3 rounded text-xs font-mono';
                alertCard.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-cyan-400 font-bold">${alert.sector}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700">${alert.severity}</span>
                    </div>
                    <div class="text-slate-300">${alert.threat_type}</div>
                    <div class="text-[10px] text-slate-500 mt-1">STATUS: ${alert.status}</div>
                `;
                alertsContainer.appendChild(alertCard);
            });
        } catch (err) {
            console.error('Error fetching alerts:', err);
        }
    }
});