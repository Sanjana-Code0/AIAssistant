// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

let overlay: HTMLDivElement | null = null;
let spotlight: HTMLDivElement | null = null;

function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 999998;
    pointer-events: none;
    transition: opacity 0.5s;
    opacity: 0;
  `;
    document.body.appendChild(overlay);

    spotlight = document.createElement('div');
    spotlight.style.cssText = `
    position: absolute;
    border: 4px solid #FACC15;
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
    z-index: 999999;
    pointer-events: none;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    display: none;
  `;
    document.body.appendChild(spotlight);
}

function injectFilters() {
    if (document.getElementById('shadowlight-filters')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'shadowlight-filters';
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0; pointer-events: none;');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `
    <defs>
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0" />
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0" />
      </filter>
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0" />
      </filter>
    </defs>
  `;
    document.body.appendChild(svg);
}

function getPageSchema() {
    const elList = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
    const interactiveElements = elList.filter(el => (el as HTMLElement).offsetParent !== null).map((el, index) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLElement).innerText?.trim().slice(0, 50) || (el as HTMLInputElement).placeholder || (el as HTMLInputElement).value || 'No label',
        id: el.id || `gen-id-${index}`,
        className: el.className,
        type: (el as HTMLInputElement).type,
        selector: el.id ? `#${el.id}` : el.tagName.toLowerCase() + (el.className ? `.${el.className.split(' ').join('.')}` : '')
    }));

    // Ensure all have IDs
    elList.forEach((el, index) => {
        if (!el.id) el.id = `gen-id-${index}`;
    });

    // Extract page text for summarization
    const mainContent = document.querySelector('main, article, #content, .content') || document.body;
    const pageText = (mainContent as HTMLElement).innerText?.slice(0, 6000) || '';

    return {
        url: window.location.href,
        title: document.title,
        interactiveElements: interactiveElements.slice(0, 50),
        pageText: pageText
    };
}

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    if (request.type === 'HIGHLIGHT_ELEMENT') {
        createOverlay();
        const el = document.querySelector(request.selector) || document.getElementById(request.selector);
        if (el && overlay && spotlight) {
            const rect = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            overlay.style.opacity = '1';
            spotlight.style.display = 'block';
            spotlight.style.top = `${rect.top + scrollY - 4}px`;
            spotlight.style.left = `${rect.left + scrollX - 4}px`;
            spotlight.style.width = `${rect.width + 8}px`;
            spotlight.style.height = `${rect.height + 8}px`;

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    if (request.type === 'CLEAR_HIGHLIGHT') {
        if (overlay) overlay.style.opacity = '0';
        if (spotlight) spotlight.style.display = 'none';
    }

    if (request.type === 'EXECUTE_ACTION') {
        const el = document.querySelector(request.selector) || document.getElementById(request.selector);
        if (el) {
            try {
                if (request.action === 'click') {
                    (el as HTMLElement).click();
                    sendResponse({ status: 'clicked' });
                } else if (request.action === 'type') {
                    (el as HTMLInputElement).value = request.text || '';
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    sendResponse({ status: 'typed' });
                } else if (request.action === 'hover') {
                    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                    sendResponse({ status: 'hovered' });
                }
            } catch (err: any) {
                sendResponse({ error: err.message });
            }
        } else {
            sendResponse({ error: 'Element not found' });
        }
    } else if (request.type === 'APPLY_CONTRAST') {
        injectFilters();
        document.documentElement.style.filter = request.filter || 'none';
        sendResponse({ status: 'applied' });
    } else if (request.type === 'SCRAPE_PAGE') {
        const schema = getPageSchema();
        sendResponse(schema);
    } else {
        sendResponse({ status: 'unknown_type' });
    }
    return false; // Sync responses
});