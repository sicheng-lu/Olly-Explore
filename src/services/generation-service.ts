import type { CanvasPage } from '@/types';

export interface GenerationResult {
  content: string;
  error?: string;
}

const activeGenerations = new Map<string, AbortController>();

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Generation cancelled', 'AbortError'));
    });
  });
}

export const GenerationService = {
  async generateSummary(workspacePages: CanvasPage[]): Promise<GenerationResult> {
    const pageId = workspacePages.find((p) => p.type === 'summary')?.id ?? 'summary';
    const controller = new AbortController();
    activeGenerations.set(pageId, controller);

    try {
      await delay(2000, controller.signal);

      const pageTitles = workspacePages.map((p) => p.title).join(', ');
      return {
        content: `Summary of ${workspacePages.length} workspace pages: ${pageTitles}`,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { content: '', error: 'Generation was cancelled' };
      }
      return { content: '', error: 'Failed to generate summary' };
    } finally {
      activeGenerations.delete(pageId);
    }
  },

  async generateDashboard(workspacePages: CanvasPage[]): Promise<GenerationResult> {
    const pageId = workspacePages.find((p) => p.type === 'dashboard')?.id ?? 'dashboard';
    const controller = new AbortController();
    activeGenerations.set(pageId, controller);

    try {
      await delay(2500, controller.signal);

      return {
        content: `Dashboard metrics generated from ${workspacePages.length} pages`,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { content: '', error: 'Generation was cancelled' };
      }
      return { content: '', error: 'Failed to generate dashboard' };
    } finally {
      activeGenerations.delete(pageId);
    }
  },

  cancelGeneration(pageId: string): void {
    const controller = activeGenerations.get(pageId);
    if (controller) {
      controller.abort();
      activeGenerations.delete(pageId);
    }
  },
};
