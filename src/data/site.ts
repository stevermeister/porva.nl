export const site = {
  owner: {
    name: "Vladimir Porva",
    displayName: "Vladimir",
    city: "Almere",
  },
  business: {
    domain: "porva.nl",
    tagline_nl: "Loodgieter & klusser uit de Stripheldenbuurt",
    intro_nl:
      "Gecertificeerd loodgieter (NEN 1006/1078/3215) met 30 jaar ervaring. Werkzaam in Almere en omgeving.",
    service_area: {
      primary: "Almere",
      radius_km: 25,
      also: ["Lelystad", "Amsterdam-Oost", "Diemen", "Muiden", "Weesp"],
    },
    services_primary: [
      { title: "Lekkages opsporen en verhelpen", icon: "droplet" },
      { title: "Kranen, sifons, afvoeren vervangen", icon: "wrench" },
      { title: "Sanitair installeren (wc, wastafel, douche)", icon: "shower" },
    ],
    services_secondary: [
      { title: "Schilderwerk" },
      { title: "Tegelwerk" },
      { title: "Deuren, sloten, lampen" },
      { title: "Meubels monteren" },
      { title: "Kleine timmerklussen" },
    ],
    certificates: [
      {
        name: "Loodgieter Nederland",
        subtitle: "NEN 1006 (drinkwater), NEN 1078 (gas), NEN 3215 (afvoer)",
        issuer: "INT Education Services (CRKBO)",
        year: 2023,
        image: "/certificaten/loodgieter-nen.jpg",
      },
      {
        name: "Bouwnormen Nederland",
        subtitle: "Bouwbesluit & NEN-normen",
        issuer: "INT Education Services (CRKBO)",
        year: 2024,
        image: "/certificaten/bouwnormen.jpg",
      },
    ],
    custom_projects: {
      title: "Grotere projecten op maat",
      intro:
        "Voor verbouwingen, badkamerrenovaties of complete installaties — niet alleen vakkundig uitvoeren, maar ook plannen vooraf.",
      services: [
        {
          icon: "pencil",
          title: "Ontwerp & planning",
          description: "Doordachte aanpak voor grotere klussen",
        },
        {
          icon: "cube",
          title: "3D-visualisatie",
          description: "Zie het eindresultaat vóór de uitvoering",
        },
        {
          icon: "calculator",
          title: "Materiaalberekening",
          description: "Precieze offerte zonder verrassingen",
        },
        {
          icon: "hammer",
          title: "Volledige uitvoering",
          description: "Van ontwerp tot oplevering — of alleen het ontwerp",
        },
      ],
      cta: "Plan een vrijblijvend gesprek",
    },
  },
  tariff: {
    starting_from_eur: 35,
    callout_within_primary_eur: 0,
    materials_billed_separately: true,
  },
  contact: {
    phone_display: "085 799 0777",
    phone_tel: "+31857990777",
    booking_url: "https://calendar.app.google/A1UF3affvMf2nF6Y8",
    whatsapp: {
      number: "+31648215944",
      url: "https://wa.me/31648215944?text=Hoi%20Vladimir%2C%20ik%20heb%20een%20klus%20voor%20je.",
      display: "+31 6 48215944",
    },
    photo: "/foto/vlad.png",
  },
} as const;
