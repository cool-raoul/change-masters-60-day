import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Niet ingelogd" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscription, tijdzone } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Geen geldige subscription" },
        { status: 400 }
      );
    }

    // Sla subscription op in database
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: request.headers.get("user-agent") || "",
          last_used_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Push subscription error:", error);
      return NextResponse.json(
        { error: "Kon subscription niet opslaan" },
        { status: 500 }
      );
    }

    // Zet de dagelijkse bundel-push aan: als iemand subscribet is dat ALTIJD
    // de intentie "ik wil push meldingen". We respecteren bestaande uur/tz
    // (alleen default'en als 'r nog niets staat) zodat een unsubscribe →
    // re-subscribe niet opeens hun eerder gekozen 8-uur terugzet naar 7.
    const { data: huidigProfiel } = await supabase
      .from("profiles")
      .select("dagelijkse_push_uur, tijdzone")
      .eq("id", user.id)
      .maybeSingle();

    const profielUpdate: Record<string, unknown> = {
      dagelijkse_push_aan: true,
    };
    if (huidigProfiel?.dagelijkse_push_uur == null) {
      profielUpdate.dagelijkse_push_uur = 7;
    }
    if (!huidigProfiel?.tijdzone && typeof tijdzone === "string" && tijdzone) {
      profielUpdate.tijdzone = tijdzone;
    }

    await supabase
      .from("profiles")
      .update(profielUpdate)
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      message: "Subscription opgeslagen",
    });
  } catch (error) {
    console.error("Subscribe endpoint error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Niet ingelogd" },
        { status: 401 }
      );
    }

    // Verwijder subscription
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Kon subscription niet verwijderen" },
        { status: 500 }
      );
    }

    // Bij unsubscribe ook de dagelijkse bundel uit. Zo blijft de cron niet
    // proberen te pushen naar een dode endpoint (die is toch net verwijderd).
    await supabase
      .from("profiles")
      .update({ dagelijkse_push_aan: false })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      message: "Subscription verwijderd",
    });
  } catch (error) {
    console.error("Unsubscribe endpoint error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
