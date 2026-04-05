"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi, categoriesApi } from "../../../lib/api";
import ImagePicker from "../../../components/ImagePicker";
import type { Category, SubCategory } from "../../../lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stockQuantity: "" });
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subCategoryId, setSubCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setCategoriesLoading(false));
  }, []);

  function handleCategoryChange(id: number | "") {
    setCategoryId(id);
    setSubCategoryId("");
    setSubCategories([]);
    if (id) {
      setSubCategoriesLoading(true);
      categoriesApi.getSubCategories(id as number)
        .then(setSubCategories)
        .catch(() => {/* no sub-categories for this category */})
        .finally(() => setSubCategoriesLoading(false));
    }
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addSpec() {
    setSpecs((s) => [...s, { key: "", value: "" }]);
  }

  function updateSpec(i: number, field: "key" | "value", val: string) {
    setSpecs((s) => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));
  }

  function removeSpec(i: number) {
    setSpecs((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const specifications = specs.reduce<Record<string, string>>((acc, sp) => {
      if (sp.key.trim()) acc[sp.key.trim()] = sp.value;
      return acc;
    }, {});

    try {
      await productsApi.create({
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
        categoryId: categoryId as number,
        subCategoryId: subCategoryId || undefined,
        images: images.length ? images : undefined,
        specifications: Object.keys(specifications).length ? specifications : undefined,
      });
      router.replace("/dashboard/products");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/products" className="p-2 rounded-xl text-muted hover:bg-brand-muted transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Product</h1>
          <p className="text-sm text-muted mt-0.5">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-foreground">Basic Info</h2>

          <Field label="Product Name *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Premium Tomatoes (1 Crate)"
              className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} placeholder="Describe your product…"
              className={`${inputCls} resize-none`} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (GHS) *">
              <input required type="number" step="0.01" min="0.01" value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" min="0" value={form.stockQuantity}
                onChange={(e) => set("stockQuantity", e.target.value)}
                placeholder="0" className={inputCls} />
            </Field>
          </div>

          <Field label="Category *">
            <select
              required
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : "")}
              disabled={categoriesLoading}
              className={inputCls}
            >
              <option value="">{categoriesLoading ? "Loading…" : "Select a category"}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {(subCategoriesLoading || subCategories.length > 0) && (
            <Field label="Sub-Category">
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value ? Number(e.target.value) : "")}
                disabled={subCategoriesLoading}
                className={inputCls}
              >
                <option value="">{subCategoriesLoading ? "Loading…" : "None"}</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Images */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Images</h2>
          <ImagePicker value={images} onChange={setImages} />
        </div>

        {/* Specifications */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Specifications</h2>
            <button type="button" onClick={addSpec}
              className="text-xs text-brand font-medium hover:underline">
              + Add row
            </button>
          </div>
          {specs.length === 0 && <p className="text-xs text-muted">No specifications added.</p>}
          {specs.map((sp, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input value={sp.key} onChange={(e) => updateSpec(i, "key", e.target.value)}
                placeholder="Key" className={inputCls} />
              <input value={sp.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="Value" className={inputCls} />
              <button type="button" onClick={() => removeSpec(i)}
                className="p-2 text-muted hover:text-red-500 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <Link href="/dashboard/products"
            className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm font-medium text-center hover:bg-background transition">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition disabled:opacity-60">
            {loading ? "Creating…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
