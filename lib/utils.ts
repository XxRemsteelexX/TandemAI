
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Diff calculation for orchestration early stopping
export interface DiffResult {
  ratio: number;
  added: string[];
  removed: string[];
}

export function calculateDiff(oldText: string, newText: string): DiffResult {
  if (!oldText || !newText) {
    return { ratio: 1.0, added: [], removed: [] };
  }

  // Simple word-based diff calculation
  const oldWords = oldText.toLowerCase().split(/\s+/);
  const newWords = newText.toLowerCase().split(/\s+/);

  const oldSet = new Set(oldWords);
  const newSet = new Set(newWords);

  const added = Array.from(newSet).filter(word => !oldSet.has(word));
  const removed = Array.from(oldSet).filter(word => !newSet.has(word));

  const totalWords = Math.max(oldWords.length, newWords.length);
  const changes = added.length + removed.length;
  const ratio = totalWords > 0 ? changes / totalWords : 0;

  return {
    ratio: Math.min(ratio, 1.0),
    added: added.slice(0, 10), // Limit for display
    removed: removed.slice(0, 10)
  };
}

// Local storage utilities
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

// Format utilities
export function formatTokenCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

// Validation utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Export utilities
export function exportToMarkdown(chatHistory: any[], metadata: any): string {
  const date = new Date().toISOString().split('T')[0];
  let markdown = `# TandemAI Chat Export\n\n`;
  markdown += `**Date:** ${date}\n`;
  markdown += `**Mode:** ${metadata.mode}\n`;
  markdown += `**Providers:** ${metadata.providers?.join(', ')}\n`;
  markdown += `**Total Tokens:** ${metadata.totalTokens}\n`;
  markdown += `**Total Time:** ${formatLatency(metadata.totalLatency)}\n\n`;
  
  markdown += `---\n\n`;
  
  chatHistory.forEach((chat, index) => {
    markdown += `## Session ${index + 1}\n\n`;
    markdown += `**User:** ${chat.userMessage}\n\n`;
    markdown += `**TandemAI Response:**\n${chat.response}\n\n`;
    
    if (chat.steps && chat.steps.length > 0) {
      markdown += `### Processing Steps\n\n`;
      chat.steps.forEach((step: any, stepIndex: number) => {
        markdown += `${stepIndex + 1}. **${step.provider_id}** (${formatLatency(step.response.latency_ms)}): ${step.response.text.substring(0, 100)}...\n`;
      });
      markdown += `\n`;
    }
  });
  
  return markdown;
}

export function downloadAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
