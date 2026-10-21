export type KartEtiketTuru = "bilgi" | "basari" | "uyari" | "hata";

interface KartGorunumProps {
  baslik: string;
  altMetin?: string;
  gorsel?: {
    src: string;
    alt: string;
  };
  etiket?: string;
  etiketTuru?: KartEtiketTuru;
}

export type KartProps = KartGorunumProps &
  (
    | { href: string; onTikla?: never }
    | { href?: never; onTikla: () => void }
  );
