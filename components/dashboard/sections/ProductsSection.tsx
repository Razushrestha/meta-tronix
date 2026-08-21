"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import Badge from "../Badge";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { Product } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getFields(isEditing: boolean): FieldConfig[] {
  return [
    { name: "name", label: "Name", type: "text", placeholder: "Product name" },
    { name: "slug", label: "Slug", type: "text", placeholder: "product-slug" },
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
      name: "previewUrl",
      label: "Preview image",
      type: "file",
      accept: "image/*",
      required: !isEditing,
      hint: isEditing ? "Leave empty to keep the current image." : undefined,
    },
  ];
}

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
      const res = await fetch(`${API_BASE}/api/v1/products/all`, {
        credentials: "include",
      });

      if (res.status === 404) {
        setProducts([]);
        return;
      }

      if (!res.ok) throw new Error("Failed to load products");

      const data = await res.json();
      setProducts(data.data ?? data);
    } catch {
      setError("Couldn't load products. Try refreshing.");
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
      slug: product.slug,
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
        const res = await fetch(`${API_BASE}/api/v1/products/${editing.id}`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to update product");
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editing.id ? { ...p, ...(updated.data ?? updated) } : p,
          ),
        );
      } else {
        const res = await fetch(`${API_BASE}/api/v1/products`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to create product");
        const created = await res.json();
        setProducts((prev) => [(created.data ?? created) as Product, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setError(
        editing ? "Couldn't update product." : "Couldn't create product.",
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
      const res = await fetch(`${API_BASE}/api/v1/products/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
    } catch {
      setError("Couldn't delete that product.");
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
