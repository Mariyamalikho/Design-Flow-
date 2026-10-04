import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function BrandPersonalityForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Brand Personality</h2>
        <p className="text-sm text-zinc-500">Define the look, feel, and voice of the brand.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brandTone">Brand Tone/Voice *</Label>
          <Input 
            id="brandTone" 
            placeholder="e.g. Professional, Playful, Authoritative..." 
            className={errors.brandTone ? "border-red-500" : ""}
            {...register("brandTone")} 
          />
          {errors.brandTone && <p className="text-sm text-red-500">{errors.brandTone.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coreValues">Core Values</Label>
          <Textarea 
            id="coreValues" 
            placeholder="What does the brand stand for?" 
            className="min-h-[80px]"
            {...register("coreValues")} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="visualPreferences">Visual Preferences (Colors, Style)</Label>
          <Textarea 
            id="visualPreferences" 
            placeholder="Any specific colors to use or avoid? Modern vs traditional?" 
            className="min-h-[80px]"
            {...register("visualPreferences")} 
          />
        </div>
      </div>
    </div>
  );
}
