"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import Badge from "../Badge";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { BlogPost } from "../types";
import { apiFetch } from "@/lib/api";

function getFields(isEditing: boolean): FieldConfig[] {
  return [
    { name: "title", label: "Title", type: "text", placeholder: "Post title" },
    {
      name: "author",
      label: "Author",
      type: "text",
      placeholder: "Author name",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["Tech", "Startup", "AI", "Design", "IOT"],
    },
    {
      name: "content",
      label: "Content",
      type: "textarea",
      placeholder: "Write the post content…",
    },
    {
      name: "published",
      label: "Status",
      type: "select",
      options: ["draft", "published"],
    },
    {
      name: "image", // must match uploadBlogImage.single("...") on the backend
      label: "Cover image",
      type: "file",
      accept: "image/*",
      required: !isEditing,
      hint: isEditing ? "Leave empty to keep the current image." : undefined,
    },
  ];
}

// Mongo returns `_id`; the UI uses `id`. Support both.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (p: BlogPost & { _id?: string }): BlogPost => ({
  ...p,
  id: p.id ?? p._id ?? "",
});

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return data?.message ?? fallback;
}

const errMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message !== "Failed to fetch"
    ? err.message
    : fallback;

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/v1/blogs/admin/all");

      if (res.status === 404) {
        setPosts([]);
        return;
      }

      if (!res.ok)
        throw new Error(await readError(res, "Failed to load blog posts"));

      const data = await res.json();
      const list = data.data ?? data;
      setPosts(Array.isArray(list) ? list.map(normalize) : []);
    } catch (err) {
      setError(errMessage(err, "Couldn't load blog posts. Try refreshing."));
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<BlogPost>[] = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "category", label: "Category" },
    {
      key: "published",
      label: "Status",
      render: (item) => (
        <Badge value={item.published ? "published" : "draft"} />
      ),
    },
  ];

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setModalOpen(true);
  }

  function toInitialValues(post: BlogPost | null): Record<string, unknown> {
    if (!post) return {};
    return {
      title: post.title,
      author: post.author,
      category: post.category,
      content: post.content,
      published: post.published ? "published" : "draft",
    };
  }

  function buildFormData(values: Record<string, unknown>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;

      if (key === "published") {
        formData.append("published", String(value === "published"));
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
        const res = await apiFetch(`/api/v1/blogs/admin/${editing.id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't update post."));
        const updated = normalize((await res.json()).data);
        setPosts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)),
        );
      } else {
        const res = await apiFetch("/api/v1/blogs/admin", {
          method: "POST",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't create post."));
        const created = normalize((await res.json()).data);
        setPosts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        errMessage(
          err,
          editing ? "Couldn't update post." : "Couldn't create post.",
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
      const res = await apiFetch(`/api/v1/blogs/admin/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't delete that post."));
      setPosts((prev) => prev.filter((p) => p.id !== target.id));
    } catch (err) {
      setError(errMessage(err, "Couldn't delete that post."));
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {loading ? "Loading…" : `${posts.length} posts`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New post
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
          Loading posts…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyLabel="No blog posts yet create your first one."
        />
      )}

      <EntityModal
        open={modalOpen}
        title={editing ? "Edit post" : "New post"}
        fields={getFields(!!editing)}
        initialValues={toInitialValues(editing)}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete post?"
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
