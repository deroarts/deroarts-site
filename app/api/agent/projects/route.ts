import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Prisma, ProjectStatus } from "@prisma/client";
import { getStorageAdapter } from "@/lib/adapters";

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
          "la COVER (cover_image_url, immagine principale) deve SEMPRE essere il LOGO del progetto (o l'icona identificativa dell'app), non uno screenshot. Gli screenshot delle schermate/funzioni vanno nella GALLERY. Scegli immagini che mostrino il progetto nel modo più convincente, coerenti con lo stile dei progetti già presenti qui sopra.",
        fields: "title, short_description, long_description in italiano ({ it }); en opzionale.",
        editing:
          "Per MODIFICARE un progetto già esistente NON crearne uno nuovo: usa PATCH /api/agent/projects con lo 'slug' del progetto + solo i campi da cambiare. POST è solo per progetti nuovi.",
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

// ── PATCH: update an EXISTING project by slug (no duplicates) ────────────────
// The agent sends the target `slug` plus only the fields to change. Untouched
// fields are left as-is. Replaced images are cleaned from storage. Never
// creates a new row; returns 404 if the slug doesn't exist. Content only.
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corpo della richiesta non valido." }, { status: 400 });
    }
    const b = body as Record<string, unknown>;

    const targetSlug = typeof b.slug === "string" ? b.slug.trim() : "";
    if (!targetSlug) {
      return NextResponse.json(
        { error: "Indica lo 'slug' del progetto da modificare." },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { slug: targetSlug } });
    if (!existing) {
      return NextResponse.json(
        { error: `Nessun progetto con slug '${targetSlug}'. Usa POST per crearne uno nuovo.` },
        { status: 404 }
      );
    }

    // Build the update only from provided fields (partial update).
    const data: Prisma.ProjectUpdateInput = {};

    if (b.title !== undefined) {
      const title = toI18n(b.title);
      if (!title) return NextResponse.json({ error: "Titolo non valido." }, { status: 400 });
      data.title = title as Prisma.InputJsonValue;
    }
    if (b.short_description !== undefined)
      data.short_description = (toI18n(b.short_description) ?? { it: "", en: "" }) as Prisma.InputJsonValue;
    if (b.long_description !== undefined)
      data.long_description = (toI18n(b.long_description) ?? { it: "", en: "" }) as Prisma.InputJsonValue;

    if (b.status !== undefined) {
      if (typeof b.status !== "string" || !(Object.values(ProjectStatus) as string[]).includes(b.status)) {
        return NextResponse.json({ error: "status non valido." }, { status: 400 });
      }
      data.status = b.status as ProjectStatus;
    }

    // Track images that will be replaced so we can clean them up afterwards.
    const orphaned: string[] = [];

    if (b.cover_image_url !== undefined) {
      let cover: string | null = null;
      if (b.cover_image_url !== null && b.cover_image_url !== "") {
        if (!isValidImageUrl(b.cover_image_url)) {
          return NextResponse.json({ error: "cover_image_url non valido." }, { status: 400 });
        }
        cover = b.cover_image_url;
      }
      if (existing.cover_image_url && existing.cover_image_url !== cover) {
        orphaned.push(existing.cover_image_url);
      }
      data.cover_image_url = cover;
    }

    if (b.gallery !== undefined) {
      const gallery: { url: string; alt: { it: string; en: string } }[] = [];
      if (Array.isArray(b.gallery)) {
        const titleIt =
          (data.title as { it?: string } | undefined)?.it ??
          (existing.title as { it?: string } | null)?.it ??
          "";
        for (const raw of b.gallery) {
          if (!raw || typeof raw !== "object") continue;
          const item = raw as Record<string, unknown>;
          if (!isValidImageUrl(item.url)) continue;
          gallery.push({ url: item.url, alt: toI18n(item.alt) ?? { it: titleIt, en: "" } });
        }
      }
      // Old gallery URLs not present in the new set are orphaned.
      const newUrls = new Set(gallery.map((g) => g.url));
      const oldGallery = Array.isArray(existing.gallery)
        ? (existing.gallery as { url?: string }[])
        : [];
      for (const g of oldGallery) {
        if (g?.url && !newUrls.has(g.url)) orphaned.push(g.url);
      }
      data.gallery = gallery as unknown as Prisma.InputJsonValue;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nessun campo da aggiornare fornito." },
        { status: 400 }
      );
    }

    const updated = await prisma.project.update({
      where: { slug: targetSlug },
      data,
      select: { id: true, slug: true, published: true },
    });

    // Best-effort cleanup of replaced images (never blocks the response).
    if (orphaned.length > 0) {
      const storage = getStorageAdapter();
      await Promise.all(
        Array.from(new Set(orphaned)).map((url) =>
          storage.delete(url).catch((e: unknown) =>
            console.error("[api/agent/projects] PATCH cleanup immagine:", url, e)
          )
        )
      );
    }

    return NextResponse.json({
      ok: true,
      slug: updated.slug,
      published: updated.published,
      updated_fields: Object.keys(data),
      message: "Progetto aggiornato. Le modifiche sono visibili nell'area admin.",
    });
  } catch (err) {
    console.error("[api/agent/projects] PATCH Error:", err);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento." },
      { status: 500 }
    );
  }
}
