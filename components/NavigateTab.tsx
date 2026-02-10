// Declare chrome for TypeScript in the global scope to fix compilation errors.
declare const chrome: any;

import React, { useState, useEffect } from 'react';
import { generateNavGuide } from '../services/geminiService';
import { NavStep } from '../types';

interface NavigateTabProps {
  currentPage: string;
  onStepActivate: (step: NavStep | null) => void;
  onPageChange: (page: string) => void;
}

export const NavigateTab: React.FC<NavigateTabProps> = ({ currentPage, onStepActivate, onPageChange }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<NavStep[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [feedbackMode, setFeedbackMode] = useState(false);

  const handleStepActivate = async (step: NavStep | null, execute = false) => {
    setActiveStepId(step ? step.selector : null);
    onStepActivate(step);

    if (step) {
      // Highlight first
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'HIGHLIGHT_ELEMENT',
            selector: step.selector
          }).catch((err: any) => {
            console.error("Messaging error:", err);
            // If messaging fails, the content script might not be injected.
          });

          if (execute) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'EXECUTE_ACTION',
              selector: step.selector,
              action: step.action
            }).then((res: any) => {
              if (res && res.error) {
                alert(`Action failed: ${res.error}`);
              }
            }).catch((err: any) => {
              console.error("Execution error:", err);
            });
          }
        }
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_HIGHLIGHT' });
        }
      });
    }
  };

  const handleStartTour = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setActiveStepId(null);
    onStepActivate(null);

    // Request page schema from Content Script
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: any) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SCRAPE_PAGE' }, async (schema: any) => {
            if (chrome.runtime.lastError) {
              setLoading(false);
              const errMsg = chrome.runtime.lastError.message;
              if (errMsg.includes("Could not establish connection")) {
                alert("Smart Assistant connection lost. Please refresh the page you want to navigate on.");
              } else {
                alert(`Error: ${errMsg}`);
              }
              return;
            }
            if (!schema) {
              setLoading(false);
              alert("Could not scrape page. Please refresh the page and try again.");
              return;
            }
            try {
              const pageSchema = JSON.stringify(schema, null, 2);
              const tourSteps = await generateNavGuide(goal, currentPage, pageSchema);
              setSteps(tourSteps);
            } catch (error: any) {
              console.error(error);
              alert(error.message || "AI failed to generate navigation steps.");
            } finally {
              setLoading(false);
            }
          });
        }
      });
    } else {
      setLoading(false);
      console.warn("Chrome API not available");
    }
  };

  const handleCloseNavigation = () => {
    setSteps([]);
    setActiveStepId(null);
    setGoal('');
    onStepActivate(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_HIGHLIGHT' });
      }
    });
  };

  if (feedbackMode) {
    return (
      <div className="p-10 flex flex-col items-center justify-center h-full text-center space-y-4 font-sans">
        <div className="text-4xl">🛠️</div>
        <h3 className="font-bold text-gray-900">Report an Issue</h3>
        <p className="text-sm text-gray-500">Is the navigation not working? Describe the problem and we'll improve.</p>
        <textarea className="w-full p-3 border rounded-xl text-sm h-32" placeholder="e.g., The 'Login' button wasn't found..."></textarea>
        <div className="flex gap-2 w-full">
          <button onClick={() => setFeedbackMode(false)} className="flex-1 py-3 border rounded-xl font-bold text-sm">Cancel</button>
          <button onClick={() => setFeedbackMode(false)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <div className="p-5 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-gray-50/50">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Natural Navigation</h3>
          {steps.length > 0 && (
            <button
              onClick={handleCloseNavigation}
              className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-black hover:bg-red-100 transition-colors uppercase tracking-widest"
            >
              CLOSE
            </button>
          )}
        </div>
        <button
          onClick={() => setFeedbackMode(true)}
          className="text-[10px] text-gray-400 hover:text-indigo-600 font-bold"
        >
          REPORT ERROR
        </button>
      </div>

      <div className="px-5 pb-5 space-y-4 flex-1 overflow-y-auto border-t border-gray-50 pt-4">
        {/* Goal Input */}
        <div className="relative group">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartTour()}
            placeholder="Where do you want to go?"
            className="w-full pl-4 pr-16 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm transition-all outline-none"
          />
          <button
            onClick={handleStartTour}
            disabled={loading || !goal}
            className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? '...' : 'GO'}
          </button>
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Scanning Page Context...</p>
          </div>
        )}

        {steps.length > 0 && (
          <div className="space-y-3 pt-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeStepId === step.selector
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/10'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                onClick={() => handleStepActivate(step)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${activeStepId === step.selector ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-gray-900 leading-tight">{step.instruction}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                        {step.action}
                      </span>
                      {step.contextHint && (
                        <span className="text-[9px] text-gray-400 font-medium line-clamp-1">
                          • {step.contextHint}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeStepId === step.selector && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepActivate(step, true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm shrink-0"
                    >
                      EXECUTE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && steps.length === 0 && (
          <div className="py-12 px-6 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-2xl opacity-20">🗺️</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-50 rounded-xl border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-indigo-600 text-lg">✨</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Smart Assistant Active</p>
              <p className="text-[11px] text-gray-400 leading-relaxed px-4">Enter a destination above and I'll guide you through the interface step-by-step.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
