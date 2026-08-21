"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import Badge from "../Badge";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { BlogPost } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getFields(isEditing: boolean): FieldConfig[] {
  return [
    { name: "title", label: "Title", type: "text", placeholder: "Post title" },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      placeholder: "post-url-slug",
    },
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
      name: "imageUrl",
      label: "Cover image",
      type: "file",
      accept: "image/*",
      required: !isEditing,
      hint: isEditing ? "Leave empty to keep the current image." : undefined,
    },
  ];
}

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
      const res = await fetch(`${API_BASE}/api/v1/blogs/admin/all`, {
        credentials: "include",
      });

      if (res.status === 404) {
        setPosts([]);
        return;
      }

      if (!res.ok) throw new Error("Failed to load blog posts");

      const data = await res.json();
      setPosts(data.data ?? data);
    } catch {
      setError("Couldn't load blog posts. Try refreshing.");
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
      slug: post.slug,
      author: post.author,
      category: post.category,
      content: post.content,
      published: post.published ? "published" : "draft",
    };
  }

  function buildFormData(values: Record<string, unknown>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;

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
        const res = await fetch(
          `${API_BASE}/api/v1/blogs/admin/${editing.id}`,
          {
            method: "PUT",
            credentials: "include",
            body: formData,
          },
        );
        if (!res.ok) throw new Error("Failed to update post");
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editing.id ? { ...p, ...(updated.data ?? updated) } : p,
          ),
        );
      } else {
        const res = await fetch(`${API_BASE}/api/v1/blogs/admin`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to create post");
        const created = await res.json();
        setPosts((prev) => [(created.data ?? created) as BlogPost, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setError(editing ? "Couldn't update post." : "Couldn't create post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/blogs/admin/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== target.id));
    } catch {
      setError("Couldn't delete that post.");
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
