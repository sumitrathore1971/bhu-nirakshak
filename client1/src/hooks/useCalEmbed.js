import { useMemo } from "react";

export function useCalEmbed(options) {
  // Placeholder hook to satisfy Navbar API. You can wire to Cal.com later.
  return useMemo(() => ({
    namespace: options?.namespace || "default",
    layout: options?.layout || "month_view",
  }), [options?.namespace, options?.layout]);
}

