import { PrismaClient, ProjectStatus, ActionType } from "@prisma/client";

const prisma = new PrismaClient();

// Placeholder image URLs used until real uploads are provided via the admin.
const PLACEHOLDER = {
  cover1: "https://placehold.co/800x500/1A222B/8FC603?text=Gestionale+per+Agenzie",
  cover2: "https://placehold.co/800x500/1A222B/8FC603?text=MoneyBox",
  cover3: "https://placehold.co/800x500/1A222B/8FC603?text=Scanner+Documenti",
  gallery1a: "https://placehold.co/800x600/1A3A26/F8F6F6?text=Schermata+1",
  gallery1b: "https://placehold.co/800x600/1A3A26/F8F6F6?text=Schermata+2",
  gallery2a: "https://placehold.co/800x600/1A3A26/F8F6F6?text=Riepilogo+spese",
  gallery2b: "https://placehold.co/800x600/1A3A26/F8F6F6?text=Obiettivi",
  gallery3a: "https://placehold.co/800x600/1A3A26/F8F6F6?text=Scansione",
};

async function main() {
  console.log("🌱 Seeding DeroArts database...");

  // ── Categories ──────────────────────────────────────────────────────────────

  const catGestionali = await prisma.category.upsert({
    where: { slug: "gestionali" },
    update: {},
    create: {
      slug: "gestionali",
      name: { it: "Gestionali", en: "Management Software" },
      sort_order: 0,
    },
  });

  const catUtilita = await prisma.category.upsert({
    where: { slug: "utilita" },
    update: {},
    create: {
      slug: "utilita",
      name: { it: "Utilità", en: "Utilities" },
      sort_order: 1,
    },
  });

  console.log("  ✓ 2 categorie create");

  // ── Project 1 — Gestionale per Agenzie ──────────────────────────────────────

  const proj1 = await prisma.project.upsert({
    where: { slug: "gestionale-agenzie" },
    update: {},
    create: {
      slug: "gestionale-agenzie",
      title: { it: "Gestionale per Agenzie", en: "Agency Management" },
      short_description: {
        it: "Gestisci clienti, commesse e fatturazione in un unico posto.",
        en: "Manage clients, jobs and invoicing in one place.",
      },
      long_description: {
        it: "Una piattaforma completa pensata per le agenzie di comunicazione e marketing. Permette di organizzare i clienti, tracciare le commesse, gestire i team e generare preventivi e fatture in pochi click. L'interfaccia è semplice e intuitiva, adatta anche a chi non ha competenze tecniche. Integrazione predisposta con i principali strumenti di lavoro.",
        en: "",
      },
      status: ProjectStatus.demo_available,
      category_id: catGestionali.id,
      cover_image_url: PLACEHOLDER.cover1,
      gallery: [
        {
          url: PLACEHOLDER.gallery1a,
          alt: { it: "Schermata del calendario commesse", en: "Jobs calendar view" },
        },
        {
          url: PLACEHOLDER.gallery1b,
          alt: { it: "Report fatturazione mensile", en: "Monthly billing report" },
        },
      ],
      published: true,
      sort_order: 0,
      from_email: null,
    },
  });

  await prisma.projectAction.deleteMany({ where: { project_id: proj1.id } });
  await prisma.projectAction.createMany({
    data: [
      {
        project_id: proj1.id,
        type: ActionType.demo,
        label: { it: "Prova la demo", en: "Try demo" },
        url: "https://demo.deroarts.com/agenzie",
        enabled: true,
        sort_order: 0,
      },
      {
        project_id: proj1.id,
        type: ActionType.request_info,
        label: { it: "Richiedi informazioni", en: "Request info" },
        url: null,
        enabled: true,
        sort_order: 1,
      },
    ],
  });

  // ── Project 2 — MoneyBox ─────────────────────────────────────────────────────

  const proj2 = await prisma.project.upsert({
    where: { slug: "moneybox" },
    update: {},
    create: {
      slug: "moneybox",
      title: { it: "MoneyBox", en: "MoneyBox" },
      short_description: {
        it: "Tieni traccia delle tue spese e raggiungi i tuoi obiettivi di risparmio.",
        en: "Track your expenses and reach your savings goals.",
      },
      long_description: {
        it: "MoneyBox è uno strumento personale per la gestione delle finanze quotidiane. Registra entrate e uscite, categorizza le spese e visualizza report grafici chiari per capire dove vanno i tuoi soldi. Semplice, veloce e senza abbonamenti. I tuoi dati rimangono sul tuo dispositivo.",
        en: "",
      },
      status: ProjectStatus.available,
      category_id: catUtilita.id,
      cover_image_url: PLACEHOLDER.cover2,
      gallery: [
        {
          url: PLACEHOLDER.gallery2a,
          alt: { it: "Riepilogo spese mensili", en: "Monthly expense summary" },
        },
        {
          url: PLACEHOLDER.gallery2b,
          alt: { it: "Pannello obiettivi di risparmio", en: "Savings goals panel" },
        },
      ],
      published: true,
      sort_order: 1,
      from_email: null,
    },
  });

  await prisma.projectAction.deleteMany({ where: { project_id: proj2.id } });
  await prisma.projectAction.createMany({
    data: [
      {
        project_id: proj2.id,
        type: ActionType.demo,
        label: { it: "Prova la demo", en: "Try demo" },
        url: "https://demo.deroarts.com/moneybox",
        enabled: true,
        sort_order: 0,
      },
      {
        project_id: proj2.id,
        type: ActionType.request_info,
        label: { it: "Richiedi informazioni", en: "Request info" },
        url: null,
        enabled: true,
        sort_order: 1,
      },
    ],
  });

  // ── Project 3 — Scanner Documenti (coming soon) ───────────────────────────────

  const proj3 = await prisma.project.upsert({
    where: { slug: "scanner-documenti" },
    update: {},
    create: {
      slug: "scanner-documenti",
      title: { it: "Scanner Documenti", en: "Document Scanner" },
      short_description: {
        it: "Digitalizza, organizza e condividi i tuoi documenti cartacei in pochi secondi.",
        en: "Digitize, organize and share your paper documents in seconds.",
      },
      long_description: {
        it: "Con Scanner Documenti puoi fotografare qualsiasi documento cartaceo e ottenere un PDF ottimizzato, con correzione automatica della prospettiva e miglioramento del contrasto. Organizza i documenti per categorie e condividili facilmente via email o link. Disponibile prossimamente per iOS e Android.",
        en: "",
      },
      status: ProjectStatus.coming_soon,
      category_id: catUtilita.id,
      cover_image_url: PLACEHOLDER.cover3,
      gallery: [
        {
          url: PLACEHOLDER.gallery3a,
          alt: { it: "Scansione documento in corso", en: "Document scanning in progress" },
        },
      ],
      published: true,
      sort_order: 2,
      from_email: null,
    },
  });

  await prisma.projectAction.deleteMany({ where: { project_id: proj3.id } });
  await prisma.projectAction.createMany({
    data: [
      // Demo disabled — app not yet available; predisposed for when it launches
      {
        project_id: proj3.id,
        type: ActionType.demo,
        label: { it: "Prova la demo", en: "Try demo" },
        url: null,
        enabled: false,
        sort_order: 0,
      },
      {
        project_id: proj3.id,
        type: ActionType.request_info,
        label: { it: "Richiedi informazioni", en: "Request info" },
        url: null,
        enabled: true,
        sort_order: 1,
      },
      // Predisposed store links — enabled once the app is published
      {
        project_id: proj3.id,
        type: ActionType.app_store,
        label: { it: "App Store", en: "App Store" },
        url: null,
        enabled: false,
        sort_order: 2,
      },
      {
        project_id: proj3.id,
        type: ActionType.play_store,
        label: { it: "Google Play", en: "Google Play" },
        url: null,
        enabled: false,
        sort_order: 3,
      },
    ],
  });

  console.log("  ✓ 3 progetti creati con copertine, gallerie e azioni");
  console.log("✅ Seed completato con successo.");
}

main()
  .catch((e) => {
    console.error("❌ Seed fallito:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
