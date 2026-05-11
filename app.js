// LabOS - Node-RED Adaptable Dashboard Logic

(function(scope) {
    document.addEventListener('DOMContentLoaded', () => {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');
        const pageTitle = document.getElementById('page-title');

        // --- Node-RED Integration ---
        if (scope) {
            // Listen for incoming messages from Node-RED
            scope.$watch('msg', function(msg) {
                if (!msg) return;
                
                // Example: If msg.topic is "temperature", update the card
                if (msg.topic === "temperature") {
                    const tempCard = document.querySelector('.card:nth-child(1) .card-value');
                    if (tempCard) tempCard.innerHTML = `${msg.payload}<span>°C</span>`;
                }
                
                // Example: Handle bulk updates via object payload
                if (typeof msg.payload === 'object') {
                    Object.keys(msg.payload).forEach(key => {
                        updateCardValue(key, msg.payload[key]);
                    });
                }
            });
        }

        function updateCardValue(id, value) {
            // Helper to find cards by title text and update them
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const title = card.querySelector('.card-title');
                if (title && title.textContent.toLowerCase().includes(id.toLowerCase())) {
                    const valueEl = card.querySelector('.card-value');
                    if (valueEl) valueEl.innerHTML = `${value}`;
                }
            });
        }

        function sendToNodeRed(topic, payload) {
            if (scope) {
                scope.send({ topic: topic, payload: payload });
            } else {
                console.log('Outbound [Node-RED Simulation]:', topic, payload);
            }
        }
        // ----------------------------

        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.getAttribute('data-page');
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                pages.forEach(p => p.classList.toggle('active', p.id === `page-${targetPage}`));
                pageTitle.textContent = item.textContent.trim();
            });
        });

        // Switch Logic (Send to Node-RED)
        const switches = document.querySelectorAll('.switch');
        switches.forEach(sw => {
            sw.addEventListener('click', () => {
                const isOn = sw.classList.contains('on');
                const title = sw.closest('.card').querySelector('.card-title').textContent;
                
                // Toggle state
                sw.classList.toggle('on');
                
                // Send command back to Node-RED
                sendToNodeRed(title.replace(/\s+/g, '_').toLowerCase(), !isOn);
            });
        });
    });
})(window.scope);
