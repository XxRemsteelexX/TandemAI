
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Server, 
  Plus, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Provider } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProviderConfigProps {
  providers: Provider[];
  onUpdateProviders: (providers: Provider[]) => void;
}

interface TestResult {
  success: boolean;
  error?: string;
  latency?: number;
}

export function ProviderConfig({ providers, onUpdateProviders }: ProviderConfigProps) {
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [testingProviders, setTestingProviders] = useState<Set<string>>(new Set());

  const defaultProvider: Omit<Provider, 'id'> = {
    name: 'New Provider',
    type: 'openai_compat',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.1:8b',
    enabled: true,
    maxTokens: 2048,
    timeout: 120000
  };

  const providerTypes = [
    { value: 'openai_compat', label: 'OpenAI Compatible (Local)' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'groq', label: 'Groq' },
    { value: 'together', label: 'Together AI' },
    { value: 'fireworks', label: 'Fireworks AI' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'kimi', label: 'Kimi (Moonshot)' }
  ];

  const addProvider = () => {
    const id = `provider-${Date.now()}`;
    const newProvider: Provider = { ...defaultProvider, id };
    setEditingProvider(newProvider);
  };

  const saveProvider = () => {
    if (!editingProvider) return;

    const existingIndex = providers.findIndex(p => p.id === editingProvider.id);
    let updatedProviders: Provider[];

    if (existingIndex >= 0) {
      updatedProviders = [...providers];
      updatedProviders[existingIndex] = editingProvider;
    } else {
      updatedProviders = [...providers, editingProvider];
    }

    onUpdateProviders(updatedProviders);
    setEditingProvider(null);
  };

  const cancelEdit = () => {
    setEditingProvider(null);
  };

  const deleteProvider = (id: string) => {
    onUpdateProviders(providers.filter(p => p.id !== id));
    if (editingProvider?.id === id) {
      setEditingProvider(null);
    }
  };

  const toggleProvider = (id: string) => {
    onUpdateProviders(providers.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const testProvider = async (provider: Provider) => {
    const providerId = provider.id;
    setTestingProviders(prev => new Set([...prev, providerId]));

    try {
      const response = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      });

      const result: TestResult = await response.json();
      setTestResults(prev => new Map([...prev, [providerId, result]]));
    } catch (error: any) {
      setTestResults(prev => new Map([...prev, [providerId, {
        success: false,
        error: error.message || 'Test failed'
      }]]));
    } finally {
      setTestingProviders(prev => {
        const next = new Set(prev);
        next.delete(providerId);
        return next;
      });
    }
  };

  const ProviderCard = ({ provider }: { provider: Provider }) => {
    const testResult = testResults.get(provider.id);
    const isTesting = testingProviders.has(provider.id);
    const isEditing = editingProvider?.id === provider.id;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className={`relative ${!provider.enabled ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <CardTitle className="text-sm">{provider.name}</CardTitle>
                <Badge variant={provider.enabled ? 'default' : 'secondary'} className="text-xs">
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProvider(provider)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testProvider(provider)}
                  disabled={isTesting}
                  className="h-8 w-8 p-0"
                >
                  {isTesting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <TestTube className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProvider(provider.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted-foreground">Type:</label>
                <p className="font-medium capitalize">{provider.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Model:</label>
                <p className="font-medium truncate">{provider.model}</p>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Base URL:</label>
              <p className="text-xs font-mono truncate">{provider.baseUrl}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={() => toggleProvider(provider.id)}
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground">
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              {testResult && (
                <div className="flex items-center gap-1">
                  {testResult.success ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        {testResult.latency}ms
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500">Failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {testResult && !testResult.success && testResult.error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {testResult.error}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <h3 className="text-lg font-medium">Providers</h3>
          <Badge variant="outline">{providers.length}</Badge>
        </div>
        <Button onClick={addProvider} size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Add Provider
        </Button>
      </div>

      {/* Provider List */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <AnimatePresence>
          {providers.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) cancelEdit();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">
                  {providers.find(p => p.id === editingProvider.id) ? 'Edit Provider' : 'Add Provider'}
                </h4>
                <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingProvider.name}
                    onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                    placeholder="Provider name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={editingProvider.type} 
                    onValueChange={(value: any) => setEditingProvider({ ...editingProvider, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providerTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Base URL</label>
                  <Input
                    value={editingProvider.baseUrl}
                    onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                    placeholder="http://localhost:11434/v1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Model</label>
                  <Input
                    value={editingProvider.model}
                    onChange={(e) => setEditingProvider({ ...editingProvider, model: e.target.value })}
                    placeholder="llama3.1:8b"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">API Key (optional)</label>
                  <Input
                    type="password"
                    value={editingProvider.apiKey || ''}
                    onChange={(e) => setEditingProvider({ ...editingProvider, apiKey: e.target.value || undefined })}
                    placeholder="sk-..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Tokens: {editingProvider.maxTokens}</label>
                  <Slider
                    value={[editingProvider.maxTokens]}
                    onValueChange={([value]) => setEditingProvider({ ...editingProvider, maxTokens: value })}
                    min={256}
                    max={8192}
                    step={256}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Timeout (seconds): {editingProvider.timeout / 1000}</label>
                  <Slider
                    value={[editingProvider.timeout / 1000]}
                    onValueChange={([value]) => setEditingProvider({ ...editingProvider, timeout: value * 1000 })}
                    min={30}
                    max={300}
                    step={30}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProvider.enabled}
                    onCheckedChange={(enabled) => setEditingProvider({ ...editingProvider, enabled })}
                  />
                  <span className="text-sm">Enabled</span>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveProvider} className="flex-1 gap-1">
                    <Save className="h-3 w-3" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEdit} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
