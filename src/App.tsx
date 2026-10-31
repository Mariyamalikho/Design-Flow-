import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteLoadingFallback } from "@/components/RouteLoadingFallback";

// Lazy-loaded route components for on-demand bundle splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const BriefWizard = lazy(() => import("@/pages/BriefWizard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Notes = lazy(() => import("@/pages/Notes"));
const Canvas = lazy(() => import("@/pages/Canvas"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ErrorBoundary><AppLayout /></ErrorBoundary>}>
          <Route
            index
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Projects />
              </Suspense>
            }
          />
          <Route
            path="projects/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ProjectDetail />
              </Suspense>
            }
          />
          <Route
            path="briefs"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <BriefWizard />
              </Suspense>
            }
          />
          <Route
            path="tasks"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Tasks />
              </Suspense>
            }
          />
          <Route
            path="notes"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Notes />
              </Suspense>
            }
          />
          <Route
            path="notes/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Notes />
              </Suspense>
            }
          />
          <Route
            path="canvas"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Canvas />
              </Suspense>
            }
          />
          <Route
            path="canvas/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Canvas />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
