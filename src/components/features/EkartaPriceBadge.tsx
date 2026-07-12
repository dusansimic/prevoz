import { Badge } from "@/components/ui/badge";
import { useEkartaOffer } from "@/hooks/use-ekarta-offer";
import { formatRsd } from "@/lib/utils";

/**
 * Online ticket price (from the e-karta shop) for one train on a relation+date,
 * shown as a small "od …" badge. Renders nothing while the shop is checked and
 * when the train is not sold online, so cards can drop it in unconditionally.
 * Price is for 1 passenger, 2nd class.
 */
export function EkartaPriceBadge({
  fromCode,
  toCode,
  dateIso,
  trainNumber,
}: {
  fromCode: string;
  toCode: string;
  dateIso: string;
  trainNumber: string;
}) {
  const offer = useEkartaOffer(fromCode, toCode, dateIso, trainNumber);

  if (offer.status !== "available" || offer.priceRsd === undefined) return null;

  return (
    <Badge
      variant="secondary"
      className="font-normal tabular-nums"
      title="2. razred, 1 putnik"
    >
      od {formatRsd(offer.priceRsd)}
    </Badge>
  );
}
