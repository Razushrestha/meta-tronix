"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import Badge from "../Badge";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { Product } from "../types";
import { apiFetch } from "@/lib/api";

function getFields(isEditing: boolean): FieldConfig[] {
  return [
    { name: "name", label: "Name", type: "text", placeholder: "Product name" },
    {
      name: "tagline",
      label: "Tagline",
      type: "text",
      placeholder: "Short one-liner",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Longer description",
      required: false,
    },
    {
      name: "problem",
      label: "Problem",
      type: "textarea",
      placeholder: "What problem does this solve?",
    },
    {
      name: "features",
      label: "Features",
      type: "text",
      placeholder: "Feature one, Feature two, Feature three",
      hint: "Comma-separated list",
    },
    {
      name: "technologies",
      label: "Technologies",
      type: "text",
      placeholder: "Next.js, Node.js, MongoDB",
      hint: "Comma-separated list",
    },
    {
      name: "productUrl",
      label: "Product URL",
      type: "text",
      placeholder: "https://example.com",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive"],
    },
    {
      name: "featured",
      label: "Featured",
      type: "select",
      options: ["yes", "no"],
      required: false,
    },
    {
      name: "image", // was "previewUrl"
      label: "Preview image",
      type: "file",
      accept: "image/*",
      required: !isEditing,
      hint: isEditing ? "Leave empty to keep the current image." : undefined,
    },
  ];
}

// Mongo returns `_id`; the UI uses `id`. Support both.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (p: any): Product => ({ ...p, id: p.id ?? p._id });

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return data?.message ?? fallback;
}

const errMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message !== "Failed to fetch"
    ? err.message
    : fallback;

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/v1/products/all");

      if (res.status === 404) {
        setProducts([]);
        return;
      }

      if (!res.ok)
        throw new Error(await readError(res, "Failed to load products"));

      const data = await res.json();
      const list = data.data ?? data;
      setProducts(Array.isArray(list) ? list.map(normalize) : []);
    } catch (err) {
      setError(errMessage(err, "Couldn't load products. Try refreshing."));
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Product>[] = [
    { key: "name", label: "Name" },
    { key: "tagline", label: "Tagline" },
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

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  function toInitialValues(product: Product | null): Record<string, unknown> {
    if (!product) return {};
    return {
      name: product.name,
      tagline: product.tagline,
      description: product.description ?? "",
      problem: product.problem,
      features: product.features?.join(", ") ?? "",
      technologies: product.technologies?.join(", ") ?? "",
      productUrl: product.productUrl,
      status: product.status,
      featured: product.featured ? "yes" : "no",
    };
  }

  function buildFormData(values: Record<string, unknown>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;

      if (key === "features" || key === "technologies") {
        const items = String(value)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        items.forEach((item) => formData.append(`${key}[]`, item));
      } else if (key === "featured") {
        formData.append("featured", String(value === "yes"));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }

    return formData;
  }

  async function handleSave(values: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const formData = buildFormData(values);

    try {
      if (editing) {
        const res = await apiFetch(`/api/v1/products/${editing.id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't update product."));
        const updated = normalize((await res.json()).data);
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)),
        );
      } else {
        const res = await apiFetch("/api/v1/products", {
          method: "POST",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't create product."));
        const created = normalize((await res.json()).data);
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        errMessage(
          err,
          editing ? "Couldn't update product." : "Couldn't create product.",
        ),
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
      const res = await apiFetch(`/api/v1/products/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't delete that product."));
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
    } catch (err) {
      setError(errMessage(err, "Couldn't delete that product."));
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {loading ? "Loading…" : `${products.length} products`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New product
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
          Loading products…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyLabel="No products yet add your first one."
        />
      )}

      <EntityModal
        open={modalOpen}
        title={editing ? "Edit product" : "New product"}
        fields={getFields(!!editing)}
        initialValues={toInitialValues(editing)}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        description={
          deleting
            ? `"${deleting.name}" will be permanently removed.`
            : undefined
        }
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
