//! Bu uygulamanın tabloları ve kaynak tanımları.
//! Sütun adları `src/` altındaki TypeScript tipleriyle ve tasarım belgelerindeki alan adlarıyla birebir aynıdır.
use crate::backend::crud::{col, req, Entity, Kind};
use crate::backend::error::{AppError, AppResult};
pub use crate::backend::schema_common::*;

/// Kayıt olan (ilk kullanıcı dışındaki) herkese verilen rol; `None` ise rolsüz kalır.
pub const DEFAULT_ROLE: Option<&str> = Some("customer");

pub static FILM: Entity = Entity {
    resource: "Film",
    table: "filmler",
    pk: "id",
    pk_kind: Kind::Int,
    cols: &[
        req("ad", Kind::Json),
        col("afis", Kind::Text),
        col("gradyan", Kind::Text),
        col("sinopsis", Kind::Text),
        col("yonetmen", Kind::Text),
        col("oyuncular", Kind::Json),
        req("sureDk", Kind::Int),
        col("turler", Kind::Json),
        col("imdb", Kind::Real),
        col("yasSiniri", Kind::Int),
        col("durum", Kind::Text),
    ],
    search: &["yonetmen", "sinopsis"],
    filters: &["durum", "yasSiniri", "sureDk"],
    order_by: "\"id\" DESC",
    readonly: false,
};

pub static SINEMA: Entity = Entity {
    resource: "Sinema",
    table: "sinemalar",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("sehir", Kind::Text),
        col("adres", Kind::Text),
    ],
    search: &["ad", "sehir"],
    filters: &["sehir"],
    order_by: "\"ad\" ASC",
    readonly: false,
};

pub static SALON: Entity = Entity {
    resource: "Salon",
    table: "salonlar",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("sinemaId", Kind::Text),
        req("numara", Kind::Int),
        req("ad", Kind::Text),
        col("tip", Kind::Text),
        req("harita", Kind::Json),
        col("durum", Kind::Text),
    ],
    search: &["ad"],
    filters: &["sinemaId", "tip", "durum"],
    order_by: "\"sinemaId\" ASC, \"numara\" ASC",
    readonly: false,
};

pub static SEANS: Entity = Entity {
    resource: "Seans",
    table: "seanslar",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("filmId", Kind::Int),
        req("salonId", Kind::Text),
        req("baslangic", Kind::Date),
        col("dil", Kind::Text),
        col("altyazi", Kind::Text),
        req("fiyat", Kind::Json),
        col("iptal", Kind::Json),
    ],
    search: &[],
    filters: &["filmId", "salonId", "dil", "baslangic"],
    order_by: "\"baslangic\" ASC",
    readonly: false,
};

pub static KOLTUK_REZERVASYONU: Entity = Entity {
    resource: "KoltukRezervasyonu",
    table: "koltuk_rezervasyonlari",
    pk: "id",
    pk_kind: Kind::Int,
    cols: &[
        req("seansId", Kind::Text),
        req("satir", Kind::Int),
        req("sutun", Kind::Int),
        col("durum", Kind::Text),
        col("siparisId", Kind::Text),
        col("tutmaBitis", Kind::Date),
    ],
    search: &[],
    filters: &["seansId", "durum", "siparisId"],
    order_by: "\"seansId\" ASC, \"satir\" ASC, \"sutun\" ASC",
    readonly: false,
};

pub static BUFE_URUNU: Entity = Entity {
    resource: "BufeUrunu",
    table: "bufe_urunleri",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Json),
        req("kategori", Kind::Text),
        col("boyut", Kind::Text),
        req("fiyat", Kind::Real),
        col("stok", Kind::Int),
        col("aktif", Kind::Bool),
    ],
    search: &[],
    filters: &["kategori", "aktif", "stok"],
    order_by: "\"kategori\" ASC, \"id\" ASC",
    readonly: false,
};

