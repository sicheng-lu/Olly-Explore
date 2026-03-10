import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OllyStateProvider } from '@/contexts/OllyStateContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { HomePage } from '@/pages/HomePage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <OllyStateProvider>
        <WorkspaceProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
            <Route path="/investigate" element={<HomePage investigatingOverride />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </WorkspaceProvider>
      </OllyStateProvider>
    </BrowserRouter>
  );
}

export default App;
