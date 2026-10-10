<script lang="ts">
  // CineQ Navigasyon — Mobilde Alt Menü, Masaüstünde Yan Menü (Sidebar) (Svelte 5 Runes)
  import { onMount } from "svelte";
  import { sepet } from "$lib/sepet.svelte";

  let { currentPath = "/" } = $props();
  let yol = $state("");

  $effect(() => {
    yol = currentPath;
  });

  const menu = [
    { href: "/", ad: "Keşfet", ikon: "🎬" },
    { href: "/biletlerim", ad: "Biletlerim", ikon: "🎟️" },
    { href: "/sepet", ad: "Sepet", ikon: "🛒" },
    { href: "/profil", ad: "Profil", ikon: "👤" },
    { href: "/hakkinda", ad: "Rehber", ikon: "📖" },
  ];

  onMount(() => {
    yol = window.location.pathname;
    sepet.yenile();
    const handleNav = () => {
      yol = window.location.pathname;
      sepet.yenile();
    };
    document.addEventListener("astro:page-load", handleNav);
    window.addEventListener("popstate", handleNav);
    return () => {
      document.removeEventListener("astro:page-load", handleNav);
      window.removeEventListener("popstate", handleNav);
    };
  });
</script>

<nav class="ana-navigasyon" aria-label="Ana Menü">
  {#each menu as m}
    <a
      href={m.href}
      class="nav-baglanti"
      class:aktif={yol === m.href || (m.href !== "/" && yol.startsWith(m.href))}
    >
      <span class="ikon">{m.ikon}</span>
      <span class="etiket">{m.ad}</span>
      {#if m.href === "/sepet" && sepet.adet > 0}
        <b class="rozet">{sepet.adet}</b>
      {/if}
    </a>
  {/each}
</nav>

<style>
  /* 1. Mobil Düzen (< 1024px): Sabit Alt Menü (Bottom Nav) */
  .ana-navigasyon {
    position: fixed;
    inset-inline: 0;
    bottom: 0;
    display: flex;
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--kart);
    border-top: 1px solid var(--kenar);
    z-index: 20;
  }

  .nav-baglanti {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 0;
    font-size: 11px;
    color: var(--yazi-soluk);
    text-decoration: none;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .nav-baglanti.aktif {
    color: var(--renk-ana);
    font-weight: 600;
  }

  .ikon {
    font-size: 20px;
  }

  .rozet {
    position: absolute;
    top: 4px;
    inset-inline-start: calc(50% + 6px);
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--renk-ana);
    color: var(--zemin);
    font-size: 11px;
    line-height: 18px;
    text-align: center;
  }

  /* 2. Masaüstü Düzen (>= 1024px): Sabit Sol/Sağ Yan Menü (Sidebar) */
  @media (min-width: 1024px) {
    .ana-navigasyon {
      position: fixed;
      inset-inline-start: 0;
      top: 58px; /* Üst başlığın altından başlar */
      bottom: 0;
      width: 240px;
      flex-direction: column;
      justify-content: flex-start;
      padding: 24px 12px;
      gap: 6px;
      border-top: none;
      border-inline-end: 1px solid var(--kenar);
      border-inline-start: none;
      overflow-y: auto;
    }

    .nav-baglanti {
      flex: initial;
      width: 100%;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14px;
      text-align: start;
    }

    .nav-baglanti:hover {
      background: var(--zemin);
      color: var(--yazi);
    }

    .nav-baglanti.aktif {
      background: var(--zemin);
      color: var(--renk-ana);
      font-weight: 700;
    }

    .ikon {
      font-size: 22px;
    }

    .etiket {
      flex: 1;
    }

    .rozet {
      position: static;
      margin-inline-start: auto;
    }
  }
</style>
