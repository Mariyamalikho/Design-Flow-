import { useFormContext } from "react-hook-form";
import type { BriefWizardFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { Printer, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BriefSummary() {
  const [copied, setCopied] = useState(false);
  const { getValues } = useFormContext<BriefWizardFormValues>();
  const data = getValues();

  const handleCopy = () => {
    const text = `Client: ${data.companyName}\nBackground: ${data.companyBackground}\n\nTarget Audience: ${data.primaryAudience}\n\nDeliverables: ${data.requiredDeliverables}\nTimeline: ${data.timeline}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Brief copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 print-container bg-white dark:bg-zinc-900 p-0 sm:p-8 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Brief Summary</h2>
          <p className="text-sm text-zinc-500 print-hide">Review your design brief before saving.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="print-hide">
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print-hide">
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="space-y-8 text-sm">
        {/* Client Info */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Client Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500 mb-1">Company Name</p>
              <p className="font-medium">{data.companyName}</p>
            </div>
            {data.contactName && (
              <div>
                <p className="text-zinc-500 mb-1">Contact Name</p>
                <p className="font-medium">{data.contactName}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-zinc-500 mb-1">Background</p>
              <p className="font-medium whitespace-pre-wrap">{data.companyBackground}</p>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Target Audience</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-zinc-500 mb-1">Primary Audience</p>
              <p className="font-medium whitespace-pre-wrap">{data.primaryAudience}</p>
            </div>
            {data.audiencePainPoints && (
              <div>
                <p className="text-zinc-500 mb-1">Pain Points</p>
                <p className="font-medium whitespace-pre-wrap">{data.audiencePainPoints}</p>
              </div>
            )}
            {data.competitors && (
              <div>
                <p className="text-zinc-500 mb-1">Competitors</p>
                <p className="font-medium whitespace-pre-wrap">{data.competitors}</p>
              </div>
            )}
          </div>
        </section>

        {/* Brand Personality */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Brand Personality</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-zinc-500 mb-1">Brand Tone</p>
              <p className="font-medium whitespace-pre-wrap">{data.brandTone}</p>
            </div>
            {data.coreValues && (
              <div>
                <p className="text-zinc-500 mb-1">Core Values</p>
                <p className="font-medium whitespace-pre-wrap">{data.coreValues}</p>
              </div>
            )}
            {data.visualPreferences && (
              <div>
                <p className="text-zinc-500 mb-1">Visual Preferences</p>
                <p className="font-medium whitespace-pre-wrap">{data.visualPreferences}</p>
              </div>
            )}
          </div>
        </section>

        {/* Deliverables */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Scope & Deliverables</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <p className="text-zinc-500 mb-1">Required Deliverables</p>
              <p className="font-medium whitespace-pre-wrap">{data.requiredDeliverables}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Timeline</p>
              <p className="font-medium">{data.timeline}</p>
            </div>
            {data.budget && (
              <div>
                <p className="text-zinc-500 mb-1">Budget</p>
                <p className="font-medium">{data.budget}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
