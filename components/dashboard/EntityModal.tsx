"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "file";
  options?: string[];
  placeholder?: string;
  required?: boolean; // defaults to true if omitted
  hint?: string; // small helper text shown under the field
  accept?: string; // for file inputs, e.g. "image/*"
}

interface EntityModalProps {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => void;
  saving?: boolean;
}

export default function EntityModal({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
  saving = false,
}: EntityModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) setValues(initialValues ?? {});
  }, [open, initialValues]);

  function handleClose() {
    if (saving) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-brand-navy/30 backdrop-blur-[2px]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
            className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
              <h2 className="text-base font-semibold text-brand-navy">
                {title}
              </h2>
              <button
                onClick={handleClose}
                disabled={saving}
                className="rounded-md p-1.5 text-brand-muted transition-colors hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSave(values);
              }}
            >
              <div className="flex-1 space-y-4">
                {fields.map((field) => {
                  const isRequired = field.required !== false;
                  return (
                    <div key={field.name}>
                      <label className="mb-1.5 block text-sm font-medium text-brand-navy">
                        {field.label}
                        {!isRequired && (
                          <span className="ml-1 text-xs font-normal text-brand-muted">
                            (optional)
                          </span>
                        )}
                      </label>

                      {field.type === "select" ? (
                        <select
                          required={isRequired}
                          disabled={saving}
                          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-body focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy disabled:bg-slate-50"
                          value={(values[field.name] as string) ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [field.name]: e.target.value,
                            }))
                          }
                        >
                          <option value="" disabled>
                            Select {field.label.toLowerCase()}
                          </option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          required={isRequired}
                          disabled={saving}
                          placeholder={field.placeholder}
                          className="w-full resize-none rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-body focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy disabled:bg-slate-50"
                          value={(values[field.name] as string) ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [field.name]: e.target.value,
                            }))
                          }
                        />
                      ) : field.type === "file" ? (
                        <input
                          type="file"
                          accept={field.accept ?? "image/*"}
                          required={isRequired}
                          disabled={saving}
                          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-body file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-navy hover:file:bg-slate-200 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy disabled:bg-slate-50"
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [field.name]: e.target.files?.[0] ?? undefined,
                            }))
                          }
                        />
                      ) : (
                        <input
                          required={isRequired}
                          disabled={saving}
                          type={field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-body focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy disabled:bg-slate-50"
                          value={(values[field.name] as string | number) ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [field.name]:
                                field.type === "number"
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }))
                          }
                        />
                      )}

                      {field.hint && (
                        <p className="mt-1 text-xs text-brand-muted">
                          {field.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-2 border-t border-brand-border pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-body transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
