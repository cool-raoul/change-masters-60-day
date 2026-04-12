import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { resendKey, email } = await request.json();

  if (!resendKey || !email) {
    return NextResponse.json({ error: "API key en e-mail zijn verplicht" }, { status: 400 });
  }

  try {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from: "Change Masters <onboarding@resend.dev>",
      to: email,
      subject: "Testmail van Change Masters",
      text: `Hoi!

Dit is een testmail van je Change Masters 60 Dagen Run systeem.

Als je dit ontvangt, werkt je e-mail koppeling goed. Je krijgt voortaan elke ochtend om 07:00 een herinnering als je openstaande taken hebt.

Succes met de run!
Change Masters`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Testmail fout:", error);
    return NextResponse.json({ error: "API key werkt niet" }, { status: 400 });
  }
}
