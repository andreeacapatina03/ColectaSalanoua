import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("colecta")
    .select("*")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { suma, password } = body;

  // Check admin password
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Update the first row
  const { data, error } = await supabase
    .from("colecta")
    .update({ suma, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
