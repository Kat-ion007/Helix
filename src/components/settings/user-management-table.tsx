"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user-store"
import type { User, UserRole } from "@/types"
import { Users, Trash2, AlertTriangle } from "lucide-react"

interface UserManagementTableProps {
  users: User[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onUpdateRole: (userId: string, role: UserRole) => Promise<void>
  onAnonymise: (userId: string) => Promise<void>
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "agent", label: "Agent" },
  { value: "lead", label: "Lead" },
  { value: "admin", label: "Admin" },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    agent: "bg-info/15 text-info border-info/20",
    lead: "bg-warning/15 text-warning border-warning/20",
    admin: "bg-escalated/15 text-escalated border-escalated/20",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${styles[role]}`}
    >
      {role}
    </span>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="row" className="h-14" />
      ))}
    </div>
  )
}

export function UserManagementTable({
  users,
  loading,
  error,
  onRetry,
  onUpdateRole,
  onAnonymise,
}: UserManagementTableProps) {
  const currentUser = useUserStore((state) => state.profile)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (loading) {
    return <SkeletonRows />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        heading="No users found"
        subtext="User accounts will appear here once created."
      />
    )
  }

  const handleConfirmAnonymise = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onAnonymise(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="User management">
          <thead>
            <tr className="border-b border-border/60 text-left">
              <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                User
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">
                Email
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Role
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">
                Created
              </th>
              <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = currentUser?.id === user.id

              return (
                <tr
                  key={user.id}
                  className="border-b border-border/30 hover:bg-surface-raised/60 transition-colors"
                >
                  {/* Name + avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold uppercase border border-accent/15 shrink-0">
                        {user.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {user.name}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] text-text-muted font-normal">
                              (you)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <p className="text-xs text-text-secondary truncate max-w-[200px]">
                      {user.email}
                    </p>
                  </td>

                  {/* Role — editable dropdown */}
                  <td className="py-3 px-4">
                    {isSelf ? (
                      // Can't change own role
                      <RoleBadge role={user.role} />
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) =>
                          onUpdateRole(user.id, e.target.value as UserRole)
                        }
                        aria-label={`Change role for ${user.name}`}
                        className="bg-surface border border-border rounded-lg px-2 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Created date */}
                  <td className="py-3 px-4 text-xs text-text-secondary text-mono hidden md:table-cell whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    {isSelf ? (
                      <span className="text-[10px] text-text-muted">—</span>
                    ) : (
                      <Button
                        variant="ghost"
                        intent="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        aria-label={`Remove ${user.name}`}
                        className="gap-1"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Anonymise Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        aria-labelledby="delete-user-title"
      >
        <Modal.Header>
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            <h2
              id="delete-user-title"
              className="text-sm font-semibold uppercase tracking-wider"
            >
              Remove User
            </h2>
          </div>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-text-primary">
              {deleteTarget?.name}
            </span>
            ? Their profile will be anonymised to preserve ticket history. This
            action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="ghost"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            intent="danger"
            onClick={handleConfirmAnonymise}
            isLoading={isDeleting}
          >
            Remove User
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
