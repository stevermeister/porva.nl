export const site = {
  owner: {
    name: "Vladimir Porva",
    displayName: "Vladimir",
    city: "Almere",
  },
  business: {
    domain: "porva.nl",
    tagline_nl: "Loodgieter & klusser in Almere",
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
  },
  tariff: {
    hourly_eur: 50,
    callout_within_primary_eur: 0,
    materials_billed_separately: true,
  },
  contact: {
    phone_display: "085 799 0777",
    phone_tel: "+31857990777",
    booking_url: "TBD",
    photo: "/foto/vladimir.jpg",
  },
} as const;
