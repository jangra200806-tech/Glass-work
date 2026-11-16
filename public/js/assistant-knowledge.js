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
      phones: ["+918607774600", "+917082014381"],
      whatsapp: "918607774600",
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
        },
        {
          id: "pricing",
          label: "Pricing",
          title: "Rates & Pricing",
          content: [
            "Website par Pricing page par indicative rate list hai — toughened glass 8/10/12 mm, laminated, frosted/etched, patterned, ACP cladding, UPVC, aluminium, steel grill aur main gate ke approximate rates.",
            "Rates sirf indication ke liye hain — final price site measurement, brand, finish aur hardware par depend karta hai. Measurement aur site visit FREE hai.",
            "Pricing page par user ko guide karein ya usse quote ke liye WhatsApp/contact par bhejein."
          ]
        },
        {
          id: "service-areas",
          label: "Service Areas",
          title: "Service Areas",
          content: [
            "Kaithal me hamari shop Karnal Road par hai. Kaam Karnal, Kurukshetra, Yamunanagar, Narwana, Assand, Pipli, Khanaur aur Kalayat jaise aas-pas ke shehron me bhi hota hai.",
            "Door ke shehar ke liye availability pehle WhatsApp par confirm karein. Travelling charge project ke hisaab se hota hai aur quotation me pehle bata diya jata hai."
          ]
        },
        {
          id: "privacy",
          label: "Privacy Policy",
          title: "Privacy Policy",
          content: [
            "Privacy Policy page par batata hai ki contact form se sirf naam, phone aur message lete hain, enquiry email aur WhatsApp dono par jaati hai, aur data ka use sirf enquiry reply karne ke liye hota hai."
          ]
        }
      ]
    };
  }

  global.ASSISTANT_KNOWLEDGE = createKnowledge();
})(window);
