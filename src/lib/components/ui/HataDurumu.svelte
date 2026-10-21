<script lang="ts">
  let {
    mesaj,
    dugmeMetni = "Tekrar dene",
    tekrarDene,
  }: {
    mesaj: string;
    dugmeMetni?: string;
    tekrarDene: () => void;
  } = $props();
</script>

<section class="hata-durumu" role="alert">
  <span class="ikon" aria-hidden="true">!</span>
  <p>{mesaj}</p>
  <button type="button" onclick={tekrarDene}>{dugmeMetni}</button>
</section>

<style>
  .hata-durumu {
    display: flex;
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--durum-oge-araligi);
    width: 100%;
    padding: var(--durum-ic-bosluk);
    border: var(--kart-kenar-genisligi) solid var(--tehlike);
    border-radius: var(--radius);
    background: var(--kart);
    color: var(--yazi);
    text-align: center;
  }

  .ikon {
    display: grid;
    width: var(--durum-ikon-boyutu);
    aspect-ratio: 1;
    place-items: center;
    border-radius: var(--kart-etiket-radius);
    background: var(--kart-etiket-hata-zemin);
    color: var(--kart-etiket-hata-yazi);
    font-weight: 800;
  }

  p {
    margin: 0;
  }

  button {
    padding: var(--durum-dugme-dikey-bosluk) var(--durum-dugme-yatay-bosluk);
    border: var(--kart-kenar-genisligi) solid var(--tehlike);
    border-radius: var(--kart-etiket-radius);
    background: var(--tehlike);
    color: var(--header-yazi);
    font-weight: 600;
  }
</style>
