"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Inicializamos Supabase de forma segura en el cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ChangePasswordForm({ supabase }: { supabase: any }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!newPassword || !confirmPassword) {
      setStatus("Completa ambos campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("Las contraseñas no coinciden.");
      return;
    }

    setUpdating(true);
    setStatus("Actualizando contraseña...");

    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setStatus(error.message ?? "Error al actualizar la contraseña.");
      } else {
        setStatus("Contraseña actualizada correctamente.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setStatus(err?.message ?? "Error inesperado.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none"
      />

      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none"
      />

      <button
        type="submit"
        disabled={updating}
        className="w-full rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {updating ? "Actualizando..." : "Actualizar contraseña"}
      </button>

      {status ? <p className="text-sm text-amber-300">{status}</p> : null}
    </form>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      // Obtenemos la sesión del usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/");
        return;
      }

      setUserEmail(session.user.email || "");

      // Buscamos su nivel de membresía en la tabla de perfiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserTier(profile.membership_tier);
      }
      setLoading(false);
    }

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Cargando tu aula de clase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      {/* Encabezado */}
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">Encriptados Academy</h1>
          <p className="text-sm text-zinc-400">{userEmail}</p>
        </div>
        <div className="flex gap-4">
          {/* Botón exclusivo si eres ADMIN para ir al panel de carga */}
          {userTier === "ADMIN" && (
            <button 
              onClick={() => router.push("/admin")}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold px-4 py-2 rounded-lg transition"
            >
              ⚙️ Panel Administrador
            </button>
          )}
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
            className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna de Cursos Disponibles - Tarjetas Modernas */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Mis Módulos de Estudio</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card: Bitcoin */}
            <article className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/50 to-zinc-900 border border-zinc-800 p-5 shadow-lg card-hover-smooth transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-amber-400/30 hover:ring-2 hover:ring-amber-400/20">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-28 w-28 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                    <Image src="/images/metrics/btc-cover.png" alt="Portada BTC" width={112} height={112} priority className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-amber-300">Curso Ahorro Inteligente BTC</h3>
                  <p className="mt-2 text-sm text-zinc-400">Estrategias de acumulación, custodia y hodling profesional.</p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => router.push('/dashboard/curso/btc')} className="flex-1 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2 font-semibold transition">Iniciar Clase</button>
                    <button className="flex-1 rounded-full border border-slate-800 bg-slate-950/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900/20">Ver Calculadora</button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card: Ethereum / DeFi */}
            <article className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/50 to-zinc-900 border border-zinc-800 p-5 shadow-lg card-hover-smooth transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-400/30 hover:ring-2 hover:ring-indigo-400/20">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-28 w-28 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                    <Image src="/images/metrics/eth-cover.png" alt="Portada ETH" width={112} height={112} priority className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-indigo-300">DeFi Avanzado (Ethereum)</h3>
                  <p className="mt-2 text-sm text-zinc-400">Deep-dive en smart contracts, lending y estrategias avanzadas.</p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => router.push('/dashboard/curso/defi')} className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 font-semibold transition">Iniciar Clase</button>
                    <button className="flex-1 rounded-full border border-slate-800 bg-slate-950/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900/20">Ver Calculadora</button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card: Uniswap */}
            <article className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/50 to-zinc-900 border border-zinc-800 p-5 shadow-lg card-hover-smooth transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-pink-400/30 hover:ring-2 hover:ring-pink-400/20">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-28 w-28 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                    <Image src="/images/metrics/uni-cover.png" alt="Portada UNI" width={112} height={112} priority className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-pink-300">Uniswap · Liquidez Concentrada</h3>
                  <p className="mt-2 text-sm text-zinc-400">Optimiza rangos de liquidez y fees con estrategias prácticas.</p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button className="flex-1 rounded-full bg-pink-500 hover:bg-pink-400 text-white py-2 font-semibold transition">Iniciar Clase</button>
                    <button className="flex-1 rounded-full border border-slate-800 bg-slate-950/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900/20">Ver Calculadora</button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card: Aave */}
            <article className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/50 to-zinc-900 border border-zinc-800 p-5 shadow-lg card-hover-smooth transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-400/30 hover:ring-2 hover:ring-emerald-400/20">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-28 w-28 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden">
                    <Image src="/images/metrics/aave-cover.png" alt="Portada AAVE" width={112} height={112} priority className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-emerald-300">Aave · Lending & Borrowing</h3>
                  <p className="mt-2 text-sm text-zinc-400">Prácticas de lending, colateral y optimización de posiciones.</p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button className="flex-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-2 font-semibold transition">Iniciar Clase</button>
                    <button className="flex-1 rounded-full border border-slate-800 bg-slate-950/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900/20">Ver Calculadora</button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Columna Lateral - Panel de Control de Usuario */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800/60 bg-[#111625]/95 p-6 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Control de cuenta</p>
              <h3 className="mt-4 text-lg font-semibold text-slate-100">Tu Membresía Actual</h3>
              <p className="mt-3 text-3xl font-bold text-amber-500">{userTier || "Sin Membresía Activa"}</p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/90 p-5">
                <div>
                  <p className="text-sm text-slate-400">Nivel de acceso</p>
                  <p className="mt-1 text-base font-semibold text-slate-100">{userTier || "Registro Básico"}</p>
                </div>
                <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Premium</span>
              </div>

              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/90 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Actualizar contraseña</h4>
                <p className="mt-2 text-sm text-slate-500">Protege tu cuenta con un password fuerte y actualizado.</p>
                <div className="mt-5">
                  <ChangePasswordForm supabase={supabase} />
                </div>
              </div>
            </div>
          </div>

          {/* Zona VIP exclusiva para el High Ticket o ADMIN */}
          {(userTier === "Asesoría 1a1" || userTier === "ADMIN") && (
            <div className="p-6 bg-gradient-to-br from-amber-500/10 to-zinc-900 border border-amber-500/30 rounded-xl">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-1 rounded uppercase tracking-wider">
                Exclusivo VIP {userTier === "ADMIN" && "· MODO DIOS"}
              </span>
              <h3 className="text-lg font-bold mt-3 text-amber-400">Zona de Acompañamiento 1a1</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Tienes acceso directo prioritario. Agenda tus sesiones personalizadas y descarga las herramientas de analítica.
              </p>
              <div className="mt-4 space-y-2">
                <a 
                  href="#" 
                  className="block text-center w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold py-2 rounded-lg transition"
                >
                  📅 Agendar Sesión Privada
                </a>
                <a 
                  href="#" 
                  className="block text-center w-full bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 py-2 rounded-lg transition"
                >
                  📊 Descargar Plantillas Avanzadas
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}