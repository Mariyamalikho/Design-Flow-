import { useState, KeyboardEvent } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { ClientInfoForm } from "@/components/wizard/ClientInfoForm";
import { TargetAudienceForm } from "@/components/wizard/TargetAudienceForm";
import { BrandPersonalityForm } from "@/components/wizard/BrandPersonalityForm";
import { DeliverablesForm } from "@/components/wizard/DeliverablesForm";
import { briefWizardSchema, brandPersonalitySchema, deliverablesSchema, clientInfoSchema, targetAudienceSchema, type BriefWizardFormValues } from "@/lib/schemas";

const steps = [
  { id: "client-info", title: "Client Info", fields: Object.keys(clientInfoSchema.shape) },
  { id: "target-audience", title: "Target Audience", fields: Object.keys(targetAudienceSchema.shape) },
  { id: "brand-personality", title: "Brand Personality", fields: Object.keys(brandPersonalitySchema.shape) },
  { id: "deliverables", title: "Deliverables", fields: Object.keys(deliverablesSchema.shape) },
  { id: "summary", title: "Summary", fields: [] }
];

export default function BriefWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const methods = useForm<BriefWizardFormValues>({
    resolver: zodResolver(briefWizardSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      contactName: "",
      companyBackground: "",
      primaryAudience: "",
      audiencePainPoints: "",
      competitors: "",
      brandTone: "",
      coreValues: "",
      visualPreferences: "",
      requiredDeliverables: "",
      timeline: "",
      budget: "",
    }
  });

  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStepIndex].fields as any;
    const isStepValid = await methods.trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLFormElement>) => {
    // Check if the user is typing in a textarea
    if ((e.target as HTMLElement).tagName.toLowerCase() === "textarea") {
      return; // Allow multiline breaks in textareas
    }
    
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission or triggering the wrong button
      if (currentStepIndex < steps.length - 1) {
        await nextStep();
      } else {
        methods.handleSubmit((data) => console.log(data))();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="px-8 py-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create Design Brief</h1>
            <Button variant="ghost" className="text-zinc-500">Save as Draft</Button>
          </div>
          
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <li key={step.title} className={`relative ${index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""}`}>
                    <div className="flex items-center">
                      <div className={`
                        flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300
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
                        <div className={`hidden sm:block ml-4 h-0.5 w-12 transition-colors duration-500 ${isCompleted ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`} />
                      )}
                    </div>
                    <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap hidden sm:block transition-colors ${isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"}`}>
                      {step.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
          
          <div className="mt-8 h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden sm:hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((data) => console.log(data))} onKeyDown={handleKeyDown}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm min-h-[400px]">
                {currentStepIndex === 0 && <ClientInfoForm />}
                {currentStepIndex === 1 && <TargetAudienceForm />}
                {currentStepIndex === 2 && <BrandPersonalityForm />}
                {currentStepIndex === 3 && <DeliverablesForm />}
                {currentStepIndex > 3 && (
                  <div className="h-full flex items-center justify-center text-zinc-400 border-dashed border rounded-lg p-12">
                    <p>Summary View will go here (Day 32)</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex items-center justify-between">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                {currentStepIndex < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Check className="mr-2 h-4 w-4" /> Complete Brief
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
