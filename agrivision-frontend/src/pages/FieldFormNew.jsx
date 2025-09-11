// src/pages/FieldFormNew.jsx
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import { queueRequest } from "../utils/db";

const schema = z.object({
  name: z.string().min(1, "Field name is required"),
  area: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z.number({ invalid_type_error: "Area must be a number" })
      .positive("Area must be greater than 0")
  ),
  soilType: z.enum(["Loamy", "Sandy", "Clay", "Black", "Alluvial"], {
    errorMap: () => ({ message: "Select a soil type" }),
  }),
  irrigation: z.enum(["Canal", "Well", "Drip", "Rainfed"], {
    errorMap: () => ({ message: "Select an irrigation type" }),
  }),
  village: z.string().optional(),
});

export default function FieldFormNew() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", area: "", soilType: "", irrigation: "", village: "" },
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/fields", data); // <-- plug your backend
      toast.success("Field saved");
      reset();
      nav("/app/fields");
    } catch (e) {
      // offline or server down -> queue request for Sync Center
      await queueRequest({ type: "create-field", payload: data });
      toast((t) => (
        <span>Offline — saved to <b>Sync Center</b>.</span>
      ));
      nav("/app/sync");
    }
  };

  return (
    <div className="max-w-lg">
      <Card title="Add Field">
        <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="text-sm mb-1 block">Field name</label>
            <Input {...register("name")} placeholder="e.g., North Plot" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm mb-1 block">Area (acre)</label>
            <Input type="number" step="0.01" {...register("area")} placeholder="e.g., 1.50" />
            {errors.area && <p className="text-xs text-red-600 mt-1">{errors.area.message}</p>}
          </div>

          <div>
            <label className="text-sm mb-1 block">Soil type</label>
            <Select {...register("soilType")}>
              <option value="">Select…</option>
              <option>Loamy</option>
              <option>Sandy</option>
              <option>Clay</option>
              <option>Black</option>
              <option>Alluvial</option>
            </Select>
            {errors.soilType && <p className="text-xs text-red-600 mt-1">{errors.soilType.message}</p>}
          </div>

          <div>
            <label className="text-sm mb-1 block">Irrigation</label>
            <Select {...register("irrigation")}>
              <option value="">Select…</option>
              <option>Canal</option>
              <option>Well</option>
              <option>Drip</option>
              <option>Rainfed</option>
            </Select>
            {errors.irrigation && <p className="text-xs text-red-600 mt-1">{errors.irrigation.message}</p>}
          </div>

          <div>
            <label className="text-sm mb-1 block">Village / PIN (optional)</label>
            <Input {...register("village")} placeholder="e.g., Amethi 227405" />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
            <Button variant="outline" type="button" onClick={()=>nav(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
