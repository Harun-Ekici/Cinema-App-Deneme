<script lang="ts">
  import { onMount } from "svelte";
  import BosDurum from "$lib/components/ui/BosDurum.svelte";
  import { filmDetayMetinleri } from "$lib/i18n/film-detay";
  import type { UygulamaDili } from "$lib/i18n/liste-durumlari";

  let dil = $state<UygulamaDili>("tr");
  let metin = $derived(filmDetayMetinleri[dil]);

  onMount(() => {
    const dilOneki = window.location.pathname.split("/")[1];
    dil = dilOneki === "en" || dilOneki === "ar" || dilOneki === "fa" ? dilOneki : "tr";
    document.documentElement.lang = dil;
    document.documentElement.dir = dil === "ar" || dil === "fa" ? "rtl" : "ltr";
    document.title = filmDetayMetinleri[dil].sayfaBasligi;
  });

  function filmlereDon() {
    window.location.href = dil === "tr" ? "/" : `/${dil}/`;
  }
</script>

<div class="sayfa">
  <BosDurum
    baslik={metin.filmBulunamadi}
    aciklama={metin.filmBulunamadiAciklama}
    dugmeMetni={metin.filmlereDon}
    tikla={filmlereDon}
  />
</div>
