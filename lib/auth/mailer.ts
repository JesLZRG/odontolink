// ============================================================
// Envio de correos transaccionales.
// Si RESEND_API_KEY esta configurado se envia via Resend (https://resend.com).
// Si no, el correo se imprime en la consola del servidor (modo desarrollo).
// ============================================================

interface Correo {
  para: string
  asunto: string
  html: string
  texto: string
}

async function enviar({ para, asunto, html, texto }: Correo) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(`\n[correo] Para: ${para}\n[correo] Asunto: ${asunto}\n${texto}\n`)
    return
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "OdontoLink <onboarding@resend.dev>",
      to: para,
      subject: asunto,
      html,
      text: texto,
    }),
  })
  if (!res.ok) {
    throw new Error(`Error enviando correo (${res.status}): ${await res.text()}`)
  }
}

export function appUrl(origin?: string) {
  return (process.env.APP_URL ?? origin ?? "http://localhost:3000").replace(/\/$/, "")
}

function plantilla(titulo: string, cuerpo: string, boton: string, enlace: string) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
    <h1 style="font-size:20px;margin:0 0 12px">${titulo}</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569">${cuerpo}</p>
    <p style="margin:24px 0">
      <a href="${enlace}" style="background:#0891B2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px">${boton}</a>
    </p>
    <p style="font-size:12px;color:#94a3b8">Si el boton no funciona, copia este enlace en tu navegador:<br>${enlace}</p>
    <p style="font-size:12px;color:#94a3b8">OdontoLink — El enlace para tu sonrisa</p>
  </div>`
}

export async function enviarCorreoVerificacion(para: string, nombre: string, enlace: string) {
  const cuerpo = `Hola ${nombre}, gracias por registrarte en OdontoLink. Confirma tu correo para activar tu cuenta. El enlace vence en 24 horas.`
  await enviar({
    para,
    asunto: "Confirma tu correo en OdontoLink",
    html: plantilla("Confirma tu correo", cuerpo, "Confirmar correo", enlace),
    texto: `${cuerpo}\n\n${enlace}`,
  })
}

export async function enviarCorreoRestablecer(para: string, nombre: string, enlace: string) {
  const cuerpo = `Hola ${nombre}, recibimos una solicitud para restablecer tu contrasena. El enlace vence en 1 hora. Si no fuiste tu, ignora este correo.`
  await enviar({
    para,
    asunto: "Restablece tu contrasena de OdontoLink",
    html: plantilla("Restablece tu contrasena", cuerpo, "Crear nueva contrasena", enlace),
    texto: `${cuerpo}\n\n${enlace}`,
  })
}
