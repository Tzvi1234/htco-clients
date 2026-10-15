// The home carousel's studio renders on transparent grounds: five for the default palette and
// the same five for Design 4 (Design 1C `HERO`).
import { msg } from "@lingui/core/macro";

import hero0 from "../../assets/hero/hero0.webp";
import hero1 from "../../assets/hero/hero1.webp";
import hero2 from "../../assets/hero/hero2.webp";
import hero3 from "../../assets/hero/hero3.webp";
import hero4 from "../../assets/hero/hero4.webp";
import hero5 from "../../assets/hero/hero5.webp";
import hero6 from "../../assets/hero/hero6.webp";
import hero7 from "../../assets/hero/hero7.webp";
import hero8 from "../../assets/hero/hero8.webp";
import hero9 from "../../assets/hero/hero9.webp";

export const HERO_NAMES = [
  msg`Miniature AI office`,
  msg`Desk, monitor and robot`,
  msg`Printed product stack`,
  msg`Robot holding a parcel`,
  msg`Shop kiosk`,
] as const;

export const HEROES = {
  sbb: [hero0, hero1, hero2, hero3, hero4],
  d4: [hero5, hero6, hero7, hero8, hero9],
} as const;
