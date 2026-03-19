/**
 * Handles all UI feedback, toasts, modals, and quantity selectors.
 */
export const ui = {
    toast(message, type = 'blue') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeftColor = getComputedStyle(document.documentElement).getPropertyValue(`--${type === 'blue' ? 'accent' : type}`);
        
        const iconName = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-triangle' : 'info';
        toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    showTravel(durationSec, msg = "Travelling...", callback) {
        const overlay = document.getElementById('travel-overlay');
        const progress = document.getElementById('travel-progress');
        const msgEl = document.getElementById('travel-msg');
        
        overlay.style.display = 'flex';
        msgEl.textContent = msg;
        progress.style.width = '0%';
        
        let start = Date.now();
        const duration = durationSec * 1000;
        
        const timer = setInterval(() => {
            let elapsed = Date.now() - start;
            let percent = Math.min(100, (elapsed / duration) * 100);
            progress.style.width = percent + '%';
            
            if (percent >= 100) {
                clearInterval(timer);
                overlay.style.display = 'none';
                if (callback) callback();
            }
        }, 100);
    },

    openQuantityModal(item, price, mode, callback) {
        const modal = document.createElement('div');
        modal.id = 'modal-container';
        modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center;';
        
        modal.innerHTML = `
            <div class="glass-panel" style="max-width: 400px; width: 90%;">
                <h2 style="text-transform: capitalize;">${mode} ${item}</h2>
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-label">Unit Price</span>
                        <span class="stat-value">$${price}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-label">Quantity</span>
                        <div class="qty-selector">
                            <div class="qty-btn" onclick="updateModalTotal(-1, ${price})">-</div>
                            <input type="number" id="modal-qty" class="qty-input" value="1" oninput="updateModalTotal(0, ${price})">
                            <div class="qty-btn" onclick="updateModalTotal(1, ${price})">+</div>
                        </div>
                    </div>

                    <div style="padding-top: 1rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between;">
                        <span class="stat-label">Total Cost</span>
                        <span class="stat-value" id="modal-total">$${price}</span>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button id="modal-confirm" style="flex: 1;">CONFIRM</button>
                        <button class="secondary" id="modal-cancel">CANCEL</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Global functions for modal (keeping it simple for demo)
        window.updateModalTotal = (delta, p) => {
            const input = document.getElementById('modal-qty');
            input.value = Math.max(1, parseInt(input.value) + delta);
            document.getElementById('modal-total').textContent = `$${(parseInt(input.value) * p).toLocaleString()}`;
        };

        document.getElementById('modal-confirm').onclick = () => {
            const qty = parseInt(document.getElementById('modal-qty').value);
            modal.remove();
            callback(qty);
        };

        document.getElementById('modal-cancel').onclick = () => modal.remove();
        if (window.lucide) lucide.createIcons();
    }
};
