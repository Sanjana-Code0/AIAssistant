// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

// Allow opening the side panel on clicking the extension icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: any) => console.error(error));

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
  // Use a generic handler to manage async responses and errors robustly
  (async () => {
    try {
      // Logic handled in side-panel (App.tsx) or content script primarily.
      sendResponse({ status: 'received' });
    } catch (err: any) {
      sendResponse({ error: err.message });
    }
  })();
  return true;
});
