interface WindowLike {
  readonly self: unknown;
  readonly top: unknown;
}

/** True when the page is inside a frame (or cannot tell): it then renders nothing (clickjacking). */
export function refuseFraming(view: WindowLike): boolean {
  try {
    return view.top !== view.self;
  } catch {
    return true;
  }
}
