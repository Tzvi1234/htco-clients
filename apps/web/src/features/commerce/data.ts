// The Design 1C demo's product names, shown only inside the Suppliers demo frame. Orders, listings
// and shipping are live from Etsy (live.tsx).
import { bi, useBi, type Bi, type ProductKind } from "../../shared/ui/kit/index.ts";

export const PRODUCT_NAMES: Record<ProductKind, Bi> = {
  star: bi("הדפס מפת כוכבים אישית", "Personalized star map print"),
  pet: bi("פורטרט חיית מחמד", "Custom pet portrait"),
  towel: bi("מגבת מטבח מפשתן", "Linen tea towel"),
  mug: bi("ספל קרמיקה עם שם", "Ceramic name mug"),
};

/** Product names in the user's language. */
export function useProductNames(): Record<ProductKind, string> {
  const text = useBi();
  return {
    star: text(PRODUCT_NAMES.star),
    pet: text(PRODUCT_NAMES.pet),
    towel: text(PRODUCT_NAMES.towel),
    mug: text(PRODUCT_NAMES.mug),
  };
}
