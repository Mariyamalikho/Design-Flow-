import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function DeliverablesForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Scope & Deliverables</h2>
        <p className="text-sm text-zinc-500">What exactly needs to be delivered, by when, and for how much?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requiredDeliverables">Required Deliverables *</Label>
          <Textarea 
            id="requiredDeliverables" 
            placeholder="e.g. Logo suite, Brand guidelines, 3 social media templates..." 
            className={`min-h-[120px] ${errors.requiredDeliverables ? "border-red-500" : ""}`}
            {...register("requiredDeliverables")} 
          />
          {errors.requiredDeliverables && <p className="text-sm text-red-500">{errors.requiredDeliverables.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline / Deadline *</Label>
          <Input 
            id="timeline" 
            placeholder="e.g. 4 weeks, or MM/DD/YYYY" 
            className={errors.timeline ? "border-red-500" : ""}
            {...register("timeline")} 
          />
          {errors.timeline && <p className="text-sm text-red-500">{errors.timeline.message as string}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="budget">Budget (Optional)</Label>
          <Input 
            id="budget" 
            placeholder="e.g. $5,000 - $10,000" 
            {...register("budget")} 
          />
        </div>
      </div>
    </div>
  );
}
