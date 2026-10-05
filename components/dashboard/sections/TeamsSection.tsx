"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Linkedin, Github, Mail } from "lucide-react";
import DataTable, { Column } from "../DataTable";
import EntityModal, { FieldConfig } from "../EntityModal";
import ConfirmDialog from "../ConfirmDialog";
import { TeamMember } from "../types";
import { apiFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Backend stores "/uploads/team/abc.jpg"; the browser needs the full URL.
const photoSrc = (path?: string) =>
  !path ? undefined : path.startsWith("http") ? path : `${API_BASE}${path}`;

function getFields(isEditing: boolean, currentPhoto?: string): FieldConfig[] {
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
      label: "Contact email",
      type: "text",
      placeholder: "name@example.com",
      required: false,
    },
    {
      name: "photo",
      label: "Photo",
      type: "file",
      accept: "image/*",
      required: !isEditing,
      hint: isEditing ? "Leave empty to keep the current photo." : undefined,
      previewUrl: currentPhoto,
    },
  ];
}

// Mongo returns `_id`; the UI uses `id`. Support both.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (m: TeamMember & { _id?: string }): TeamMember => ({
  ...m,
  id: m.id ?? m._id ?? "",
});

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return data?.message ?? fallback;
}

const errMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message !== "Failed to fetch"
    ? err.message
    : fallback;

// Backend (buildTeamPayload) expects flat keys, not "socials[x]".
const SOCIAL_KEYS: Record<string, string> = {
  "socials.linkedin": "socialsLinkedin",
  "socials.github": "socialsGithub",
  "socials.email": "socialsEmail",
};

const iconLinkClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-slate-500 transition-colors hover:border-cyan-400 hover:text-cyan-600";

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
      const res = await apiFetch("/api/v1/team");

      if (res.status === 404) {
        setMembers([]);
        return;
      }

      if (!res.ok)
        throw new Error(await readError(res, "Failed to load team members"));

      const data = await res.json();
      const list = data.data ?? data;
      setMembers(Array.isArray(list) ? list.map(normalize) : []);
    } catch (err) {
      setError(errMessage(err, "Couldn't load team members. Try refreshing."));
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<TeamMember>[] = [
    {
      key: "photoUrl",
      label: "Photo",
      render: (item) => {
        const src = photoSrc(item.photoUrl);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.name}
            className="h-9 w-9 rounded-full border border-brand-border object-cover"
          />
        ) : (
          <span className="text-brand-muted">—</span>
        );
      },
    },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    {
      key: "bio",
      label: "Bio",
      render: (item) => (
        <span
          title={item.bio}
          className="block max-w-[16rem] truncate text-brand-muted"
        >
          {item.bio}
        </span>
      ),
    },
    {
      key: "socials",
      label: "Links",
      render: (item) => {
        const { linkedin, github, email } = item.socials ?? {};

        if (!linkedin && !github && !email) {
          return <span className="text-brand-muted">No links</span>;
        }

        return (
          <div className="flex items-center gap-2">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={iconLinkClass}
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={iconLinkClass}
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className={iconLinkClass}
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        );
      },
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

  function buildFormData(values: Record<string, unknown>): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;

      if (value instanceof File) {
        formData.append(key, value);
      } else if (SOCIAL_KEYS[key]) {
        formData.append(SOCIAL_KEYS[key], String(value));
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
        const res = await apiFetch(`/api/v1/team/${editing.id}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't update team member."));
        const updated = normalize((await res.json()).data);
        setMembers((prev) =>
          prev.map((m) => (m.id === editing.id ? { ...m, ...updated } : m)),
        );
      } else {
        const res = await apiFetch("/api/v1/team", {
          method: "POST",
          body: formData,
        });
        if (!res.ok)
          throw new Error(await readError(res, "Couldn't add team member."));
        const created = normalize((await res.json()).data);
        setMembers((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        errMessage(
          err,
          editing
            ? "Couldn't update team member."
            : "Couldn't add team member.",
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
      const res = await apiFetch(`/api/v1/team/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok)
        throw new Error(
          await readError(res, "Couldn't remove that team member."),
        );
      setMembers((prev) => prev.filter((m) => m.id !== target.id));
    } catch (err) {
      setError(errMessage(err, "Couldn't remove that team member."));
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
          emptyLabel="No team members yet add your first one."
        />
      )}

      <EntityModal
        open={modalOpen}
        title={editing ? "Edit member" : "New member"}
        fields={getFields(!!editing, photoSrc(editing?.photoUrl))}
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
