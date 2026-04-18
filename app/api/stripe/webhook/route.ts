import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { NextResponse } from "next/server";

export const maxDuration = 30;
// Stripe stuurt een raw body — we mogen 'm NIET parsen vóór signatuur-check.
export const dynamic = "force-dynamic";

// Service-role client omdat webhooks geen auth-sessie hebben.
function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY of NEXT_PUBLIC_SUPABASE_URL ontbreekt");
  }
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

function berekenPremiumTot(currentPeriodEnd: number): string {
  // Stripe geeft unix-seconds; premium_tot is een date.
  // We gebruiken de einddatum van de huidige periode + 1 dag marge,
  // zodat de gebruiker niet midden op de dag zijn toegang verliest.
  const d = new Date(currentPeriodEnd * 1000);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

async function updatePremiumUitSubscription(sub: Stripe.Subscription) {
  const supabase = adminSupabase();

  // Customer kan string | Customer | DeletedCustomer zijn
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const customerMetadata =
    typeof sub.customer === "object" && !("deleted" in sub.customer)
      ? sub.customer.metadata
      : undefined;

  let targetUserId =
    (sub.metadata?.supabase_user_id as string | undefined) ||
    (customerMetadata?.supabase_user_id as string | undefined);

  // Fallback: als metadata ontbreekt, zoek op customer_id
  if (!targetUserId) {
    const { data: profiel } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();
    targetUserId = profiel?.id;
  }

  if (!targetUserId) {
    console.error("Stripe webhook: geen user_id gevonden voor subscription", sub.id);
    return;
  }

  // Stripe SDK v22 heeft current_period_end op het subscription-object
  // verplaatst naar items[].current_period_end. We lezen beide om robuust te zijn.
  const subAny = sub as any;
  const periodeEinde: number | undefined =
    subAny.current_period_end ||
    subAny.items?.data?.[0]?.current_period_end;

  const actief = ["active", "trialing", "past_due"].includes(sub.status);
  const premiumTot =
    actief && periodeEinde ? berekenPremiumTot(periodeEinde) : null;

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      premium_status: sub.status,
      premium_tot: premiumTot,
    })
    .eq("id", targetUserId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { fout: "STRIPE_WEBHOOK_SECRET ontbreekt" },
      { status: 500 }
    );
  }

  const signatuur = request.headers.get("stripe-signature");
  if (!signatuur) {
    return NextResponse.json({ fout: "Geen signatuur" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signatuur, secret);
  } catch (err: any) {
    console.error("Stripe webhook signatuur ongeldig:", err?.message);
    return NextResponse.json({ fout: "Ongeldige signatuur" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sessie = event.data.object as Stripe.Checkout.Session;
        if (sessie.mode === "subscription" && sessie.subscription) {
          const subId =
            typeof sessie.subscription === "string"
              ? sessie.subscription
              : sessie.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await updatePremiumUitSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updatePremiumUitSubscription(sub);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In SDK v22 zit de subscription-ref op invoice.parent.subscription_details
        // of op een line item. We pakken beide.
        const invAny = invoice as any;
        const subRef =
          invAny.subscription ||
          invAny.parent?.subscription_details?.subscription ||
          invAny.lines?.data?.[0]?.subscription;
        if (subRef) {
          const subId = typeof subRef === "string" ? subRef : subRef.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await updatePremiumUitSubscription(sub);
        }
        break;
      }
      default:
        // Andere events negeren
        break;
    }

    return NextResponse.json({ ontvangen: true });
  } catch (error: any) {
    console.error("Stripe webhook verwerkingsfout:", error?.message || error);
    return NextResponse.json(
      { fout: error?.message || "Onbekende fout" },
      { status: 500 }
    );
  }
}
