"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order_index: number;
  download_url?: string;   // Nuevas columnas dinámicas
  download_label?: string; // Nombre personalizado del botón
}

export default function CoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    async function fetchCourseAndLessons() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (lessonsData && lessonsData.length > 0) {
        setLessons(lessonsData);
      }
      setLoading(false);
    }

    if (id) fetchCourseAndLessons();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Cargando contenido del módulo...</p>
      </div>
    );
  }

  const currentLesson = lessons[selectedIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      {/* Botón Volver */}
      <button 
        onClick={() => router.push("/dashboard")}
        className="mb-8 text-sm text-zinc-400 hover:text-amber-500 transition flex items-center gap-2"
      >
        ← Volver al Panel Principal
      </button>

      {/* Encabezado del Curso */}
      <header className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-8 mb-8 shadow-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Academia Encriptados</span>
        <h1 className="text-3xl font-black mt-2 text-zinc-100">Curso Ahorro Inteligente BTC</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          Estrategias y herramientas prácticas de acumulación, analítica y custodia profesional de activos digitales.
        </p>
      </header>

      {/* Grid Principal Inferior en Dos Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA (~70%) - VIDEO */}
        <div className="lg:col-span-2 space-y-6">
          {currentLesson ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black aspect-video shadow-2xl">
                <iframe
                  src={currentLesson.video_url}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Clase Actual</span>
                <h2 className="text-2xl font-bold text-zinc-100 mt-1">{currentLesson.title}</h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{currentLesson.description}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 text-zinc-500">
              No hay clases cargadas en este módulo todavía.
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA (~30%) - RECURSOS Y LISTA DE CLASES */}
        <div className="space-y-6">
          
          {/* SECCIÓN: RECURSOS DINÁMICOS POR CLASE */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Material de Estudio</h3>
            
            {currentLesson && currentLesson.download_url ? (
              <div>
                <p className="text-xs text-zinc-400 mb-4">Descarga el recurso exclusivo seleccionado para complementar este video.</p>
                <a
                  href={currentLesson.download_url}
                  download
                  className="group flex items-center justify-between gap-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left transition hover:bg-amber-500 hover:text-zinc-950 duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-200 group-hover:text-zinc-950 transition line-clamp-1">
                      {currentLesson.download_label || "Descargar Recurso de Apoyo"}
                    </p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-zinc-900 transition mt-0.5">
                      Haz clic para iniciar descarga instantánea
                    </p>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-800 text-amber-400 group-hover:bg-zinc-950 group-hover:text-amber-400 transition">
                    📥
                  </div>
                </a>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-2">
                No se requieren lecturas ni plantillas adicionales para esta clase.
              </p>
            )}
          </div>

          {/* SECCIÓN: RUTA DE CLASES */}
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
              <h3 className="text-sm font-bold text-zinc-200">Ruta de clases</h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {lessons.length} clases
              </span>
            </div>
            
            <ul className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {lessons.map((les, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li key={les.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-full rounded-xl border p-3 text-left transition duration-200 ${
                        isSelected
                          ? "border-amber-500/40 bg-amber-500/10 text-zinc-100"
                          : "border-transparent bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/50 text-zinc-400"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${isSelected ? "text-amber-400" : "text-zinc-300"}`}>
                        {les.title}
                      </p>
                      {les.description && (
                        <p className="mt-1 text-[11px] text-zinc-500 line-clamp-1">
                          {les.description}
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

        </div>

      </div>
    </div>
  );
}