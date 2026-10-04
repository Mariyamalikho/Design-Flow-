import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function ClientInfoForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Client Information</h2>
        <p className="text-sm text-zinc-500">Basic details about the client and their company.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" placeholder="e.g. Acme Corp" {...register("companyName")} className={errors.companyName ? "border-red-500" : ""} />
          {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input id="contactName" placeholder="e.g. Jane Doe" {...register("contactName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyBackground">Company Background & Industry *</Label>
          <Textarea 
            id="companyBackground" 
            placeholder="Describe what the company does and the industry they operate in..." 
            className={`min-h-[120px] ${errors.companyBackground ? "border-red-500" : ""}`}
            {...register("companyBackground")} 
          />
          {errors.companyBackground && <p className="text-sm text-red-500">{errors.companyBackground.message as string}</p>}
        </div>
      </div>
    </div>
  );
}
