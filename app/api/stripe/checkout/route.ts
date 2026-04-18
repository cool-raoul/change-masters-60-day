import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { fout: "STRIPE_PRICE_ID ontbreekt in environment variables" },
        { status: 500 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://app.eleva.nl";

    // Haal bestaande customer op als die er al is
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    const stripe = getStripe();

    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const sessie = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // Card + iDEAL/Bancontact (eerste betaling) → SEPA mandaat voor recurring.
      // Stripe zet de eerste iDEAL/Bancontact-betaling automatisch om naar
      // SEPA Direct Debit voor de maandelijkse incasso daarna.
      payment_method_types: ["card", "ideal", "bancontact", "sepa_debit"],
      success_url: `${origin}/coach?upgrade=success`,
      cancel_url: `${origin}/coach?upgrade=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "nl",
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      metadata: { supabase_user_id: user.id },
    });

    if (!sessie.url) {
      return NextResponse.json(
        { fout: "Geen checkout URL ontvangen" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: sessie.url });
  } catch (error: any) {
    console.error("Stripe checkout fout:", error?.message || error);
    return NextResponse.json(
      { fout: error?.message || "Onbekende fout" },
      { status: 500 }
    );
  }
}
