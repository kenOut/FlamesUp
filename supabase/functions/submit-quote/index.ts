import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteItem {
  product_id?: string | null;
  product_name: string;
  quantity: number;
}

interface SubmitPayload {
  user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  items: QuoteItem[];
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f4f4f5;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1c1c1e;padding:28px 32px;">
      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:0.5px;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f97316;margin-right:8px;vertical-align:middle;"></span>
        Flames Solutions
      </span>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="background:#f4f4f5;padding:20px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Flames Solutions — Commercial Kitchen Equipment</p>
    </div>
  </div>
</body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: SubmitPayload = await req.json();
    const { user_id, name, email, phone, company, message, items } = payload;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "At least one item is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: user_id ?? null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        message: message?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (quoteError || !quote) {
      return new Response(
        JSON.stringify({ success: false, error: quoteError?.message || "Failed to create quote" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validItems = items.filter(i => i.product_name?.trim());

    if (validItems.length > 0) {
      const { error: itemsError } = await supabase.from("quote_items").insert(
        validItems.map(i => ({
          quote_id: quote.id,
          product_id: i.product_id ?? null,
          product_name: i.product_name.trim(),
          quantity: Math.max(1, i.quantity || 1),
        }))
      );

      if (itemsError) {
        console.error("quote_items insert error:", itemsError.message);
      }
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "a.agbanu7@gmail.com";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    const SITE_URL = Deno.env.get("SITE_URL") || "https://flamessolutions.com";

    if (RESEND_API_KEY) {
      const quoteRef = quote.id.slice(0, 8).toUpperCase();

      const contactRows = [
        `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;">Name</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${name}</td></tr>`,
        `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${email}</td></tr>`,
        phone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${phone}</td></tr>` : "",
        company ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Company</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${company}</td></tr>` : "",
      ].join("");

      const itemRows = validItems.map(i =>
        `<tr>
          <td style="padding:10px 12px;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;">${i.product_name}</td>
          <td style="padding:10px 12px;text-align:center;color:#f97316;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6;">×${i.quantity}</td>
        </tr>`
      ).join("");

      const itemTable = `
        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:10px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
              <th style="text-align:center;padding:10px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>`;

      const adminHtml = emailWrapper(`
        <div style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">
          New Quote Request
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Quote Request from ${name}</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Quote ID: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${quoteRef}</code></p>

        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Client Info</p>
          <table style="width:100%;border-collapse:collapse;">${contactRows}</table>
        </div>

        <div style="margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Requested Items (${validItems.length})</p>
          ${itemTable}
        </div>

        ${message ? `
        <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:24px;border-left:3px solid #f97316;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;">Client Notes</p>
          <p style="margin:0;color:#374151;font-size:14px;font-style:italic;">${message}</p>
        </div>` : ""}

        <a href="${SITE_URL}/admin" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Review in Admin Dashboard
        </a>
      `);

      const userConfirmHtml = emailWrapper(`
        <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">
          Quote Received
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">We've Received Your Request</h1>
        <p style="margin:0 0 6px;color:#374151;font-size:15px;">Hi ${name}, thank you for reaching out to Flames Solutions.</p>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Your quote request has been submitted successfully. Our team will review it and get back to you with pricing shortly.</p>

        <div style="background:#f9fafb;border-radius:8px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
          <div>
            <p style="margin:0 0 2px;font-size:12px;color:#9ca3af;font-weight:500;">Your Quote Reference</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;">#${quoteRef}</p>
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Items You Requested</p>
          ${itemTable}
        </div>

        ${message ? `
        <div style="background:#fff7ed;border-radius:8px;padding:14px 16px;margin-bottom:24px;border-left:3px solid #f97316;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#92400e;">Your Notes</p>
          <p style="margin:0;color:#78350f;font-size:14px;font-style:italic;">${message}</p>
        </div>` : ""}

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1e40af;">What happens next?</p>
          <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6;">Our team will review your request and prepare a detailed price quote. You'll receive another email once your quote is ready${user_id ? " — you can also track it in your dashboard" : ""}.</p>
        </div>

        ${user_id ? `<a href="${SITE_URL}/dashboard" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Track in Dashboard</a>` : ""}
      `);

      const emailsToSend = [
        { to: ADMIN_EMAIL, subject: `New Quote Request from ${name} — #${quoteRef}`, html: adminHtml },
        { to: email.trim().toLowerCase(), subject: `Quote Request Received — Flames Solutions (#${quoteRef})`, html: userConfirmHtml },
      ];

      for (const mail of emailsToSend) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
          }),
        });
        if (!emailRes.ok) {
          const errBody = await emailRes.text();
          console.error("Resend email failed:", emailRes.status, errBody);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, quote_id: quote.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
