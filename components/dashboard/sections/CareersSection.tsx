"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import Badge from "../Badge";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { CareerListing } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const FIELDS: FieldConfig[] = [
  {
    name: "title",
    label: "Role title",
    type: "text",
    placeholder: "e.g. Frontend Engineer",
  },
  {
    name: "department",
    label: "Department",
    type: "text",
    placeholder: "e.g. Engineering",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "e.g. Kathmandu, NP",
  },
  {
    name: "employmentType",
    label: "Employment type",
    type: "select",
    options: ["full-time", "part-time", "contract", "internship", "remote"],
  },
  {
    name: "workplace",
    label: "Workplace",
    type: "select",
    options: ["onsite", "remote", "hybrid"],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Role overview",
  },
  {
    name: "responsibilities",
    label: "Responsibilities",
    type: "text",
    placeholder: "Build features, Review PRs, Mentor juniors",
    hint: "Comma-separated list",
  },
  {
    name: "requirements",
    label: "Requirements",
    type: "text",
    placeholder: "3+ years experience, React, TypeScript",
    hint: "Comma-separated list",
  },
  {
    name: "preferredQualifications",
    label: "Preferred qualifications",
    type: "text",
    placeholder: "AWS experience, Open source contributions",
    hint: "Comma-separated list",
    required: false,
  },
  {
    name: "experience",
    label: "Experience",
    type: "text",
    placeholder: "e.g. 2-4 years",
  },
  {
    name: "vacancies",
    label: "Vacancies",
    type: "number",
    placeholder: "1",
  },
  {
    name: "salaryMin",
    label: "Salary min",
    type: "number",
    placeholder: "0",
    required: false,
  },
  {
    name: "salaryMax",
    label: "Salary max",
    type: "number",
    placeholder: "0",
    required: false,
  },
  {
    name: "salaryCurrency",
    label: "Currency",
    type: "text",
    placeholder: "NPR",
    required: false,
  },
  {
    name: "applicationDeadline",
    label: "Application deadline",
    type: "text",
    placeholder: "YYYY-MM-DD",
    required: false,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["draft", "open", "closed"],
  },
];

export default function CareersSection() {
  const [listings, setListings] = useState<CareerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CareerListing | null>(null);
  const [deleting, setDeleting] = useState<CareerListing | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/careers`, {
        credentials: "include",
      });

      if (res.status === 404) {
        setListings([]);
        return;
      }

      if (!res.ok) throw new Error("Failed to load listings");

      const data = await res.json();
      setListings(data.data ?? data);
    } catch {
      setError("Couldn't load career listings. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<CareerListing>[] = [
    { key: "title", label: "Role" },
    { key: "department", label: "Department" },
    { key: "location", label: "Location" },
    {
      key: "employmentType",
      label: "Type",
      render: (item) => (
        <span className="capitalize">
          {item.employmentType.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <Badge value={item.status} />,
    },
  ];

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(listing: CareerListing) {
    setEditing(listing);
    setModalOpen(true);
  }

  function toInitialValues(
    listing: CareerListing | null,
  ): Record<string, unknown> {
    if (!listing) return {};
    return {
      title: listing.title,
      department: listing.department,
      location: listing.location,
      employmentType: listing.employmentType,
      workplace: listing.workplace,
      description: listing.description,
      responsibilities: listing.responsibilities?.join(", ") ?? "",
      requirements: listing.requirements?.join(", ") ?? "",
      preferredQualifications:
        listing.preferredQualifications?.join(", ") ?? "",
      experience: listing.experience,
      vacancies: listing.vacancies,
      salaryMin: listing.salary?.min ?? "",
      salaryMax: listing.salary?.max ?? "",
      salaryCurrency: listing.salary?.currency ?? "",
      applicationDeadline: listing.applicationDeadline
        ? listing.applicationDeadline.slice(0, 10)
        : "",
      status: listing.status,
    };
  }

  function buildPayload(
    values: Record<string, unknown>,
  ): Record<string, unknown> {
    const toArray = (val: unknown) =>
      String(val ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload: Record<string, unknown> = {
      title: values.title,
      department: values.department,
      location: values.location,
      employmentType: values.employmentType,
      workplace: values.workplace,
      description: values.description,
      responsibilities: toArray(values.responsibilities),
      requirements: toArray(values.requirements),
      preferredQualifications: toArray(values.preferredQualifications),
      experience: values.experience,
      vacancies: Number(values.vacancies) || 1,
      status: values.status,
    };

    if (values.salaryMin || values.salaryMax) {
      payload.salary = {
        min: Number(values.salaryMin) || 0,
        max: Number(values.salaryMax) || 0,
        currency: values.salaryCurrency || "NPR",
      };
    }

    if (values.applicationDeadline) {
      payload.applicationDeadline = values.applicationDeadline;
    }

    return payload;
  }

  async function handleSave(values: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const payload = buildPayload(values);

    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/api/v1/careers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update listing");
        const updated = await res.json();
        setListings((prev) =>
          prev.map((l) =>
            l.id === editing.id ? { ...l, ...(updated.data ?? updated) } : l,
          ),
        );
      } else {
        const res = await fetch(`${API_BASE}/api/v1/careers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create listing");
        const created = await res.json();
        setListings((prev) => [
          (created.data ?? created) as CareerListing,
          ...prev,
        ]);
      }
      setModalOpen(false);
    } catch {
      setError(
        editing ? "Couldn't update listing." : "Couldn't create listing.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/careers/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      setListings((prev) => prev.filter((l) => l.id !== target.id));
    } catch {
      setError("Couldn't delete that listing.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {loading ? "Loading…" : `${listings.length} listings`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New listing
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-16 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading listings…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={listings}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyLabel="No open roles yet post your first listing."
        />
      )}

      <EntityModal
        open={modalOpen}
        title={editing ? "Edit listing" : "New listing"}
        fields={FIELDS}
        initialValues={toInitialValues(editing)}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete listing?"
        description={
          deleting
            ? `"${deleting.title}" will be permanently removed.`
            : undefined
        }
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
