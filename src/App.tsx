import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OllyStateProvider } from '@/contexts/OllyStateContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { TimelineProvider } from '@/contexts/TimelineContext';
import { HomePage } from '@/pages/HomePage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <HashRouter>
      <OllyStateProvider>
        <WorkspaceProvider>
          <TimelineProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
              <Route path="/investigate" element={<HomePage investigatingOverride />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </TimelineProvider>
        </WorkspaceProvider>
      </OllyStateProvider>
    </HashRouter>
  );
}

export default App;
