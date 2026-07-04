import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase no está configurado en el servidor. Agrega SUPABASE_SERVICE_ROLE_KEY en .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const email: string | undefined = body?.email;
  const membership_tier: string | undefined = body?.membership_tier;
  const temporary_password: string = body?.temporary_password ?? "Encriptados2026*";

  if (!email || !membership_tier) {
    return NextResponse.json({ error: "Faltan campos: email o membership_tier" }, { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: temporary_password,
      email_confirm: true,
    });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const userId = userData?.user?.id ?? (userData as any)?.id ?? null;
    if (!userId) {
      return NextResponse.json({ error: "No se devolvió un ID de usuario desde Supabase" }, { status: 500 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        [
          {
            id: userId,
            membership_tier,
          },
        ],
        { onConflict: "id" }
      );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: userData, profile: profileData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
