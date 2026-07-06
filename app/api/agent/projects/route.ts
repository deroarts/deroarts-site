import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma, ProjectStatus } from "@prisma/client";

// External-agent endpoint (e.g. Devin). Request-time only, never prerendered.
export const dynamic = "force-dynamic";

// ── Auth: shared API key via x-api-key header ───────────────────────────────
// This route lives outside the /admina middleware matcher, so it guards itself.
function isAuthorized(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  const expected = process.env.AGENT_API_KEY;
  return Boolean(expected) && key === expected;
}

function unauthorized() {
  return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
}

// Local slug helper — mirrors admin actions (no shared lib helper exists).
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâã]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Coerce a translatable field into the canonical { it, en } JSON shape.
// Accepts a plain string (→ { it, en:"" }) or a partial { it?, en? } object.
function toI18n(value: unknown): { it: string; en: string } | null {
  if (typeof value === "string") {
    const it = value.trim();
    return it ? { it, en: "" } : null;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const it = typeof obj.it === "string" ? obj.it.trim() : "";
    const en = typeof obj.en === "string" ? obj.en.trim() : "";
    if (!it && !en) return null;
    return { it: it || en, en };
  }
  return null;
}

// Keep only http(s) or site-relative image URLs — no data:/blobs, no junk.
function isValidImageUrl(url: unknown): url is string {
  return (
    typeof url === "string" &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/"))
  );
}

// ── GET: read published projects so the agent can contextualize ────────────
// Returns ONLY public content (titles, descriptions, images, category, status).
// Never exposes client data (requests, emails) or unpublished drafts.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { sort_order: "asc" },
      select: {
        slug: true,
        title: true,
        short_description: true,
        long_description: true,
        status: true,
        cover_image_url: true,
        gallery: true,
        category: { select: { slug: true, name: true } },
      },
    });

    return NextResponse.json({
      count: projects.length,
      projects,
      // Briefing for the agent: act as a copywriter/marketer, not a cataloguer.
      style_guide: {
        mission:
          "Obiettivo: catturare l'attenzione del visitatore in pochi secondi e convincerlo a interagire con DeroArts (provare, informarsi, contattare). Scrivi come un copywriter che presenta un prodotto per venderlo, NON come chi compila una scheda tecnica.",
        method:
          "Prima STUDIA davvero il progetto: che problema risolve, per chi conta, qual è il beneficio concreto e il punto di forza che lo rende migliore. Da lì ricava l'angolo con cui presentarlo. Ogni progetto è diverso: adatta contenuto e taglio al progetto specifico.",
        anti_generic:
          "VIETATI i contenuti generici, riciclati o 'passe-partout'. Niente frasi che potrebbero valere per qualunque software. Se una frase suona standard, riscrivila con qualcosa di specifico e concreto di QUESTO progetto.",
        persuasion:
          "Persuadi con eleganza e understatement, non con superlativi gridati: convinci mostrando qualità, benefici concreti e sicurezza. Un tocco di call-to-action implicita va bene; l'entusiasmo esagerato no.",
        structure:
          "title = nome del progetto, breve e riconoscibile. short_description = un gancio di 1 frase che fa capire subito il valore e invoglia. long_description = il racconto: problema → soluzione → benefici/punti di forza → cosa può fare l'utente. Concreto, scorrevole, mai prolisso.",
        voice: "impersonale / terza persona — mai prima persona (no 'io', 'noi', 'creo', 'creiamo', 'ho fatto'). Non deve trasparire chi c'è dietro né se è una persona sola o un team: es. 'Strumenti digitali creati per…', non 'Creiamo…'.",
        audience: "mai nominare i destinatari (no imprese, PMI, aziende, agenzie, privati, professionisti): il messaggio è per tutti, in generale.",
        quality_price:
          "lega la qualità al prezzo accessibile con eleganza (es. 'alla portata di tutti', 'senza pesare sul budget'). PAROLE VIETATE: 'artigianale', 'economico', 'low cost', 'a buon mercato' (suonano cheap).",
        tone: "software ben fatto, semplice, affidabile, chiaro — ma vivo e coinvolgente, non asettico.",
        images:
          "le immagini sono parte della presentazione: scegli screenshot che mostrano il progetto nel modo più convincente (schermate/funzioni rappresentative), più icone/loghi del progetto. Coerenti con lo stile dei progetti già presenti qui sopra.",
        fields: "title, short_description, long_description in italiano ({ it }); en opzionale.",
        never_touch: "solo contenuti (testi/foto). Mai layout, mai pubblicare (le bozze le pubblica l'admin).",
      },
    });
  } catch (err) {
    console.error("[api/agent/projects] GET Error:", err);
    return NextResponse.json({ error: "Errore." }, { status: 500 });
  }
}

