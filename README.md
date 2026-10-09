# CineQ — Sinema & Büfe Rezervasyon Uygulaması

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)](https://tauri.app/)
[![Astro](https://img.shields.io/badge/Astro-v5-orange?logo=astro)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

Vizyondaki filmleri listeleyen, salon koltuk seçimi ve büfe siparişi sağlayan mobil ve masaüstü uygulaması.

---

## İçindekiler
- [Proje Bilgileri](#proje-bilgileri)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Mimari](#mimari)
- [Lisans](#lisans)

---

## Proje Bilgileri

- **Üniversite:** [İstinye Üniversitesi](https://www.istinye.edu.tr/)
- **Ders:** MYO063 - Mobil Uygulama Geliştirme
- **Eğitmen:** [Keyvan Arasteh](https://github.com/keyvanarasteh)
- **Öğrenci:** Harun Ekici
- **Öğrenci No:** 2520171003 / 2620511144
- **Program:** Bilgisayar Teknolojisi
- **Proje Fikri Detayı:** [docs/proje-fikri.md](docs/proje-fikri.md)

---

## Kurulum ve Çalıştırma

Projeyi çalıştırmak için:

```bash
git clone https://github.com/Harun-Ekici/Cinema-App-Deneme.git
cd Cinema-App-Deneme
# Bağımlılıkları yükleyin
bun install

# Web arayüzünü geliştirme modunda başlatın
bun run dev

# Tauri masaüstü uygulamasını başlatın
bun run tauri dev

# Derleme (Build)
bun run build