(function (global) {
  "use strict";

  function createKnowledge() {
    const fallbackBusiness = {
      name: "MAA MANSA DEVI GLASS WORKS",
      location: "Kaithal, Haryana, India",
      city: "Kaithal",
      state: "Haryana",
      country: "India",
      address: "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony, Kaithal, Haryana - 136027, India",
      phones: ["+918607774600", "+919812739362"],
      whatsapp: "917082014381",
      hours: [
        { days: "Monday - Saturday", time: "9:00 AM - 6:00 PM" },
        { days: "Sunday", time: "9:00 AM - 1:00 PM" }
      ],
      rating: { value: 5, source: "Justdial" },
      tagline: "Premium Glass & Aluminium Works",
      products: [],
      services: [],
      projects: [],
      faqs: [],
      whyUs: []
    };

    const business = (typeof BUSINESS !== "undefined" && BUSINESS) || fallbackBusiness;

    return {
      business,
      products: business.products || [],
      services: business.services || [],
      projects: business.projects || [],
      faqs: business.faqs || [],
      whyUs: business.whyUs || [],
      pages: [
        {
          id: "home",
          label: "Home",
          title: "MAA MANSA DEVI GLASS WORKS",
          content: [
            "Premium glass, aluminium, steel, UPVC and ACP fabrication work.",
            "Home section me hero slides, about intro aur free quote CTA hain.",
            "Business Kaithal, Haryana me hai aur tagline Premium Glass & Aluminium Works hai."
          ]
        },
        {
          id: "about",
          label: "About",
          title: "About Our Company",
          content: [
            "About section me company Kaithal, Haryana me professional fabrication company ke roop me present hai.",
            "Specialisation: premium architectural glass, aluminium framing, steel structures, UPVC doors & windows aur ACP panel cladding.",
            "Why Choose Us section me quality workmanship, modern designs, reliable service aur customer satisfaction hain."
          ]
        },
        {
          id: "products",
          label: "Products",
          title: "Products",
          content: [
            "Products section me Glass, Aluminium, Steel, UPVC Profiles aur ACP Panels categories hain.",
            "Har product ke bullet points services/custom options batayein."
          ]
        },
        {
          id: "services",
          label: "Services",
          title: "Services",
          content: [
            "Services me glass partition, windows & doors, steel fabrication, ACP cladding, custom fabrication aur mirror fitting services hain."
          ]
        },
        {
          id: "projects",
          label: "Projects",
          title: "Projects",
          content: [
            "Projects section me actual work gallery ke photos/categories hain — Glass, Steel, Aluminium, UPVC aur ACP."
          ]
        },
        {
          id: "contact",
          label: "Contact",
          title: "Contact",
          content: [
            "Contact section me address, timings, phone numbers, WhatsApp aur map info hain.",
            "Free quote aur enquiry contact form/Whtsapp se mil sakti hain."
          ]
        }
      ]
    };
  }

  global.ASSISTANT_KNOWLEDGE = createKnowledge();
})(window);
