import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteItem {
  product_name: string;
  quantity: number;
  unit_price?: string;
}

interface NotifyPayload {
  type: "quote_submitted" | "quote_ready" | "quote_accepted";
  quote_id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  quoted_price?: string;
  delivery_fee?: string;
  admin_notes?: string;
  order_id?: string;
  items?: QuoteItem[];
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0; padding: 0; background: #f4f4f5;
`;

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flames Solutions</title></head>
<body style="${baseStyles}">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1c1c1e;padding:28px 32px;display:flex;align-items:center;gap:12px;">
      <div style="width:10px;height:10px;border-radius:50%;background:#f97316;"></div>
      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:0.5px;">Flames Solutions</span>
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

function itemsTable(items: QuoteItem[], showPrice = false): string {
  if (!items || items.length === 0) return "";
  const rows = items.map(item => `
    <tr>
      <td style="padding:10px 12px;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;">${item.product_name}</td>
      <td style="padding:10px 12px;text-align:center;color:#f97316;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6;">×${item.quantity}</td>
      ${showPrice ? `<td style="padding:10px 12px;text-align:right;color:#2563eb;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6;">${item.unit_price || "—"}</td>` : ""}
    </tr>`).join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:4px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="text-align:left;padding:10px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
          <th style="text-align:center;padding:10px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          ${showPrice ? `<th style="text-align:right;padding:10px 12px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Unit Price</th>` : ""}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: NotifyPayload = await req.json();
    const { type, quote_id, name, email, phone, company, message, quoted_price, delivery_fee, admin_notes, order_id, items } = payload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@flamessolutions.com";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@flamessolutions.com";
    const SITE_URL = Deno.env.get("SITE_URL") || "https://flamessolutions.com";

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emails: { to: string; subject: string; html: string }[] = [];

    if (type === "quote_submitted") {
      const contactRows = [
        { label: "Name", value: name },
        { label: "Email", value: email },
        phone ? { label: "Phone", value: phone } : null,
        company ? { label: "Company", value: company } : null,
      ].filter(Boolean) as { label: string; value: string }[];

      const contactHtml = contactRows.map(r => `
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:14px;width:80px;">${r.label}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${r.value}</td>
        </tr>`).join("");

      const html = emailWrapper(`
        <div style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">
          New Quote Request
        </div>
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Quote Request from ${name}</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Quote ID: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px;">${quote_id.slice(0, 8).toUpperCase()}</code></p>

        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Client Info</p>
          <table style="width:100%;border-collapse:collapse;">${contactHtml}</table>
        </div>

        ${items && items.length > 0 ? `
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Requested Items (${items.length})</p>
          ${itemsTable(items)}
        </div>` : ""}

        ${message ? `
        <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:24px;border-left:3px solid #f97316;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;">Client Notes</p>
          <p style="margin:0;color:#374151;font-size:14px;font-style:italic;">${message}</p>
        </div>` : ""}

        <a href="${SITE_URL}/admin" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Review in Admin Dashboard
        </a>
      `);

      emails.push({ to: ADMIN_EMAIL, subject: `New Quote Request from ${name}`, html });
    } else if (type === "quote_ready") {
      if (email) {
        const html = emailWrapper(`
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Your Quote is Ready</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hi ${name}, we've reviewed your request and prepared a quote for you.</p>

          ${items && items.length > 0 ? `
          <div style="margin-bottom:24px;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Quoted Items</p>
            ${itemsTable(items, true)}
          </div>` : ""}

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Equipment Total</p>
                <p style="margin:0;font-size:24px;font-weight:700;color:#1d4ed8;">${quoted_price}</p>
              </div>
              ${delivery_fee ? `
              <div>
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Delivery Fee</p>
                <p style="margin:0;font-size:18px;font-weight:600;color:#1d4ed8;">${delivery_fee}</p>
              </div>` : ""}
            </div>
            ${admin_notes ? `<p style="margin:16px 0 0;color:#374151;font-size:13px;padding-top:12px;border-top:1px solid #bfdbfe;">${admin_notes}</p>` : ""}
          </div>

          <p style="margin:0 0 20px;color:#374151;font-size:14px;">Log in to your dashboard to review the full details and accept or decline this quote.</p>

          <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
            View & Accept Quote
          </a>
        `);

        emails.push({ to: email, subject: "Your Quote is Ready — Flames Solutions", html });
      }
    } else if (type === "quote_accepted") {
      const html = emailWrapper(`
        <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">
          Quote Accepted
        </div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">A Client Accepted a Quote!</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">An order has been automatically created and is awaiting your confirmation.</p>

        <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:100px;">Quote ID</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;"><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${quote_id.slice(0, 8).toUpperCase()}</code></td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Order ID</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;"><code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${(order_id || "").slice(0, 8).toUpperCase()}</code></td></tr>
          </table>
        </div>

        <a href="${SITE_URL}/admin" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
          Process Order in Dashboard
        </a>
      `);

      emails.push({ to: ADMIN_EMAIL, subject: `Quote Accepted — Order Created`, html });
    }

    for (const mail of emails) {
      await fetch("https://api.resend.com/emails", {
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
    }

    return new Response(
      JSON.stringify({ success: true, type, emails_sent: emails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
