(function () {
  "use strict";

  const K = window.ASSISTANT_KNOWLEDGE || {
    business: {
      name: "MAA MANSA DEVI GLASS WORKS",
      address: "Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony, Kaithal, Haryana - 136027, India",
      phones: ["+918607774600", "+917082014381"],
      whatsapp: "918607774600",
      hours: [
        { days: "Monday - Saturday", time: "9:00 AM - 6:00 PM" },
        { days: "Sunday", time: "9:00 AM - 1:00 PM" }
      ],
      rating: { value: 5, source: "Justdial" }
    },
    products: [],
    services: [],
    projects: [],
    faqs: [],
    pages: []
  };

  const state = {
    open: false,
    messages: [],
    welcomeAdded: false,
    quickReplies: [],
    currentTourStep: 0,
    tourState: "idle",
    tourUtterance: null,
    tourSectionId: null,
    assistantLang: "hi-IN",
    recognition: null,
    listening: false,
    isTyping: false
  };

  const ROBOT_IMAGE_SRC = "images/assistant-robot-black-gold.svg";
  const ROBOT_IMAGE_FALLBACK_SRC = "images/assistant-robot-black-gold.png";
  const GREETING_STORAGE_KEY = "mmdgAssistantGreetingShown";
  let greetingEl = null;
  let greetingTimer = null;
  let greetingShownInMemory = false;
  let greetingDismissed = false;

  function createRobotImage(className, alt, eager) {
    const picture = document.createElement("picture");
    picture.className = "assistant-robot-picture";

    const source = document.createElement("source");
    source.srcset = ROBOT_IMAGE_SRC;
    source.type = "image/svg+xml";
    picture.appendChild(source);

    const img = document.createElement("img");
    img.className = className;
    img.src = ROBOT_IMAGE_FALLBACK_SRC;
    img.alt = alt || "";
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    img.draggable = false;
    img.addEventListener("error", () => {
      const fallback = document.createElement("span");
      fallback.className = "assistant-robot-fallback";
      fallback.textContent = "🤖";
      fallback.setAttribute("aria-hidden", "true");
      picture.replaceWith(fallback);
    });
    picture.appendChild(img);
    return picture;
  }

  function createMessageAvatar() {
    const avatar = document.createElement("span");
    avatar.className = "assistant-message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.appendChild(createRobotImage("assistant-avatar-img", "", false));
    return avatar;
  }

  function hasGreetingBeenShown() {
    if (greetingShownInMemory) return true;
    try {
      return window.localStorage.getItem(GREETING_STORAGE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function rememberGreetingShown() {
    greetingShownInMemory = true;
    try {
      window.localStorage.setItem(GREETING_STORAGE_KEY, "1");
    } catch (error) {
      /* localStorage is optional */
    }
  }

  function hideGreeting() {
    greetingDismissed = true;
    if (greetingTimer) {
      window.clearTimeout(greetingTimer);
      greetingTimer = null;
    }
    if (!greetingEl) return;
    greetingEl.classList.remove("assistant-greeting-visible");
    greetingEl.setAttribute("aria-hidden", "true");
  }

  function showGreeting() {
    if (hasGreetingBeenShown() || greetingEl || greetingDismissed) return;
    rememberGreetingShown();

    greetingEl = document.createElement("div");
    greetingEl.className = "assistant-greeting";
    greetingEl.setAttribute("role", "status");
    greetingEl.setAttribute("aria-live", "polite");
    greetingEl.innerHTML = `
      <span>Namaste! Kuch poochna hai?</span>
      <button class="assistant-greeting-close" type="button" aria-label="Close message">×</button>
    `;
    document.body.appendChild(greetingEl);

    greetingEl.querySelector(".assistant-greeting-close").addEventListener("click", (event) => {
      event.stopPropagation();
      hideGreeting();
    });

    window.requestAnimationFrame(() => {
      if (!greetingEl || greetingDismissed) return;
      greetingEl.setAttribute("aria-hidden", "false");
      greetingEl.classList.add("assistant-greeting-visible");
    });

    greetingTimer = window.setTimeout(hideGreeting, 5000);
  }

  const launcher = document.createElement("button");
  launcher.id = "assistant-launcher";
  launcher.className = "assistant-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open AI Assistant");
  launcher.setAttribute("aria-expanded", "false");

  const robotShell = document.createElement("span");
  robotShell.className = "assistant-robot-shell";
  robotShell.appendChild(createRobotImage("assistant-icon", "AI Assistant robot", true));
  launcher.appendChild(robotShell);

  const speakingWaves = document.createElement("span");
  speakingWaves.className = "assistant-speaking-waves";
  speakingWaves.setAttribute("aria-hidden", "true");
  speakingWaves.innerHTML = "<i></i><i></i><i></i>";
  launcher.appendChild(speakingWaves);

  const panel = document.createElement("div");
  panel.id = "assistant-panel";
  panel.className = "assistant-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="assistant-header">
      <div class="assistant-brand">
        <span class="assistant-avatar assistant-avatar-header" id="assistant-header-avatar" aria-hidden="true"></span>
        <span class="assistant-title">MAA MANSA DEVI GLASS WORKS Assistant</span>
      </div>
      <div class="assistant-header-actions">
        <button class="assistant-lang" type="button" aria-label="Change language">${state.assistantLang === "hi-IN" ? "HI" : "EN"}</button>
        <button class="assistant-close" id="assistant-close" type="button" aria-label="Close assistant">×</button>
      </div>
    </div>
    <div class="assistant-messages" id="assistant-messages"></div>
    <div class="assistant-controls" id="assistant-controls">
      <button type="button" data-action="pause">Pause</button>
      <button type="button" data-action="resume">Resume</button>
      <button type="button" data-action="next">Next</button>
      <button type="button" data-action="prev">Previous</button>
      <button type="button" data-action="stop">Stop</button>
    </div>
    <div class="assistant-input-row">
      <input id="assistant-input" type="text" placeholder="Apni sawal likhein..." autocomplete="off">
      <button id="assistant-send" type="button" aria-label="Send message">➤</button>
      <button id="assistant-mic" type="button" aria-label="Voice input">🎤</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const headerAvatar = panel.querySelector("#assistant-header-avatar");
  if (headerAvatar) headerAvatar.appendChild(createRobotImage("assistant-avatar-img", "", false));

  const closeBtn = panel.querySelector("#assistant-close");
  const langBtn = panel.querySelector(".assistant-lang");
  const messagesEl = panel.querySelector("#assistant-messages");
  const controlsEl = panel.querySelector("#assistant-controls");
  const inputEl = panel.querySelector("#assistant-input");
  const sendBtn = panel.querySelector("#assistant-send");
  const micBtn = panel.querySelector("#assistant-mic");
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) micBtn.disabled = true;

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    return addMessage("user", text);
  }

  function addAssistantMessage(text, opts = {}) {
    return addMessage("assistant", text, opts);
  }

  function addMessage(source, text, opts = {}) {
    const msg = { source, text, quickReplies: opts.quickReplies || [] };
    state.messages.push(msg);
    renderMessages();
    scrollToBottom();
    return msg;
  }

  function renderMessages() {
    messagesEl.innerHTML = "";

    if (state.isTyping) {
      const typingRow = document.createElement("div");
      typingRow.className = "assistant-message-row assistant-message-assistant";
      typingRow.appendChild(createMessageAvatar());
      const typingBubble = document.createElement("div");
      typingBubble.className = "assistant-bubble assistant-typing";
      typingBubble.textContent = "typing...";
      typingRow.appendChild(typingBubble);
      messagesEl.appendChild(typingRow);
      scrollToBottom();
      return;
    }

    state.messages.forEach((msg) => {
      const row = document.createElement("div");
      row.className = "assistant-message-row";
      row.classList.add(`assistant-message-${msg.source}`);

      const bubble = document.createElement("div");
      bubble.className = "assistant-bubble";
      bubble.textContent = msg.text;

      const rowEl = document.createElement("div");
      rowEl.className = "assistant-message";
      rowEl.appendChild(bubble);

      if (msg.source === "assistant") {
        row.appendChild(createMessageAvatar());
      }
      row.appendChild(rowEl);
      messagesEl.appendChild(row);

      if (msg.source === "assistant") {
        const speaker = document.createElement("button");
        speaker.className = "assistant-speaker";
        speaker.type = "button";
        speaker.setAttribute("aria-label", "Read response aloud");
        speaker.innerHTML = "🔊";
        speaker.addEventListener("click", () => speakText(msg.text, state.assistantLang));
        rowEl.appendChild(speaker);
      }

      if (msg.source === "assistant" && msg.quickReplies && msg.quickReplies.length) {
        const quick = document.createElement("div");
        quick.className = "assistant-quick-replies";
        msg.quickReplies.forEach((qr) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "assistant-quick-btn";
          btn.textContent = qr.label;
          btn.addEventListener("click", () => {
            if (qr.action) handleQuickAction(qr.action);
            else if (typeof qr.message === "string") send(qr.message);
          });
          quick.appendChild(btn);
        });
        messagesEl.appendChild(quick);
      }
    });
  }

  function handleQuickAction(action) {
    if (!action) return;
    if (action === "navigate:products") {
      document.querySelector("#products")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "navigate:services") {
      document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "navigate:about") {
      document.querySelector("#about")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "navigate:home") {
      document.querySelector("#home")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "navigate:projects") {
      document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "navigate:contact") {
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action === "call") {
      window.open("tel:+918607774600", "_blank");
      return;
    }
    if (action === "whatsapp") {
      window.open("https://wa.me/918607774600", "_blank");
      return;
    }
    send(action);
  }

  function getSmallTalkReply(input) {
    const text = String(input || "")
      .toLowerCase()
      .replace(/[,.!?;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const greetings = new Set([
      "hi", "hii", "hiii", "hello", "helo", "hlo", "hey", "namaste", "namaskar",
      "good morning", "good afternoon", "good evening"
    ]);
    const thanks = new Set(["thanks", "thank you", "thankyou", "thx", "shukriya", "dhanyavad", "dhanyavaad"]);
    const bye = new Set(["bye", "goodbye", "good bye", "see you", "see ya", "alvida"]);

    if (greetings.has(text)) {
      return {
        text: "Namaste! Main MAA MANSA DEVI GLASS WORKS Assistant hoon. Products, services, timings, address, projects ya voice tour ke baare me pooch sakte hain."
      };
    }
    if (thanks.has(text)) {
      return { text: "Aapka swagat hai! Koi aur sawal ho to zaroor poochhein." };
    }
    if (bye.has(text)) {
      return { text: "Dhanyavaad! Phir milte hain." };
    }
    return null;
  }

  function useLocalFallback(value) {
    const fallback = getAssistantReply(value);
    addAssistantMessage(fallback.text, { quickReplies: fallback.quickReplies || [] });
  }

  function getAssistantReply(input) {
    const text = (input || "").toLowerCase();
    const has = (...words) => words.some((w) => text.includes(w));

    if (has("price", "cost", "discount", "offer", "rate", "kitna", "paisa", "charge", "charges", "rupee")) {
      return {
        text: "Iski jankari mere paas nahi hai, kripya call karein: 8607774600",
        quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }]
      };
    }

    if (has("email", "mail")) {
      return {
        text: "Iski jankari mere paas nahi hai, kripya call karein: 8607774600",
        quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }]
      };
    }

    if (has("time", "timings", "kitne", "kab", "kaun", "hour", "hours", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mon", "tue", "wed", "thu", "fri", "sat", "sun")) {
      return {
        text: "Hum Monday se Saturday 9:00 AM - 6:00 PM aur Sunday 9:00 AM - 1:00 PM tak khate hain.",
        quickReplies: [{ label: "Address", action: "address" }, { label: "Products", action: "products" }]
      };
    }

    if (has("address", "where", "location", "hanuman", "karnal", "railway", "friends colony", "136027")) {
      return {
        text: "Address: Near Hanuman Vatika, Karnal Road, Near Railway Crossing, Friends Colony, Kaithal, Haryana - 136027, India.",
        quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }]
      };
    }

    if (has("product", "glass", "aluminium", "aluminum", "steel", "upvc", "acp", "kaanch", "shisha", "facade", "cladding", "kitchen", "partition", "window", "door", "railing", "gate", "modular", "paneel")) {
      const product = K.products.find((p) => text.includes(p.title.toLowerCase()) || text.includes((p.category || "").toLowerCase()))
        || (has("kaanch", "shisha", "glass") ? K.products.find((p) => p.category === "Glass") : null)
        || (has("aluminium", "aluminum") ? K.products.find((p) => p.category === "Aluminium") : null)
        || (has("steel") ? K.products.find((p) => p.category === "Steel") : null)
        || (has("upvc") ? K.products.find((p) => p.category === "UPVC") : null)
        || (has("acp") ? K.products.find((p) => p.category === "ACP") : null);
      const lines = [];
      if (product) {
        lines.push(product.desc);
        (product.bullets || []).forEach((b) => lines.push(b));
      } else {
        (K.products || []).forEach((p) => {
          lines.push(`${p.title}: ${p.desc}`);
          (p.bullets || []).forEach((b) => lines.push(b));
        });
      }
      return { text: lines.join(" "), quickReplies: [{ label: "Products page kholo", action: "navigate:products" }] };
    }

    if (has("service")) {
      const service = K.services.find((s) => text.includes(s.title.toLowerCase()));
      const lines = service ? [service.desc] : K.services.slice(0, 2).map((s) => s.desc);
      return { text: lines.join(" "), quickReplies: [{ label: "Services", action: "navigate:services" }] };
    }

    if (has("project")) {
      const project = K.projects.find((p) => text.includes(p.title.toLowerCase()) || text.includes((p.category || "").toLowerCase()));
      const lines = project ? [`${project.title} — ${project.category}`] : K.projects.slice(0, 3).map((p) => `${p.title} — ${p.category}`);
      return { text: lines.join(" "), quickReplies: [{ label: "Projects", action: "navigate:projects" }] };
    }

    if (has("about")) {
      return {
        text: "Hum professional fabrication company hain, Kaithal, Haryana me, premium glass/aluminium/steel/UPVC/ACP work par.",
        quickReplies: [{ label: "About", action: "navigate:about" }]
      };
    }

    if (has("home")) {
      return {
        text: "Home me hamara tagline aur hero/about/CTA content hain. Products, services ya projects dekhne ke liye buttons use karein.",
        quickReplies: [{ label: "Home", action: "navigate:home" }]
      };
    }

    if (has("call", "phone", "whatsapp", "contact", "number", "enquiry", "quote", "free quote", "get quote")) {
      return {
        text: "Call +91 8607774600 ya WhatsApp +91 8607774600 par contact karein. Free quote ke liye contact page/form use karein.",
        quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }]
      };
    }

    const greeting = has("namaste", "hello", "hi ", "hii", "hey");
    if (greeting) {
      return { text: "Namaste! Main MAA MANSA DEVI GLASS WORKS Assistant hoon. Aap mujhse products, services, timings, address, projects ya voice tour pooch sakte hain." };
    }

    if (has("faq")) {
      const faq = K.faqs.find((f) => text.includes(f.q.toLowerCase()));
      return { text: faq ? faq.a : "FAQ ka jawab humare paas hai, kripya contact page check karein." };
    }

    if (has("rating", "rt", "star", "justdial", "feedback")) {
      const rating = K.business?.rating;
      return {
        text: `Hum Justdial par ${rating?.value ?? 5}/5 rating hain.`,
        quickReplies: [{ label: "Contact", action: "contact" }]
      };
    }

    return {
      text: "Iski jankari mere paas nahi hai, kripya call karein: 8607774600",
      quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }]
    };
  }

  async function send(raw) {
    const value = (raw || "").trim();
    if (!value) return;
    addUserMessage(value);
    const lower = value.toLowerCase();
    if (lower.includes("voice tour")) {
      startTour();
      return;
    }

    const smallTalk = getSmallTalkReply(value);
    if (smallTalk) {
      addAssistantMessage(smallTalk.text, { quickReplies: smallTalk.quickReplies || [] });
      return;
    }

    state.isTyping = true;
    launcher.classList.add("assistant-launcher-thinking");
    panel.classList.add("assistant-panel-thinking");
    renderMessages();

    try {
      const history = state.messages.slice(-6).map((m) => ({
        role: m.source === "assistant" ? "assistant" : "user",
        content: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || (data && typeof data.error === "string")) {
        const code = data && typeof data.error === "string" ? data.error : `http_${response.status}`;
        console.warn("[assistant] /api/chat error:", code);
        useLocalFallback(value);
        return;
      }

      const reply = data && typeof data.reply === "string" ? data.reply.trim() : "";
      if (!reply) {
        console.warn("[assistant] /api/chat error:", "empty_response");
        useLocalFallback(value);
        return;
      }

      addAssistantMessage(reply, { quickReplies: Array.isArray(data?.quickReplies) ? data.quickReplies : [] });
    } catch (error) {
      console.warn("[assistant] /api/chat error:", "network_error");
      useLocalFallback(value);
    } finally {
      state.isTyping = false;
      launcher.classList.remove("assistant-launcher-thinking");
      panel.classList.remove("assistant-panel-thinking");
      renderMessages();
    }
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || state.assistantLang;
    const voices = window.speechSynthesis.getVoices() || [];
    const wanted = (lang || state.assistantLang).toLowerCase();
    const voice =
      voices.find((v) => (v.lang || "").toLowerCase() === wanted) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith(wanted)) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("hi")) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    state.tourUtterance = utterance;
    launcher.classList.add("assistant-launcher-speaking");
    panel.classList.add("assistant-panel-speaking");
    utterance.onend = () => {
      launcher.classList.remove("assistant-launcher-speaking");
      panel.classList.remove("assistant-panel-speaking");
      if (state.tourState === "speaking") nextTourStep();
    };
    utterance.onerror = () => {
      launcher.classList.remove("assistant-launcher-speaking");
      panel.classList.remove("assistant-panel-speaking");
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    state.tourUtterance = null;
    launcher.classList.remove("assistant-launcher-speaking");
    panel.classList.remove("assistant-panel-speaking");
  }

  function speakText(text, lang) {
    if (!("speechSynthesis" in window)) return;
    speak(text, lang);
  }

  const tourSteps = [
    { id: "home", label: "Home", text: "Welcome to MAA MANSA DEVI GLASS WORKS. This is our Home section. We work on premium glass, aluminium, steel, UPVC and ACP projects." },
    { id: "about", label: "About", text: "About section me hamara company Kaithal, Haryana me hai aur modern glass, aluminium, steel, UPVC aur ACP work par focus karta hai." },
    { id: "products", label: "Products", text: "Products section me Glass, Aluminium, Steel, UPVC Profiles aur ACP Panels hain. Har category ke bullet points details hain." },
    { id: "services", label: "Services", text: "Services me glass partition, windows & doors, steel fabrication, ACP cladding, custom fabrication aur mirror fitting services hain." },
    { id: "projects", label: "Projects", text: "Projects me humara actual work gallery hai — Glass, Aluminium, Steel, UPVC, ACP aur aluminium kitchen/facade wali categories hain." },
    { id: "contact", label: "Contact", text: "Contact section me address, timings, phone numbers, WhatsApp aur map info hain. Call ya WhatsApp kar sakte hain." }
  ];

  function getTourText(step) {
    const lang = state.assistantLang;
    const isHindi = (lang || "").toLowerCase().startsWith("hi");
    const texts = isHindi
      ? {
          home: "MAA MANSA DEVI GLASS WORKS ka Home section hai. Hum premium glass, aluminium, steel, UPVC aur ACP projects par kaam karte hain.",
          about: "About section mein humara company Kaithal, Haryana mein hai aur modern glass, aluminium, steel, UPVC aur ACP work par focus karta hai.",
          products: "Products section mein Glass, Aluminium, Steel, UPVC Profiles aur ACP Panels hain. Har category ke bullet points details hain.",
          services: "Services mein glass partition, windows & doors, steel fabrication, ACP cladding, custom fabrication aur mirror fitting services hain.",
          projects: "Projects mein humara actual work gallery hai — Glass, Aluminium, Steel, UPVC, ACP aur aluminium kitchen/facade wali categories hain.",
          contact: "Contact section mein address, timings, phone numbers, WhatsApp aur map info hain. Call ya WhatsApp kar sakte hain."
        }
      : {
          home: "Welcome to MAA MANSA DEVI GLASS WORKS. This is our Home section. We work on premium glass, aluminium, steel, UPVC and ACP projects.",
          about: "About section me hamara company Kaithal, Haryana me hai aur modern glass, aluminium, steel, UPVC aur ACP work par focus karta hai.",
          products: "Products section me Glass, Aluminium, Steel, UPVC Profiles aur ACP Panels hain. Har category ke bullet points details hain.",
          services: "Services me glass partition, windows & doors, steel fabrication, ACP cladding, custom fabrication aur mirror fitting services hain.",
          projects: "Projects me humara actual work gallery hai — Glass, Aluminium, Steel, UPVC, ACP aur aluminium kitchen/facade wali categories hain.",
          contact: "Contact section me address, timings, phone numbers, WhatsApp aur map info hain. Call ya WhatsApp kar sakte hain."
        };
    const text = texts[step];
    return text || texts.home;
  }

  function getTourEndText() {
    const lang = state.assistantLang;
    return (lang || "").toLowerCase().startsWith("hi")
      ? "Tour khatam. Call ya WhatsApp se contact kar sakte hain."
      : "Tour ended. You can contact us by call or WhatsApp.";
  }

  function getSection(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    return el;
  }

  function speakTourStep(step) {
    if (state.tourState !== "speaking") return;
    state.currentTourStep = step;
    const section = getSection(tourSteps[step].id);
    if (section) {
      state.tourSectionId = tourSteps[step].id;
      section.classList.add("assistant-tour-highlight");
      window.setTimeout(() => {
        const current = document.getElementById(tourSteps[step].id);
        if (current) current.classList.remove("assistant-tour-highlight");
      }, 2600);
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const text = getTourText(step);
    addAssistantMessage(text);
    speak(text, state.assistantLang);
  }

  function startTour() {
    state.currentTourStep = 0;
    state.tourState = "speaking";
    controlsEl.style.display = "flex";
    speakTourStep(0);
  }

  function nextTourStep() {
    if (state.tourState !== "speaking") return;
    const next = state.currentTourStep + 1;
    if (next >= tourSteps.length) {
      const finalText = getTourEndText();
      addAssistantMessage(finalText, { quickReplies: [{ label: "Call", action: "call" }, { label: "WhatsApp", action: "whatsapp" }] });
      stopTour();
      speak(finalText, state.assistantLang);
      return;
    }
    speakTourStep(next);
  }

  function prevTourStep() {
    if (state.tourState !== "speaking") return;
    const prev = state.currentTourStep - 1;
    if (prev < 0) {
      stopTour();
      return;
    }
    speakTourStep(prev);
  }

  function stopTour() {
    stopSpeaking();
    state.tourState = "idle";
    state.currentTourStep = 0;
    const previousSectionId = state.tourSectionId;
    state.tourSectionId = null;
    if (previousSectionId) {
      const previousSection = document.getElementById(previousSectionId);
      if (previousSection) previousSection.classList.remove("assistant-tour-highlight");
    }
    controlsEl.style.display = "none";
  }

  function startVoiceInput() {
    if (state.listening) {
      state.listening = false;
      if (state.recognition) state.recognition.stop();
      micBtn.textContent = "🎤";
      micBtn.disabled = false;
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      micBtn.disabled = true;
      return;
    }
    const recognition = new Ctor();
    state.recognition = recognition;
    state.listening = true;
    micBtn.disabled = false;
    micBtn.textContent = "⏸";
    recognition.lang = state.assistantLang;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || []).map((r) => r[0]?.transcript || "").join(" ").trim();
      if (transcript) {
        inputEl.value = transcript;
        send(transcript);
      }
    };
    recognition.onend = () => {
      state.listening = false;
      micBtn.textContent = "🎤";
      micBtn.disabled = false;
    };
    recognition.onerror = () => {
      state.listening = false;
      micBtn.textContent = "🎤";
      micBtn.disabled = false;
    };
    recognition.start();
  }

  function initAssistant() {
    if (state.open) return;

    launcher.addEventListener("click", () => {
      state.open = !state.open;
      panel.setAttribute("aria-hidden", String(!state.open));
      panel.classList.toggle("assistant-panel-open", state.open);
      launcher.setAttribute("aria-expanded", String(state.open));
      if (state.open) {
        hideGreeting();
        if (!state.welcomeAdded) {
          state.welcomeAdded = true;
          addAssistantMessage("Namaste! Main MAA MANSA DEVI GLASS WORKS Assistant hoon. Aap mujhse products, services, timings, address, projects ya voice tour pooch sakte hain.", { quickReplies: [
            { label: "Products dekho", message: "Products dekho" },
            { label: "Services", message: "Services" },
            { label: "Timings", message: "Timings" },
            { label: "Address", message: "Address" },
            { label: "Voice Tour", message: "Voice Tour" }
          ] });
        }
        inputEl.focus();
      } else {
        stopTour();
      }
    });

    closeBtn.addEventListener("click", () => {
      state.open = false;
      panel.setAttribute("aria-hidden", "true");
      panel.classList.remove("assistant-panel-open");
      launcher.setAttribute("aria-expanded", "false");
      hideGreeting();
      stopTour();
    });

    sendBtn.addEventListener("click", () => send(inputEl.value));

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send(inputEl.value);
    });

    micBtn.addEventListener("click", startVoiceInput);

    controlsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "pause") {
        if (state.tourState === "speaking" && state.tourUtterance) window.speechSynthesis.pause();
        state.tourState = "paused";
        launcher.classList.remove("assistant-launcher-speaking");
        panel.classList.remove("assistant-panel-speaking");
      } else if (action === "resume") {
        if (state.tourState === "paused" && state.tourUtterance) window.speechSynthesis.resume();
        state.tourState = "speaking";
        if (state.tourUtterance) {
          launcher.classList.add("assistant-launcher-speaking");
          panel.classList.add("assistant-panel-speaking");
        }
      } else if (action === "next") {
        stopSpeaking();
        const next = state.currentTourStep + 1;
        if (next >= tourSteps.length) {
          stopTour();
          return;
        }
        speakTourStep(next);
      } else if (action === "prev") {
        stopSpeaking();
        const prev = state.currentTourStep - 1;
        if (prev < 0) {
          stopTour();
          return;
        }
        speakTourStep(prev);
      } else if (action === "stop") {
        stopTour();
      }
    });

    langBtn.addEventListener("click", () => {
      state.assistantLang = state.assistantLang === "hi-IN" ? "en-IN" : "hi-IN";
      langBtn.textContent = state.assistantLang === "hi-IN" ? "HI" : "EN";
    });

    // Initial render
    state.open = false;
    panel.setAttribute("aria-hidden", "true");
    panel.classList.remove("assistant-panel-open");
    state.welcomeAdded = false;
    state.messages = [];
    state.quickReplies = [];
    renderMessages();

    window.setTimeout(() => {
      if (!state.open) showGreeting();
    }, 900);
  }

  if (document.readyState === "complete") initAssistant();
  else document.addEventListener("DOMContentLoaded", initAssistant);
})();
