class QuantumPopup {
    constructor() {
        this.createPopupElement();
        this.addEventListeners();
    }

    createPopupElement() {
        const popup = document.createElement('div');
        popup.className = 'popup-overlay';
        popup.innerHTML = `
            <div class="popup-container">
                <div class="popup-header">
                    <h2 class="popup-title"></h2>
                    <button class="popup-close">&times;</button>
                </div>
                <div class="popup-content">
                    <div class="popup-summary"></div>
                    <button class="read-more-btn">Read More</button>
                    <div class="full-content"></div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        
        this.overlay = popup;
        this.container = popup.querySelector('.popup-container');
        this.title = popup.querySelector('.popup-title');
        this.summary = popup.querySelector('.popup-summary');
        this.fullContent = popup.querySelector('.full-content');
        this.readMoreBtn = popup.querySelector('.read-more-btn');
    }

    addEventListeners() {
        this.overlay.querySelector('.popup-close').addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
        this.readMoreBtn.addEventListener('click', () => this.toggleFullContent());
    }

    show(concept) {
        const explanation = quantumExplanations[concept];
        if (!explanation) return;

        this.title.textContent = explanation.title;
        this.summary.textContent = explanation.summary;
        this.fullContent.innerHTML = explanation.fullContent.replace(/\n\n/g, '<br><br>');
        this.fullContent.style.display = 'none';
        this.readMoreBtn.textContent = 'Read More';
        this.overlay.style.display = 'block';
    }

    hide() {
        this.overlay.style.display = 'none';
    }

    toggleFullContent() {
        const isVisible = this.fullContent.style.display === 'block';
        this.fullContent.style.display = isVisible ? 'none' : 'block';
        this.readMoreBtn.textContent = isVisible ? 'Read More' : 'Show Less';
    }
}

// Initialize popup system
document.addEventListener('DOMContentLoaded', () => {
    window.quantumPopup = new QuantumPopup();
});
