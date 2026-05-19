import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SalanouaAdjud";

// 1. GET: Calculează suma totală și returnează istoricul
export async function GET() {
  try {
    const { data: tranzactii, error: tError } = await supabase
      .from("tranzactii")
      .select("id, suma_adaugata, created_at, comentariu")
      .order("created_at", { ascending: false });

    if (tError) throw tError;

    const sumaTotala = tranzactii?.reduce((acc, curr) => acc + Number(curr.suma_adaugata), 0) || 0;
    const ultimaActualizare = tranzactii && tranzactii.length > 0 ? tranzactii[0].created_at : new Date().toISOString();

    return NextResponse.json({
      suma: sumaTotala,
      updated_at: ultimaActualizare,
      istoric: tranzactii || []
    });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la preluarea datelor" }, { status: 500 });
  }
}

// 2. POST: Adaugă o nouă tranzacție
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suma_noua, comentariu, password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Parolă incorectă" }, { status: 401 });
    }

    if (suma_noua === undefined) {
      return NextResponse.json({ success: true });
    }

    const { error: insertError } = await supabase
      .from("tranzactii")
      .insert([
        { 
          suma_adaugata: parseFloat(suma_noua), 
          comentariu: comentariu
        }
      ]);

    if (insertError) throw insertError;

    const { data: toate } = await supabase.from("tranzactii").select("suma_adaugata");
    const sumaTotala = toate?.reduce((acc, curr) => acc + Number(curr.suma_adaugata), 0) || 0;

    return NextResponse.json({ success: true, suma: sumaTotala });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la salvare" }, { status: 500 });
  }
}

// 3. DELETE REPARAT: Citim id și password direct din JSON body
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Parolă incorectă" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID-ul lipsește" }, { status: 400 });
    }

    // Ștergem rândul din Supabase
    const { error: deleteError } = await supabase
      .from("tranzactii")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // Recalculăm suma totală live
    const { data: toate } = await supabase.from("tranzactii").select("suma_adaugata");
    const sumaTotala = toate?.reduce((acc, curr) => acc + Number(curr.suma_adaugata), 0) || 0;

    return NextResponse.json({ success: true, suma: sumaTotala });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la ștergerea tranzacției" }, { status: 500 });
  }
}