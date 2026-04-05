"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { productsApi } from "../../../lib/api";
import ImagePicker from "../../../components/ImagePicker";
import type { MerchantProduct } from "../../../lib/types";

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<MerchantProduct | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stockQuantity: "" });
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productsApi.get(Number(id))
      .then((p) => {
        setProduct(p);
        setImages(p.images ?? []);
        setForm({
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          stockQuantity: String(p.stockQuantity),
        });
        setSpecs(
          Object.entries(p.specifications ?? {}).map(([key, value]) => ({ key, value }))
        );
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addSpec() { setSpecs((s) => [...s, { key: "", value: "" }]); }
  function updateSpec(i: number, field: "key" | "value", val: string) {
    setSpecs((s) => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));
  }
  function removeSpec(i: number) { setSpecs((s) => s.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const specifications = specs.reduce<Record<string, string>>((acc, sp) => {
      if (sp.key.trim()) acc[sp.key.trim()] = sp.value;
      return acc;
    }, {});

    try {
      await productsApi.update(Number(id), {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
        images: images.length ? images : undefined,
        specifications: Object.keys(specifications).length ? specifications : undefined,
      });
      router.replace("/dashboard/products");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !product) {
    return <div className="p-8 text-center text-muted text-sm">{error}</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/products" className="p-2 rounded-xl text-muted hover:bg-brand-muted transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
          <p className="text-sm text-muted mt-0.5">{product?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-foreground">Basic Info</h2>
          <Field label="Product Name *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} className={`${inputCls} resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (GHS) *">
              <input required type="number" step="0.01" min="0.01" value={form.price}
                onChange={(e) => set("price", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" min="0" value={form.stockQuantity}
                onChange={(e) => set("stockQuantity", e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <div className={`${inputCls} text-muted cursor-default select-none`}>
                {product?.categoryName ?? "—"}
              </div>
            </Field>
            {product?.subCategoryName && (
              <Field label="Sub-Category">
                <div className={`${inputCls} text-muted cursor-default select-none`}>
                  {product.subCategoryName}
                </div>
              </Field>
            )}
          </div>
          <p className="text-xs text-muted -mt-2">Category cannot be changed after creation.</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-foreground">Images</h2>
          <ImagePicker value={images} onChange={setImages} />
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Specifications</h2>
            <button type="button" onClick={addSpec} className="text-xs text-brand font-medium hover:underline">+ Add row</button>
          </div>
          {specs.length === 0 && <p className="text-xs text-muted">No specifications added.</p>}
          {specs.map((sp, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input value={sp.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Key" className={inputCls} />
              <input value={sp.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Value" className={inputCls} />
              <button type="button" onClick={() => removeSpec(i)} className="p-2 text-muted hover:text-red-500 transition">
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
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
