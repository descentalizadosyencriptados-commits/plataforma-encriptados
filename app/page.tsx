"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
      window.location.href = "/dashboard";
    } catch (error) {
      setStatus("Error inesperado al iniciar sesión con Supabase.");
      console.error("Supabase login exception:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto min-h-full max-w-6xl rounded-3xl border border-white/6 bg-gradient-to-br from-[#06070a] via-zinc-900/60 to-zinc-900/40 p-12 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Columna Izquierda - Propuesta de Valor */}
          <div className="px-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-500/10 to-indigo-600/8 px-3 py-1 text-sm font-medium text-amber-300 ring-1 ring-amber-500/10">
              <span>🔒 En producción • Conectando con Web3</span>
            </div>

            <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-300">Finanzas sin intermediarios.</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-indigo-400">Tu capital bajo tu control.</span>
            </h2>

            <p className="mt-6 text-lg text-zinc-300 max-w-prose">
              Aprende a dominar el ecosistema DeFi. Domina estrategias profesionales de Yield Farming, provee liquidez concentrada en Uniswap V3/V4, gestiona Lending en Aave y construye un portafolio cripto sólido con total tranquilidad legal y fiscal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                ["Bitcoin", "#F7931A"],
                ["Ethereum", "#627EEA"],
                ["Uniswap", "#FF007A"],
                ["Aave", "#2EB67D"],
                ["Celo", "#35D07F"],
                ["Arbitrum", "#28a0f0"],
                ["Polygon", "#8247e5"],
                ["Base", "#1b1f3a"],
              ].map(([name, color]) => (
                <span key={String(name)} style={{ borderColor: color as string }} className="px-3 py-1 rounded-full text-sm font-medium text-zinc-100 border" >{String(name)}</span>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Card de Acceso */}
          <div className="flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-800 p-8 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-40 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/40">
                  <span className="text-sm font-medium text-zinc-300">Logo Encriptados Academy</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailPasswordLogin}>
                <label className="flex flex-col text-sm text-slate-300">
                  Correo electrónico
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="tu@correo.com"
                  />
                </label>

                <label className="flex flex-col text-sm text-slate-300">
                  Contraseña
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 rounded-2xl border border-slate-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="********"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition duration-200 hover:bg-amber-400"
                >
                  Iniciar Sesión
                </button>

                <div className="text-center mt-2">
                  <button type="button" onClick={handleMagicLink} className="text-sm text-amber-300 hover:underline">Enviar Magic Link</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {status ? (
          <p className="mt-6 text-center text-sm text-slate-300">{status}</p>
        ) : null}
      </div>
      {/* Features Grid - ¿Por qué Encriptados Academy? */}
      <div className="mt-12 mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white">¿Por qué Encriptados Academy?</h3>
          <p className="mt-2 text-sm text-zinc-400">Educación profesional en DeFi, rendimiento avanzado y seguridad patrimonial.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-300">UNI</div>
              <div>
                <h4 className="font-semibold text-white">Estratégias Uniswap V3/V4</h4>
                <p className="mt-2 text-sm text-zinc-400">Aprende a diseñar rangos de precio óptimos y maximizar tus fees mediante el rebalanceo estratégico de pools dinámicas.</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400">AAV</div>
              <div>
                <h4 className="font-semibold text-white">Lending & Borrowing</h4>
                <p className="mt-2 text-sm text-zinc-400">Domina protocolos como Aave para usar tu colateral estratégicamente, abrir líneas de crédito descentralizadas y optimizar tu capital.</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300">TAX</div>
              <div>
                <h4 className="font-semibold text-white">Tranquilidad Legal y Fiscal</h4>
                <p className="mt-2 text-sm text-zinc-400">Opera con la seguridad de saber cómo declarar de forma correcta tus rendimientos DeFi, logrando total paz jurídica en 2026.</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-300">🔒</div>
              <div>
                <h4 className="font-semibold text-white">Custodia Profesional</h4>
                <p className="mt-2 text-sm text-zinc-400">Implementa protocolos técnicos avanzados y aprende el manejo seguro de hardware wallets para que nadie pueda tocar tus fondos.</p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-400/20 flex items-center justify-center text-green-300">📈</div>
              <div>
                <h4 className="font-semibold text-white">Calculadoras Dinámicas</h4>
                <p className="mt-2 text-sm text-zinc-400">Acceso exclusivo a simuladores para proyectar tus rangos de liquidez, calcular impermanent loss y gestionar riesgos.</p>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-400/20 flex items-center justify-center text-purple-300">👥</div>
              <div>
                <h4 className="font-semibold text-white">Comunidad Encriptados Pro</h4>
                <p className="mt-2 text-sm text-zinc-400">Resuelve tus dudas directamente con soporte especializado debajo de cada módulo y avanza de la mano con profesionales del ecosistema.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
