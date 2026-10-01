import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ErrorBoundary><AppLayout /></ErrorBoundary>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />`n          <Route path="projects/:id" element={<ProjectDetail />} />`n          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