pub static BUFE_MENUSU: Entity = Entity {
    resource: "BufeMenusu",
    table: "bufe_menuleri",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("icerik", Kind::Json),
        req("fiyat", Kind::Real),
        col("aktif", Kind::Bool),
    ],
    search: &["ad"],
    filters: &["aktif"],
    order_by: "\"ad\" ASC",
    readonly: false,
};

pub static SIPARIS: Entity = Entity {
    resource: "Siparis",
    table: "siparisler",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        col("musteriId", Kind::Text),
        col("biletler", Kind::Json),
        col("bufe", Kind::Json),
        req("toplam", Kind::Real),
        col("durum", Kind::Text),
        col("olusturma", Kind::Date),
        col("kullanimZamani", Kind::Date),
    ],
    search: &["id"],
    filters: &["musteriId", "durum", "olusturma"],
    order_by: "\"olusturma\" DESC",
    readonly: false,
};

pub static BILET: Entity = Entity {
    resource: "Bilet",
    table: "biletler",
    pk: "kod",
    pk_kind: Kind::Text,
    cols: &[
        req("siparisId", Kind::Text),
        req("seansId", Kind::Text),
        req("satir", Kind::Int),
        req("sutun", Kind::Int),
        req("kategori", Kind::Text),
        req("fiyat", Kind::Real),
        col("kullanildi", Kind::Bool),
        col("kullanimZamani", Kind::Date),
    ],
    search: &["kod"],
    filters: &["siparisId", "seansId", "kategori", "kullanildi"],
    order_by: "\"kod\" ASC",
    readonly: false,
};

pub static MUSTERI: Entity = Entity {
    resource: "Musteri",
    table: "musteriler",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("eposta", Kind::Text),
        col("favoriFilmler", Kind::Json),
        col("siparisSayisi", Kind::Int),
        col("durum", Kind::Text),
        col("kayit", Kind::Date),
    ],
    search: &["ad", "eposta"],
    filters: &["durum"],
    order_by: "\"kayit\" DESC",
    readonly: false,
};

pub static KAMPANYA: Entity = Entity {
    resource: "Kampanya",
    table: "kampanyalar",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("tur", Kind::Text),
        req("deger", Kind::Real),
        col("kapsam", Kind::Text),
        req("baslangic", Kind::Date),
        req("bitis", Kind::Date),
        col("durum", Kind::Text),
    ],
    search: &["ad"],
    filters: &["durum", "kapsam"],
    order_by: "\"baslangic\" DESC",
    readonly: false,
};

pub static ABONELIK_PLANI: Entity = Entity {
    resource: "AbonelikPlani",
    table: "abonelik_planlari",
    pk: "id",
    pk_kind: Kind::Text,
    cols: &[
        req("ad", Kind::Text),
        req("aylikFiyat", Kind::Real),
        col("ayricalik", Kind::Json),
        col("durum", Kind::Text),
    ],
    search: &[],
    filters: &["durum"],
    order_by: "\"ad\" ASC",
    readonly: false,
};

pub static PROJECT: &[&Entity] = &[&FILM, &SINEMA, &SALON, &SEANS, &KOLTUK_REZERVASYONU, &BUFE_URUNU, &BUFE_MENUSU, &SIPARIS, &BILET, &MUSTERI, &KAMPANYA, &ABONELIK_PLANI];

/// Bütün kaynaklar: ortak + bu uygulamanınkiler.
pub fn all() -> Vec<&'static Entity> {
    let mut v: Vec<&'static Entity> = vec![&CONTACT_MESSAGE, &CONTENT_PAGE, &AUDIT_LOG];
    v.extend(PROJECT.iter().copied());
    v
}

pub fn entity(resource: &str) -> AppResult<&'static Entity> {
    all().into_iter().find(|e| e.resource == resource)
        .ok_or_else(|| AppError::NotFound(format!("`{resource}` adında bir kaynak yok.")))
}
