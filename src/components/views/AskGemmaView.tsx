'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { askGemmaAssistant } from '../../lib/openrouter';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemma';
  text: string;
  timestamp: string;
}

export const AskGemmaView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'gemma',
      text: "Hello! I am Gemma, your Kindra AI assistant. How can I help you today with civic issue reporting, volunteer events, or Karma rewards?",
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery('');
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.text,
    }));

    // Call Gemma AI model with full context system prompt and conversation history
    const gemmaResponse = await askGemmaAssistant(currentQuery, history);

    const gemmaMsg: ChatMessage = {
      id: `m-${Date.now() + 1}`,
      sender: 'gemma',
      text: gemmaResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, gemmaMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-md py-md px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto w-full h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold shadow-md">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
              Ask Gemma AI Assistant
              <span className="text-xs bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-semibold">
                Online (Gemma 4 26B)
              </span>
            </h1>
            <p className="text-xs text-on-surface-variant">
              Instant answers for civic reports, municipal guidelines, and community initiatives.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <Card className="flex-1 flex flex-col justify-between p-md border-outline-variant/30 overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-md pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  msg.sender === 'user'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-primary-container text-on-primary'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <span className="material-symbols-outlined text-base">auto_awesome</span>}
              </div>

              <div
                className={`flex flex-col gap-1 p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-container text-on-primary rounded-tr-none'
                    : 'bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/30'
                }`}
              >
                <span>{msg.text}</span>
                <span
                  className={`text-[10px] self-end mt-1 opacity-70 ${
                    msg.sender === 'user' ? 'text-primary-fixed-dim' : 'text-on-surface-variant'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto items-center text-xs text-on-surface-variant animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              </div>
              <span>Gemma is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-md border-t border-outline-variant/30 mt-sm">
          <Input
            placeholder="Ask Gemma anything about civic issues, Karma points, or volunteer events..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            icon="send"
            disabled={isLoading || !inputQuery.trim()}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
