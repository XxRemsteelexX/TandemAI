
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Clock, Zap, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { ChatMessage, OrchestrationResult, StreamEvent, Provider, OrchestrationConfig } from '@/lib/types';
import { formatTokenCount, formatLatency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  providers: Provider[];
  config: OrchestrationConfig;
  onStreamEvent?: (event: StreamEvent) => void;
}

interface ChatSession {
  id: string;
  userMessage: string;
  response?: string;
  steps?: any[];
  isLoading: boolean;
  timestamp: number;
  error?: string;
}

export function ChatInterface({ providers, config, onStreamEvent }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamEvent, setCurrentStreamEvent] = useState<StreamEvent | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showThinking, setShowThinking] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentStreamEvent]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const sessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: sessionId,
      userMessage: input.trim(),
      isLoading: true,
      timestamp: Date.now()
    };

    setSessions(prev => [...prev, newSession]);
    setInput('');
    setIsProcessing(true);
    setCurrentStreamEvent(null);

    try {
      const messages: ChatMessage[] = [
        { role: 'user', content: newSession.userMessage }
      ];

      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, config, providers })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let steps: any[] = [];
      let finalResult: OrchestrationResult | null = null;

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: null };
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const event: StreamEvent = JSON.parse(data);
              setCurrentStreamEvent(event);
              onStreamEvent?.(event);

              if (event.type === 'round_result' && event.result) {
                steps.push({
                  round: event.round,
                  provider_id: event.provider_id,
                  result: event.result
                });
              } else if (event.type === 'final' && event.final_result) {
                finalResult = event.final_result;
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Unknown error');
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      // Update session with final result
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              response: finalResult?.final_answer || 'No response received',
              steps: finalResult?.steps || steps,
              isLoading: false
            }
          : session
      ));

    } catch (error: any) {
      console.error('Chat error:', error);
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              error: error.message || 'Something went wrong',
              isLoading: false
            }
          : session
      ));
    } finally {
      setIsProcessing(false);
      setCurrentStreamEvent(null);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* User Message */}
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <Card className="flex-1 bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm">{session.userMessage}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assistant Response */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/10 rounded-full p-2">
                  {session.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : (
                    <Bot className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <Card className="flex-1">
                  <CardContent className="p-4">
                    {session.error ? (
                      <p className="text-sm text-destructive">{session.error}</p>
                    ) : session.response ? (
                      <div>
                        {config.mode === 'conversation' && session.steps && session.steps.length > 0 ? (
                          // In conversation mode, show the actual conversation flow instead of summary
                          <div className="space-y-4">
                            {session.steps.map((step, index) => (
                              <div key={index} className="border-l-2 border-muted pl-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {step.provider_id}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatLatency(step.response?.latency_ms || 0)}
                                  </div>
                                </div>
                                <div className="text-sm whitespace-pre-wrap">
                                  {step.response?.text || 'No response'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{session.response}</p>
                        )}
                        {session.steps && session.steps.length > 0 && showThinking && config.mode !== 'conversation' && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs font-medium text-muted-foreground">
                                AI Reasoning Steps
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowThinking(!showThinking)}
                                className="h-6 px-2 text-xs"
                              >
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {session.steps.map((step, index) => {
                                const stepId = `${session.id}-${index}`;
                                const isExpanded = expandedSteps.has(stepId);
                                const hasFullText = step.response?.text && step.response.text.length > 200;
                                
                                return (
                                  <div key={index} className="bg-muted/30 rounded-lg p-3 border">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge variant="outline" className="text-xs">
                                        Round {step.round}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {step.provider_id}
                                      </Badge>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatLatency(step.response?.latency_ms || 0)}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Zap className="h-3 w-3" />
                                        {formatTokenCount(step.response?.usage?.total_tokens || 0)}
                                      </div>
                                      {step.diff && (
                                        <Badge variant="outline" className="text-xs">
                                          {(step.diff.ratio * 100).toFixed(1)}% change
                                        </Badge>
                                      )}
                                      {hasFullText && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleStepExpansion(stepId)}
                                          className="h-6 w-6 p-0 ml-auto"
                                        >
                                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </Button>
                                      )}
                                    </div>
                                    
                                    <div className="text-sm bg-background/50 rounded p-3 font-mono">
                                      {isExpanded || !hasFullText ? (
                                        <p className="whitespace-pre-wrap text-xs leading-relaxed">
                                          {step.response?.text || 'No response text'}
                                        </p>
                                      ) : (
                                        <div>
                                          <p className="text-xs leading-relaxed text-muted-foreground">
                                            {step.response?.text?.substring(0, 200)}...
                                          </p>
                                          <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => toggleStepExpansion(stepId)}
                                            className="h-auto p-0 text-xs text-blue-500 hover:text-blue-600"
                                          >
                                            Show full response
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {session.steps && session.steps.length > 0 && !showThinking && config.mode !== 'conversation' && (
                          <div className="mt-4 pt-4 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowThinking(true)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Show AI reasoning steps ({session.steps.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : session.isLoading ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Orchestrating {config.sequence.length} models in {config.mode} mode...
                        </p>
                        {currentStreamEvent && (
                          <div className="flex items-center gap-2">
                            {currentStreamEvent.type === 'round_start' && (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs text-muted-foreground">
                                  Round {currentStreamEvent.round}: {currentStreamEvent.provider_id}
                                </span>
                              </>
                            )}
                            {currentStreamEvent.type === 'diff' && currentStreamEvent.diff && (
                              <span className="text-xs text-muted-foreground">
                                Change detected: {(currentStreamEvent.diff.ratio * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask your question... (Shift+Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="lg"
              className="shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick Mode Info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {config.mode}
            </Badge>
            <span>•</span>
            <span>{config.sequence.length} models</span>
            <span>•</span>
            <span>{config.rounds} rounds</span>
            {config.early_stop && (
              <>
                <span>•</span>
                <span>Early stop enabled</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
