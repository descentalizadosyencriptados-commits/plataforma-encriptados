"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const CONTENT_TABLE = "course_contents";
const COURSE_TIER = "Curso Ahorro Inteligente BTC";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(COURSE_TIER);
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

      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        setStatus("Debes iniciar sesión para acceder al panel de administrador.");
        router.replace("/");
        return;
      }

      const email = data.session.user.email;
      setUserEmail(email ?? null);

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
        .eq("membership_tier", COURSE_TIER)
        .order("id", { ascending: true });

      if (error) {
        console.error("Supabase fetch contents error:", error);
        setStatus("Error al cargar la lista de contenidos.");
        return;
      }

      setContents((data ?? []) as CourseContent[]);
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

    if (!title || !description || !videoUrl) {
      setStatus("Completa los campos obligatorios (título, descripción y video)." );
      return;
    }

    if (editingContentId !== null) {
      setStatus("Actualizando contenido en Supabase...");
      try {
        const { error } = await supabase
          .from(CONTENT_TABLE)
          .update({
            title,
            description,
            video_url: videoUrl,
            pdf_url: pdfUrl && pdfUrl.trim() !== "" ? pdfUrl : null,
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
          pdf_url: pdfUrl && pdfUrl.trim() !== "" ? pdfUrl : null,
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
    setStatus("Modo edición activo. Edita los campos y actualiza.");
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!allowed) {
      setStatus("No autorizado.");
      return;
    }

    setStatus("Eliminando contenido...");
    try {
      const { error } = await supabase.from(CONTENT_TABLE).delete().eq("id", contentId);
      if (error) {
        setStatus("Error al eliminar el contenido. Revisa la consola.");
        console.error("Supabase delete error:", error);
        return;
      }

      setContents((prev) => prev.filter((item) => item.id !== contentId));
      setStatus("🗑️ Contenido eliminado correctamente.");
    } catch (error) {
      setStatus("Error inesperado al eliminar el contenido.");
      console.error("Supabase delete exception:", error);
    }
  };

  const isEditMode = editingContentId !== null;

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
        <header className="rounded-[2rem] border border-amber-300/20 bg-slate-900/70 p-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Administración Maestro</p>
              <h1 className="mt-4 text-4xl font-semibold text-amber-200 sm:text-5xl">Panel de Administración</h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                Aquí puedes controlar todo el CRUD de las lecciones, videos y recursos del Curso Ahorro Inteligente BTC sin tocar directamente Supabase.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="self-start rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-sm text-white transition hover:bg-slate-900"
            >
              Volver al Aula
            </button>
          </div>
          <div className="mt-6 rounded-3xl bg-slate-950/80 p-6 text-slate-300 ring-1 ring-amber-300/10">
            <p className="text-sm text-slate-400">Administrador en sesión:</p>
            <p className="mt-2 font-medium text-amber-300">{userEmail}</p>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.6fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-slate-950/30">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-slate-50">{isEditMode ? "Editar lección" : "Crear contenido nuevo"}</h2>
              <p className="text-slate-400">
                Completa el formulario para crear o actualizar una clase del curso. Elige el producto y agrega el enlace del video junto al recurso adicional.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Título de la lección
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  placeholder="Ej. Estrategia de rangos BTC"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Descripción breve
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  placeholder="Describe qué aprenderán los estudiantes en esta lección..."
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Enlace del video
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="https://youtube.com/..."
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Recurso / Excel / PDF
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={pdfUrl}
                      onChange={(event) => setPdfUrl(event.target.value)}
                      className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      placeholder="Dejar vacío si no aplica, o pega la URL aquí..."
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="whitespace-nowrap rounded-2xl border border-amber-400/10 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
                    >
                      📁 Adjuntar Archivo Local (.pdf, .xlsx, .html)
                    </button>

                    {pdfUrl ? (
                      <button
                        type="button"
                        onClick={() => setPdfUrl("")}
                        className="ml-2 rounded-full bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/15"
                        title="Limpiar recurso"
                      >
                        ✖
                      </button>
                    ) : null}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.xlsx,.xls,.html,.htm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const suggestedPath = `/downloads/${file.name}`;
                        setPdfUrl(suggestedPath);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Producto asociado</p>
                <p className="mt-2 font-medium text-slate-100">{COURSE_TIER}</p>
                <p className="mt-1 text-xs text-slate-500">Todos los cambios se aplican solo a este curso.</p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                {isEditMode ? "Actualizar Cambios en la Base de Datos" : "Guardar Contenido en la Base de Datos"}
              </button>
            </form>

            {status ? (
              <div className="mt-6 rounded-3xl border border-amber-300/10 bg-slate-950/80 p-4 text-sm font-medium text-amber-300">
                {status}
              </div>
            ) : null}

            <section className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-inner shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Gestionar Clases Existentes</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-50">Lista de lecciones del curso</h3>
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
                <p className="mt-6 text-slate-400">Cargando lecciones...</p>
              ) : contents.length === 0 ? (
                <p className="mt-6 text-slate-400">No hay lecciones registradas aún.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {contents.map((content) => (
                    <div key={content.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-slate-950/10">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm uppercase tracking-[0.25em] text-amber-300/70">{content.membership_tier}</p>
                          <h4 className="mt-2 text-lg font-semibold text-slate-50">{content.title}</h4>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{content.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                            <span className="rounded-full bg-slate-950 px-3 py-1">Video: {content.video_url ? "Link" : "N/A"}</span>
                            <span className="rounded-full bg-slate-950 px-3 py-1">Recurso: {content.pdf_url ? "Link" : "N/A"}</span>
                            <span className="rounded-full bg-slate-950 px-3 py-1">ID: {content.id}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditContent(content)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
                          >
                            📝 Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContent(content.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
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
