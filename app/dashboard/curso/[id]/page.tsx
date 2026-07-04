"use client";
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
        router.push("/login");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Cargando contenido...</p>
      </div>
    );
  }

  if (!courseName) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Curso no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-[70vh] overflow-auto">
          <h2 className="text-lg font-semibold mb-4 text-amber-500">{courseName}</h2>
          <ul className="space-y-2">
            {lessons.length === 0 && <li className="text-zinc-500">No hay lecciones disponibles.</li>}
            {lessons.map((les, idx) => (
              <li key={les.id}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-md transition ${idx === selectedIndex ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-zinc-800'}`}
                >
                  <div className="font-semibold text-sm">{les.title}</div>
                  {les.description && <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{les.description}</div>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          {current ? (
            <>
              <div className="w-full mb-4 relative pb-[56.25%] h-0 rounded overflow-hidden bg-black">
                {current.video_url ? (
                  <iframe
                    src={toEmbedUrl(current.video_url)}
                    title={current.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500">Video no disponible</div>
                )}
              </div>

              <h3 className="text-xl font-bold">{current.title}</h3>
              {current.description && <p className="text-sm text-zinc-400 mt-2">{current.description}</p>}

              <div className="mt-4 flex gap-3">
                {current.pdf_url && (
                  <a href={current.pdf_url} target="_blank" rel="noreferrer" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold">
                    Material Extra
                  </a>
                )}
                {current.pdf_url && current.pdf_url.includes("calculator") && (
                  <a href={current.pdf_url} target="_blank" rel="noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm">
                    Abrir Calculadora
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="text-zinc-500">Selecciona una lección para empezar.</div>
          )}
        </main>
      </div>
    </div>
  );
}
