import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId, orgId } = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">B</div>
          <span className="font-bold text-lg tracking-tight">BEECARBONIT</span>
        </div>
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm text-zinc-300 hover:text-white transition-colors">
                  Connexion
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Démarrer
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-8 uppercase tracking-widest">
          Next.js 14 · Serverless · EU Region
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Gérez votre patrimoine<br />de façon intelligente
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mb-10">
          GMAO · BIM · ESG · IoT · CSRD — Une plateforme souveraine pour les bâtiments tertiaires modernes.
        </p>
        <div className="flex gap-4">
          {userId ? (
            <Link href="/dashboard">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Mon espace →
              </button>
            </Link>
          ) : (
            <>
              <SignUpButton mode="modal">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Démarrer gratuitement
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Se connecter
                </button>
              </SignInButton>
            </>
          )}
        </div>

        {/* Status badge */}
        {orgId && (
          <div className="mt-8 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-2 rounded-lg">
            ✓ Organisation connectée ({orgId.slice(0, 12)}...)
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © 2026 BEECARBONIT · Serverless Architecture · Region EU (Frankfurt)
      </footer>
    </main>
  );
}