// ── POST: create a DRAFT project (published: false) ─────────────────────────
// The agent may ONLY create content. Drafts are invisible on the site until
// the admin publishes them manually. Layout/structure are never touched here.
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corpo della richiesta non valido." }, { status: 400 });
    }

    const b = body as Record<string, unknown>;

    // Required translatable fields.
    const title = toI18n(b.title);
    if (!title) {
      return NextResponse.json(
        { error: "Il titolo è obbligatorio (title.it)." },
        { status: 400 }
      );
    }
    const short_description =
      toI18n(b.short_description) ?? { it: "", en: "" };
    const long_description =
      toI18n(b.long_description) ?? { it: "", en: "" };

    // Optional cover image (must be a valid URL if provided).
    let cover_image_url: string | null = null;
    if (b.cover_image_url != null && b.cover_image_url !== "") {
      if (!isValidImageUrl(b.cover_image_url)) {
        return NextResponse.json(
          { error: "cover_image_url non valido (usa un URL http(s), es. quello restituito da /api/agent/upload)." },
          { status: 400 }
        );
      }
      cover_image_url = b.cover_image_url;
    }

    // Optional gallery: array of { url, alt? }.
    const gallery: { url: string; alt: { it: string; en: string } }[] = [];
    if (Array.isArray(b.gallery)) {
      for (const raw of b.gallery) {
        if (!raw || typeof raw !== "object") continue;
        const item = raw as Record<string, unknown>;
        if (!isValidImageUrl(item.url)) continue;
        gallery.push({
          url: item.url,
          alt: toI18n(item.alt) ?? { it: title.it, en: "" },
        });
      }
    }

    // Optional status (defaults to available); reject unknown values.
    let status: ProjectStatus = ProjectStatus.available;
    if (typeof b.status === "string") {
      if ((Object.values(ProjectStatus) as string[]).includes(b.status)) {
        status = b.status as ProjectStatus;
      } else {
        return NextResponse.json(
          { error: "status non valido." },
          { status: 400 }
        );
      }
    }

    // Optional category by slug — link only if it already exists (never create).
    let category_id: string | null = null;
    if (typeof b.category === "string" && b.category.trim()) {
      const cat = await prisma.category.findUnique({
        where: { slug: b.category.trim() },
        select: { id: true },
      });
      if (cat) category_id = cat.id;
    }

    // Slug: from provided value or Italian title; de-duplicate on conflict.
    let slug = (typeof b.slug === "string" && b.slug.trim() ? b.slug.trim() : toSlug(title.it));
    if (!slug) {
      return NextResponse.json({ error: "Impossibile generare lo slug dal titolo." }, { status: 400 });
    }
    const existing = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const project = await prisma.project.create({
      data: {
        slug,
        title: title as Prisma.InputJsonValue,
        short_description: short_description as Prisma.InputJsonValue,
        long_description: long_description as Prisma.InputJsonValue,
        status,
        category_id,
        cover_image_url,
        gallery: gallery as unknown as Prisma.InputJsonValue,
        published: false, // ALWAYS a draft — admin publishes manually
        from_email: typeof b.from_email === "string" ? b.from_email : null,
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json(
      {
        ok: true,
        id: project.id,
        slug: project.slug,
        published: false,
        message:
          "Bozza creata. Visibile solo nell'area admin finché non viene pubblicata manualmente.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/agent/projects] POST Error:", err);
    return NextResponse.json(
      { error: "Errore durante la creazione della bozza." },
      { status: 500 }
    );
  }
}
