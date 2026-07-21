import type { APIRoute } from 'astro'
import { Resend } from 'resend'
import { z } from 'zod'

// ── Inizializzazione ──
const resend = new Resend(import.meta.env.RESEND_API_KEY)

// ── Validazione input con Zod ──
const Schema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  messaggio: z.string().min(10).max(2000),
})

// ── Helper: risposta JSON uniforme ──
const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const POST: APIRoute = async ({ request }) => {
  // 1) Parse del body
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'JSON mancante' }, 400)
  }

  // 2) Validazione
  const result = Schema.safeParse(body)
  if (!result.success) {
    return json({ error: 'Dati non validi' }, 400)
  }

  const { nome, email, messaggio } = result.data

  // 3) Invio email tramite Resend
  // NOTA: "onboarding@resend.dev" è l'indirizzo di test di Resend.
  // Per la produzione, verifica il tuo dominio su Resend e usa
  // qualcosa come "Portfolio <noreply@tuodominio.com>"
  const { error } = await resend.emails.send({
    from: 'Portfolio <onboarding@resend.dev>',
    to: ['olgamarrazzoit@gmail.com'],
    subject: `Nuovo messaggio da ${nome}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#0a0618;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0618; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 24px;">
              <span style="font-family:Inter,sans-serif; font-size:20px; font-weight:600; background:linear-gradient(90deg,#67e8f9,#d946ef); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;">OM</span>
            </td>
          </tr>

          <!-- Titolo -->
          <tr>
            <td style="padding:0 0 20px;">
              <h2 style="margin:0; font-family:Inter,sans-serif; font-size:18px; font-weight:600; color:#ffffff;">Nuovo messaggio dal portfolio</h2>
            </td>
          </tr>

          <!-- Campi -->
          <tr>
            <td style="padding:0 0 6px;">
              <p style="margin:0; font-family:Inter,sans-serif; font-size:14px; color:rgba(255,255,255,0.55);">
                <strong style="color:rgba(255,255,255,0.85);">Nome:</strong> ${nome}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 20px;">
              <p style="margin:0; font-family:Inter,sans-serif; font-size:14px; color:rgba(255,255,255,0.55);">
                <strong style="color:rgba(255,255,255,0.85);">Email:</strong>
                <a href="mailto:${email}" style="color:#00d4ff; text-decoration:none;">${email}</a>
              </p>
            </td>
          </tr>

          <!-- Messaggio -->
          <tr>
            <td style="padding:0;">
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px;">
                <p style="margin:0 0 10px; font-family:Inter,sans-serif; font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#00d4ff;">Messaggio</p>
                <p style="margin:0; font-family:Inter,sans-serif; font-size:14px; line-height:1.7; color:rgba(255,255,255,0.75); white-space:pre-wrap;">${messaggio}</p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    replyTo: email,
  })

  // 4) Gestione errore
  if (error) {
    console.error(error)
    return json({ error: 'Errore invio email' }, 500)
  }

  // 5) Successo
  return json({ ok: true }, 200)
}