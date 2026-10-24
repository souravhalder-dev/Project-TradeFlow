'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, User, ShieldCheck } from 'lucide-react';

export default function BuyerMessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const d = await res.json();
        setConversations(d.conversations || []);
        if (d.conversations?.length > 0 && !activeConvId) {
          setActiveConvId(d.conversations[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage('');
        await loadMessages(activeConvId);
      }
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-brand-orange" />
          <span>Manufacturer Communications</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct authenticated messages, RFQ inquiries, and order negotiations.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r divide-y overflow-y-auto max-h-[600px] text-xs">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No active conversations.</div>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants?.find((p: any) => p.userId !== user?.id)?.user;
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex flex-col space-y-1 ${
                    isSelected ? 'bg-amber-50/60 border-l-4 border-brand-orange' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 truncate">
                      {other?.name || other?.email || 'Supplier'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="font-medium text-slate-700 truncate">{conv.subject || 'Inquiry'}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {conv.messages?.[0]?.content || 'Start conversation...'}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Message Thread (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between h-[600px] bg-slate-50/30">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{activeConv.subject || 'Direct Inquiry'}</div>
                  <div className="text-slate-400 text-[11px]">
                    Linked to: {activeConv.product ? activeConv.product.name : activeConv.rfq ? activeConv.rfq.title : 'Marketplace'}
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-3 text-xs shadow-sm space-y-1 ${
                        isMine ? 'bg-brand-orange text-white' : 'bg-white border text-slate-800'
                      }`}>
                        <div className={`text-[10px] font-bold ${isMine ? 'text-orange-200' : 'text-slate-500'}`}>
                          {msg.sender?.name || (isMine ? 'You' : 'Supplier')}
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[9px] text-right ${isMine ? 'text-orange-200' : 'text-slate-400'}`}>
                          {formatDateTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message to the manufacturer..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-orange"
                />
                <Button type="submit" variant="brand" size="sm" disabled={isSending} className="font-bold">
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to read message history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
