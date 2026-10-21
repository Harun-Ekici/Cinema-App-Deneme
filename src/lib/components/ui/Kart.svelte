<script lang="ts">
  import type { KartProps } from "$lib/types";

  let {
    baslik,
    altMetin,
    gorsel,
    etiket,
    etiketTuru = "bilgi",
    href,
    onTikla,
  }: KartProps = $props();

  function spaceToClick(event: KeyboardEvent) {
    if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }
</script>

{#snippet icerik()}
  {#if gorsel}
    <img class="kart-gorsel" src={gorsel.src} alt={gorsel.alt.trim() || baslik} />
  {/if}

  <span class="kart-icerik">
    {#if etiket}
      <span class="kart-etiket" class:bilgi={etiketTuru === "bilgi"} class:basari={etiketTuru === "basari"} class:uyari={etiketTuru === "uyari"} class:hata={etiketTuru === "hata"}>
        {etiket}
      </span>
    {/if}
    <span class="kart-baslik">{baslik}</span>
    {#if altMetin}
      <span class="kart-alt-metin">{altMetin}</span>
    {/if}
  </span>
{/snippet}

{#if href !== undefined}
  <a class="kart" href={href} tabindex="0" onkeydown={spaceToClick}>
    {@render icerik()}
  </a>
{:else if onTikla}
  <button class="kart" type="button" tabindex="0" onclick={onTikla}>
    {@render icerik()}
  </button>
{/if}

<style>
  .kart {
    display: flex;
    flex-direction: column;
    gap: var(--kart-bosluk);
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: var(--kart-ic-bosluk);
    overflow: hidden;
    border: var(--kart-kenar-genisligi) var(--kart-kenar-stili) var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
    text-align: start;
    text-decoration: none;
    transition:
      background-color var(--kart-gecis),
      border-color var(--kart-gecis),
      box-shadow var(--kart-gecis),
      transform var(--kart-gecis);
  }

  a.kart,
  button.kart {
    cursor: pointer;
  }

  .kart:hover {
    border-color: var(--renk-ana);
    box-shadow: 0 var(--kart-golge-y) var(--kart-golge-yayilim) var(--kenar);
    transform: translateY(calc(0rem - var(--kart-hover-yukselme)));
  }

  .kart:focus-visible {
    outline: var(--kart-odak-genisligi) solid var(--kart-odak-rengi);
    outline-offset: var(--kart-odak-araligi);
  }

  .kart-gorsel {
    display: block;
    width: 100%;
    max-height: var(--kart-gorsel-yukseklik);
    aspect-ratio: var(--kart-gorsel-orani);
    object-fit: cover;
    border-radius: var(--kart-gorsel-radius);
  }

  .kart-icerik {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--kart-metin-bosluk);
    min-width: 0;
    text-align: start;
  }

  .kart-etiket {
    max-width: 100%;
    padding: var(--kart-etiket-dikey-bosluk) var(--kart-etiket-yatay-bosluk);
    overflow: hidden;
    border-radius: var(--kart-etiket-radius);
    font-size: var(--kart-etiket-yazi-boyutu);
    font-weight: 700;
    line-height: var(--kart-satir-yuksekligi);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kart-etiket.bilgi {
    background: var(--kart-etiket-bilgi-zemin);
    color: var(--kart-etiket-bilgi-yazi);
  }

  .kart-etiket.basari {
    background: var(--kart-etiket-basari-zemin);
    color: var(--kart-etiket-basari-yazi);
  }

  .kart-etiket.uyari {
    background: var(--kart-etiket-uyari-zemin);
    color: var(--kart-etiket-uyari-yazi);
  }

  .kart-etiket.hata {
    background: var(--kart-etiket-hata-zemin);
    color: var(--kart-etiket-hata-yazi);
  }

  .kart-baslik {
    display: -webkit-box;
    width: 100%;
    overflow: hidden;
    color: var(--yazi);
    font-size: var(--kart-baslik-yazi-boyutu);
    font-weight: 700;
    line-height: var(--kart-satir-yuksekligi);
    overflow-wrap: anywhere;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--kart-baslik-satir-sayisi);
  }

  .kart-alt-metin {
    display: -webkit-box;
    width: 100%;
    overflow: hidden;
    color: var(--yazi-soluk);
    font-size: var(--kart-alt-metin-yazi-boyutu);
    line-height: var(--kart-satir-yuksekligi);
    overflow-wrap: anywhere;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--kart-alt-metin-satir-sayisi);
  }
</style>
