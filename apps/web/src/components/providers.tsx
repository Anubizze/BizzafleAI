"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <QueryClientProvider client={client}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className:
              "!bg-[var(--bg-elevated)] !text-[var(--fg)] !border !border-[var(--border)] !shadow-[var(--shadow)] !rounded-2xl",
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
