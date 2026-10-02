import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { id: "client-info", title: "Client Info" },
  { id: "target-audience", title: "Target Audience" },
  { id: "brand-personality", title: "Brand Personality" },
  { id: "deliverables", title: "Deliverables" },
  { id: "summary", title: "Summary" }
];

export default function BriefWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header & Progress Bar */}
      <header className="px-8 py-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create Design Brief</h1>
            <Button variant="ghost" className="text-zinc-500">Save as Draft</Button>
          </div>
          
          {/* Step Navigator */}
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <li key={step.title} className={`relative ${index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""}`}>
                    <div className="flex items-center">
                      <div className={`
                        flex h-8 w-8 items-center justify-center rounded-full border-2 
                        ${isCompleted ? "border-indigo-600 bg-indigo-600" : isCurrent ? "border-indigo-600 bg-white dark:bg-zinc-950" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"}
                      `}>
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-white" aria-hidden="true" />
                        ) : (
                          <span className={`text-sm font-medium ${isCurrent ? "text-indigo-600" : "text-zinc-500"}`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index !== steps.length - 1 && (
                        <div className={`hidden sm:block ml-4 h-0.5 w-12 ${isCompleted ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                      )}
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-zinc-500 whitespace-nowrap hidden sm:block">
                      {step.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
          
          {/* Continuous Progress Bar (Mobile mostly) */}
          <div className="mt-8 h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden sm:hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm h-[400px] flex items-center justify-center text-zinc-400 border-dashed">
            <p>Form content for <strong>{steps[currentStepIndex].title}</strong> will go here (Days 30-31)</p>
          </div>
          
          {/* Footer Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex === steps.length - 1}
            >
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
