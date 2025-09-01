
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Settings, 
  Download, 
  Trash2, 
  Workflow,
  Bot,
  Server,
  Brain,
  Info
} from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { ProviderConfig } from './provider-config';
import { OrchestrationConfig } from './orchestration-config';
import { Provider, OrchestrationConfig as ConfigType, TandemAIConfig, StreamEvent } from '@/lib/types';
import { saveConfig, loadConfig, getChatHistory, clearChatHistory } from '@/lib/storage';
import { exportToMarkdown, downloadAsFile } from '@/lib/utils';
import { motion } from 'framer-motion';

export function TandemAI() {
  const [config, setConfig] = useState<TandemAIConfig | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);

  // Load configuration on mount
  useEffect(() => {
    const loadedConfig = loadConfig();
    setConfig(loadedConfig);
  }, []);

  // Save configuration whenever it changes
  useEffect(() => {
    if (config) {
      saveConfig(config);
    }
  }, [config]);

  const updateProviders = (providers: Provider[]) => {
    if (!config) return;
    
    const newConfig = { ...config, providers };
    // Update sequence to only include enabled providers that still exist
    const validProviderIds = providers.filter(p => p.enabled).map(p => p.id);
    const filteredSequence = newConfig.orchestration.sequence.filter(id => 
      validProviderIds.includes(id)
    );
    
    setConfig({
      ...newConfig,
      orchestration: {
        ...newConfig.orchestration,
        sequence: filteredSequence
      }
    });
  };

  const updateOrchestrationConfig = (orchestration: ConfigType) => {
    if (!config) return;
    setConfig({ ...config, orchestration });
  };

  const handleStreamEvent = (event: StreamEvent) => {
    setStreamEvents(prev => [...prev.slice(-50), event]); // Keep last 50 events
  };

  const exportChatHistory = () => {
    const history = getChatHistory();
    if (history.length === 0) {
      alert('No chat history to export');
      return;
    }

    const metadata = {
      mode: config?.orchestration.mode || 'unknown',
      providers: config?.providers.filter(p => p.enabled).map(p => p.name) || [],
      totalTokens: history.reduce((sum, chat) => sum + (chat.metadata?.totalTokens || 0), 0),
      totalLatency: history.reduce((sum, chat) => sum + (chat.metadata?.totalLatency || 0), 0)
    };

    const markdown = exportToMarkdown(history, metadata);
    const date = new Date().toISOString().split('T')[0];
    downloadAsFile(markdown, `tandem-ai-export-${date}.md`, 'text/markdown');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      clearChatHistory();
      alert('Chat history cleared');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Loading TandemAI...</p>
        </div>
      </div>
    );
  }

  const enabledProviders = config.providers.filter(p => p.enabled);
  const validSequence = config.orchestration.sequence.filter(id =>
    enabledProviders.some(p => p.id === id)
  );
  const isConfigValid = validSequence.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-2">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TandemAI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Local-first LLM ensemble orchestration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Server className="h-3 w-3" />
                {enabledProviders.length} providers
              </Badge>
              <Badge variant="outline" className="gap-1 capitalize">
                <Workflow className="h-3 w-3" />
                {config.orchestration.mode}
              </Badge>
              {!isConfigValid && (
                <Badge variant="destructive" className="gap-1">
                  <Info className="h-3 w-3" />
                  Setup Required
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <Server className="h-4 w-4" />
              Providers
              <Badge variant="secondary" className="text-xs">
                {config.providers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="orchestration" className="gap-2">
              <Brain className="h-4 w-4" />
              Orchestration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            {!isConfigValid ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-8 text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Setup Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure at least 2 enabled providers and set up your orchestration sequence to start chatting.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setActiveTab('providers')} className="gap-1">
                      <Server className="h-4 w-4" />
                      Configure Providers
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('orchestration')} 
                      variant="outline" 
                      className="gap-1"
                    >
                      <Brain className="h-4 w-4" />
                      Setup Orchestration
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[calc(100vh-200px)]"
              >
                <Card className="h-full flex flex-col overflow-hidden">
                  <ChatInterface
                    providers={config.providers}
                    config={config.orchestration}
                    onStreamEvent={handleStreamEvent}
                  />
                </Card>
              </motion.div>
            )}

            {/* Chat Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportChatHistory}
                className="gap-1"
              >
                <Download className="h-3 w-3" />
                Export History
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearHistory}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Clear History
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProviderConfig
                providers={config.providers}
                onUpdateProviders={updateProviders}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="orchestration">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <OrchestrationConfig
                config={config.orchestration}
                providers={config.providers}
                onUpdateConfig={updateOrchestrationConfig}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t bg-background/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            TandemAI - Orchestrate local LLMs for better responses.{' '}
            <span className="text-primary font-medium">
              Privacy-first, offline-capable AI ensemble platform.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
