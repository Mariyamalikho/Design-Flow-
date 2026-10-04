import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function TargetAudienceForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Target Audience</h2>
        <p className="text-sm text-zinc-500">Who is this brand trying to reach?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryAudience">Primary Audience *</Label>
          <Textarea 
            id="primaryAudience" 
            placeholder="e.g. Millennials aged 25-34 looking for eco-friendly products..." 
            className={`min-h-[100px] ${errors.primaryAudience ? "border-red-500" : ""}`}
            {...register("primaryAudience")} 
          />
          {errors.primaryAudience && <p className="text-sm text-red-500">{errors.primaryAudience.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audiencePainPoints">Audience Pain Points</Label>
          <Textarea 
            id="audiencePainPoints" 
            placeholder="What problems does the audience face that this brand solves?" 
            className="min-h-[100px]"
            {...register("audiencePainPoints")} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="competitors">Main Competitors</Label>
          <Input id="competitors" placeholder="e.g. Brand X, Brand Y" {...register("competitors")} />
        </div>
      </div>
    </div>
  );
}
