<script lang="ts">
  let {
    baslik,
    aciklama,
    dugmeMetni,
    tikla,
  }: {
    baslik: string;
    aciklama: string;
    dugmeMetni?: string;
    tikla?: () => void;
  } = $props();
</script>

<section class="bos-durum" aria-labelledby="bos-durum-baslik">
  <span class="ikon" aria-hidden="true">🎬</span>
  <h2 id="bos-durum-baslik">{baslik}</h2>
  <p>{aciklama}</p>
  {#if dugmeMetni && tikla}
    <button type="button" onclick={tikla}>{dugmeMetni}</button>
  {/if}
</section>

<style>
  .bos-durum {
    display: flex;
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--durum-oge-araligi);
    width: 100%;
    padding: var(--durum-ic-bosluk);
    border: var(--kart-kenar-genisligi) dashed var(--kenar);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
    text-align: center;
  }

  .ikon {
    font-size: var(--durum-ikon-boyutu);
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: var(--durum-baslik-boyutu);
  }

  p {
    max-width: var(--durum-metin-genisligi);
    color: var(--yazi-soluk);
  }

  button {
    padding: var(--durum-dugme-dikey-bosluk) var(--durum-dugme-yatay-bosluk);
    border: var(--kart-kenar-genisligi) solid var(--renk-ana);
    border-radius: var(--kart-etiket-radius);
    background: var(--renk-ana);
    color: var(--header-yazi);
    font-weight: 600;
  }
</style>
