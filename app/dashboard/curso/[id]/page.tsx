"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  membership_tier?: string | null;
};

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [courseName, setCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const mapped = id === "btc" ? "Curso Ahorro Inteligente BTC" : id === "defi" ? "DeFi Avanzado" : null;
    setCourseName(mapped);
  }, [id]);

  useEffect(() => {
    if (!courseName) {
      setLoading(false);
      return;
    }

    let mounted = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("course_contents")
        .select("*")
        .eq("membership_tier", courseName);

      if (error) {
        console.error("Error completo de Supabase:", error);
      } else if (mounted) {
        setLessons((data as Lesson[]) || []);
        setSelectedIndex(0);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [courseName, router]);

  function toEmbedUrl(url?: string | null) {
    if (!url) return "";
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    if (url.includes("/embed/")) return url;
    return url;
  }

  const current = lessons[selectedIndex];
  const isBtcCourse = courseName === "Curso Ahorro Inteligente BTC";

  const btcModules = [
    {
      title: "Introducción al Ahorro en BTC",
      description: "Comprende por qué el bitcoin puede convertirse en una herramienta de ahorro de largo plazo y cómo construir disciplina financiera.",
    },
    {
      title: "Estrategia de Acumulación",
      description: "Diseña un plan de aportes consistente, con metas claras y reglas simples para acumular sin tomar riesgos innecesarios.",
    },
    {
      title: "Custodia Profesional",
      description: "Aprende a proteger tu patrimonio con criterios de seguridad, organización y gestión responsable del activo.",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <p className="animate-pulse text-zinc-400">Cargando contenido...</p>
      </div>
    );
  }

  if (!courseName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <p className="text-zinc-400">Curso no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_35%),linear-gradient(135deg,#09090b_0%,#020617_100%)] bg-zinc-950 p-4 text-zinc-100 md:p-8 lg:p-12">
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <header className="mb-8 rounded-3xl border border-amber-500/20 bg-zinc-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.35em] text-amber-500">
                Academia Encriptados
              </p>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">{courseName}</h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
                {isBtcCourse
                  ? "Una experiencia premium para entender el ahorro inteligente en bitcoin, construir disciplina de acumulación y proteger tu patrimonio con criterio."
                  : "Explora cada clase del curso con contenido guiado, recursos complementarios y una experiencia visual más cuidada."}
              </p>
            </div>
            {isBtcCourse && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Módulo 1 · Ahorro Inteligente en BTC
              </div>
            )}
          </div>
        </header>

        {/* LAYOUT PRINCIPAL: 70% VIDEO / 30% SIDEBAR */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[7fr_3fr] lg:items-start">
          {/* ===================== COLUMNA IZQUIERDA (~70%) ===================== */}
          <main className="space-y-6">
            {/* 1. TARJETAS INFORMATIVAS DE MÓDULOS */}
            {isBtcCourse && (
              <section className="grid gap-4 md:grid-cols-3">
                {btcModules.map((module) => (
                  <article
                    key={module.title}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-lg shadow-black/20 backdrop-blur"
                  >
                    <h3 className="text-base font-semibold text-amber-400">{module.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
                  </article>
                ))}
              </section>
            )}

            {/* 2. BANNER DE RECURSO DESTACADO - ANCHO COMPLETO, ANTES DEL VIDEO */}
            {isBtcCourse && (
              <div className="flex w-full flex-col items-start justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-amber-500"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2a1 1 0 0 1 1 1v11.17l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1Zm-8 18a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-amber-100 sm:text-base">
                    Bitácora de Inversión BTC (Excel Automatizado)
                  </span>
                </div>

                <a
                  href="/downloads/BTC_FINAL.xlsx"
                  download
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-400/30"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                  >
                    <path
                      fill="currentColor"
                      d="M12 3a1 1 0 0 1 1 1v8.17l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
                    />
                  </svg>
                  Descargar
                </a>
              </div>
            )}

            {/* 3. REPRODUCTOR DE VIDEO - INMEDIATAMENTE ABAJO DEL BANNER */}
            <section className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
              {current ? (
                <>
                  <div className="relative mb-4 h-0 w-full overflow-hidden rounded-2xl bg-black pb-[56.25%] ring-1 ring-zinc-800/80">
                    {current.video_url ? (
                      <iframe
                        src={toEmbedUrl(current.video_url)}
                        title={current.title}
                        className="absolute inset-0 h-full w-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                        Video no disponible
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">
                        Clase actual
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{current.title}</h3>
                      {current.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">{current.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {current.pdf_url && (
                        <a
                          href={current.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
                        >
                          Material Extra
                        </a>
                      )}
                      {current.pdf_url && current.pdf_url.includes("calculator") && (
                        <a
                          href={current.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                        >
                          Abrir Calculadora
                        </a>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-zinc-500">Selecciona una lección para empezar.</div>
              )}
            </section>
          </main>

          {/* ===================== COLUMNA DERECHA (~30%) - FIJA ===================== */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-4 shadow-lg shadow-black/20 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Ruta de clases</h2>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  {lessons.length} clases
                </span>
              </div>
              <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {lessons.length === 0 && <li className="text-sm text-zinc-500">No hay lecciones disponibles.</li>}
                {lessons.map((les, idx) => (
                  <li key={les.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        idx === selectedIndex
                          ? "border-amber-500/30 bg-amber-500/10"
                          : "border-transparent bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/70"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{les.title}</div>
                      {les.description && (
                        <div className="mt-1 text-xs text-zinc-500 line-clamp-2">{les.description}</div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}