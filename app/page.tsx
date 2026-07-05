"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkEnv = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus("Error: no se encontraron las variables de entorno de Supabase.");
      console.error("NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están definidas.");
      return false;
    }
    return true;
  };

  const handleEmailPasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checkEnv()) return;
    if (!email || !password) {
      setStatus("Por favor ingresa correo electrónico y contraseña.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Iniciando sesión con correo y contraseña...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus("Error al iniciar sesión. Revisa tu correo o contraseña.");
        console.error("Supabase signInWithPassword error:", error);
        return;
      }

      setStatus("Inicio de sesión exitoso. Redirigiendo...");
      console.log("Supabase signInWithPassword response:", data);
      router.replace("/dashboard");
    } catch (error) {
      setStatus("Error inesperado al iniciar sesión con Supabase.");
      console.error("Supabase login exception:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function verifySession() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setIsCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
        return;
      }
      setIsCheckingSession(false);
    }

    verifySession();
  }, [router]);

  const handleMagicLink = async () => {
    if (!checkEnv()) return;
    if (!email) {
      setStatus("Ingresa tu correo electrónico para recibir el enlace mágico.");
      return;
    }

    setStatus("Enviando enlace mágico al correo...");

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setStatus("Error al enviar el enlace mágico. Revisa la consola.");
        console.error("Supabase signInWithOtp error:", error);
        return;
      }

      setStatus("Revisa tu correo: te enviamos el enlace mágico.");
      console.log("Supabase signInWithOtp response:", data);
    } catch (error) {
      setStatus("Error inesperado al enviar el enlace mágico.");
      console.error("Supabase magic link exception:", error);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-xl">
          <div className="h-4 w-4 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Verificando sesión...</p>
            <p className="text-xs text-slate-500">Un momento mientras protegemos tu acceso.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="relative flex flex-col justify-between bg-[#0B0F19] px-6 py-10 sm:px-12 sm:py-16 text-white overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%)] blur-3xl opacity-60" />
          <div className="absolute bottom-0 right-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(234,179,8,0.18),_transparent_55%)] opacity-70 blur-3xl" />

          <div className="space-y-10 relative z-10">
            <div className="flex items-center justify-start">
              <Image
                src="/images/logo-encriptados.png"
                alt="Logo Encriptados Academy"
                width={150}
                height={70}
                priority
                className="object-contain"
              />
            </div>

            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300/80">Encriptados Academy</p>
              <h1 className="mt-6 text-4xl font-serif font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Finanzas sin <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">intermediarios.</span>
                <span className="block text-white">Tu <span className="text-amber-300">capital</span> bajo tu control.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Educación DeFi premium con estrategias de liquidez, lending y custodia profesional para construir tu posición con confianza.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Bitcoin", "#F7931A"],
                ["Ethereum", "#627EEA"],
                ["Uniswap", "#FF007A"],
                ["Aave", "#2EB67D"],
                ["Celo", "#35D07F"],
                ["Arbitrum", "#28a0f0"],
              ].map(([name, color]) => (
                <span
                  key={String(name)}
                  style={{ borderColor: color as string }}
                  className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-medium text-slate-100 bg-white/5 backdrop-blur-sm"
                >
                  {String(name)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 relative z-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300 shadow-[0_40px_120px_-80px_rgba(255,255,255,0.25)]">
            <p className="text-sm leading-7">
              Una experiencia global de software premium para traders y creadores Web3 que exigen un entorno elegante y seguro.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 sm:py-16 text-slate-900">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Acceso premium</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Inicia sesión en tu Aula Virtual</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Ingresa tu correo y contraseña para desbloquear contenido exclusivo DeFi.</p>
            </div>

            <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                <div className="relative mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border-0 bg-transparent pl-10 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                <div className="relative mt-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="********"
                    className="w-full border-0 bg-transparent pl-10 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-3xl bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-slate-950/20 transition duration-200 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
              </button>

              {status ? (
                <p className="text-center text-sm text-rose-600">{status}</p>
              ) : null}
            </form>

            <div className="relative my-8">
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
              <span className="relative bg-white px-4 text-sm text-slate-500">o</span>
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition duration-200 hover:bg-slate-50"
            >
              Enviar Magic Link
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
