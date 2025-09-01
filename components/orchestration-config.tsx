
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  MessageSquare, 
  Target, 
  Sword, 
  BookOpen, 
  Settings, 
  Brain,
  GripVertical,
  X,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { OrchestrationConfig, Provider, OrchestrationMode } from '@/lib/types';
import { motion, Reorder } from 'framer-motion';
import { MODES, PRESETS } from '@/lib/config/defaultModes';

interface OrchestrationConfigProps {
  config: OrchestrationConfig;
  providers: Provider[];
  onUpdateConfig: (config: OrchestrationConfig) => void;
}

const MODE_INFO = {
  conversation: {
    icon: MessageSquare,
    title: 'Conversation',
    description: 'Natural chat with 3 models responding sequentially',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  answer: {
    icon: Target,
    title: 'Answer',
    description: 'Seed → Refine → Polish for best final answer',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  argumentative: {
    icon: Sword,
    title: 'Argumentative',
    description: 'Two models debate → Arbiter decides',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  research: {
    icon: BookOpen,
    title: 'Research',
    description: 'Outline → Suggestions → Rewrite for structured research',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
};

export function OrchestrationConfig({ config, providers, onUpdateConfig }: OrchestrationConfigProps) {
  const enabledProviders = providers.filter(p => p.enabled);
  
  const updateSequence = (newSequence: string[]) => {
    onUpdateConfig({ ...config, sequence: newSequence });
  };

  const addProviderToSequence = (providerId: string) => {
    if (!config.sequence.includes(providerId)) {
      updateSequence([...config.sequence, providerId]);
    }
  };

  const removeProviderFromSequence = (providerId: string) => {
    updateSequence(config.sequence.filter(id => id !== providerId));
  };

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    if (!preset) return;

    // Apply mode settings from MODES
    const modeConfig = MODES[preset.mode];
    if (modeConfig) {
      // Filter preset providers to only include enabled ones
      const availableProviders = preset.providers.filter(id => 
        providers.find(p => p.id === id && p.enabled)
      );
      
      onUpdateConfig({
        ...config,
        ...modeConfig,
        sequence: availableProviders.slice(0, preset.mode === 'conversation' ? 3 : 3)
      });
    }
  };

  const applyModeDefaults = (mode: OrchestrationMode) => {
    const modeConfig = MODES[mode];
    if (modeConfig) {
      // Keep current sequence but apply mode-specific settings
      onUpdateConfig({
        ...config,
        ...modeConfig,
        mode // Explicitly set the mode
      });
    }
  };

  const ModeCard = ({ mode, info }: { mode: OrchestrationMode; info: typeof MODE_INFO[keyof typeof MODE_INFO] }) => {
    const Icon = info.icon;
    const isSelected = config.mode === mode;
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className={`cursor-pointer transition-all ${
            isSelected 
              ? `ring-2 ring-primary ${info.bgColor}` 
              : 'hover:shadow-md'
          }`}
          onClick={() => applyModeDefaults(mode)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${info.bgColor}`}>
                <Icon className={`h-4 w-4 ${info.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{info.title}</h4>
                  {isSelected && <Badge variant="default" className="text-xs">Active</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Workflow className="h-4 w-4" />
          <h3 className="text-lg font-medium">Orchestration Mode</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(MODE_INFO).map(([mode, info]) => (
            <ModeCard key={mode} mode={mode as OrchestrationMode} info={info} />
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4" />
          <h3 className="text-lg font-medium">Quick Presets</h3>
          <Badge variant="secondary" className="text-xs">Recommended</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(PRESETS).map(([presetName, preset]) => {
            const availableCount = preset.providers.filter(id => 
              providers.find(p => p.id === id && p.enabled)
            ).length;
            
            return (
              <motion.div
                key={presetName}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => applyPreset(presetName)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {presetName === 'Local Privacy' && <Shield className="h-3 w-3 text-green-500" />}
                          {presetName === 'Speed First' && <Zap className="h-3 w-3 text-yellow-500" />}
                          {presetName === 'Max Quality' && <Star className="h-3 w-3 text-purple-500" />}
                          {presetName === 'Research Deep' && <Brain className="h-3 w-3 text-blue-500" />}
                          <h4 className="font-medium text-sm">{presetName}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {preset.mode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {availableCount}/{preset.providers.length} available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Provider Sequence */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h3 className="text-lg font-medium">Provider Sequence</h3>
            <Badge variant="outline">{config.sequence.length}</Badge>
          </div>
        </div>

        {/* Current Sequence */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Active Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            {config.sequence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No providers selected</p>
            ) : (
              <Reorder.Group
                axis="x"
                values={config.sequence}
                onReorder={updateSequence}
                className="flex gap-2 flex-wrap"
              >
                {config.sequence.map((providerId, index) => {
                  const provider = providers.find(p => p.id === providerId);
                  if (!provider) return null;

                  return (
                    <Reorder.Item
                      key={providerId}
                      value={providerId}
                      className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing"
                      whileDrag={{ scale: 1.05 }}
                    >
                      <span className="text-xs font-medium">#{index + 1}</span>
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{provider.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProviderFromSequence(providerId)}
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            )}
          </CardContent>
        </Card>

        {/* Available Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {enabledProviders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enabled providers</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {enabledProviders.map(provider => (
                  <Button
                    key={provider.id}
                    variant={config.sequence.includes(provider.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => addProviderToSequence(provider.id)}
                    disabled={config.sequence.includes(provider.id)}
                    className="text-xs"
                  >
                    {provider.name}
                    {config.sequence.includes(provider.id) && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        #{config.sequence.indexOf(provider.id) + 1}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Rounds: {config.rounds}</label>
              <Slider
                value={[config.rounds]}
                onValueChange={([value]) => onUpdateConfig({ ...config, rounds: value })}
                min={1}
                max={3}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Min Change Ratio: {(config.min_change_ratio * 100).toFixed(0)}%
              </label>
              <Slider
                value={[config.min_change_ratio * 100]}
                onValueChange={([value]) => onUpdateConfig({ 
                  ...config, 
                  min_change_ratio: value / 100 
                })}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Seed Temperature: {config.seed_temperature.toFixed(2)}
              </label>
              <Slider
                value={[config.seed_temperature * 100]}
                onValueChange={([value]) => onUpdateConfig({ 
                  ...config, 
                  seed_temperature: value / 100 
                })}
                min={1}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Refine Temperature: {config.refine_temperature.toFixed(2)}
              </label>
              <Slider
                value={[config.refine_temperature * 100]}
                onValueChange={([value]) => onUpdateConfig({ 
                  ...config, 
                  refine_temperature: value / 100 
                })}
                min={1}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Early Stop</p>
                <p className="text-xs text-muted-foreground">
                  Stop when change ratio falls below threshold
                </p>
              </div>
              <Switch
                checked={config.early_stop}
                onCheckedChange={(early_stop) => onUpdateConfig({ ...config, early_stop })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Thinking Mode</p>
                <p className="text-xs text-muted-foreground">
                  Show processing steps and intermediate results
                </p>
              </div>
              <Switch
                checked={config.thinking_mode}
                onCheckedChange={(thinking_mode) => onUpdateConfig({ ...config, thinking_mode })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Verifier (Coming Soon)</p>
                <p className="text-xs text-muted-foreground">
                  Use NLI model to verify factual claims
                </p>
              </div>
              <Switch
                checked={config.use_verifier}
                onCheckedChange={(use_verifier) => onUpdateConfig({ ...config, use_verifier })}
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Judge (Coming Soon)</p>
                <p className="text-xs text-muted-foreground">
                  Score responses and trigger extra refinement
                </p>
              </div>
              <Switch
                checked={config.use_judge}
                onCheckedChange={(use_judge) => onUpdateConfig({ ...config, use_judge })}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
