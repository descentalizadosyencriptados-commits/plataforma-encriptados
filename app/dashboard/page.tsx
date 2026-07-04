"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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
        router.push("/login");
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
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna de Cursos Disponibles */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Mis Módulos de Estudio</h2>

          {/* Módulo 1: Ahorro Inteligente en BTC */}
          {(userTier === "Curso Ahorro Inteligente BTC" || userTier === "DeFi Avanzado" || userTier === "Asesoría 1a1" || userTier === "ADMIN") ? (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-amber-500/50 transition">
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Low Ticket</span>
              <h3 className="text-lg font-bold mt-2">Curso de Ahorro Inteligente en Bitcoin</h3>
              <p className="text-sm text-zinc-400 mt-1">Aprende a acumular y custodiar tu Bitcoin de forma segura y estratégica.</p>
            <button 
                type="button"
                onClick={() => router.push('/dashboard/curso/btc')}
                className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-semibold py-2 rounded-lg transition"
              >
                Ingresar al Módulo
              </button>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl opacity-50">
              <h3 className="text-lg font-bold text-zinc-500">Curso de Ahorro Inteligente en Bitcoin</h3>
              <p className="text-sm text-zinc-600 mt-1">No tienes acceso a este módulo.</p>
            </div>
          )}

          {/* Módulo 2: DeFi Avanzado */}
          {(userTier === "DeFi Avanzado" || userTier === "Asesoría 1a1" || userTier === "ADMIN") ? (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 transition">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Medium Ticket</span>
              <h3 className="text-lg font-bold mt-2">DeFi Avanzado y Liquidez Concentrada</h3>
              <p className="text-sm text-zinc-400 mt-1">Estrategias de yield farming, préstamos y optimización de rangos en Uniswap.</p>
              <button 
                type="button"
                onClick={() => router.push('/dashboard/curso/defi')}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg transition"
              >
                Ingresar al Módulo
              </button>
            </div>
          ) : (
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl flex justify-between items-center opacity-40">
              <div>
                <h3 className="text-lg font-bold text-zinc-500">DeFi Avanzado y Liquidez Concentrada</h3>
                <p className="text-sm text-zinc-600 mt-1">Disponible en el plan Medium Ticket.</p>
              </div>
            </div>
          )}
        </div>

        {/* Columna Lateral - Información de Cuenta y Zona VIP */}
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <h3 className="font-semibold text-zinc-300">Tu Membresía Actual</h3>
            <p className="text-xl font-bold mt-2 text-amber-500">{userTier || "Sin Membresía Activa"}</p>
          </div>

          {/* Formulario: Cambiar contraseña */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <h3 className="font-semibold text-zinc-300">Actualizar Contraseña</h3>
            <p className="text-sm text-zinc-400 mt-2">Cambia tu contraseña de forma segura desde tu cuenta.</p>

            <ChangePasswordForm supabase={supabase} />
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