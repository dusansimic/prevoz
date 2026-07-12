import { useEffect, useState } from "react";
import { getEkartaOffers } from "@/services/train-service";

export interface EkartaOffer {
  status: "loading" | "available" | "unavailable";
  /** Price in RSD (1 passenger, 2nd class); set only when `available`. */
  priceRsd?: number;
}

const LOADING: EkartaOffer = { status: "loading" };
const UNAVAILABLE: EkartaOffer = { status: "unavailable" };

/**
 * Whether a specific train on a relation+date is sold online, and its price.
 * All trains sharing a relation reuse one cached request (see `getEkartaOffers`).
 * Errors resolve to `unavailable` (fail-soft).
 */
export function useEkartaOffer(
  fromCode: string,
  toCode: string,
  dateIso: string,
  trainNumber: string,
): EkartaOffer {
  const [offer, setOffer] = useState<EkartaOffer>(LOADING);

  useEffect(() => {
    let active = true;
    setOffer(LOADING);
    getEkartaOffers(fromCode, toCode, dateIso).then((offers) => {
      if (!active) return;
      const priceRsd = offers.get(trainNumber);
      setOffer(priceRsd === undefined ? UNAVAILABLE : { status: "available", priceRsd });
    });
    return () => {
      active = false;
    };
  }, [fromCode, toCode, dateIso, trainNumber]);

  return offer;
}
