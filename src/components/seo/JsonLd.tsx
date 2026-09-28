import React from "react";

export function JsonLd() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
    "@id": "https://kghdental.com/#organization",
    name: "KGH Dental",
    alternateName: [
      "কেজিএইচ ডেন্টাল",
      "KGH Dental Care",
      "KGH Dental Clinic Banani",
      "KGH Dental Dhaka",
    ],
    url: "https://kghdental.com",
    logo: "https://kghdental.com/images/logos/kgh-logo-transparent.png",
    image: [
      "https://kghdental.com/images/logos/KGH%20Dental%20Logo%201.png",
      "https://kghdental.com/images/Service-page-banner-cover/01.%20Orthodontics%20Cover%20Banner.png",
    ],
    description:
      "KGH Dental is a premier multi-specialty dental clinic in Banani, Dhaka, bringing together certified orthodontists, prosthodontists, oral & maxillofacial surgeons, and pediatric dentists under one roof.",
    telephone: "+8801700000000",
    email: "care@kghdental.com",
    priceRange: "$$",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash, Credit Card, bKash, Nagad",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Level 4, Chandiwala Mansion, House 32, Road 11, Block G",
      addressLocality: "Banani",
      addressRegion: "Dhaka",
      postalCode: "1213",
      addressCountry: "BD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.7937,
      longitude: 90.4049,
    },
    hasMap: "https://maps.app.goo.gl/aztfz8BxL5vug12L7",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
        ],
        opens: "11:00",
        closes: "21:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "17:00",
        closes: "21:30",
      },
    ],
    medicalSpecialty: [
      "Orthodontics",
      "Prosthodontics",
      "Oral and Maxillofacial Surgery",
      "Pediatric Dentistry",
      "Periodontics",
      "Endodontics",
      "Cosmetic Dentistry",
    ],
    availableService: [
      {
        "@type": "MedicalProcedure",
        name: "Metal & Clear Aligners / Invisible Braces",
      },
      {
        "@type": "MedicalProcedure",
        name: "Dental Implants & Full Mouth Rehabilitation",
      },
      {
        "@type": "MedicalProcedure",
        name: "Root Canal Treatment & Endodontics",
      },
      {
        "@type": "MedicalProcedure",
        name: "Oral & Maxillofacial Surgery & Wisdom Tooth Extraction",
      },
      {
        "@type": "MedicalProcedure",
        name: "Pediatric Dentistry (Children Dental Care)",
      },
      {
        "@type": "MedicalProcedure",
        name: "Cosmetic Dentistry & Teeth Whitening",
      },
      {
        "@type": "MedicalProcedure",
        name: "Scaling, Polishing & Gum Health Care",
      },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kghdental.com/appointment",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Book Dental Appointment",
      },
    },
    sameAs: [
      "https://facebook.com/kghdental",
      "https://maps.app.goo.gl/aztfz8BxL5vug12L7",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  );
}
