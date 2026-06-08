(function () {
  "use strict";

  window.__P99__ = {
    brand: {
      name: "Project99",
      tagline: "Agencia de Inteligencia Artificial",
      owner: "",
      email: "",
      phone: "",
      location: "",
      year: new Date().getFullYear()
    },

    /* ── Catalogo de servicios ── */
    services: [
      { id: "web",        label: "Desarrollo de Sitio Web",       base: 300,  unit: "web" },
      { id: "chatbot",    label: "Chatbot con IA",                base: 1200, unit: "proyecto" },
      { id: "data",       label: "Analisis de Datos con IA",      base: 2500, unit: "proyecto" },
      { id: "automation", label: "Automatizacion de Procesos",    base: 800,  unit: "mes" },
      { id: "seo",        label: "SEO con IA",                    base: 350,  unit: "mes" },
      { id: "email",      label: "Email Marketing Automatizado",  base: 500,  unit: "mes" },
      { id: "content",    label: "Creacion de Contenido con IA",  base: 900,  unit: "mes" },
      { id: "app",        label: "App con Claude Code",           base: 4500, unit: "proyecto" },
      { id: "agent",      label: "Agente IA Personalizado",       base: 8000, unit: "proyecto" },
      { id: "consulting", label: "Consultoria IA",                base: 150,  unit: "hora" },
      { id: "finetune",   label: "Fine-tuning Modelo",            base: 3000, unit: "proyecto" }
    ],

    /* ── Descripciones extendidas para presupuestos ── */
    serviceDescriptions: {
      "web": {
        short: "Sitio web profesional, rapido y optimizado para conversion.",
        what: "Desarrollo completo de tu sitio web con diseno moderno, adaptado a movil, carga rapida y optimizado para aparecer en Google. Incluye hasta 5 paginas, formulario de contacto, integracion con redes sociales y dominio configurado.",
        gains: ["Presencia profesional online en menos de 2 semanas", "Mas contactos y clientes desde Google (SEO basico incluido)", "Imagen de marca que genera confianza y credibilidad", "Actualizaciones sencillas sin conocimientos tecnicos"],
        includes: ["Diseno personalizado responsive", "Hasta 5 paginas (inicio, servicios, sobre nosotros, contacto, blog)", "Formulario de contacto con notificaciones", "SEO basico y Google Analytics", "Velocidad optimizada (Core Web Vitals)", "SSL y hosting primer ano"],
        timeline: "7-14 dias"
      },
      "chatbot": {
        short: "Asistente IA que atiende clientes 24/7 y genera leads automaticamente.",
        what: "Desarrollo e implementacion de un chatbot inteligente entrenado con la informacion de tu negocio. Atiende preguntas frecuentes, cualifica leads, agenda citas y escala conversaciones complejas al equipo humano.",
        gains: ["Atencion al cliente 24/7 sin coste adicional de personal", "Reduccion del 60% en consultas repetitivas al equipo", "Captura de leads mientras duermes", "Respuestas en segundos, no en horas"],
        includes: ["Integracion web + WhatsApp Business", "Entrenamiento con datos de tu empresa", "Panel de control y estadisticas", "Escalado a humano inteligente", "Soporte tecnico 3 meses", "Actualizaciones mensuales"],
        timeline: "2-3 semanas"
      },
      "data": {
        short: "Transforma tus datos en decisiones rentables con IA.",
        what: "Analisis profundo de los datos de tu negocio para identificar patrones, predecir tendencias y tomar mejores decisiones. Incluye dashboard interactivo, reportes automaticos y recomendaciones accionables.",
        gains: ["Decisiones basadas en datos reales, no intuicion", "Identificacion de oportunidades de ahorro e ingresos ocultos", "Predicciones de demanda y estacionalidad", "Reportes automaticos que ahorran horas de trabajo"],
        includes: ["Conexion a tus fuentes de datos (CRM, ventas, web)", "Dashboard interactivo en tiempo real", "Modelos predictivos personalizados", "Reportes PDF automaticos semanales/mensuales", "Formacion al equipo (2h)", "Mantenimiento 3 meses"],
        timeline: "3-4 semanas"
      },
      "automation": {
        short: "Elimina tareas repetitivas. Tu equipo se enfoca en lo que importa.",
        what: "Automatizacion de procesos repetitivos usando Make, Zapier y IA. Conectamos tus herramientas para que fluyan solas: CRM, email, facturas, reportes, notificaciones y mas, todo sin intervencion manual.",
        gains: ["Ahorro de 10-30 horas semanales en tareas manuales", "Cero errores humanos en procesos criticos", "Escalabilidad sin contratar mas personal", "Visibilidad total del estado de cada proceso"],
        includes: ["Auditoria de procesos actual (2h)", "Diseno de hasta 5 workflows automatizados", "Conexion de herramientas existentes", "Panel de monitorizacion", "Documentacion completa", "Soporte 3 meses"],
        timeline: "2-3 semanas"
      },
      "agent": {
        short: "Un empleado digital que trabaja solo, aprende y toma decisiones.",
        what: "Desarrollo de agente IA personalizado que automatiza procesos complejos de tu negocio con capacidad de razonamiento, toma de decisiones y aprendizaje continuo. Va mucho mas alla de un chatbot.",
        gains: ["Automatizacion de procesos que requerian razonamiento humano", "Disponible 24/7 sin supervision", "Maneja multiples tareas en paralelo", "Aprende y mejora con el uso"],
        includes: ["Diseno de arquitectura del agente", "Integracion con APIs y sistemas existentes", "Panel de control y supervision", "Trazabilidad de todas las acciones", "Testing exhaustivo", "Soporte 6 meses"],
        timeline: "4-8 semanas"
      }
    },

    /* ── Clientes (vacio) ── */
    clients: [],
    projects: [],
    financials: {
      monthly: [],
      current: { income: 0, expenses: 0, net: 0, margin: 0 },
      expenseCategories: [],
      topServices: []
    },
    team: [],
    portfolio: [],

    /* ── Pipeline ── */
    pipeline: [
      { key:"lead-frio",       label:"Lead Frio",         count:0, value:0, color:"#444" },
      { key:"lead-caliente",   label:"Lead Caliente",     count:0, value:0, color:"#E5302A" },
      { key:"propuesta",       label:"Propuesta Enviada", count:0, value:0, color:"#888" },
      { key:"negociacion",     label:"Negociacion",       count:0, value:0, color:"#AAA" },
      { key:"cliente",         label:"Cliente",           count:0, value:0, color:"#22C55E" }
    ],

    /* ── Academy courses con YouTube ── */
    courses: [
      {
        id: "cr01",
        title: "Chatbots con IA Avanzada",
        badge: "CHAT", color: "#E5302A",
        modules: 5, duration: "8h", level: "Intermedio",
        price: "800 - 3.000 EUR",
        description: "Aprende a construir chatbots con la API de Claude, OpenAI y Gemini. Desde el primer mensaje hasta integraciones con WhatsApp y web.",
        objective: "Al finalizar sabras crear, entrenar y desplegar chatbots comerciales que puedes vender a clientes por 800-3.000 EUR.",
        tools: ["Claude API", "OpenAI API", "Node.js / Python", "WhatsApp Business API", "Vercel"],
        videos: [
          { title: "Chatbot con Claude API desde cero (Node.js)", ytId: "chatbot claude API tutorial node.js 2024 español", duration: "~45min" },
          { title: "Integrar ChatGPT/Claude en tu web", ytId: "integrar chatgpt claude api web javascript tutorial español", duration: "~1h" },
          { title: "WhatsApp Bot con IA paso a paso", ytId: "whatsapp bot inteligencia artificial node.js tutorial español 2024", duration: "~40min" },
          { title: "Desplegar chatbot en Vercel gratis", ytId: "desplegar aplicacion vercel tutorial español 2024", duration: "~20min" },
          { title: "Caso real: chatbot atencion al cliente con IA", ytId: "chatbot atencion cliente inteligencia artificial caso real", duration: "~50min" }
        ],
        steps: ["Registrate en Anthropic y obtén tu API key", "Crea un proyecto Node.js o Python", "Haz tu primera llamada a la API con un prompt", "Diseña el system prompt de tu chatbot", "Integra con tu web o WhatsApp", "Despliega en Vercel o Railway gratis"]
      },
      {
        id: "cr02",
        title: "Analisis de Datos con IA",
        badge: "DATA", color: "#888",
        modules: 6, duration: "12h", level: "Avanzado",
        price: "1.500 - 5.000 EUR",
        description: "Python + pandas + IA para analizar cualquier dataset de negocio y crear dashboards automaticos que impresionan a los clientes.",
        objective: "Dominar Python para analisis de datos y poder entregar dashboards inteligentes valorados entre 1.500 y 5.000 EUR.",
        tools: ["Python", "pandas", "matplotlib / plotly", "Claude API", "Google Sheets API", "Streamlit"],
        videos: [
          { title: "Python desde cero - Curso completo para principiantes", ytId: "python desde cero curso completo español 2024 principiantes", duration: "~4h" },
          { title: "pandas para analisis de datos de negocio", ytId: "pandas python analisis datos negocio tutorial español 2024", duration: "~2h" },
          { title: "Dashboard con Streamlit en 1 hora", ytId: "streamlit python dashboard tutorial español 2024", duration: "~1h" },
          { title: "Analizar datos de Excel con Python e IA", ytId: "python excel analisis datos inteligencia artificial tutorial español", duration: "~35min" },
          { title: "Automatizar reportes con Python", ytId: "automatizar reportes python tutorial español 2024", duration: "~40min" }
        ],
        steps: ["Instala Python + VS Code + Jupyter Notebook", "Aprende las bases: variables, bucles, funciones", "Domina pandas: cargar, limpiar y analizar datos", "Visualiza con matplotlib y plotly", "Conecta la IA para interpretar los datos", "Despliega tu dashboard en Streamlit Cloud"]
      },
      {
        id: "cr03",
        title: "Automatizacion de Procesos",
        badge: "AUTO", color: "#666",
        modules: 4, duration: "6h", level: "Basico",
        price: "500 - 2.000 EUR/mes",
        description: "Make, n8n y Zapier para automatizar cualquier proceso de negocio. Sin codigo. Puedes cobrar recurrente mensual.",
        objective: "Crear y vender automatizaciones de procesos con ingresos recurrentes de 500-2.000 EUR al mes por cliente.",
        tools: ["Make (Integromat)", "n8n", "Zapier", "Airtable", "Gmail API", "Webhooks"],
        videos: [
          { title: "Make.com (Integromat) tutorial completo en español", ytId: "make.com integromat tutorial completo español 2024 automatizacion", duration: "~2h" },
          { title: "n8n automatizacion tutorial en español desde cero", ytId: "n8n automatizacion tutorial español desde cero 2024", duration: "~1h 45min" },
          { title: "Zapier tutorial en español 2024", ytId: "zapier tutorial español automatizacion negocio 2024", duration: "~55min" },
          { title: "Automatizar CRM y emails con Make o Zapier", ytId: "automatizar crm email facturacion make zapier tutorial español", duration: "~40min" }
        ],
        steps: ["Crea cuenta gratis en Make.com", "Aprende el concepto de escenarios y modulos", "Conecta dos herramientas simples (Gmail + Sheets)", "Anade logica: filtros, condiciones y bucles", "Construye tu primer workflow de negocio completo", "Documenta y cobra por el mantenimiento mensual"]
      },
      {
        id: "cr04",
        title: "SEO con Inteligencia Artificial",
        badge: "SEO", color: "#555",
        modules: 4, duration: "5h", level: "Basico",
        price: "200 - 500 EUR/mes",
        description: "Usa IA para multiplicar tu produccion de contenido SEO, analizar competencia y subir posiciones en Google.",
        objective: "Ofrecer servicios de SEO con IA que posicionan webs en Google con un tercio del tiempo tradicional.",
        tools: ["Claude / ChatGPT", "Semrush / Ahrefs", "Google Search Console", "SurferSEO", "WordPress"],
        videos: [
          { title: "SEO con Inteligencia Artificial - Estrategia 2024", ytId: "SEO inteligencia artificial estrategia completa español 2024", duration: "~1h 20min" },
          { title: "Crear contenido SEO con IA en masa", ytId: "crear articulos SEO inteligencia artificial tutorial español 2024", duration: "~45min" },
          { title: "Keyword research con IA - tecnicas avanzadas", ytId: "keyword research palabras clave inteligencia artificial tutorial español", duration: "~40min" },
          { title: "Auditoria SEO completa con ChatGPT o Claude", ytId: "auditoria SEO chatgpt claude tutorial español 2024", duration: "~50min" }
        ],
        steps: ["Instala Semrush o Ubersuggest (gratis)", "Identifica keywords de cola larga de tu cliente", "Crea un sistema de prompts para generar articulos", "Optimiza con SurferSEO antes de publicar", "Configura Google Search Console", "Reporta resultados mensualmente al cliente"]
      },
      {
        id: "cr05",
        title: "Email Marketing Automatizado",
        badge: "EMAIL", color: "#777",
        modules: 3, duration: "4h", level: "Basico",
        price: "300 - 800 EUR/mes",
        description: "Secuencias de email automaticas con IA que venden mientras duermes. Mailchimp, ActiveCampaign y copywriting.",
        objective: "Disenar y gestionar embudos de email para clientes cobrando una tarifa mensual recurrente.",
        tools: ["ActiveCampaign", "Mailchimp", "Claude / ChatGPT", "Canva", "Google Analytics"],
        videos: [
          { title: "Email marketing con IA - Curso completo en español", ytId: "email marketing inteligencia artificial curso completo español 2024", duration: "~1h 30min" },
          { title: "ActiveCampaign tutorial desde cero en español", ytId: "activecampaign tutorial desde cero español 2024", duration: "~1h 10min" },
          { title: "Copywriting con IA para email - tecnicas pro", ytId: "copywriting inteligencia artificial email marketing tutorial español", duration: "~45min" }
        ],
        steps: ["Elige plataforma: Mailchimp (gratis) o ActiveCampaign", "Importa o crea una lista de contactos", "Diseña la secuencia de bienvenida (5 emails)", "Genera los copies con IA y ajusta la voz", "Configura las automatizaciones de activacion", "Analiza aperturas y clics semanalmente"]
      },
      {
        id: "cr06",
        title: "Creacion de Contenido con IA",
        badge: "CMS", color: "#999",
        modules: 4, duration: "6h", level: "Basico",
        price: "500 - 1.500 EUR/mes",
        description: "Blogs, redes sociales y copywriting en masa usando IA. Conviertete en una agencia de contenidos escalable.",
        objective: "Gestionar el contenido de multiples clientes usando flujos con IA que multiplican tu productividad x10.",
        tools: ["Claude / ChatGPT", "Canva", "Buffer / Hootsuite", "Notion", "Google Docs"],
        videos: [
          { title: "Crear contenido para redes sociales con IA 2024", ytId: "crear contenido redes sociales inteligencia artificial español 2024", duration: "~50min" },
          { title: "Sistema de contenido escalable con ChatGPT o Claude", ytId: "sistema contenido escalable chatgpt claude agencia marketing español", duration: "~1h" },
          { title: "Canva con IA - Tutorial completo en español", ytId: "canva inteligencia artificial tutorial completo español 2024", duration: "~45min" },
          { title: "Gestion de redes sociales con IA para agencias", ytId: "gestion redes sociales inteligencia artificial agencia tutorial español", duration: "~40min" }
        ],
        steps: ["Define la estrategia de contenido del cliente", "Crea una plantilla de brand voice para los prompts", "Genera el calendario mensual con IA (30 posts en 2h)", "Diseña visuales con Canva + IA", "Programa con Buffer o Meta Business Suite", "Reporta engagement mensualmente"]
      },
      {
        id: "cr07",
        title: "Apps con Claude Code",
        badge: "APP", color: "#CC2020",
        modules: 7, duration: "15h", level: "Avanzado",
        price: "2.000 - 10.000 EUR",
        description: "Construye aplicaciones web completas usando Claude Code como programador IA. Sin experiencia previa necesaria.",
        objective: "Ser capaz de construir y vender MVPs y aplicaciones web completas usando Claude Code como asistente.",
        tools: ["Claude Code CLI", "React / Next.js", "Supabase", "Vercel", "GitHub", "VS Code"],
        videos: [
          { title: "Claude Code tutorial completo desde cero en español", ytId: "claude code tutorial completo español desde cero 2024", duration: "~1h 30min" },
          { title: "Construir una app SaaS con IA completa", ytId: "construir app saas inteligencia artificial tutorial español 2024", duration: "~2h" },
          { title: "Next.js + Supabase Full Stack tutorial español", ytId: "nextjs supabase full stack tutorial español 2024", duration: "~3h" },
          { title: "Desplegar app en Vercel - guia completa", ytId: "desplegar aplicacion vercel gratis tutorial español 2024", duration: "~30min" },
          { title: "Stripe en Next.js - monetizar tu app en 30 min", ytId: "stripe nextjs pagos tutorial español 2024", duration: "~35min" }
        ],
        steps: ["Instala Claude Code con: npm install -g @anthropic-ai/claude-code", "Configura tu API key de Anthropic", "Empieza con un proyecto simple: una landing page", "Itera: describe funcionalidades en lenguaje natural", "Conecta a Supabase para base de datos", "Despliega en Vercel y cobra al cliente"]
      },
      {
        id: "cr08",
        title: "Agentes IA Personalizados",
        badge: "AGENT", color: "#AA1818",
        modules: 8, duration: "20h", level: "Experto",
        price: "5.000 - 20.000 EUR",
        description: "Construye agentes IA autonomos con n8n, LangChain y APIs de IA que automatizan procesos complejos de negocio.",
        objective: "Disenar y vender agentes IA que reemplazan flujos enteros de trabajo, con tickets de proyecto de 5.000-20.000 EUR.",
        tools: ["n8n", "LangChain", "Python", "Claude API", "OpenAI API", "Supabase / Pinecone"],
        videos: [
          { title: "Construir AI Agents con n8n en español 2024", ytId: "agentes IA n8n tutorial completo español 2024", duration: "~2h" },
          { title: "LangChain Python - Agentes desde cero en español", ytId: "langchain python agentes IA tutorial español desde cero 2024", duration: "~1h 50min" },
          { title: "RAG embeddings memoria para tu IA - tutorial español", ytId: "RAG embeddings memoria inteligencia artificial tutorial español 2024", duration: "~1h 15min" },
          { title: "Sistemas multi-agente arquitectura avanzada IA", ytId: "multi agente sistemas arquitectura inteligencia artificial tutorial español", duration: "~1h 30min" },
          { title: "Agente de ventas automatico con IA - caso real", ytId: "agente ventas automatico inteligencia artificial caso real español", duration: "~1h" }
        ],
        steps: ["Aprende los fundamentos de LLMs y function calling", "Instala n8n localmente o en Railway", "Construye tu primer agente simple con un tool", "Implementa memoria y contexto persistente", "Anade capacidad de busqueda web y lectura de documentos", "Despliega y monitoriza con logs y alertas", "Documenta el caso de uso para venderlo"]
      }
    ],

    /* ── Modelos de IA ── */
    aiModels: [
      { id:"claude",     provider:"Anthropic",   name:"Claude",       models:["claude-opus-4-5","claude-sonnet-4-5","claude-haiku-4-5"], defaultModel:"claude-sonnet-4-5",  keyPlaceholder:"sk-ant-api03-...", docsUrl:"https://docs.anthropic.com", color:"#E5302A", icon:"✦", category:"Frontier", status:"disconnected" },
      { id:"openai",     provider:"OpenAI",      name:"ChatGPT / GPT",models:["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"],  defaultModel:"gpt-4o",            keyPlaceholder:"sk-proj-...",       docsUrl:"https://platform.openai.com/docs", color:"#10A37F", icon:"⬡", category:"Frontier", status:"disconnected" },
      { id:"gemini",     provider:"Google",      name:"Gemini",       models:["gemini-2.0-flash","gemini-1.5-pro","gemini-1.5-flash"],  defaultModel:"gemini-2.0-flash",   keyPlaceholder:"AIzaSy...",         docsUrl:"https://ai.google.dev/docs", color:"#4285F4", icon:"◈", category:"Frontier", status:"disconnected" },
      { id:"mistral",    provider:"Mistral AI",  name:"Mistral",      models:["mistral-large-latest","mistral-medium","mistral-small"], defaultModel:"mistral-large-latest",keyPlaceholder:"...",              docsUrl:"https://docs.mistral.ai", color:"#FF7000", icon:"◎", category:"Frontier", status:"disconnected" },
      { id:"grok",       provider:"xAI",         name:"Grok",         models:["grok-3","grok-3-mini","grok-2"],                        defaultModel:"grok-3",            keyPlaceholder:"xai-...",           docsUrl:"https://docs.x.ai", color:"#FFFFFF", icon:"✕", category:"Frontier", status:"disconnected" },
      { id:"llama",      provider:"Meta/Ollama",  name:"Llama",       models:["llama-3.3-70b","llama-3.2-11b-vision","llama-3.1-8b"],  defaultModel:"llama-3.3-70b",      keyPlaceholder:"https://localhost:11434", docsUrl:"https://ollama.com", color:"#0064E0", icon:"⬡", category:"Open Source", status:"disconnected" },
      { id:"perplexity", provider:"Perplexity",  name:"Perplexity",   models:["sonar-pro","sonar","sonar-reasoning"],                  defaultModel:"sonar-pro",         keyPlaceholder:"pplx-...",          docsUrl:"https://docs.perplexity.ai", color:"#20B2AA", icon:"⊙", category:"Search AI", status:"disconnected" },
      { id:"cohere",     provider:"Cohere",      name:"Cohere",       models:["command-r-plus","command-r","command"],                 defaultModel:"command-r-plus",    keyPlaceholder:"...",               docsUrl:"https://docs.cohere.com", color:"#D4A0FF", icon:"◉", category:"Enterprise", status:"disconnected" }
    ],

    /* ── Integraciones de herramientas ── */
    integrations: [
      { id:"gmaps",    name:"Google Maps",  status:"disconnected", icon:"⊙", category:"Leads" },
      { id:"stripe",   name:"Stripe",       status:"disconnected", icon:"$", category:"Pagos" },
      { id:"gmail",    name:"Gmail",        status:"disconnected", icon:"@", category:"Email" },
      { id:"slack",    name:"Slack",        status:"disconnected", icon:"#", category:"Notif" },
      { id:"zapier",   name:"Zapier",       status:"disconnected", icon:"⚡", category:"Auto" },
      { id:"calendly", name:"Calendly",     status:"disconnected", icon:"⊡", category:"Cal" },
      { id:"github",   name:"GitHub",       status:"disconnected", icon:"⊕", category:"Dev" },
      { id:"figma",    name:"Figma",        status:"disconnected", icon:"△", category:"Design" },
      { id:"notion",   name:"Notion",       status:"disconnected", icon:"N", category:"Docs" },
      { id:"hubspot",  name:"HubSpot",      status:"disconnected", icon:"◎", category:"CRM" }
    ],

    /* ── Componentes de codigo ── */
    components: [
      {
        id: "comp01",
        icon: "{ }",
        title: "React Chat Widget",
        desc: "Componente listo para integrar chatbot en cualquier web React",
        app: "React + Claude API + Vercel",
        code: `// ChatWidget.jsx — Instala: npm install @anthropic-ai/sdk
import { useState, useRef, useEffect } from "react";

export default function ChatWidget({ apiKey, systemPrompt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], systemPrompt })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ position:"fixed", bottom:24, right:24, width:360, background:"#111", border:"1px solid #333", borderRadius:12, overflow:"hidden", fontFamily:"sans-serif" }}>
      <div style={{ background:"#E5302A", padding:"12px 16px", color:"#fff", fontWeight:700 }}>Asistente IA</div>
      <div style={{ height:320, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role==="user"?"flex-end":"flex-start", background: m.role==="user"?"#E5302A":"#222", color:"#fff", padding:"8px 12px", borderRadius:8, maxWidth:"80%", fontSize:14 }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ color:"#888", fontSize:13 }}>Escribiendo...</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display:"flex", gap:8, padding:"8px 12px", borderTop:"1px solid #222" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Escribe aqui..." style={{ flex:1, background:"#1a1a1a", border:"1px solid #333", borderRadius:6, padding:"6px 10px", color:"#fff", fontSize:14 }} />
        <button onClick={sendMessage} style={{ background:"#E5302A", border:"none", borderRadius:6, padding:"6px 14px", color:"#fff", cursor:"pointer" }}>→</button>
      </div>
    </div>
  );
}

// pages/api/chat.js (Next.js API Route)
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  const { messages, systemPrompt } = req.body;
  const msg = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: systemPrompt || "Eres un asistente util.",
    messages
  });
  res.json({ reply: msg.content[0].text });
}`,
        steps: [
          "Crea un proyecto Next.js: npx create-next-app@latest mi-chatbot",
          "Instala el SDK: npm install @anthropic-ai/sdk",
          "Crea el archivo pages/api/chat.js con el codigo del handler de arriba",
          "Crea el componente ChatWidget.jsx con el codigo de arriba",
          "Añade ANTHROPIC_API_KEY=sk-ant-... en tu archivo .env.local",
          "Importa el widget en tu pagina: <ChatWidget systemPrompt='Eres el asistente de [EMPRESA]...' />",
          "Personaliza el system prompt con los datos del cliente",
          "Despliega en Vercel: vercel --prod (conecta el repo de GitHub)"
        ]
      },
      {
        id: "comp02",
        icon: "</> ",
        title: "API Claude Integration",
        desc: "Ejemplo completo de integracion con la API de Claude en Node.js",
        app: "Node.js / Python + Claude API",
        code: `// ─── Node.js ───────────────────────────────────────
// npm install @anthropic-ai/sdk dotenv
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Llamada basica con cache de system prompt
async function askClaude(userMessage, context = "") {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: "Eres un asistente profesional de una agencia de IA. Responde siempre en espanol, de forma concisa y orientada a negocio.",
        cache_control: { type: "ephemeral" }  // Prompt caching — ahorra tokens
      }
    ],
    messages: [
      ...(context ? [{ role: "user", content: context }, { role: "assistant", content: "Entendido." }] : []),
      { role: "user", content: userMessage }
    ]
  });
  return response.content[0].text;
}

// Ejemplo con streaming
async function askClaudeStream(userMessage) {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userMessage }]
  });
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta") {
      process.stdout.write(chunk.delta.text);
    }
  }
}

// ─── Python ────────────────────────────────────────
# pip install anthropic
# import anthropic, os
# client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
# msg = client.messages.create(
#   model="claude-sonnet-4-5", max_tokens=1024,
#   messages=[{"role": "user", "content": "Hola, como puedes ayudarme?"}]
# )
# print(msg.content[0].text)`,
        steps: [
          "Crea cuenta en console.anthropic.com y genera una API key",
          "Crea el proyecto: mkdir mi-proyecto && cd mi-proyecto && npm init -y",
          "Instala dependencias: npm install @anthropic-ai/sdk dotenv",
          "Crea .env con ANTHROPIC_API_KEY=sk-ant-...",
          "Crea index.js con el codigo de arriba",
          "Prueba: node index.js",
          "Para produccion, usa variables de entorno de Vercel/Railway/Render"
        ]
      },
      {
        id: "comp03",
        icon: "CSS",
        title: "Dashboard Layout CSS Grid",
        desc: "Layout CSS Grid responsive para dashboards profesionales",
        app: "HTML + CSS puro (sin framework)",
        code: `/* ── Dashboard Layout con CSS Grid ── */
:root {
  --sidebar-w: 240px;
  --topbar-h: 56px;
  --bg: #080808;
  --bg-2: #111118;
  --text: #E2E8F0;
  --accent: #E5302A;
  --border: rgba(255,255,255,0.06);
  --r: 10px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; }
body { display: grid; grid-template-columns: var(--sidebar-w) 1fr; grid-template-rows: var(--topbar-h) 1fr; background: var(--bg); color: var(--text); font-family: "Inter", sans-serif; }

/* Sidebar ocupa columna 1, filas 1+2 */
.sidebar { grid-column: 1; grid-row: 1 / -1; background: var(--bg-2); border-right: 1px solid var(--border); overflow-y: auto; }

/* Topbar ocupa columna 2, fila 1 */
.topbar { grid-column: 2; grid-row: 1; background: var(--bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 1.5rem; gap: 1rem; position: sticky; top: 0; z-index: 10; }

/* Content ocupa columna 2, fila 2 */
.content { grid-column: 2; grid-row: 2; overflow-y: auto; padding: 1.5rem; }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.kpi-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--r); padding: 1.25rem; }
.kpi-value { font-size: 1.75rem; font-weight: 800; margin: .5rem 0; }
.kpi-label { font-size: .75rem; color: #888; text-transform: uppercase; letter-spacing: .05em; }

/* Responsive: sidebar como overlay en movil */
@media (max-width: 768px) {
  body { grid-template-columns: 1fr; grid-template-rows: var(--topbar-h) 1fr; }
  .sidebar { position: fixed; left: -var(--sidebar-w); width: var(--sidebar-w); height: 100%; z-index: 100; transition: left .2s; }
  .sidebar.open { left: 0; }
  .topbar, .content { grid-column: 1; }
}`,
        steps: [
          "Crea un archivo index.html y styles.css en blanco",
          "Añade el CSS de arriba en styles.css",
          "En el HTML crea la estructura: <div class='sidebar'>, <header class='topbar'>, <main class='content'>",
          "Anade tus nav-items en el sidebar con enlaces",
          "En el topbar pon el logo y boton de perfil",
          "En content pon el .kpi-grid con tus datos",
          "Abre en el navegador y ajusta colores editando las variables :root",
          "Convierte a app PWA annadiendo manifest.json y service worker"
        ]
      },
      {
        id: "comp04",
        icon: "JS",
        title: "Lead Scraper Helper",
        desc: "Script para automatizar extraccion de datos de Google Maps via API",
        app: "Node.js + Google Maps Places API",
        code: `// lead-scraper.js — npm install axios dotenv
// Requiere: Google Maps Places API key
import axios from "axios";
import fs from "fs";
import "dotenv/config";

const API_KEY = process.env.GOOGLE_MAPS_KEY;
const BASE = "https://maps.googleapis.com/maps/api";

async function searchPlaces(query, location, radius = 5000) {
  const url = BASE+"/place/textsearch/json";
  const params = { query, location, radius, key: API_KEY, language: "es" };
  const res = await axios.get(url, { params });
  return res.data.results || [];
}

async function getPlaceDetails(placeId) {
  const url = BASE+"/place/details/json";
  const fields = "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status";
  const res = await axios.get(url, { params: { place_id: placeId, fields, key: API_KEY } });
  return res.data.result || {};
}

async function scrapeLeads(sector, ciudad, lat, lng) {
  console.log("Buscando: "+sector+" en "+ciudad+"...");
  const places = await searchPlaces(sector+" "+ciudad, lat+","+lng);
  const leads = [];
  for (const p of places.slice(0, 20)) {
    const det = await getPlaceDetails(p.place_id);
    leads.push({
      name: det.name || p.name,
      address: det.formatted_address,
      phone: det.formatted_phone_number || "",
      website: det.website || "",
      rating: det.rating || 0,
      reviews: det.user_ratings_total || 0,
      // Score: sin web = mayor oportunidad
      score: (!det.website ? 9 : det.rating < 3.5 ? 7 : 5)
    });
    await new Promise(r => setTimeout(r, 200)); // rate limit
  }
  // Ordena por score (mayor oportunidad primero)
  leads.sort((a, b) => b.score - a.score);
  fs.writeFileSync("leads_"+sector.replace(/\s/g,"_")+".json", JSON.stringify(leads, null, 2));
  console.log("Exportados "+leads.length+" leads a leads_"+sector+".json");
  return leads;
}

// Ejemplo: restaurantes en Madrid
scrapeLeads("restaurantes", "Madrid", "40.4168", "-3.7038");`,
        steps: [
          "Activa la Places API en console.cloud.google.com (necesitas tarjeta, hay capa gratuita)",
          "Genera una API key y añadela al .env: GOOGLE_MAPS_KEY=AIza...",
          "Instala dependencias: npm install axios dotenv",
          "Copia el script y cambia el sector y ciudad en la ultima linea",
          "Ejecuta: node lead-scraper.js",
          "Abre el JSON generado — los leads con score 9 son los que no tienen web (maxima oportunidad)",
          "Importa el JSON a tu CRM o hoja de calculo",
          "Automatiza con un cron job para buscar nuevos leads cada semana"
        ]
      }
    ],

    /* ── Plantillas de email ── */
    emailTemplates: [
      {
        id: "em01",
        icon: "@",
        title: "Cold Email — Primera toma de contacto",
        desc: "Template personalizable para prospecting frio B2B",
        app: "Gmail / Lemlist / Apollo",
        code: `Asunto: [DATO ESPECIFICO DE SU EMPRESA] + IA

Hola [NOMBRE],

Vi que [EMPRESA] acaba de [DATO REAL: lanzar producto / ganar premio / expandirse / etc.]. Enhorabuena.

Trabajo con [TIPO DE EMPRESAS SIMILARES] en [CIUDAD/SECTOR] ayudandoles a [RESULTADO ESPECIFICO: reducir X horas de trabajo / aumentar X% conversion / atender clientes 24/7 con IA].

¿Tiene sentido hablar 15 minutos esta semana para ver si podemos hacer algo parecido para [EMPRESA]?

[TU NOMBRE]
[TU EMPRESA] | [TELEFONO]

---
P.D.: Si no es el momento, sin problema. ¿Hay alguien de su equipo que lleve [TEMA] con quien deberia hablar?`,
        steps: [
          "Investiga 5 min la empresa en LinkedIn y Google antes de enviar",
          "Encuentra el email con Hunter.io (gratis hasta 25/mes) o Apollo.io",
          "Personaliza la linea de apertura con algo real y reciente de su empresa",
          "Envia entre martes-jueves, de 8:00-9:30 o 16:00-17:30",
          "Si no responden en 4 dias, envia el email de follow-up",
          "Maximo 3 emails por prospecto antes de dejarlo",
          "Usa Lemlist.com para automatizar la secuencia (gratis 14 dias)"
        ]
      },
      {
        id: "em02",
        icon: "@",
        title: "Follow-up — Seguimiento tras enviar propuesta",
        desc: "Email de seguimiento que reactiva propuestas sin respuesta",
        app: "Gmail / cualquier cliente de email",
        code: `Asunto: Re: Propuesta [NOMBRE EMPRESA] — ¿alguna duda?

Hola [NOMBRE],

Le escribo para hacer seguimiento de la propuesta que envie el [FECHA].

Entiendo que tiene muchas cosas en la cabeza. Solo queria asegurarme de que llego correctamente y resolver cualquier duda que haya podido surgir.

Lo que propongo es:
✓ [BENEFICIO PRINCIPAL EN 1 LINEA]
✓ Implementacion en [TIEMPO]
✓ Sin permanencia — si no ves resultados en [PERIODO], paramos

¿Tiene 20 minutos esta semana para revisarla juntos por videollamada?

[TU NOMBRE]

---
Si el momento no es ahora, ¿cuándo seria un buen momento para retomarlo?`,
        steps: [
          "Envia este follow-up entre 3 y 5 dias despues de la propuesta",
          "Nunca empieces con 'Solo queria saber si...' — suena a inseguridad",
          "Menciona algo nuevo o un caso de exito reciente para dar mas valor",
          "Si no hay respuesta al follow-up, espera 7 dias y envia un cierre",
          "Lleva un registro en tu CRM de cuando enviaste cada email",
          "Usa plantillas en Gmail (Configuracion > Configuracion avanzada > Plantillas)"
        ]
      },
      {
        id: "em03",
        icon: "@",
        title: "Onboarding — Bienvenida al nuevo cliente",
        desc: "Email de inicio de relacion que transmite profesionalidad y reduce ansiedad",
        app: "Gmail / Notion (para el doc de onboarding)",
        code: `Asunto: Bienvenido/a a bordo, [NOMBRE] — aqui tienes todo lo que necesitas

Hola [NOMBRE],

Oficial: ya somos equipo. Me alegra mucho que [EMPRESA] haya confiado en nosotros.

LO QUE PASA AHORA:

1. KICKOFF (esta semana)
   → Te envio invitacion de calendario para [DIA/HORA]
   → Duracion: 60 min — repasamos objetivos, accesos y plazos

2. LO QUE NECESITO DE TI (antes del kickoff):
   → Acceso a [HERRAMIENTA 1] (te explico como en el kickoff)
   → Acceso a [HERRAMIENTA 2]
   → [CUALQUIER OTRO RECURSO]

3. COMO COMUNICARNOS:
   → Canal principal: este email / [SLACK/WHATSAPP]
   → Respondo en menos de 24h en dias laborables
   → Para urgencias: [TELEFONO]

4. TU ENTREGA ESTIMADA: [FECHA]

Cualquier pregunta antes del kickoff, escribeme sin problema.

Bienvenido/a al equipo,
[TU NOMBRE]
[EMPRESA] | [EMAIL] | [TELEFONO]`,
        steps: [
          "Envia este email el mismo dia que el cliente firma o hace el pago inicial",
          "Personaliza con los accesos y herramientas especificas del proyecto",
          "Crea una carpeta en Google Drive o Notion con todos los recursos del cliente",
          "Incluye el link al doc de onboarding con todo lo que necesita saber",
          "Agenda el kickoff call inmediatamente (no dejes pasar mas de 48h)",
          "Guarda la plantilla en Gmail para usarla con cada nuevo cliente"
        ]
      },
      {
        id: "em04",
        icon: "@",
        title: "Entrega de proyecto — Email final con checklist",
        desc: "Email de cierre profesional que genera confianza y facilita el upsell",
        app: "Gmail + Loom (para video de entrega)",
        code: `Asunto: ENTREGA: [NOMBRE PROYECTO] para [EMPRESA] — todo listo ✓

Hola [NOMBRE],

Tengo buenas noticias: [NOMBRE DEL PROYECTO] esta listo.

RESUMEN DE LO ENTREGADO:
✓ [ENTREGABLE 1]
✓ [ENTREGABLE 2]
✓ [ENTREGABLE 3]

ACCESOS Y RECURSOS:
→ [ENLACE/CREDENCIALES]
→ Manual de uso: [LINK AL DOC]
→ Video tutorial (6 min): [LINK LOOM]

PROXIMOS PASOS PARA TI:
1. Revisa el video tutorial
2. Prueba [LO MAS IMPORTANTE] antes del [FECHA]
3. Dimelo si algo no esta como esperabas

SOPORTE POST-ENTREGA:
Cuentas con [X dias/semanas] de soporte incluido para ajustes menores.

Ha sido un placer trabajar en esto contigo. Si todo va bien, me encantaria que dejaras una resena en [GOOGLE / LINKEDIN] — ayuda mucho a que otros te encuentren.

Y cuando estes listo para el siguiente paso ([SIGUIENTE SERVICIO NATURAL: mantenimiento / SEO / chatbot...]), cuenta conmigo.

Un abrazo,
[TU NOMBRE]`,
        steps: [
          "Graba un Loom corto (5-10 min) mostrando lo que has construido — vale muchisimo",
          "Incluye siempre un link al manual de usuario en Google Docs o Notion",
          "Envia los accesos de forma segura (usa 1Password o Bitwarden para compartir)",
          "Pide la resena en Google siempre — el 80% de los que preguntan la dejan",
          "Menciona el siguiente servicio natural sin presionar — planta la semilla",
          "Haz seguimiento a las 2 semanas para verificar que todo funciona bien"
        ]
      }
    ],

    /* ── Prompts con contenido real ── */
    prompts: [
      {
        id: "pr01",
        category: "Web",
        title: "Landing Page de Alta Conversion",
        desc: "Genera HTML/CSS/JS completo para una landing optimizada para ventas",
        app: "Claude / ChatGPT + VS Code + Vercel",
        prompt: `Eres un experto en diseno web y conversion rate optimization (CRO).

Crea una landing page completa en HTML/CSS/JS para [NOMBRE DEL NEGOCIO] que vende [PRODUCTO/SERVICIO].

Requisitos:
- Diseno moderno, oscuro/claro, con [COLOR PRINCIPAL]
- Seccion hero con headline impactante y CTA prominente
- 3 secciones de beneficios con iconos
- Testimonios de clientes (3 reales o inventados como placeholder)
- FAQ con 5 preguntas frecuentes
- Formulario de contacto funcional (mailto)
- Footer con redes sociales
- 100% responsive (movil primero)
- Sin dependencias externas (solo HTML/CSS/JS puro)

Publico objetivo: [DESCRIBE TU CLIENTE IDEAL]
Propuesta de valor principal: [QUE RESUELVES]
CTA principal: [ACCION QUE QUIERES QUE HAGAN]

Genera el codigo completo listo para subir a Hostinger.`,
        steps: [
          "Abre Claude.ai o ChatGPT y pega el prompt de abajo",
          "Reemplaza los [CORCHETES] con los datos reales de tu cliente",
          "Copia el HTML generado y guardalo como index.html",
          "Abre el archivo en el navegador para revisarlo",
          "Si algo no te gusta, pide ajustes: 'Cambia el color del boton a rojo y el titulo a...'",
          "Cuando estes satisfecho, sube el archivo a Hostinger via FTP o el gestor de archivos",
          "Opcional: conecta el formulario con Formspree.io para recibir los emails"
        ]
      },
      {
        id: "pr02",
        category: "Chatbot",
        title: "System Prompt para Chatbot de Atencion al Cliente",
        desc: "Prompt base profesional para entrenar un chatbot de soporte",
        app: "Claude API / OpenAI API + Node.js + Vercel",
        prompt: `Eres [NOMBRE DEL ASISTENTE], el asistente virtual de [NOMBRE EMPRESA].

Tu mision es ayudar a los clientes con:
- Consultas sobre productos y servicios
- Estado de pedidos y envios
- Resolucion de problemas tecnicos basicos
- Informacion de precios y disponibilidad
- Proceso de devolucion y garantia

Informacion de la empresa:
- Horario: [HORARIO DE ATENCION]
- Email: [EMAIL SOPORTE]
- Telefono: [TELEFONO]
- Web: [URL]

Productos/servicios principales:
[LISTA TUS PRODUCTOS/SERVICIOS CON PRECIOS]

Politicas importantes:
- Devolucion: [POLITICA]
- Envio: [POLITICA]
- Garantia: [POLITICA]

Instrucciones de comportamiento:
1. Responde SIEMPRE en el idioma del usuario
2. Se conciso (maximo 3 parrafos por respuesta)
3. Si no sabes la respuesta, deriva al equipo humano: "Para esto necesito derivarte con un especialista. Puedes contactar en [EMAIL]"
4. Nunca inventes informacion. Si no tienes el dato, dilo claramente.
5. Usa un tono [FORMAL/CERCANO/TECNICO] y tutea/no tutees segun [INSTRUCCION]
6. Ante quejas, empatiza primero antes de resolver
7. Cierra siempre con una pregunta de si hay algo mas en que puedas ayudar`,
        steps: [
          "Crea una cuenta en Anthropic (console.anthropic.com) o OpenAI (platform.openai.com)",
          "Ve a la seccion API Keys y genera una clave",
          "Rellena el prompt con los datos reales de tu cliente (sustituye todos los [CORCHETES])",
          "Prueba el prompt en el Workbench de Anthropic o el Playground de OpenAI",
          "Afina el tono y las respuestas hasta que suene natural",
          "Integra la API en tu web con el snippet de codigo (consulta la documentacion oficial)",
          "Aniade el widget de chat en el HTML de la web del cliente",
          "Monitoriza las conversaciones la primera semana y ajusta el prompt"
        ]
      },
      {
        id: "pr03",
        category: "Analisis",
        title: "Analisis Completo de Competencia",
        desc: "Framework para analizar la competencia digital de cualquier negocio con IA",
        app: "Claude / ChatGPT + Semrush (gratis) + SimilarWeb",
        prompt: `Actua como un consultor de estrategia digital experto.

Analiza la competencia digital de [MI EMPRESA] que opera en el sector [SECTOR] en [PAIS/REGION].

Mis principales competidores son: [LISTA 3-5 COMPETIDORES con sus URLs]

Para cada competidor, analiza y compara:

1. PRESENCIA WEB
- Calidad y UX del sitio web
- Velocidad y rendimiento
- Posicionamiento SEO (palabras clave principales)
- Blog/contenido activo

2. REDES SOCIALES
- Plataformas activas
- Frecuencia de publicacion
- Nivel de engagement
- Tipo de contenido que funciona

3. PROPUESTA DE VALOR
- Que prometen en su web
- Precios visibles (si los hay)
- Garantias y diferenciadores

4. PUNTOS DEBILES (oportunidades para mi)
- Que no estan haciendo bien
- Donde yo podria superarles

5. ACCIONES RECOMENDADAS (top 5 priorizadas)

Basate en esta informacion que te proporciono sobre ellos: [PEGA TEXTO DE SUS WEBS, REDES, ETC]`,
        steps: [
          "Abre las webs de los 3-5 principales competidores de tu cliente",
          "Con Semrush.com (version gratuita) analiza el trafico organico de cada uno",
          "Copia el texto principal de sus webs (home + servicios)",
          "Pega toda esa informacion en el prompt donde dice [PEGA TEXTO...]",
          "Ejecuta el prompt en Claude o ChatGPT",
          "Guarda el analisis en un Google Doc o Notion",
          "Usa las oportunidades detectadas para proponer servicios al cliente",
          "Repite el analisis cada 3 meses para ver evolucion"
        ]
      },
      {
        id: "pr04",
        category: "Ventas",
        title: "Email Frio B2B que Genera Respuestas",
        desc: "Secuencia de 3 emails de prospecting que no parecen spam",
        app: "Claude / ChatGPT + Gmail / Lemlist / Apollo",
        prompt: `Eres un experto en ventas B2B y copywriting.

Escribe una secuencia de 3 emails de prospecting en frio para [MI EMPRESA] dirigidos a [CARGO: CEO, Director Marketing, etc.] de empresas de [SECTOR] con [TAMANO: 10-50 empleados].

Mi empresa: [NOMBRE]
Lo que vendemos: [PRODUCTO/SERVICIO en 1 linea]
Resultado principal que logramos: [EJ: "reducimos el tiempo de atencion al cliente un 60%"]
Caso de exito similar que podemos mencionar: [EJ: "empresa X del mismo sector"]

Email 1 (dia 1) - Primer contacto:
- Asunto corto e intrigante (max 6 palabras)
- Apertura personalizada basada en algo de su empresa
- Propuesta de valor en 2 frases
- CTA suave (no pedir reunion, sino despertar curiosidad)
- Max 80 palabras en el cuerpo

Email 2 (dia 4) - Follow up con valor:
- Asunto diferente al primero
- Referencia al email anterior sin disculparte
- Comparte un recurso util (dato, caso, idea)
- CTA un poco mas directo
- Max 60 palabras

Email 3 (dia 10) - Cierre:
- Asunto de ruptura ("Cierro tu expediente...")
- Humor sutil y honestidad
- Ultima propuesta de valor
- CTA final
- Max 50 palabras

Tono: directo, humano, sin jerga corporativa. Que parezca escrito por una persona real.`,
        steps: [
          "Investiga 5-10 minutos la empresa del prospecto antes de enviar",
          "Personaliza la 'apertura' del email 1 con algo especifico de ellos (post reciente, premio, expansion...)",
          "Usa Apollo.io o Hunter.io para encontrar el email correcto del contacto",
          "Configura la secuencia en Lemlist (gratis hasta 100 emails) o Gmail manualmente",
          "Envia entre martes y jueves, entre 8-9am o 4-5pm",
          "Nunca envies los 3 emails el mismo dia: respeta los intervalos",
          "Si responden negativamente, agradece y cierra la conversacion con amabilidad",
          "Analiza tasas de apertura y clics para optimizar los asuntos"
        ]
      },
      {
        id: "pr05",
        category: "SEO",
        title: "Articulo SEO Optimizado con IA",
        desc: "Genera articulos de blog posicionables en Google en minutos",
        app: "Claude / ChatGPT + SurferSEO + WordPress",
        prompt: `Eres un experto en SEO y content marketing.

Escribe un articulo de blog optimizado para SEO sobre el tema: [TEMA DEL ARTICULO]
Keyword principal: [KEYWORD OBJETIVO]
Keywords secundarias: [LISTA 3-5 RELACIONADAS]
Publico objetivo: [QUIEN LO VA A LEER]
Intencion de busqueda: [INFORMACIONAL / TRANSACCIONAL / NAVEGACIONAL]

Estructura del articulo:
- Titulo H1 con la keyword principal (max 60 caracteres)
- Meta descripcion (max 155 caracteres, incluir keyword)
- Introduccion enganadora que prometa resolver el problema (150 palabras)
- 5-7 secciones H2 con la estructura que mejor responda la intencion
- Cada seccion: 200-300 palabras
- Incluir listas con viñetas donde sea natural
- Llamada a la accion al final relacionada con [MI SERVICIO/PRODUCTO]
- Conclusion que resuma los puntos clave (100 palabras)

Tono: [PROFESIONAL/DIVULGATIVO/TECNICO]
Longitud total objetivo: 1.500-2.000 palabras
No uses frases genericas como "En el mundo actual..." o "En conclusion..."`,
        steps: [
          "Investiga la keyword en Google: mira los primeros 5 resultados y anota que cubren",
          "Usa Semrush o Ubersuggest (gratis) para verificar volumen de busqueda",
          "Rellena el prompt con tu keyword y tema",
          "Genera el articulo y copialo a Google Docs",
          "Revisa que suene natural y anade informacion especifica del sector",
          "Sube a WordPress y formatea: usa los H2/H3, anade imagenes (Unsplash gratis)",
          "Instala el plugin Yoast SEO y sigue sus recomendaciones (luz verde)",
          "Publica y comparte en redes sociales del cliente para ganar las primeras visitas"
        ]
      },
      {
        id: "pr06",
        category: "Propuesta",
        title: "Propuesta Comercial de Servicios IA",
        desc: "Documento de propuesta que cierra clientes de alto ticket",
        app: "Claude / ChatGPT + Google Docs / Notion",
        prompt: `Eres un consultor senior de transformacion digital e inteligencia artificial.

Escribe una propuesta comercial profesional para [NOMBRE EMPRESA CLIENTE] sobre la implementacion de [SERVICIO: chatbot / automatizacion / analitica / agente IA].

Contexto del cliente:
- Empresa: [NOMBRE]
- Sector: [SECTOR]
- Tamano: [EMPLEADOS]
- Problema principal que tienen: [DESCRIBE EL DOLOR]
- Objetivo que quieren lograr: [QUE QUIEREN]
- Presupuesto aproximado: [RANGO]

Estructura de la propuesta (6 secciones):
1. Resumen ejecutivo (1 pagina): situacion actual + lo que proponemos + resultado esperado
2. Diagnostico: analisis del problema y su impacto en euros/tiempo
3. Solucion propuesta: descripcion tecnica accesible de lo que vamos a hacer
4. Plan de implementacion: fases, hitos y tiempos (formato tabla)
5. Inversion: desglose claro de costes, ROI esperado y condiciones de pago
6. Por que nosotros: 3 razones especificas + caso de exito similar

Tono: profesional pero accesible. Orientado a negocio, no a tecnologia.
Formato: titulos claros, bullets, sin parrafos de mas de 4 lineas.`,
        steps: [
          "Antes de escribir la propuesta, haz una llamada de descubrimiento de 30min con el cliente",
          "Apunta: su mayor frustracion, cuanto les cuesta el problema y cuando lo quieren resuelto",
          "Rellena el prompt con esa informacion real",
          "Genera la propuesta y exportala a Google Docs",
          "Personalizala con el logo del cliente (en el header)",
          "Anade capturas de pantalla o mockups si tienes",
          "Enviala en PDF por email con un asunto personalizado",
          "Haz un follow-up telefonico a las 48h de enviarla"
        ]
      },
      {
        id: "pr07",
        category: "Agentes",
        title: "Arquitectura de Agente IA con n8n",
        desc: "Diseña la arquitectura completa de un agente IA antes de construirlo",
        app: "n8n + Claude API + Supabase",
        prompt: `Eres un arquitecto de sistemas de IA especializado en agentes autonomos.

Diseña la arquitectura completa de un agente IA para automatizar el siguiente proceso de negocio:

Empresa: [TIPO DE NEGOCIO]
Proceso a automatizar: [DESCRIBE EL PROCESO PASO A PASO]
Herramientas que ya usan: [CRM, email, base de datos, etc.]
Resultado esperado: [QUE DEBE LOGRAR EL AGENTE]

Por favor, diseña:

1. DIAGRAMA DE FLUJO (en texto ASCII o Mermaid)
   - Entrada del proceso
   - Pasos del agente
   - Decisiones y bifurcaciones
   - Salida y acciones

2. TOOLS/FUNCIONES necesarias:
   - Nombre de la funcion
   - Input y output
   - API o herramienta que la ejecuta

3. PROMPT DEL AGENTE (system prompt completo)

4. PLAN DE IMPLEMENTACION en n8n:
   - Nodos necesarios
   - Conexiones entre nodos
   - Manejo de errores

5. METRICAS DE EXITO:
   - Como mediremos que funciona
   - KPIs principales`,
        steps: [
          "Documenta el proceso manual actual en un Google Doc (cada paso, quien lo hace, cuanto tarda)",
          "Identifica que partes son repetitivas y no requieren criterio humano",
          "Ejecuta el prompt para obtener la arquitectura",
          "Instala n8n: usa n8n.cloud (gratis) o instala en Railway/VPS",
          "Construye el workflow nodo por nodo siguiendo el plan generado",
          "Prueba primero con datos ficticios antes de conectar datos reales",
          "Implementa manejo de errores: que pase si un paso falla",
          "Monitoriza durante 2 semanas antes de dejarlo correr solo"
        ]
      },
      {
        id: "pr08",
        category: "Reportes",
        title: "Informe Mensual de Resultados para Cliente",
        desc: "Genera informes profesionales que justifican tu tarifa mensual",
        app: "Claude / ChatGPT + Google Data Studio / Notion",
        prompt: `Eres un consultor de marketing digital con 10 anos de experiencia.

Genera un informe mensual de resultados para el cliente [NOMBRE EMPRESA].
Mes del informe: [MES Y ANO]
Servicio que les prestamos: [SERVICIO]

DATOS DEL MES (rellena con los reales):
- [METRICA 1]: valor del mes vs mes anterior
- [METRICA 2]: valor del mes vs mes anterior
- [METRICA 3]: valor del mes vs mes anterior
(Ejemplos: trafico web, leads generados, emails enviados/apertura, posiciones SEO, etc.)

Estructura del informe:
1. RESUMEN EJECUTIVO (3 bullets: logros, retos, siguiente mes)
2. METRICAS PRINCIPALES (tabla con valores y variacion %)
3. ANALISIS: que funcionó y por que (2-3 parrafos con datos)
4. LO QUE NO FUNCIONO: honesto pero constructivo
5. PLAN SIGUIENTE MES: 3 acciones concretas con responsable y fecha
6. RECOMENDACION: 1 cosa que deberia hacer el cliente para mejorar resultados

Tono: profesional, orientado a negocio. Celebra los exitos, gestiona bien los fracasos.
Formato: conciso, con bullets. Max 1 pagina A4 si es posible.`,
        steps: [
          "Crea una plantilla de Google Sheets con las metricas clave de cada cliente",
          "El dia 1 de cada mes, exporta los datos del mes anterior",
          "Rellena los datos en el prompt",
          "Genera el informe y copialo a Notion o Google Docs",
          "Anade graficos si tienes (screenshot de GA4, Search Console, etc.)",
          "Envialo antes del dia 5 del mes siguiente",
          "Ofrece una llamada de 30min para revisar el informe (aumenta el perceived value)",
          "Archiva todos los informes: son tu historial de resultados para renovaciones"
        ]
      }
    ]
  };
})();
