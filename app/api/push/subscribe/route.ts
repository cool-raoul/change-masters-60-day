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
    const { subscription } = body;

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
