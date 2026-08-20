"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { TeamMember } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getFields(isEditing: boolean): FieldConfig[] {
  return [
    { name: "name", label: "Name", type: "text", placeholder: "Full name" },
    {
      name: "role",
      label: "Role",
      type: "text",
      placeholder: "e.g. Design Lead",
    },
    { name: "bio", label: "Bio", type: "textarea", placeholder: "Short bio" },
    {
      name: "socials.linkedin",
      label: "LinkedIn",
      type: "text",
      placeholder: "https://linkedin.com/in/...",
      required: false,
    },
    {
      name: "socials.github",
      label: "GitHub",
      type: "text",
      placeholder: "https://github.com/...",
      required: false,
    },
    {
      name: "socials.email",
      label: "Social email",
      type: "text",
      placeholder: "name@example.com",
      required: false,
    },
    {
      name: "photo",
      label: "Photo",
      type: "file",
      accept: "image/*",
      required: !isEditing, // required on create, optional when editing
      hint: isEditing ? "Leave empty to keep the current photo." : undefined,
    },
  ];
}

export default function TeamsSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/team`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load team members");
      const data = await res.json();
      setMembers(data.data ?? data);
    } catch {
      setError("Couldn't load team members. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<TeamMember>[] = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    {
      key: "socials",
      label: "Email",
      render: (item) => item.socials?.email ?? "—",
    },
  ];

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditing(member);
    setModalOpen(true);
  }

  // Flattens the nested `socials` object into dot-keys the form understands,
  // since EntityModal fields are named "socials.linkedin" etc.
  function toInitialValues(member: TeamMember | null): Record<string, unknown> {
    if (!member) return {};
    return {
      name: member.name,
      role: member.role,
      bio: member.bio,
      "socials.linkedin": member.socials?.linkedin ?? "",
      "socials.github": member.socials?.github ?? "",
      "socials.email": member.socials?.email ?? "",
    };
  }

  // Converts flat form values (including "socials.x" dot-keys and a File)
  // into FormData with bracketed field names, matching the API's expected
  // multipart/form-data shape (socials[linkedin], socials[github], etc).
  function buildFormData(values: Record<string, unknown>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null) continue;

      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        formData.append(`${parent}[${child}]`, String(value));
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
        const res = await fetch(`${API_BASE}/api/v1/team/${editing.id}`, {
          method: "PUT",
          credentials: "include",
          body: formData, // no Content-Type header — browser sets the multipart boundary
        });
        if (!res.ok) throw new Error("Failed to update team member");
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editing.id ? { ...m, ...(updated.data ?? updated) } : m,
          ),
        );
      } else {
        const res = await fetch(`${API_BASE}/api/v1/team`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to add team member");
        const created = await res.json();
        setMembers((prev) => [
          (created.data ?? created) as TeamMember,
          ...prev,
        ]);
      }
      setModalOpen(false);
    } catch {
      setError(
        editing ? "Couldn't update team member." : "Couldn't add team member.",
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
      const res = await fetch(`${API_BASE}/api/v1/team/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete team member");
      setMembers((prev) => prev.filter((m) => m.id !== target.id));
    } catch {
      setError("Couldn't remove that team member.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-muted">
          {loading ? "Loading…" : `${members.length} team members`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New member
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
          Loading team members…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={members}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyLabel="No team members yet — add your first one."
        />
      )}

      <EntityModal
        open={modalOpen}
        title={editing ? "Edit member" : "New member"}
        fields={getFields(!!editing)}
        initialValues={toInitialValues(editing)}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remove team member?"
        description={
          deleting
            ? `"${deleting.name}" will be removed from the team.`
            : undefined
        }
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
