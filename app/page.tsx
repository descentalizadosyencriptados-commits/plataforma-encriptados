"use client";

import { FormEvent, useState } from "react";
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
      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 p-12 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
        <span className="mb-6 inline-flex rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300 ring-1 ring-amber-500/20">
          Bienvenido a la Academia
        </span>
        <h1 className="text-center text-5xl font-semibold tracking-tight text-amber-300 sm:text-6xl">
          Encriptados Academy
        </h1>
        <p className="mt-4 max-w-2xl text-center text-lg text-slate-300 sm:text-xl">
          Panel de Control de Estudiantes
        </p>

        <form className="mt-10 w-full max-w-xl space-y-4" onSubmit={handleEmailPasswordLogin}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm text-slate-300">
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="tu@correo.com"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-300">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="********"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={handleMagicLink}
              className="inline-flex w-full items-center justify-center rounded-full border border-amber-500/40 bg-slate-950/70 px-8 py-4 text-base font-semibold text-amber-300 transition duration-300 ease-out hover:border-amber-300 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Enviar Magic Link
            </button>
          </div>
        </form>

        {status ? (
          <p className="mt-6 text-center text-sm text-slate-300">{status}</p>
        ) : null}
      </div>
    </div>
  );
}
