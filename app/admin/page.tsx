"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const CONTENT_TABLE = "course_contents";

// Sincronizado exactamente con los nombres de tus productos reales
const membershipOptions = [
  "Curso Ahorro Inteligente BTC",
  "DeFi Avanzado",
  "Asesoría 1a1",
] as const;

type MembershipTier = (typeof membershipOptions)[number];

type CourseContent = {
  id: number;
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  membership_tier: MembershipTier;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(membershipOptions[0]);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentMembership, setStudentMembership] = useState<string>("Curso Ahorro Inteligente BTC");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string>("Encriptados2026*");

  useEffect(() => {
    async function validateAdmin() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus("Configuración incompleta: variables de entorno de Supabase faltantes.");
        setLoading(false);
        return;
      }

      // 1. Validar sesión existente
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        setStatus("Debes iniciar sesión para acceder al panel de administrador.");
        router.replace("/");
        return;
      }

      const email = data.session.user.email;
      setUserEmail(email ?? null);

      // 2. Validar rol ADMIN directamente en la tabla profiles de Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("id", data.session.user.id)
        .single();

      if (profileError || profile?.membership_tier !== "ADMIN") {
        setStatus("No tienes permiso para acceder al panel de administrador.");
        setTimeout(() => router.replace("/dashboard"), 3000);
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    validateAdmin();
  }, [router]);

  const loadContents = async () => {
    setContentLoading(true);
    try {
      const { data, error } = await supabase
        .from(CONTENT_TABLE)
        .select("id, title, description, video_url, pdf_url, membership_tier")
        .order("membership_tier", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("Supabase fetch contents error:", error);
        setStatus("Error al cargar la lista de contenidos.");
        return;
      }

      setContents(data ?? []);
    } catch (error) {
      console.error("Error al cargar contenidos:", error);
      setStatus("Error inesperado al cargar la lista de contenidos.");
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) {
      loadContents();
    }
  }, [allowed]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setPdfUrl("");
    setMembershipTier(membershipOptions[0]);
    setEditingContentId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!allowed) {
      setStatus("No autorizado.");
      return;
    }

    if (!title || !description || !videoUrl || !pdfUrl) {
      setStatus("Completa todos los campos antes de guardar.");
      return;
    }

    if (editingContentId) {
      setStatus("Actualizando contenido en Supabase...");
      try {
        const { error } = await supabase
          .from(CONTENT_TABLE)
          .update({
            title,
            description,
            video_url: videoUrl,
            pdf_url: pdfUrl,
            membership_tier: membershipTier,
          })
          .eq("id", editingContentId);

        if (error) {
          setStatus("Error al actualizar el contenido. Revisa la consola.");
          console.error("Supabase update error:", error);
          return;
        }

        setStatus("✅ Contenido actualizado correctamente.");
        resetForm();
        await loadContents();
        return;
      } catch (error) {
        setStatus("Error inesperado al actualizar el contenido.");
        console.error("Supabase update exception:", error);
        return;
      }
    }

    setStatus("Guardando contenido en Supabase...");

    try {
      const { error } = await supabase.from(CONTENT_TABLE).insert([
        {
          title,
          description,
          video_url: videoUrl,
          pdf_url: pdfUrl,
          membership_tier: membershipTier,
        },
      ]);

      if (error) {
        setStatus("Error al guardar el contenido. Revisa la consola.");
        console.error("Supabase insert error:", error);
        return;
      }

      setStatus("🎉 ¡Contenido guardado correctamente en la academia!");
      resetForm();
      await loadContents();
    } catch (error) {
      setStatus("Error inesperado al guardar el contenido.");
      console.error("Supabase save exception:", error);
    }
  };

  const handleEditContent = (content: CourseContent) => {
    setEditingContentId(content.id);
    setTitle(content.title);
    setDescription(content.description);
    setVideoUrl(content.video_url);
    setPdfUrl(content.pdf_url);
    setMembershipTier(content.membership_tier);
    setStatus("Modo edición activo. Actualiza los campos y guarda.");
  };

  const handleDeleteContent = async (contentId: number) => {
    setStatus("Eliminando contenido...");
    try {
      const { error } = await supabase.from(CONTENT_TABLE).delete().eq("id", contentId);
      if (error) {
        setStatus("Error al eliminar el contenido. Revisa la consola.");
        console.error("Supabase delete error:", error);
        return;
      }

      setStatus("🗑️ Contenido eliminado correctamente.");
      setContents((prev) => prev.filter((item) => item.id !== contentId));
    } catch (error) {
      setStatus("Error inesperado al eliminar el contenido.");
      console.error("Supabase delete exception:", error);
    }
  };

  const isEditMode = editingContentId !== null;
  const groupedContents = membershipOptions.map((tier) => ({
    tier,
    items: contents.filter((content) => content.membership_tier === tier),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse text-amber-400 font-medium">Verificando credenciales de Administrador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Administración Maestro</p>
              <h1 className="mt-4 text-4xl font-semibold text-amber-200 sm:text-5xl">Panel de Administración</h1>
            </div>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-xl transition ring-1 ring-white/10"
            >
              Volver al Aula
            </button>
          </div>
          <p className="mt-3 max-w-3xl text-slate-300">
            Control de contenido multimedia, recursos de estudio y segmentación por membresía para tus estudiantes de Encriptados Academy.
          </p>
          <div className="mt-6 rounded-3xl bg-slate-950/70 p-6 text-slate-300 ring-1 ring-white/10">
            <p className="text-sm text-slate-400">Administrador en sesión:</p>
            <p className="mt-2 font-medium text-amber-300">{userEmail}</p>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-slate-950/30">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-slate-50">Agregar nuevo contenido</h2>
              <p className="text-slate-400">
                Completa los datos para guardar una clase con su respectivo video de YouTube/Vimeo, material extra o calculadoras, y asígnalo al producto correspondiente.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Título de la clase
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  placeholder="Ej. Estrategia de Rangos en Uniswap V3"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Descripción del contenido
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  placeholder="Describe qué aprenderán los estudiantes en este video..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Enlace del Video (Link)
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="https://youtube.com/... o vimeo..."
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Calculadora / PDF Extra (Link)
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(event) => setPdfUrl(event.target.value)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="https://drive.google.com/... (Plantillas/Excel)"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Vincular a este Producto / Membresía
                <select
                  value={membershipTier}
                  onChange={(event) => setMembershipTier(event.target.value as MembershipTier)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                >
                  {membershipOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-950 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {isEditMode ? "✅ Actualizar Cambios" : "🚀 Guardar Contenido en la Base de Datos"}
              </button>
            </form>

            {status ? (
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/50 border border-white/5 text-center text-sm font-medium text-amber-300">
                {status}
              </div>
            ) : null}

            <section className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Contenido existente</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-50">Clases y recursos por producto</h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  Limpiar formulario
                </button>
              </div>

              {contentLoading ? (
                <p className="mt-6 text-slate-400">Cargando contenidos...</p>
              ) : (
                <div className="mt-6 space-y-6">
                  {groupedContents.map(({ tier, items }) => (
                    <div key={tier} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.25em] text-amber-300/70">{tier}</p>
                          <p className="mt-2 text-sm text-slate-400">{items.length} lección{items.length === 1 ? "" : "es"}</p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          {items.length} items
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-slate-500">No hay contenido para este producto aún.</p>
                      ) : (
                        <div className="grid gap-4">
                          {items.map((item) => (
                            <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm shadow-slate-950/20">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 space-y-2">
                                  <h4 className="text-lg font-semibold text-slate-50">{item.title}</h4>
                                  <p className="line-clamp-2 text-sm text-slate-400">{item.description}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                    <span className="rounded-full bg-slate-900 px-2 py-1">ID: {item.id}</span>
                                    <a href={item.video_url} target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-2 py-1 text-amber-300 transition hover:bg-slate-800">
                                      Video
                                    </a>
                                    <a href={item.pdf_url} target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-2 py-1 text-slate-300 transition hover:bg-slate-800">
                                      Recurso
                                    </a>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleEditContent(item)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
                                  >
                                    📝 Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteContent(item.id)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-slate-950/30 h-fit">
            <div className="mb-6 rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
              <h2 className="text-lg font-semibold text-slate-50">Registrar Alumno Manualmente</h2>
              <p className="mt-2 text-sm text-slate-400">Crea una cuenta con contraseña temporal y asigna la membresía.</p>

              <form
                className="mt-4 grid gap-3"
                onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  setCreateStatus(null);
                  if (!allowed) {
                    setCreateStatus("No autorizado.");
                    return;
                  }

                  if (!studentEmail) {
                    setCreateStatus("Ingresa un correo válido.");
                    return;
                  }

                  setCreatingStudent(true);
                  setCreateStatus("Creando usuario...");

                  try {
                    const res = await fetch("/api/admin/create-user", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: studentEmail,
                        membership_tier: studentMembership,
                        temporary_password: temporaryPassword,
                      }),
                    });

                    const json = await res.json();
                    if (!res.ok) {
                      setCreateStatus(json?.error ?? "Error al crear usuario");
                    } else {
                      const newId = json?.user?.user?.id ?? json?.user?.id ?? "OK";
                      setCreateStatus(`Usuario creado (ID: ${newId})`);
                      setStudentEmail("");
                    }
                  } catch (err) {
                    console.error(err);
                    setCreateStatus("Error inesperado al crear el usuario.");
                  } finally {
                    setCreatingStudent(false);
                  }
                }}
              >
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                />

                <select
                  value={studentMembership}
                  onChange={(e) => setStudentMembership(e.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                >
                  <option>Curso Ahorro Inteligente BTC</option>
                  <option>DeFi Avanzado</option>
                </select>

                <input
                  type="text"
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                  placeholder="Contraseña temporal (opcional)"
                />

                <button
                  disabled={creatingStudent}
                  className="rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
                >
                  {creatingStudent ? "Creando..." : "Crear alumno"}
                </button>

                {createStatus ? (
                  <p className="mt-2 text-sm text-amber-300">{createStatus}</p>
                ) : null}
              </form>
            </div>

            <h2 className="text-2xl font-semibold text-slate-50">Estructura Sincronizada</h2>
            <div className="mt-6 space-y-4 text-slate-300">
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">Tabla de Destino</p>
                <p className="mt-2 text-sm leading-6">
                  Los registros se guardan en <span className="font-medium text-white">{CONTENT_TABLE}</span>.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80">Segmentación Inteligente</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Al subir una clase asignada a <span className="text-white">DeFi Avanzado</span>, automáticamente solo los alumnos con ese nivel o superior podrán reproducir el video.
                </p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}