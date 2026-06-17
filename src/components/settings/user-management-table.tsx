"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/user-store"
import type { User, UserRole, UserStatus } from "@/types"
import { Users, Trash2, AlertTriangle, Plus, Edit, UserX, UserCheck, Search } from "lucide-react"

interface UserManagementTableProps {
  users: User[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onCreateUser: (userData: { name: string; email: string; role: UserRole }) => Promise<void>
  onUpdateUser: (userData: { id: string; name?: string; email?: string; role?: UserRole; status?: UserStatus }) => Promise<void>
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

function StatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    active: "bg-success/15 text-success border-success/20",
    inactive: "bg-danger/15 text-danger border-danger/20",
    invited: "bg-warning/15 text-warning border-warning/20",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${styles[status]}`}
    >
      {status}
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
  onCreateUser,
  onUpdateUser,
  onAnonymise,
}: UserManagementTableProps) {
  const currentUser = useUserStore((state) => state.profile)

  // Search filter state
  const [searchQuery, setSearchQuery] = useState("")

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createEmail, setCreateEmail] = useState("")
  const [createRole, setCreateRole] = useState<UserRole>("agent")
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Edit modal states
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState<UserRole>("agent")
  const [editError, setEditError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Track user ID whose status is currently being updated
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  // Handle create user submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)

    if (!createName.trim()) {
      setCreateError("Name is required.")
      return
    }
    if (!createEmail.trim() || !/\S+@\S+\.\S+/.test(createEmail)) {
      setCreateError("A valid email address is required.")
      return
    }

    setIsCreating(true)
    try {
      await onCreateUser({
        name: createName.trim(),
        email: createEmail.trim(),
        role: createRole,
      })
      // Reset form & close
      setCreateName("")
      setCreateEmail("")
      setCreateRole("agent")
      setIsCreateOpen(false)
    } catch (err: any) {
      setCreateError(err.message || "An error occurred while creating the user.")
    } finally {
      setIsCreating(false)
    }
  }

  // Handle edit user submit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)

    if (!editTarget) return

    if (!editName.trim()) {
      setEditError("Name is required.")
      return
    }
    if (!editEmail.trim() || !/\S+@\S+\.\S+/.test(editEmail)) {
      setEditError("A valid email address is required.")
      return
    }

    setIsEditing(true)
    try {
      await onUpdateUser({
        id: editTarget.id,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      })
      setEditTarget(null)
    } catch (err: any) {
      setEditError(err.message || "An error occurred while updating the user.")
    } finally {
      setIsEditing(false)
    }
  }

  // Handle open edit modal
  const openEditModal = (user: User) => {
    setEditTarget(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
    setEditError(null)
  }

  // Handle toggle user status
  const handleToggleStatus = async (user: User) => {
    const nextStatus: UserStatus = user.status === "active" ? "inactive" : "active"
    setStatusUpdatingId(user.id)
    try {
      await onUpdateUser({
        id: user.id,
        status: nextStatus,
      })
    } catch (err) {
      console.error("[UserManagementTable] Toggle status failed:", err)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Handle delete confirm
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

  if (loading && users.length === 0) {
    return <SkeletonRows />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  return (
    <>
      {/* Top Search + Add Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-raised border border-border/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* Create User Button */}
        <Button
          variant="primary"
          onClick={() => {
            setCreateError(null)
            setIsCreateOpen(true)
          }}
          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
          size="sm"
        >
          <Plus size={14} />
          Add New User
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          heading="No users found"
          subtext={searchQuery ? "Try refining your search query." : "User accounts will appear here once created."}
        />
      ) : (
        <div className="overflow-x-auto border border-border/40 rounded-xl bg-surface-raised/30">
          <table className="w-full text-sm" aria-label="User management">
            <thead>
              <tr className="border-b border-border/60 text-left bg-surface-raised/50">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  User
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">
                  Email
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Role
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                  Status
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">
                  Created
                </th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = currentUser?.id === user.id
                const isUpdatingStatus = statusUpdatingId === user.id

                return (
                  <tr
                    key={user.id}
                    className="border-b border-border/30 hover:bg-surface-raised/40 transition-colors"
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
                      <p className="text-xs text-text-secondary truncate max-w-[200px]" title={user.email}>
                        {user.email}
                      </p>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Created date */}
                    <td className="py-3 px-4 text-xs text-text-secondary text-mono hidden md:table-cell whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {isSelf ? (
                          <span className="text-[10px] text-text-muted pr-3">—</span>
                        ) : (
                          <>
                            {/* Edit Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              aria-label={`Edit ${user.name}`}
                              className="px-2 h-7 gap-1 text-xs"
                            >
                              <Edit size={12} />
                              <span className="hidden lg:inline">Edit</span>
                            </Button>

                            {/* Enable/Disable status toggle */}
                            <Button
                              variant="ghost"
                              intent={user.status === "active" ? "danger" : "default"}
                              size="sm"
                              onClick={() => handleToggleStatus(user)}
                              isLoading={isUpdatingStatus}
                              disabled={isUpdatingStatus}
                              aria-label={user.status === "active" ? `Disable ${user.name}` : `Enable ${user.name}`}
                              className="px-2 h-7 gap-1 text-xs"
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserX size={12} />
                                  <span className="hidden lg:inline">Disable</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck size={12} />
                                  <span className="hidden lg:inline">Enable</span>
                                </>
                              )}
                            </Button>

                            {/* Remove/Anonymise Button */}
                            <Button
                              variant="ghost"
                              intent="danger"
                              size="sm"
                              onClick={() => setDeleteTarget(user)}
                              aria-label={`Remove ${user.name}`}
                              className="px-2 h-7 gap-1 text-xs"
                            >
                              <Trash2 size={12} />
                              <span className="hidden lg:inline">Remove</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => !isCreating && setIsCreateOpen(false)}
        aria-labelledby="create-user-title"
      >
        <form onSubmit={handleCreateUser}>
          <Modal.Header>
            <h2 id="create-user-title" className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Create New User
            </h2>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-4">
              {createError && (
                <div role="alert" className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label htmlFor="create-name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  id="create-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="create-email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="create-email"
                  type="email"
                  placeholder="name@company.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="create-role" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  System Role
                </label>
                <select
                  id="create-role"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  disabled={isCreating}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreating}
            >
              Send Invitation
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => !isEditing && setEditTarget(null)}
        aria-labelledby="edit-user-title"
      >
        <form onSubmit={handleEditUser}>
          <Modal.Header>
            <h2 id="edit-user-title" className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Edit User Details
            </h2>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-4">
              {editError && (
                <div role="alert" className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label htmlFor="edit-name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  System Role
                </label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  disabled={isEditing}
                  className="w-full bg-surface-raised border border-border/80 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onClick={() => setEditTarget(null)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isEditing}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Anonymise Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
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
