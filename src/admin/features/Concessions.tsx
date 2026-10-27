import { useState, type SyntheticEvent } from "react";
import { DataTable } from "../components/DataTable";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge } from "../components/StatusBadge";
import { AdminIcon } from "../components/AdminIcon";
import { requireAdminData, useAdminData } from "../AdminDataContext";
import type { BufeKategori, BufeUrunu } from "../domain/types";

const categoryLabels: Record<BufeKategori, string> = {
  misir: "Mısır",
  icecek: "İçecek",
  atistirmalik: "Atıştırmalık",
  menu: "Menü",
};

export default function Concessions() {
  const { data, replaceCollection } = useAdminData();
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<BufeUrunu | null>(null);
  const adminData = requireAdminData(data);

  const products = category
    ? adminData.concessionProducts.filter((product) => product.kategori === category)
    : adminData.concessionProducts;

  async function updateProduct(id: string, update: (stock: number, active: boolean) => { stock: number; active: boolean }) {
    try {
      await replaceCollection("concessionProducts", adminData.concessionProducts.map((product) => {
        if (product.id !== id) return product;
        const next = update(product.stok, product.aktif);
        return { ...product, stok: next.stock, aktif: next.active };
      }));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Büfe ürünü güncellenemedi.");
    }
  }

  function openProductForm(product?: BufeUrunu) {
    setError("");
    setDraft(product ? structuredClone(product) : {
      id: "",
      ad: { tr: "", en: "", de: "", ar: "" },
      kategori: "misir",
      boyut: "Orta",
      fiyat: 0,
      stok: 0,
      aktif: true,
    });
  }

  async function saveProduct(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !draft.ad.tr.trim() || !draft.ad.en.trim() || !draft.ad.de.trim() || !draft.ad.ar.trim() || draft.fiyat < 0 || draft.stok < 0) {
      setError("Dört dilde ürün adı, geçerli fiyat ve stok bilgisi gereklidir.");
      return;
    }
    const editing = Boolean(draft.id);
    const product = {
      ...draft,
      id: editing ? draft.id : `bufe-${crypto.randomUUID()}`,
      ad: { ...draft.ad, tr: draft.ad.tr.trim(), en: draft.ad.en.trim(), de: draft.ad.de.trim(), ar: draft.ad.ar.trim() },
    };
    try {
      const next = editing
        ? adminData.concessionProducts.map((item) => item.id === product.id ? product : item)
        : [...adminData.concessionProducts, product];
      await replaceCollection("concessionProducts", next);
      setDraft(null);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Büfe ürünü kaydedilemedi.");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">BÜFE OPERASYONLARI</p><h1>Büfe</h1><p>Ürün kategorilerini, fiyatları ve stok seviyelerini yönetin.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => openProductForm()}><AdminIcon name="plus" />Ürün ekle</button></div>
      <section className="admin-stat-grid admin-stat-grid--compact"><article className="admin-stat-card"><span>Toplam ürün</span><strong>{adminData.concessionProducts.length}</strong><small>Menü dışı ürünler</small></article><article className="admin-stat-card"><span>Aktif ürün</span><strong>{adminData.concessionProducts.filter((product) => product.aktif).length}</strong><small>Satışa açık</small></article><article className="admin-stat-card"><span>Kritik stok</span><strong>{adminData.concessionProducts.filter((product) => product.stok < 100).length}</strong><small>100 adedin altında</small></article><article className="admin-stat-card"><span>Menüler</span><strong>{adminData.concessionMenus.length}</strong><small>{adminData.concessionMenus.filter((menu) => menu.aktif).length} aktif kombo</small></article></section>
      {error && <p className="admin-inline-error" role="alert">{error}</p>}
      <FilterBar filters={[{ key: "category", label: "Kategori", options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label })) }]} values={{ category }} onChange={(_, value) => setCategory(value)} onClear={() => setCategory("")} />
      <DataTable caption="Büfe ürünleri ve stok durumu" rows={products} rowKey={(product) => product.id} columns={[
        { key: "name", header: "Ürün", value: (product) => product.ad.tr, render: (product) => <div className="admin-product-cell"><span className="admin-product-icon"><AdminIcon name={product.kategori === "misir" ? "popcorn" : product.kategori === "icecek" ? "drink" : "snack"} /></span><strong>{product.ad.tr}</strong></div> },
        { key: "category", header: "Kategori", value: (product) => categoryLabels[product.kategori] },
        { key: "size", header: "Boyut", value: (product) => product.boyut ?? "—" },
        { key: "price", header: "Fiyat", value: (product) => `${product.fiyat} TL` },
        { key: "stock", header: "Stok", value: (product) => product.stok, render: (product) => <div className="admin-stock-cell"><strong>{product.stok}</strong><div className="admin-stock-actions"><button type="button" className="admin-icon-button" aria-label={`${product.ad.tr} stoğunu azalt`} onClick={() => void updateProduct(product.id, (stock, active) => ({ stock: Math.max(0, stock - 1), active }))}><AdminIcon name="minus" /></button><button type="button" className="admin-icon-button" aria-label={`${product.ad.tr} stoğunu artır`} onClick={() => void updateProduct(product.id, (stock, active) => ({ stock: stock + 1, active }))}><AdminIcon name="plus" /></button></div></div> },
        { key: "status", header: "Durum", value: (product) => product.aktif ? "Aktif" : "Pasif", render: (product) => <StatusBadge tone={product.aktif ? "success" : "neutral"} label={product.aktif ? "Aktif" : "Pasif"} /> },
      ]} actions={(product) => <div className="admin-action-group"><button className="admin-button admin-button--quiet" type="button" onClick={() => openProductForm(product)}><AdminIcon name="edit" />Düzenle</button><button className="admin-button admin-button--quiet" type="button" onClick={() => void updateProduct(product.id, (stock, active) => ({ stock, active: !active }))}><AdminIcon name={product.aktif ? "block" : "active"} />{product.aktif ? "Pasifleştir" : "Etkinleştir"}</button></div>} />
      <section className="admin-panel"><div className="admin-section-heading"><div><h2>Menü ve kombinler</h2><p>Tanımlı ürün paketleri</p></div></div><div className="admin-menu-grid">{adminData.concessionMenus.map((menu) => <article className="admin-menu-card" key={menu.id}><div><strong>{menu.ad}</strong><StatusBadge tone={menu.aktif ? "success" : "neutral"} label={menu.aktif ? "Aktif" : "Taslak"} /></div><p>{menu.icerik.map((item) => `${adminData.concessionProducts.find((product) => product.id === item.urunId)?.ad.tr ?? "Ürün"} × ${item.adet}`).join(" · ")}</p><strong>{menu.fiyat} TL</strong></article>)}</div></section>
      {draft && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title"><div className="admin-section-heading"><div><h2 id="product-form-title">{draft.id ? "Ürünü düzenle" : "Büfe ürünü ekle"}</h2><p>Ürün adlarını dört dilde tanımlayın.</p></div><button className="admin-icon-button" type="button" aria-label="Formu kapat" onClick={() => setDraft(null)}><AdminIcon name="close" /></button></div><form className="admin-form" onSubmit={(event) => void saveProduct(event)}>
        {(["tr", "en", "de", "ar"] as const).map((lang) => <label className="admin-field" key={lang}><span>Ürün adı · {lang.toUpperCase()}</span><input required dir={lang === "ar" ? "rtl" : "ltr"} value={draft.ad[lang]} onChange={(event) => setDraft({ ...draft, ad: { ...draft.ad, [lang]: event.target.value } })} /></label>)}
        <div className="admin-form-row"><label className="admin-field"><span>Kategori</span><select value={draft.kategori} onChange={(event) => setDraft({ ...draft, kategori: event.target.value as BufeKategori })}><option value="misir">Mısır</option><option value="icecek">İçecek</option><option value="atistirmalik">Atıştırmalık</option><option value="menu">Menü</option></select></label><label className="admin-field"><span>Boyut</span><select value={draft.boyut ?? ""} onChange={(event) => setDraft({ ...draft, boyut: event.target.value ? event.target.value as BufeUrunu["boyut"] : undefined })}><option value="">Belirtilmedi</option><option value="Küçük">Küçük</option><option value="Orta">Orta</option><option value="Büyük">Büyük</option></select></label></div>
        <div className="admin-form-row"><label className="admin-field"><span>Fiyat (TL)</span><input type="number" min={0} required value={draft.fiyat} onChange={(event) => setDraft({ ...draft, fiyat: Number(event.target.value) })} /></label><label className="admin-field"><span>Stok</span><input type="number" min={0} required value={draft.stok} onChange={(event) => setDraft({ ...draft, stok: Number(event.target.value) })} /></label></div>
        {error && <p className="admin-inline-error" role="alert">{error}</p>}
        <div className="admin-form-actions"><button className="admin-button" type="button" onClick={() => setDraft(null)}>Vazgeç</button><button className="admin-button admin-button--primary" type="submit">Kaydet</button></div>
      </form></section></div>}
    </div>
  );
}
