"use client";
import React, { useState } from "react";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface CalendarEntityPanelProps<T extends { id: string }> {
  title: string;
  label: string;
  items: T[];
  fields: FieldConfig[];
  renderItem: (
    item: T,
    actions: {
      onEdit: () => void;
      onDelete: () => void;
      isConfirmingDelete: boolean;
    }
  ) => React.ReactNode;
  validate?: (formValues: Record<string, any>, editingItem: T | null) => string | null;
  onSave: (formValues: Record<string, any>, editingItem: T | null) => void;
  onDelete: (id: string) => void;
  getInitialFormValues?: (item: T | null) => Record<string, any>;
}

export default function CalendarEntityPanel<T extends { id: string }>({
  title,
  label,
  items,
  fields,
  renderItem,
  validate,
  onSave,
  onDelete,
  getInitialFormValues,
}: CalendarEntityPanelProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const openAddForm = () => {
    setEditingItem(null);
    setErrorMsg(null);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "select" && f.options && f.options.length > 0) {
        initial[f.key] = f.options[0].value;
      } else {
        initial[f.key] = "";
      }
    });
    setFormValues(initial);
    setIsFormOpen(true);
  };

  const openEditForm = (item: T) => {
    setEditingItem(item);
    setErrorMsg(null);
    if (getInitialFormValues) {
      setFormValues(getInitialFormValues(item));
    } else {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        initial[f.key] = (item as any)[f.key] ?? "";
      });
      setFormValues(initial);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setErrorMsg(null);
    setFormValues({});
  };

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (validate) {
      const err = validate(formValues, editingItem);
      if (err) {
        setErrorMsg(err);
        return;
      }
    }

    onSave(formValues, editingItem);
    handleCloseForm();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--outline-variant)]">
        <h3 className="font-display font-bold text-base text-[var(--on-surface)]">
          {title}
        </h3>
        <span className="text-xs text-[var(--on-surface-variant)]">{items.length} total</span>
      </div>

      <div className="space-y-2.5 text-sm">
        {items.map((item) => {
          const isConfirming = confirmDeleteId === item.id;

          return (
            <div key={item.id} className="space-y-1">
              {renderItem(item, {
                onEdit: () => openEditForm(item),
                onDelete: () => setConfirmDeleteId(item.id),
                isConfirmingDelete: isConfirming,
              })}

              {isConfirming && (
                <div className="p-2 rounded-lg bg-[var(--surface-container-high)] text-xs flex items-center justify-between border border-[var(--error)] animate-fadeIn">
                  <span className="text-[var(--on-surface)] text-[11px]">Delete item?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn-secondary text-[10px] !py-0.5 !px-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="badge badge-danger text-[10px] cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          if (isFormOpen) {
            handleCloseForm();
          } else {
            openAddForm();
          }
        }}
        className="btn-secondary text-xs !py-1.5 mt-4"
      >
        {isFormOpen ? "Cancel" : `+ Add ${label}`}
      </button>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 p-3 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[var(--on-surface)]">
              {editingItem ? `Edit ${label}` : `Add ${label}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.key} className={fields.length === 1 ? "sm:col-span-2" : ""}>
                <label className="block text-[10px] font-semibold text-[var(--on-surface-variant)] mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required !== false}
                    className="w-full text-xs"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required !== false}
                    placeholder={field.placeholder}
                    className="w-full text-xs"
                  />
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required !== false}
                    className="w-full text-xs"
                  />
                ) : (
                  <input
                    type="text"
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    required={field.required !== false}
                    placeholder={field.placeholder}
                    className="w-full text-xs"
                  />
                )}
              </div>
            ))}
          </div>

          {errorMsg && <p className="text-xs text-[var(--error)]">{errorMsg}</p>}

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleCloseForm}
              className="btn-secondary text-xs !py-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs !py-1">
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
