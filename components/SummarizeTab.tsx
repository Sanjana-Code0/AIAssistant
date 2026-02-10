
import React, { useState } from 'react';
import { summarizePage, repurposeContent } from '../services/geminiService';
import { SummaryResult } from '../types';

interface SummarizeTabProps {
  pageContent: string;
}

export const SummarizeTab: React.FC<SummarizeTabProps> = ({ pageContent }) => {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [repurposeResult, setRepurposeResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (mode: 'full' | 'short' | 'eli5') => {
    setLoading(true);
    setRepurposeResult(null);
    try {
      const res = await summarizePage(pageContent, mode);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepurpose = async (format: 'tweet' | 'blog' | 'article') => {
    setLoading(true);
    setResult(null);
    try {
      const res = await repurposeContent(pageContent, format);
      setRepurposeResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 space-y-8 overflow-y-auto h-full bg-white font-sans">
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">📝</div>
          Summarization
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'full', label: 'Full Summary', icon: '📄' },
            { id: 'short', label: 'Short', icon: '⚡' },
            { id: 'eli5', label: 'Simple', icon: '🧒' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSummarize(mode.id as any)}
              disabled={loading}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all duration-200 bg-white min-h-[100px]"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{mode.icon}</span>
              <span className="text-[11px] font-bold text-gray-700 group-hover:text-indigo-600">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xs">✨</div>
          Repurpose Content
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'tweet', label: 'Tweets', icon: '🐦' },
            { id: 'blog', label: 'Blog Post', icon: '✍️' },
            { id: 'article', label: 'Article', icon: '📑' }
          ].map((format) => (
            <button
              key={format.id}
              onClick={() => handleRepurpose(format.id as any)}
              disabled={loading}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all duration-200 bg-white min-h-[100px]"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{format.icon}</span>
              <span className="text-[11px] font-bold text-gray-700 group-hover:text-purple-600">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs font-bold text-indigo-900 animate-pulse">Generating Insights...</p>
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
            <h4 className="font-bold text-indigo-900 mb-3 text-lg leading-tight">{result.title}</h4>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed font-medium">{result.content}</p>
            {result.keyTakeaways.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Key Takeaways</h5>
                <ul className="space-y-3">
                  {result.keyTakeaways.map((point, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600 items-start">
                      <span className="text-indigo-500 font-bold mt-1">•</span>
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setResult(null)} className="mt-4 w-full py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100/50 rounded-xl transition">Clear Result</button>
          </div>
        ) : repurposeResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-purple-900 text-sm">Generated Content</h4>
              <button
                onClick={() => navigator.clipboard.writeText(repurposeResult)}
                className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition"
              >
                Copy Text
              </button>
            </div>
            <div className="relative bg-gray-50 p-6 rounded-2xl border border-gray-200/60 shadow-inner max-h-[300px] overflow-y-auto">
              <div className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{repurposeResult}</div>
            </div>
            <button onClick={() => setRepurposeResult(null)} className="mt-4 w-full py-3 text-xs font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition uppercase tracking-widest">Clear Result</button>
          </div>
        ) : (
          <div className="text-center py-12 opacity-40 select-none">
            <div className="text-5xl mb-4 filter grayscale contrast-50">📥</div>
            <p className="text-xs font-bold text-gray-400">Select an option above to generate insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};
