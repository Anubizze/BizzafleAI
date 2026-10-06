import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <p className="mt-10 text-xs uppercase tracking-[0.18em] text-ink-faint">404</p>
        <h1 className="display mt-3 text-5xl">Такой страницы нет</h1>
        <Link href="/" className="mt-8 inline-block">
          <Button variant="outline">На главную</Button>
        </Link>
      </div>
    </main>
  );
}
