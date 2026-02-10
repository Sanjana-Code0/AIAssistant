import React, { useState, useEffect } from 'react';
import { SidebarHeader } from './components/SidebarHeader';
import { ChatTab } from './components/ChatTab';
import { SummarizeTab } from './components/SummarizeTab';
import { AccessibilityTab } from './components/AccessibilityTab';
import { NavigateTab } from './components/NavigateTab';
import { AccessibilityMode, ToolTab, NavStep } from './types';

// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>(ToolTab.ACCESSIBILITY);
  const [accessMode, setAccessMode] = useState<AccessibilityMode>(AccessibilityMode.NORMAL);
  const [activeStep, setActiveStep] = useState<NavStep | null>(null);
  const [pageInfo, setPageInfo] = useState({ title: 'Loading...', url: '' });
  const [pageContent, setPageContent] = useState('');

  const getFilterClass = () => {
    switch (accessMode) {
      case AccessibilityMode.HIGH_CONTRAST: return 'contrast(1.8) brightness(1.1)';
      case AccessibilityMode.DARK_MODE: return 'invert(1) hue-rotate(180deg)';
      case AccessibilityMode.GRAYSCALE: return 'grayscale(1)';
      case AccessibilityMode.PROTANOPIA: return 'url(#protanopia)';
      case AccessibilityMode.DEUTERANOPIA: return 'url(#deuteranopia)';
      case AccessibilityMode.TRITANOPIA: return 'url(#tritanopia)';
      default: return 'none';
    }
  };

  // Get current tab info on mount and on update
  const refreshPageData = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]) {
          setPageInfo({ title: tabs[0].title, url: tabs[0].url });

          // Request page content for summary/chat context
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SCRAPE_PAGE' }, (response: any) => {
              if (response) {
                // Store actual text for summarization
                setPageContent(response.pageText || '');

                // Re-apply filters on navigation
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'APPLY_CONTRAST',
                  filter: getFilterClass()
                });
              }
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    refreshPageData();

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const listener = (tabId: number, changeInfo: any, tab: any) => {
        if (changeInfo.status === 'complete' && tab.active) {
          refreshPageData();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      return () => chrome.tabs.onUpdated.removeListener(listener);
    }
  }, []);

  // Synchronize visual effects when mode changes
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'APPLY_CONTRAST',
            filter: getFilterClass()
          });
        }
      });
    }
  }, [accessMode]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.id) {
          if (activeStep) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'HIGHLIGHT_ELEMENT',
              selector: activeStep.selector
            });
          } else {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_HIGHLIGHT' });
          }
        }
      });
    }
  }, [activeStep]);

  return (
    <div
      className="w-[400px] h-[600px] bg-white flex flex-col font-sans border border-gray-200/50 shadow-2xl overflow-hidden"
      style={{ filter: getFilterClass() }}
    >
      <SidebarHeader />

      <div className="flex border-b border-gray-100 bg-white relative z-0">
        {[
          { id: ToolTab.ACCESSIBILITY, label: 'Accessibility', icon: 'eye' },
          { id: ToolTab.NAVIGATE, label: 'Navigation', icon: 'compass' },
          { id: ToolTab.SUMMARIZE, label: 'Intelligence', icon: 'sparkles' },
          { id: ToolTab.CHAT, label: 'Assistant', icon: 'chat-bubble-oval-left' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 flex flex-col items-center gap-2 transition-all relative overflow-hidden group ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
          >
            {/* Simple icon representation for now, normally use heroicons */}
            <span className={`text-xl transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {tab.icon === 'eye' && '👁️'}
              {tab.icon === 'compass' && '🧭'}
              {tab.icon === 'sparkles' && '✨'}
              {tab.icon === 'chat-bubble-oval-left' && '💬'}
            </span>
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>

            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 animate-in fade-in slide-in-from-left duration-300"></span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative bg-gray-50/30">
        <div className="absolute inset-0 overflow-y-auto">
          {activeTab === ToolTab.CHAT && <ChatTab pageContent={pageContent} />}
          {activeTab === ToolTab.SUMMARIZE && <SummarizeTab pageContent={pageContent} />}
          {activeTab === ToolTab.ACCESSIBILITY && <AccessibilityTab currentMode={accessMode} onModeChange={setAccessMode} />}
          {activeTab === ToolTab.NAVIGATE && (
            <NavigateTab
              currentPage={pageInfo.url}
              onStepActivate={setActiveStep}
              onPageChange={(url: string) => console.log("Navigation requested to", url)}
            />
          )}
        </div>
      </div>

      <div className="p-3 bg-white border-t border-gray-100 flex justify-between items-center px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">AI Engine: Gemini 3 Flash</span>
        </div>
        <button className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition">
          HOME
        </button>
      </div>
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
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
      </svg>
    </div>
  );
};

export default App;