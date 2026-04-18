export type Taal = "nl" | "en" | "fr" | "es" | "de" | "pt";

export const TAAL_OPTIES: { code: Taal; label: string; vlag: string }[] = [
  { code: "nl", label: "Nederlands", vlag: "🇳🇱" },
  { code: "en", label: "English", vlag: "🇬🇧" },
];

type Vertalingen = Record<string, Record<Taal, string>>;

export const t: Vertalingen = {
  // ===== REGISTRATIE =====
  "registreer.titel": {
    nl: "Account aanmaken", en: "Create account", fr: "Cr\u00e9er un compte",
    es: "Crear cuenta", de: "Konto erstellen", pt: "Criar conta",
  },
  "registreer.welkom": {
    nl: "60 Dagen Run Systeem", en: "60 Day Run System", fr: "Syst\u00e8me de 60 jours",
    es: "Sistema de 60 d\u00edas", de: "60 Tage Run System", pt: "Sistema de 60 dias",
  },
  "registreer.uitgenodigd": {
    nl: "Je bent uitgenodigd om deel te nemen aan de 60 Dagen Run!",
    en: "You have been invited to join the 60 Day Run!",
    fr: "Vous \u00eates invit\u00e9(e) \u00e0 rejoindre le Run de 60 jours !",
    es: "\u00a1Has sido invitado/a a unirte al Run de 60 d\u00edas!",
    de: "Du wurdest eingeladen, am 60 Tage Run teilzunehmen!",
    pt: "Voc\u00ea foi convidado(a) para participar do Run de 60 dias!",
  },
  "registreer.naam": {
    nl: "Jouw naam", en: "Your name", fr: "Votre nom",
    es: "Tu nombre", de: "Dein Name", pt: "Seu nome",
  },
  "registreer.naam_placeholder": {
    nl: "Voornaam Achternaam", en: "First Last name", fr: "Pr\u00e9nom Nom",
    es: "Nombre Apellido", de: "Vorname Nachname", pt: "Nome Sobrenome",
  },
  "registreer.email": {
    nl: "E-mailadres", en: "Email address", fr: "Adresse e-mail",
    es: "Correo electr\u00f3nico", de: "E-Mail-Adresse", pt: "Endere\u00e7o de e-mail",
  },
  "registreer.wachtwoord": {
    nl: "Wachtwoord", en: "Password", fr: "Mot de passe",
    es: "Contrase\u00f1a", de: "Passwort", pt: "Senha",
  },
  "registreer.wachtwoord_min": {
    nl: "Minimaal 6 tekens", en: "At least 6 characters", fr: "Au moins 6 caract\u00e8res",
    es: "M\u00ednimo 6 caracteres", de: "Mindestens 6 Zeichen", pt: "M\u00ednimo 6 caracteres",
  },
  "registreer.wachtwoord_bevestig": {
    nl: "Wachtwoord bevestigen", en: "Confirm password", fr: "Confirmer le mot de passe",
    es: "Confirmar contrase\u00f1a", de: "Passwort best\u00e4tigen", pt: "Confirmar senha",
  },
  "registreer.wachtwoord_herhaal": {
    nl: "Herhaal wachtwoord", en: "Repeat password", fr: "R\u00e9p\u00e9tez le mot de passe",
    es: "Repite la contrase\u00f1a", de: "Passwort wiederholen", pt: "Repita a senha",
  },
  "registreer.knop": {
    nl: "Account aanmaken", en: "Create account", fr: "Cr\u00e9er le compte",
    es: "Crear cuenta", de: "Konto erstellen", pt: "Criar conta",
  },
  "registreer.knop_laden": {
    nl: "Account aanmaken...", en: "Creating account...", fr: "Cr\u00e9ation du compte...",
    es: "Creando cuenta...", de: "Konto wird erstellt...", pt: "Criando conta...",
  },
  "registreer.al_account": {
    nl: "Al een account?", en: "Already have an account?", fr: "D\u00e9j\u00e0 un compte ?",
    es: "\u00bfYa tienes cuenta?", de: "Schon ein Konto?", pt: "J\u00e1 tem conta?",
  },
  "registreer.inloggen": {
    nl: "Inloggen", en: "Log in", fr: "Se connecter",
    es: "Iniciar sesi\u00f3n", de: "Anmelden", pt: "Entrar",
  },
  "registreer.wachtwoorden_niet_gelijk": {
    nl: "Wachtwoorden komen niet overeen.", en: "Passwords do not match.",
    fr: "Les mots de passe ne correspondent pas.", es: "Las contrase\u00f1as no coinciden.",
    de: "Passw\u00f6rter stimmen nicht \u00fcberein.", pt: "As senhas n\u00e3o coincidem.",
  },
  "registreer.wachtwoord_te_kort": {
    nl: "Wachtwoord moet minimaal 6 tekens zijn.", en: "Password must be at least 6 characters.",
    fr: "Le mot de passe doit contenir au moins 6 caract\u00e8res.",
    es: "La contrase\u00f1a debe tener al menos 6 caracteres.",
    de: "Das Passwort muss mindestens 6 Zeichen lang sein.",
    pt: "A senha deve ter pelo menos 6 caracteres.",
  },
  "registreer.mislukt": {
    nl: "Registratie mislukt: ", en: "Registration failed: ", fr: "Inscription \u00e9chou\u00e9e : ",
    es: "Registro fallido: ", de: "Registrierung fehlgeschlagen: ", pt: "Registro falhou: ",
  },

  // ===== BEVESTIGINGSSCHERM =====
  "bevestig.titel": {
    nl: "Check je e-mail!", en: "Check your email!", fr: "V\u00e9rifie ton e-mail !",
    es: "\u00a1Revisa tu correo!", de: "Pr\u00fcfe deine E-Mail!", pt: "Verifique seu e-mail!",
  },
  "bevestig.gestuurd": {
    nl: "We hebben een bevestigingslink gestuurd naar:", en: "We sent a confirmation link to:",
    fr: "Nous avons envoy\u00e9 un lien de confirmation \u00e0 :", es: "Hemos enviado un enlace de confirmaci\u00f3n a:",
    de: "Wir haben einen Best\u00e4tigungslink gesendet an:", pt: "Enviamos um link de confirma\u00e7\u00e3o para:",
  },
  "bevestig.hoe": {
    nl: "Hoe werkt het:", en: "How it works:", fr: "Comment \u00e7a marche :",
    es: "C\u00f3mo funciona:", de: "So funktioniert es:", pt: "Como funciona:",
  },
  "bevestig.stap1": {
    nl: "Open je e-mail (check ook je spam map)", en: "Open your email (check spam too)",
    fr: "Ouvre ton e-mail (v\u00e9rifie aussi les spams)", es: "Abre tu correo (revisa tambi\u00e9n spam)",
    de: "\u00d6ffne deine E-Mail (pr\u00fcfe auch Spam)", pt: "Abra seu e-mail (verifique spam tamb\u00e9m)",
  },
  "bevestig.stap2": {
    nl: "Klik op de bevestigingslink in de mail", en: "Click the confirmation link in the email",
    fr: "Clique sur le lien de confirmation", es: "Haz clic en el enlace de confirmaci\u00f3n",
    de: "Klicke auf den Best\u00e4tigungslink", pt: "Clique no link de confirma\u00e7\u00e3o",
  },
  "bevestig.stap3": {
    nl: "Je wordt automatisch doorgestuurd", en: "You will be redirected automatically",
    fr: "Tu seras redirig\u00e9(e) automatiquement", es: "Ser\u00e1s redirigido/a autom\u00e1ticamente",
    de: "Du wirst automatisch weitergeleitet", pt: "Voc\u00ea ser\u00e1 redirecionado(a) automaticamente",
  },
  "bevestig.stap4": {
    nl: "Log daarna in met je e-mail en wachtwoord", en: "Then log in with your email and password",
    fr: "Connecte-toi ensuite avec ton e-mail et mot de passe", es: "Luego inicia sesi\u00f3n con tu correo y contrase\u00f1a",
    de: "Melde dich dann mit E-Mail und Passwort an", pt: "Depois entre com seu e-mail e senha",
  },
  "bevestig.naar_login": {
    nl: "Naar inloggen", en: "Go to login", fr: "Aller \u00e0 la connexion",
    es: "Ir a iniciar sesi\u00f3n", de: "Zum Anmelden", pt: "Ir para login",
  },
  "bevestig.geen_mail": {
    nl: "Geen mail ontvangen?", en: "Didn't receive an email?", fr: "Pas re\u00e7u de mail ?",
    es: "\u00bfNo recibiste el correo?", de: "Keine E-Mail erhalten?", pt: "N\u00e3o recebeu o e-mail?",
  },
  "bevestig.opnieuw": {
    nl: "Probeer opnieuw", en: "Try again", fr: "R\u00e9essayer",
    es: "Intentar de nuevo", de: "Erneut versuchen", pt: "Tentar novamente",
  },

  // ===== LOGIN =====
  "login.titel": {
    nl: "Inloggen", en: "Log in", fr: "Se connecter",
    es: "Iniciar sesi\u00f3n", de: "Anmelden", pt: "Entrar",
  },
  "login.email": {
    nl: "E-mailadres", en: "Email address", fr: "Adresse e-mail",
    es: "Correo electr\u00f3nico", de: "E-Mail-Adresse", pt: "Endere\u00e7o de e-mail",
  },
  "login.wachtwoord": {
    nl: "Wachtwoord", en: "Password", fr: "Mot de passe",
    es: "Contrase\u00f1a", de: "Passwort", pt: "Senha",
  },
  "login.knop": {
    nl: "Inloggen", en: "Log in", fr: "Se connecter",
    es: "Iniciar sesi\u00f3n", de: "Anmelden", pt: "Entrar",
  },
  "login.knop_laden": {
    nl: "Inloggen...", en: "Logging in...", fr: "Connexion...",
    es: "Iniciando sesi\u00f3n...", de: "Anmelden...", pt: "Entrando...",
  },
  "login.geen_account": {
    nl: "Nog geen account?", en: "Don't have an account?", fr: "Pas encore de compte ?",
    es: "\u00bfNo tienes cuenta?", de: "Noch kein Konto?", pt: "N\u00e3o tem conta?",
  },
  "login.registreer": {
    nl: "Registreer hier", en: "Register here", fr: "Inscrivez-vous ici",
    es: "Reg\u00edstrate aqu\u00ed", de: "Hier registrieren", pt: "Registre-se aqui",
  },
  "login.mislukt": {
    nl: "Inloggen mislukt. Controleer je e-mail en wachtwoord.",
    en: "Login failed. Check your email and password.",
    fr: "Connexion \u00e9chou\u00e9e. V\u00e9rifiez votre e-mail et mot de passe.",
    es: "Inicio de sesi\u00f3n fallido. Verifica tu correo y contrase\u00f1a.",
    de: "Anmeldung fehlgeschlagen. \u00dcberpr\u00fcfe E-Mail und Passwort.",
    pt: "Login falhou. Verifique seu e-mail e senha.",
  },
  "login.subtitel": {
    nl: "60 Dagen Run Systeem", en: "60 Day Run System", fr: "Syst\u00e8me de 60 jours",
    es: "Sistema de 60 d\u00edas", de: "60 Tage Run System", pt: "Sistema de 60 dias",
  },

  // ===== SIDEBAR NAVIGATIE =====
  "nav.dashboard": {
    nl: "Dashboard", en: "Dashboard", fr: "Tableau de bord",
    es: "Panel", de: "Dashboard", pt: "Painel",
  },
  "nav.namenlijst": {
    nl: "Namenlijst", en: "Contacts", fr: "Contacts",
    es: "Contactos", de: "Kontakte", pt: "Contatos",
  },
  "nav.zoeken": {
    nl: "Zoeken", en: "Search", fr: "Rechercher",
    es: "Buscar", de: "Suchen", pt: "Pesquisar",
  },
  "nav.coach": {
    nl: "ELEVA Mentor", en: "ELEVA Mentor", fr: "ELEVA Mentor",
    es: "ELEVA Mentor", de: "ELEVA Mentor", pt: "ELEVA Mentor",
  },
  "nav.scripts": {
    nl: "Scripts", en: "Scripts", fr: "Scripts",
    es: "Guiones", de: "Skripte", pt: "Scripts",
  },
  "nav.producten": {
    nl: "Producten", en: "Products", fr: "Produits",
    es: "Productos", de: "Produkte", pt: "Produtos",
  },
  "nav.herinneringen": {
    nl: "Herinneringen", en: "Reminders", fr: "Rappels",
    es: "Recordatorios", de: "Erinnerungen", pt: "Lembretes",
  },
  "nav.team": {
    nl: "Mijn Team", en: "My Team", fr: "Mon \u00c9quipe",
    es: "Mi Equipo", de: "Mein Team", pt: "Minha Equipe",
  },
  "nav.instellingen": {
    nl: "Instellingen", en: "Settings", fr: "Param\u00e8tres",
    es: "Ajustes", de: "Einstellungen", pt: "Configura\u00e7\u00f5es",
  },
  "nav.mijn_why": {
    nl: "Mijn WHY", en: "My WHY", fr: "Mon POURQUOI",
    es: "Mi POR QU\u00c9", de: "Mein WARUM", pt: "Meu PORQU\u00ca",
  },
  "nav.premium": {
    nl: "Premium", en: "Premium", fr: "Premium",
    es: "Premium", de: "Premium", pt: "Premium",
  },
  "nav.uitloggen": {
    nl: "Uitloggen", en: "Log out", fr: "Se d\u00e9connecter",
    es: "Cerrar sesi\u00f3n", de: "Abmelden", pt: "Sair",
  },
  "nav.60dagen": {
    nl: "60 Dagen Run", en: "60 Day Run", fr: "Run de 60 jours",
    es: "Run de 60 d\u00edas", de: "60 Tage Run", pt: "Run de 60 dias",
  },

  // ===== DASHBOARD =====
  "dashboard.dag": {
    nl: "Dag", en: "Day", fr: "Jour",
    es: "D\u00eda", de: "Tag", pt: "Dia",
  },
  "dashboard.van_60": {
    nl: "van 60", en: "of 60", fr: "sur 60",
    es: "de 60", de: "von 60", pt: "de 60",
  },
  "dashboard.voortgang": {
    nl: "60 Dagenrun voortgang", en: "60 Day Run progress", fr: "Progression du Run de 60 jours",
    es: "Progreso del Run de 60 d\u00edas", de: "60 Tage Run Fortschritt", pt: "Progresso do Run de 60 dias",
  },
  "dashboard.dagen_te_gaan": {
    nl: "dagen te gaan", en: "days to go", fr: "jours restants",
    es: "d\u00edas restantes", de: "Tage verbleibend", pt: "dias restantes",
  },
  "dashboard.vandaag": {
    nl: "Vandaag bijhouden", en: "Track today", fr: "Suivre aujourd'hui",
    es: "Registrar hoy", de: "Heute tracken", pt: "Registrar hoje",
  },
  "dashboard.pipeline": {
    nl: "Pipeline", en: "Pipeline", fr: "Pipeline",
    es: "Pipeline", de: "Pipeline", pt: "Pipeline",
  },
  "dashboard.bekijk_alles": {
    nl: "Bekijk alles", en: "View all", fr: "Tout voir",
    es: "Ver todo", de: "Alles anzeigen", pt: "Ver tudo",
  },
  "dashboard.jouw_why": {
    nl: "Jouw WHY", en: "Your WHY", fr: "Votre POURQUOI",
    es: "Tu POR QU\u00c9", de: "Dein WARUM", pt: "Seu PORQU\u00ca",
  },
  "dashboard.aanpassen": {
    nl: "Aanpassen", en: "Edit", fr: "Modifier",
    es: "Editar", de: "Bearbeiten", pt: "Editar",
  },
  "dashboard.herinneringen": {
    nl: "Herinneringen", en: "Reminders", fr: "Rappels",
    es: "Recordatorios", de: "Erinnerungen", pt: "Lembretes",
  },
  "dashboard.geen_herinneringen": {
    nl: "Geen openstaande herinneringen. Goed bezig!", en: "No pending reminders. Keep it up!",
    fr: "Aucun rappel en attente. Bon travail !", es: "\u00a1Sin recordatorios pendientes. \u00a1Sigue as\u00ed!",
    de: "Keine offenen Erinnerungen. Weiter so!", pt: "Sem lembretes pendentes. Continue assim!",
  },
  "dashboard.alle_herinneringen": {
    nl: "Alle herinneringen", en: "All reminders", fr: "Tous les rappels",
    es: "Todos los recordatorios", de: "Alle Erinnerungen", pt: "Todos os lembretes",
  },
  "dashboard.snelle_acties": {
    nl: "Snelle acties", en: "Quick actions", fr: "Actions rapides",
    es: "Acciones r\u00e1pidas", de: "Schnellaktionen", pt: "A\u00e7\u00f5es r\u00e1pidas",
  },
  "dashboard.prospect_toevoegen": {
    nl: "+ Nieuw toevoegen", en: "+ Add new", fr: "+ Ajouter nouveau",
    es: "+ A\u00f1adir prospecto", de: "+ Kontakt hinzuf\u00fcgen", pt: "+ Adicionar prospecto",
  },
  "dashboard.coach_raadplegen": {
    nl: "ELEVA Mentor raadplegen", en: "Consult ELEVA Mentor", fr: "Consulter ELEVA Mentor",
    es: "Consultar ELEVA Mentor", de: "ELEVA Mentor befragen", pt: "Consultar ELEVA Mentor",
  },
  "dashboard.scripts_bekijken": {
    nl: "Scripts bekijken", en: "View scripts", fr: "Voir les scripts",
    es: "Ver guiones", de: "Skripte ansehen", pt: "Ver scripts",
  },

  // ===== PIPELINE FASEN =====
  "fase.prospect": {
    nl: "Prospects", en: "Prospects", fr: "Prospects",
    es: "Prospectos", de: "Kontakte", pt: "Prospectos",
  },
  "fase.uitgenodigd": {
    nl: "Uitgenodigd", en: "Invited", fr: "Invit\u00e9",
    es: "Invitado", de: "Eingeladen", pt: "Convidado",
  },
  "fase.one_pager": {
    nl: "One Pager", en: "One Pager", fr: "One Pager",
    es: "One Pager", de: "One Pager", pt: "One Pager",
  },
  "fase.presentatie": {
    nl: "Presentatie", en: "Presentation", fr: "Pr\u00e9sentation",
    es: "Presentaci\u00f3n", de: "Pr\u00e4sentation", pt: "Apresenta\u00e7\u00e3o",
  },
  "fase.followup": {
    nl: "Follow up", en: "Follow up", fr: "Suivi",
    es: "Seguimiento", de: "Follow-up", pt: "Acompanhamento",
  },
  "fase.not_yet": {
    nl: "Not Yet", en: "Not Yet", fr: "Pas encore",
    es: "A\u00fan no", de: "Noch nicht", pt: "Ainda n\u00e3o",
  },
  "fase.shopper": {
    nl: "Shoppers", en: "Shoppers", fr: "Clients",
    es: "Clientes", de: "Kunden", pt: "Clientes",
  },
  "fase.member": {
    nl: "Members", en: "Members", fr: "Membres",
    es: "Miembros", de: "Mitglieder", pt: "Membros",
  },

  // ===== COACH =====
  "coach.titel": {
    nl: "ELEVA Mentor", en: "ELEVA Mentor", fr: "ELEVA Mentor",
    es: "ELEVA Mentor", de: "ELEVA Mentor", pt: "ELEVA Mentor",
  },
  "coach.subtitel": {
    nl: "Jouw persoonlijke mentor voor al jouw vragen omtrent deze business",
    en: "Your personal mentor for all your questions about this business",
    fr: "Ton mentor personnel pour toutes tes questions sur ce business",
    es: "Tu mentor personal para todas tus preguntas sobre este negocio",
    de: "Dein pers\u00f6nlicher Mentor f\u00fcr alle deine Fragen zu diesem Business",
    pt: "Seu mentor pessoal para todas as suas perguntas sobre este neg\u00f3cio",
  },
  "coach.wat_kan": {
    nl: "Wat de ELEVA Mentor o.a. voor jou kan doen?", en: "What the ELEVA Mentor can do for you?",
    fr: "Ce que l'ELEVA Mentor peut faire pour toi", es: "\u00bfQu\u00e9 puede hacer el ELEVA Mentor por ti",
    de: "Was kann der ELEVA Mentor f\u00fcr dich tun?", pt: "O que o ELEVA Mentor pode fazer por voc\u00ea?",
  },
  "coach.nieuw_gesprek": {
    nl: "+ Nieuw gesprek", en: "+ New conversation", fr: "+ Nouvelle conversation",
    es: "+ Nueva conversaci\u00f3n", de: "+ Neues Gespr\u00e4ch", pt: "+ Nova conversa",
  },
  "coach.eerdere": {
    nl: "Eerdere gesprekken", en: "Previous conversations", fr: "Conversations pr\u00e9c\u00e9dentes",
    es: "Conversaciones anteriores", de: "Fr\u00fchere Gespr\u00e4che", pt: "Conversas anteriores",
  },
  "coach.geen_gesprekken": {
    nl: "Nog geen gesprekken. Start een nieuw gesprek met de ELEVA Mentor!",
    en: "No conversations yet. Start a new conversation with the ELEVA Mentor!",
    fr: "Pas encore de conversations. D\u00e9marre une nouvelle conversation avec ELEVA Mentor !",
    es: "\u00a1Sin conversaciones a\u00fan. \u00a1Inicia una nueva conversaci\u00f3n con el ELEVA Mentor!",
    de: "Noch keine Gespr\u00e4che. Starte ein neues Gespr\u00e4ch mit dem ELEVA Mentor!",
    pt: "Sem conversas ainda. Comece uma nova conversa com o ELEVA Mentor!",
  },
  "coach.placeholder": {
    nl: "Stel je vraag aan de ELEVA Mentor...", en: "Ask the ELEVA Mentor a question...",
    fr: "Pose ta question à ELEVA Mentor...", es: "Haz tu pregunta al ELEVA Mentor...",
    de: "Stelle dem ELEVA Mentor eine Frage...", pt: "Fa\u00e7a sua pergunta ao coach...",
  },
  "coach.stel_vraag": {
    nl: "Stel je vraag aan de ELEVA Mentor of kies een snelle vraag hieronder.",
    en: "Ask the ELEVA Mentor a question or choose a quick question below.",
    fr: "Pose ta question à ELEVA Mentor ou choisis une question rapide ci-dessous.",
    es: "Haz tu pregunta al ELEVA Mentor o elige una pregunta r\u00e1pida a continuaci\u00f3n.",
    de: "Stelle dem ELEVA Mentor eine Frage oder w\u00e4hle eine Schnellfrage unten.",
    pt: "Fa\u00e7a sua pergunta ao ELEVA Mentor ou escolha uma pergunta r\u00e1pida abaixo.",
  },
  "coach.over_prospect": {
    nl: "Over welk prospect? (optioneel)", en: "About which prospect? (optional)",
    fr: "\u00c0 propos de quel prospect ? (optionnel)", es: "\u00bfSobre qu\u00e9 prospecto? (opcional)",
    de: "\u00dcber welchen Kontakt? (optional)", pt: "Sobre qual prospecto? (opcional)",
  },
  "coach.algemeen": {
    nl: "\u2014 Algemeen gesprek \u2014", en: "\u2014 General conversation \u2014",
    fr: "\u2014 Conversation g\u00e9n\u00e9rale \u2014", es: "\u2014 Conversaci\u00f3n general \u2014",
    de: "\u2014 Allgemeines Gespr\u00e4ch \u2014", pt: "\u2014 Conversa geral \u2014",
  },
  "coach.prospect_info": {
    nl: "Als je een prospect selecteert, weet de coach direct hun situatie.",
    en: "If you select a prospect, the coach will know their situation.",
    fr: "Si tu s\u00e9lectionnes un prospect, le coach conna\u00eetra sa situation.",
    es: "Si seleccionas un prospecto, el coach conocer\u00e1 su situaci\u00f3n.",
    de: "Wenn du einen Kontakt ausw\u00e4hlst, kennt der Coach die Situation.",
    pt: "Se voc\u00ea selecionar um prospecto, o coach saber\u00e1 a situa\u00e7\u00e3o.",
  },
  "coach.start_gesprek": {
    nl: "Start gesprek", en: "Start conversation", fr: "D\u00e9marrer la conversation",
    es: "Iniciar conversaci\u00f3n", de: "Gespr\u00e4ch starten", pt: "Iniciar conversa",
  },
  "coach.starten": {
    nl: "Starten...", en: "Starting...", fr: "D\u00e9marrage...",
    es: "Iniciando...", de: "Starten...", pt: "Iniciando...",
  },
  "coach.geen_prospect": {
    nl: "Geen prospect", en: "No prospect", fr: "Pas de prospect",
    es: "Sin prospecto", de: "Kein Kontakt", pt: "Sem prospecto",
  },
  "coach.berichten": {
    nl: "berichten", en: "messages", fr: "messages",
    es: "mensajes", de: "Nachrichten", pt: "mensagens",
  },
  "coach.verwijder_bevestig": {
    nl: "Gesprek verwijderen?", en: "Delete conversation?",
    fr: "Supprimer la conversation ?", es: "\u00bfEliminar conversaci\u00f3n?",
    de: "Gespr\u00e4ch l\u00f6schen?", pt: "Excluir conversa?",
  },
  "coach.swipe_hint": {
    nl: "Swipe links om te verwijderen", en: "Swipe left to delete",
    fr: "Glisser \u00e0 gauche pour supprimer", es: "Desliza a la izquierda para eliminar",
    de: "Nach links wischen zum L\u00f6schen", pt: "Deslize para a esquerda para excluir",
  },

  // Snelle vragen coach
  "coach.snel.dm": {
    nl: "Schrijf een DM", en: "Write a DM", fr: "\u00c9crire un DM",
    es: "Escribir un DM", de: "DM schreiben", pt: "Escrever um DM",
  },
  "coach.snel.bezwaar": {
    nl: "Bezwaar afhandelen", en: "Handle objection", fr: "G\u00e9rer une objection",
    es: "Manejar objeci\u00f3n", de: "Einwand behandeln", pt: "Lidar com obje\u00e7\u00e3o",
  },
  "coach.snel.followup": {
    nl: "Follow-up bericht", en: "Follow-up message", fr: "Message de suivi",
    es: "Mensaje de seguimiento", de: "Follow-up Nachricht", pt: "Mensagem de acompanhamento",
  },
  "coach.snel.accountability": {
    nl: "Accountability check", en: "Accountability check", fr: "Bilan de responsabilit\u00e9",
    es: "Control de responsabilidad", de: "Accountability Check", pt: "Verifica\u00e7\u00e3o de responsabilidade",
  },
  "coach.snel.motivatie": {
    nl: "Motivatie boost", en: "Motivation boost", fr: "Boost de motivation",
    es: "Impulso de motivaci\u00f3n", de: "Motivations-Boost", pt: "Impulso de motiva\u00e7\u00e3o",
  },
  "coach.snel.closing": {
    nl: "Gesprek afsluiten", en: "Close conversation", fr: "Conclure la conversation",
    es: "Cerrar conversaci\u00f3n", de: "Gespr\u00e4ch abschlie\u00dfen", pt: "Fechar conversa",
  },

  // ===== HERINNERINGEN =====
  "herinneringen.titel": {
    nl: "Herinneringen", en: "Reminders", fr: "Rappels",
    es: "Recordatorios", de: "Erinnerungen", pt: "Lembretes",
  },
  "herinneringen.openstaand": {
    nl: "openstaande herinneringen", en: "pending reminders", fr: "rappels en attente",
    es: "recordatorios pendientes", de: "offene Erinnerungen", pt: "lembretes pendentes",
  },
  "herinneringen.bijgewerkt": {
    nl: "Alles bijgewerkt!", en: "All caught up!", fr: "Tout est \u00e0 jour !",
    es: "\u00a1Todo al d\u00eda!", de: "Alles erledigt!", pt: "Tudo em dia!",
  },
  "herinneringen.geen": {
    nl: "Geen openstaande herinneringen. Ga zo door!",
    en: "No pending reminders. Keep it up!",
    fr: "Aucun rappel en attente. Continue comme \u00e7a !",
    es: "\u00a1Sin recordatorios pendientes. \u00a1Sigue as\u00ed!",
    de: "Keine offenen Erinnerungen. Weiter so!",
    pt: "Sem lembretes pendentes. Continue assim!",
  },
  "herinneringen.verlopen": {
    nl: "Verlopen", en: "Overdue", fr: "En retard",
    es: "Vencidos", de: "\u00dcberf\u00e4llig", pt: "Atrasados",
  },
  "herinneringen.vandaag": {
    nl: "Vandaag", en: "Today", fr: "Aujourd'hui",
    es: "Hoy", de: "Heute", pt: "Hoje",
  },
  "herinneringen.komende_7": {
    nl: "Komende 7 dagen", en: "Next 7 days", fr: "Prochains 7 jours",
    es: "Pr\u00f3ximos 7 d\u00edas", de: "N\u00e4chste 7 Tage", pt: "Pr\u00f3ximos 7 dias",
  },
  "herinneringen.later": {
    nl: "Later", en: "Later", fr: "Plus tard",
    es: "M\u00e1s tarde", de: "Sp\u00e4ter", pt: "Mais tarde",
  },

  // ===== NAMENLIJST =====
  "namenlijst.titel": {
    nl: "Namenlijst", en: "Contacts", fr: "Contacts",
    es: "Contactos", de: "Kontakte", pt: "Contatos",
  },
  "namenlijst.nieuw": {
    nl: "+ Nieuw toevoegen", en: "+ Add new", fr: "+ Ajouter nouveau",
    es: "+ Agregar nuevo", de: "+ Neu hinzufügen", pt: "+ Adicionar novo",
  },
  "namenlijst.zoeken": {
    nl: "Zoek prospect...", en: "Search prospect...", fr: "Rechercher un prospect...",
    es: "Buscar prospecto...", de: "Kontakt suchen...", pt: "Pesquisar prospecto...",
  },
  "namenlijst.geen": {
    nl: "Nog geen prospects. Voeg je eerste prospect toe!",
    en: "No prospects yet. Add your first prospect!",
    fr: "Pas encore de prospects. Ajoute ton premier prospect !",
    es: "\u00a1Sin prospectos a\u00fan. \u00a1A\u00f1ade tu primer prospecto!",
    de: "Noch keine Kontakte. F\u00fcge deinen ersten Kontakt hinzu!",
    pt: "Sem prospectos ainda. Adicione seu primeiro prospecto!",
  },
  "namenlijst.pipeline": {
    nl: "Pipeline", en: "Pipeline", fr: "Pipeline",
    es: "Pipeline", de: "Pipeline", pt: "Pipeline",
  },
  "namenlijst.lijst": {
    nl: "Lijst", en: "List", fr: "Liste",
    es: "Lista", de: "Liste", pt: "Lista",
  },
  "namenlijst.aantekeningen": {
    nl: "Aantekeningen", en: "Notes", fr: "Notes",
    es: "Notas", de: "Notizen", pt: "Notas",
  },
  "namenlijst.geen_aantekeningen": {
    nl: "Nog geen aantekeningen toegevoegd.", en: "No notes added yet.",
    fr: "Aucune note ajout\u00e9e.", es: "Sin notas a\u00fan.",
    de: "Noch keine Notizen hinzugef\u00fcgt.", pt: "Nenhuma nota adicionada.",
  },

  // ===== WHY =====
  "why.titel": {
    nl: "Jouw WHY", en: "Your WHY", fr: "Ton POURQUOI",
    es: "Tu POR QU\u00c9", de: "Dein WARUM", pt: "Seu PORQU\u00ca",
  },
  "why.subtitel": {
    nl: "Ontdek wat jou \u00e9cht drijft \u2014 de basis van jouw 60-dagenrun",
    en: "Discover what truly drives you \u2014 the foundation of your 60-day run",
    fr: "D\u00e9couvre ce qui te motive vraiment \u2014 la base de ton run de 60 jours",
    es: "Descubre lo que realmente te impulsa \u2014 la base de tu run de 60 d\u00edas",
    de: "Entdecke was dich wirklich antreibt \u2014 die Basis deines 60-Tage-Runs",
    pt: "Descubra o que realmente te motiva \u2014 a base do seu run de 60 dias",
  },
  "why.huidige": {
    nl: "Jouw huidige WHY", en: "Your current WHY", fr: "Ton POURQUOI actuel",
    es: "Tu POR QU\u00c9 actual", de: "Dein aktuelles WARUM", pt: "Seu PORQU\u00ca atual",
  },
  "why.terug": {
    nl: "\u2190 Terug naar dashboard", en: "\u2190 Back to dashboard", fr: "\u2190 Retour au tableau de bord",
    es: "\u2190 Volver al panel", de: "\u2190 Zur\u00fcck zum Dashboard", pt: "\u2190 Voltar ao painel",
  },
  "why.opnieuw": {
    nl: "WHY opnieuw ontdekken", en: "Rediscover your WHY", fr: "Red\u00e9couvrir ton POURQUOI",
    es: "Redescubrir tu POR QU\u00c9", de: "WARUM neu entdecken", pt: "Redescobrir seu PORQU\u00ca",
  },
  "why.welkom": {
    nl: "Welkom,", en: "Welcome,", fr: "Bienvenue,",
    es: "\u00a1Bienvenido/a,", de: "Willkommen,", pt: "Bem-vindo(a),",
  },
  "why.wat_is": {
    nl: "Wat is een WHY?", en: "What is a WHY?", fr: "Qu'est-ce qu'un POURQUOI ?",
    es: "\u00bfQu\u00e9 es un POR QU\u00c9?", de: "Was ist ein WARUM?", pt: "O que \u00e9 um PORQU\u00ca?",
  },
  "why.uitleg1": {
    nl: "Je WHY is jouw persoonlijke motivatie. Het antwoord op de vraag: \"Waarom doe ik dit echt?\" Niet het geld, niet de auto \u2014 maar wat er in jouw leven verandert als je dit voor elkaar krijgt.",
    en: "Your WHY is your personal motivation. The answer to the question: \"Why am I really doing this?\" Not the money, not the car \u2014 but what changes in your life when you achieve this.",
    fr: "Ton POURQUOI est ta motivation personnelle. La r\u00e9ponse \u00e0 la question : \"Pourquoi je fais vraiment \u00e7a ?\" Pas l'argent, pas la voiture \u2014 mais ce qui change dans ta vie quand tu r\u00e9ussis.",
    es: "Tu POR QU\u00c9 es tu motivaci\u00f3n personal. La respuesta a la pregunta: \"\u00bfPor qu\u00e9 realmente hago esto?\" No el dinero, no el coche \u2014 sino lo que cambia en tu vida cuando lo logras.",
    de: "Dein WARUM ist deine pers\u00f6nliche Motivation. Die Antwort auf die Frage: \"Warum mache ich das wirklich?\" Nicht das Geld, nicht das Auto \u2014 sondern was sich in deinem Leben ver\u00e4ndert.",
    pt: "Seu PORQU\u00ca \u00e9 sua motiva\u00e7\u00e3o pessoal. A resposta \u00e0 pergunta: \"Por que estou realmente fazendo isso?\" N\u00e3o o dinheiro, n\u00e3o o carro \u2014 mas o que muda na sua vida quando voc\u00ea consegue.",
  },
  "why.uitleg2": {
    nl: "Je WHY is ook je anker. Op de dagen dat het moeilijk is, lees je hem terug. En hij is zo geschreven dat je hem trots kunt delen met mensen in je omgeving.",
    en: "Your WHY is also your anchor. On the hard days, you read it back. And it's written so you can proudly share it with people around you.",
    fr: "Ton POURQUOI est aussi ton ancre. Les jours difficiles, tu le relis. Et il est \u00e9crit pour que tu puisses le partager fi\u00e8rement avec ton entourage.",
    es: "Tu POR QU\u00c9 tambi\u00e9n es tu ancla. En los d\u00edas dif\u00edciles, lo relees. Y est\u00e1 escrito para que puedas compartirlo con orgullo.",
    de: "Dein WARUM ist auch dein Anker. An schwierigen Tagen liest du es nochmal. Und es ist so geschrieben, dass du es stolz teilen kannst.",
    pt: "Seu PORQU\u00ca tamb\u00e9m \u00e9 sua \u00e2ncora. Nos dias dif\u00edceis, voc\u00ea o rel\u00ea. E est\u00e1 escrito para que voc\u00ea possa compartilh\u00e1-lo com orgulho.",
  },
  "why.voorbeeld": {
    nl: "Voorbeeld WHY", en: "Example WHY", fr: "Exemple POURQUOI",
    es: "Ejemplo POR QU\u00c9", de: "Beispiel WARUM", pt: "Exemplo PORQU\u00ca",
  },
  "why.wat_gebeurt": {
    nl: "Wat gaat er straks gebeuren?", en: "What will happen next?",
    fr: "Que va-t-il se passer ?", es: "\u00bfQu\u00e9 va a pasar?",
    de: "Was passiert als n\u00e4chstes?", pt: "O que vai acontecer?",
  },
  "why.wat_gebeurt_uitleg": {
    nl: "De ELEVA Mentor stelt je een paar vragen over jouw situatie, je dromen en wat je echt drijft. Wees eerlijk \u2014 hoe opener je bent, hoe krachtiger je WHY wordt. Het duurt ongeveer 5 tot 10 minuten.",
    en: "The ELEVA Mentor will ask you a few questions about your situation, your dreams and what truly drives you. Be honest \u2014 the more open you are, the more powerful your WHY becomes. It takes about 5 to 10 minutes.",
    fr: "Le coach IA te posera quelques questions sur ta situation, tes r\u00eaves et ce qui te motive vraiment. Sois honn\u00eate \u2014 plus tu es ouvert, plus ton POURQUOI sera puissant. Cela prend environ 5 \u00e0 10 minutes.",
    es: "El coach IA te har\u00e1 unas preguntas sobre tu situaci\u00f3n, tus sue\u00f1os y lo que realmente te impulsa. S\u00e9 honesto \u2014 cuanto m\u00e1s abierto seas, m\u00e1s poderoso ser\u00e1 tu POR QU\u00c9. Toma unos 5 a 10 minutos.",
    de: "Der KI-Coach stellt dir ein paar Fragen zu deiner Situation, deinen Tr\u00e4umen und was dich wirklich antreibt. Sei ehrlich \u2014 je offener du bist, desto kraftvoller wird dein WARUM. Es dauert etwa 5 bis 10 Minuten.",
    pt: "O coach IA far\u00e1 algumas perguntas sobre sua situa\u00e7\u00e3o, seus sonhos e o que realmente te motiva. Seja honesto \u2014 quanto mais aberto voc\u00ea for, mais poderoso ser\u00e1 seu PORQU\u00ca. Leva cerca de 5 a 10 minutos.",
  },
  "why.start": {
    nl: "Start het gesprek", en: "Start the conversation", fr: "D\u00e9marrer la conversation",
    es: "Iniciar la conversaci\u00f3n", de: "Gespr\u00e4ch starten", pt: "Iniciar a conversa",
  },
  "why.bevestig": {
    nl: "Dit is 'm!", en: "This is it!", fr: "C'est \u00e7a !",
    es: "\u00a1Es esto!", de: "Das ist es!", pt: "\u00c9 isso!",
  },
  "why.finetunen": {
    nl: "Verder finetunen", en: "Keep refining", fr: "Affiner encore",
    es: "Seguir afinando", de: "Weiter verfeinern", pt: "Continuar refinando",
  },
  "why.opgeslagen": {
    nl: "Jouw WHY is opgeslagen!", en: "Your WHY has been saved!",
    fr: "Ton POURQUOI a \u00e9t\u00e9 enregistr\u00e9 !", es: "\u00a1Tu POR QU\u00c9 ha sido guardado!",
    de: "Dein WARUM wurde gespeichert!", pt: "Seu PORQU\u00ca foi salvo!",
  },
  "why.terugvinden": {
    nl: "Je kunt je WHY altijd terugvinden op het dashboard en hier aanpassen.",
    en: "You can always find your WHY on the dashboard and edit it here.",
    fr: "Tu peux toujours retrouver ton POURQUOI sur le tableau de bord et le modifier ici.",
    es: "Siempre puedes encontrar tu POR QU\u00c9 en el panel y editarlo aqu\u00ed.",
    de: "Du findest dein WARUM immer auf dem Dashboard und kannst es hier bearbeiten.",
    pt: "Voc\u00ea sempre pode encontrar seu PORQU\u00ca no painel e edit\u00e1-lo aqui.",
  },
  "why.naar_dashboard": {
    nl: "Naar het dashboard", en: "Go to dashboard", fr: "Aller au tableau de bord",
    es: "Ir al panel", de: "Zum Dashboard", pt: "Ir para o painel",
  },
  "why.antwoord": {
    nl: "Jouw antwoord...", en: "Your answer...", fr: "Ta r\u00e9ponse...",
    es: "Tu respuesta...", de: "Deine Antwort...", pt: "Sua resposta...",
  },

  // ===== ALGEMEEN =====
  "algemeen.laden": {
    nl: "Laden...", en: "Loading...", fr: "Chargement...",
    es: "Cargando...", de: "Laden...", pt: "Carregando...",
  },
  "algemeen.opslaan": {
    nl: "Opslaan", en: "Save", fr: "Enregistrer",
    es: "Guardar", de: "Speichern", pt: "Salvar",
  },
  "algemeen.annuleren": {
    nl: "Annuleren", en: "Cancel", fr: "Annuler",
    es: "Cancelar", de: "Abbrechen", pt: "Cancelar",
  },
  "algemeen.verwijderen": {
    nl: "Verwijderen", en: "Delete", fr: "Supprimer",
    es: "Eliminar", de: "L\u00f6schen", pt: "Excluir",
  },
  "algemeen.terug": {
    nl: "\u2190 Terug", en: "\u2190 Back", fr: "\u2190 Retour",
    es: "\u2190 Atr\u00e1s", de: "\u2190 Zur\u00fcck", pt: "\u2190 Voltar",
  },
  "algemeen.sluiten": {
    nl: "Sluiten", en: "Close", fr: "Fermer",
    es: "Cerrar", de: "Schlie\u00dfen", pt: "Fechar",
  },
  "algemeen.vandaag": {
    nl: "Vandaag", en: "Today", fr: "Aujourd'hui",
    es: "Hoy", de: "Heute", pt: "Hoje",
  },
  "algemeen.gisteren": {
    nl: "Gisteren", en: "Yesterday", fr: "Hier",
    es: "Ayer", de: "Gestern", pt: "Ontem",
  },

  // ===== INSTELLINGEN =====
  "instellingen.titel": { nl: "Instellingen", en: "Settings", fr: "Paramètres", es: "Ajustes", de: "Einstellungen", pt: "Configurações" },
  "instellingen.subtitel": { nl: "Beheer jouw profiel en account", en: "Manage your profile and account", fr: "Gérez votre profil et compte", es: "Gestiona tu perfil y cuenta", de: "Profil und Konto verwalten", pt: "Gerenciar seu perfil e conta" },
  "instellingen.profiel": { nl: "Profiel", en: "Profile", fr: "Profil", es: "Perfil", de: "Profil", pt: "Perfil" },
  "instellingen.naam": { nl: "Naam", en: "Name", fr: "Nom", es: "Nombre", de: "Name", pt: "Nome" },
  "instellingen.rol": { nl: "Rol", en: "Role", fr: "Rôle", es: "Rol", de: "Rolle", pt: "Função" },
  "instellingen.leider": { nl: "Teamleider", en: "Team leader", fr: "Chef d'équipe", es: "Líder de equipo", de: "Teamleiter", pt: "Líder de equipe" },
  "instellingen.lid": { nl: "Teamlid", en: "Team member", fr: "Membre d'équipe", es: "Miembro del equipo", de: "Teammitglied", pt: "Membro da equipe" },
  "instellingen.profiel_opslaan": { nl: "Profiel opslaan", en: "Save profile", fr: "Enregistrer le profil", es: "Guardar perfil", de: "Profil speichern", pt: "Salvar perfil" },
  "instellingen.email_herinneringen": { nl: "E-mail herinneringen", en: "Email reminders", fr: "Rappels par e-mail", es: "Recordatorios por correo", de: "E-Mail Erinnerungen", pt: "Lembretes por e-mail" },
  "instellingen.email_subtitel": { nl: "Koppel je eigen gratis e-mailaccount zodat je elke ochtend een herinnering krijgt van openstaande taken.", en: "Connect your own free email account to receive a daily morning reminder of pending tasks.", fr: "Connecte ton compte e-mail gratuit pour recevoir chaque matin un rappel de tes tâches en attente.", es: "Conecta tu cuenta de correo gratuita para recibir cada mañana un recordatorio de tareas pendientes.", de: "Verbinde dein kostenloses E-Mail-Konto für eine tägliche Erinnerung an offene Aufgaben.", pt: "Conecte sua conta de e-mail gratuita para receber lembretes diários de tarefas pendentes." },
  "instellingen.hoe_stap": { nl: "Hoe stel je dit in? (2 minuten)", en: "How to set this up? (2 minutes)", fr: "Comment configurer cela ? (2 minutes)", es: "¿Cómo configurar esto? (2 minutos)", de: "Wie richtet man das ein? (2 Minuten)", pt: "Como configurar isso? (2 minutos)" },
  "instellingen.stap1": { nl: "Ga naar resend.com en maak een gratis account aan (100 mails per dag, gratis)", en: "Go to resend.com and create a free account (100 emails/day, free)", fr: "Va sur resend.com et crée un compte gratuit (100 mails/jour, gratuit)", es: "Ve a resend.com y crea una cuenta gratuita (100 correos/día, gratis)", de: "Gehe zu resend.com und erstelle ein kostenloses Konto (100 Mails/Tag, kostenlos)", pt: "Acesse resend.com e crie uma conta gratuita (100 e-mails/dia, grátis)" },
  "instellingen.stap2": { nl: "Klik na het inloggen op API Keys in het menu links", en: "After logging in, click API Keys in the left menu", fr: "Après connexion, clique sur API Keys dans le menu gauche", es: "Después de iniciar sesión, haz clic en API Keys en el menú izquierdo", de: "Klicke nach dem Einloggen auf API Keys im linken Menü", pt: "Após fazer login, clique em API Keys no menu esquerdo" },
  "instellingen.stap3": { nl: "Klik op Create API Key, geef hem een naam en kopieer de key", en: "Click Create API Key, give it a name and copy the key", fr: "Clique sur Create API Key, donne-lui un nom et copie la clé", es: "Haz clic en Create API Key, dale un nombre y copia la clave", de: "Klicke auf Create API Key, gib einen Namen und kopiere den Key", pt: "Clique em Create API Key, dê um nome e copie a chave" },
  "instellingen.stap4": { nl: "Plak de key hieronder en klik op opslaan", en: "Paste the key below and click save", fr: "Colle la clé ci-dessous et clique sur enregistrer", es: "Pega la clave abajo y haz clic en guardar", de: "Füge den Key unten ein und klicke auf Speichern", pt: "Cole a chave abaixo e clique em salvar" },
  "instellingen.notificatie_email": { nl: "E-mailadres voor herinneringen", en: "Email address for reminders", fr: "Adresse e-mail pour les rappels", es: "Correo electrónico para recordatorios", de: "E-Mail-Adresse für Erinnerungen", pt: "Endereço de e-mail para lembretes" },
  "instellingen.notificatie_uitleg": { nl: "Vul hier een ander e-mailadres in als je de herinneringen ergens anders wilt ontvangen.", en: "Enter a different email address if you want to receive reminders elsewhere.", fr: "Entre une autre adresse e-mail pour recevoir les rappels ailleurs.", es: "Introduce otro correo si quieres recibir los recordatorios en otro lugar.", de: "Gib eine andere E-Mail-Adresse ein, um Erinnerungen woanders zu erhalten.", pt: "Insira outro e-mail se quiser receber os lembretes em outro lugar." },
  "instellingen.resend_key": { nl: "Resend API Key", en: "Resend API Key", fr: "Clé API Resend", es: "Clave API de Resend", de: "Resend API-Key", pt: "Chave API Resend" },
  "instellingen.key_uitleg": { nl: "Je key wordt versleuteld opgeslagen. Niemand anders kan hem zien.", en: "Your key is stored encrypted. No one else can see it.", fr: "Ta clé est stockée chiffrée. Personne d'autre ne peut la voir.", es: "Tu clave se almacena cifrada. Nadie más puede verla.", de: "Dein Key wird verschlüsselt gespeichert. Niemand anderes kann ihn sehen.", pt: "Sua chave é armazenada criptografada. Ninguém mais pode vê-la." },
  "instellingen.testmail": { nl: "Testmail sturen", en: "Send test email", fr: "Envoyer un e-mail test", es: "Enviar correo de prueba", de: "Test-Mail senden", pt: "Enviar e-mail de teste" },
  "instellingen.testen": { nl: "Testen...", en: "Testing...", fr: "Test en cours...", es: "Probando...", de: "Testen...", pt: "Testando..." },
  "instellingen.actief": { nl: "E-mail herinneringen zijn actief. Je krijgt elke ochtend om 07:00 een mail als je openstaande herinneringen hebt.", en: "Email reminders are active. You will receive a daily email at 07:00 if you have pending reminders.", fr: "Les rappels par e-mail sont actifs. Tu recevras un e-mail quotidien à 07h00 si tu as des rappels en attente.", es: "Los recordatorios por correo están activos. Recibirás un correo a las 07:00 si tienes recordatorios pendientes.", de: "E-Mail-Erinnerungen sind aktiv. Du erhältst täglich um 07:00 eine E-Mail bei offenen Erinnerungen.", pt: "Os lembretes por e-mail estão ativos. Você receberá um e-mail às 07:00 se tiver lembretes pendentes." },
  "instellingen.wachtwoord": { nl: "Wachtwoord wijzigen", en: "Change password", fr: "Modifier le mot de passe", es: "Cambiar contraseña", de: "Passwort ändern", pt: "Alterar senha" },
  "instellingen.nieuw_wachtwoord": { nl: "Nieuw wachtwoord", en: "New password", fr: "Nouveau mot de passe", es: "Nueva contraseña", de: "Neues Passwort", pt: "Nova senha" },
  "instellingen.wachtwoord_placeholder": { nl: "Minimaal 6 tekens", en: "At least 6 characters", fr: "Au moins 6 caractères", es: "Mínimo 6 caracteres", de: "Mindestens 6 Zeichen", pt: "Mínimo 6 caracteres" },
  "instellingen.bevestig_wachtwoord": { nl: "Bevestig wachtwoord", en: "Confirm password", fr: "Confirmer le mot de passe", es: "Confirmar contraseña", de: "Passwort bestätigen", pt: "Confirmar senha" },
  "instellingen.herhaal_placeholder": { nl: "Herhaal nieuw wachtwoord", en: "Repeat new password", fr: "Répéter le nouveau mot de passe", es: "Repite la nueva contraseña", de: "Neues Passwort wiederholen", pt: "Repita a nova senha" },
  "instellingen.wachtwoord_wijzigen": { nl: "Wachtwoord wijzigen", en: "Change password", fr: "Modifier le mot de passe", es: "Cambiar contraseña", de: "Passwort ändern", pt: "Alterar senha" },
  "instellingen.wijzigen_laden": { nl: "Wijzigen...", en: "Changing...", fr: "Modification...", es: "Cambiando...", de: "Ändern...", pt: "Alterando..." },

  // ===== NIEUW PROSPECT =====
  "nieuw.titel": { nl: "Nieuw Prospect", en: "New Prospect", fr: "Nouveau Prospect", es: "Nuevo Prospecto", de: "Neuer Kontakt", pt: "Novo Prospecto" },
  "nieuw.subtitel": { nl: "Voeg iemand toe aan je namenlijst", en: "Add someone to your list", fr: "Ajoutez quelqu'un à votre liste", es: "Añade a alguien a tu lista", de: "Jemanden zur Kontaktliste hinzufügen", pt: "Adicione alguém à sua lista" },
  "nieuw.naam": { nl: "Volledige naam", en: "Full name", fr: "Nom complet", es: "Nombre completo", de: "Vollständiger Name", pt: "Nome completo" },
  "nieuw.naam_placeholder": { nl: "Voor- en achternaam", en: "First and last name", fr: "Prénom et nom", es: "Nombre y apellido", de: "Vor- und Nachname", pt: "Nome e sobrenome" },
  "nieuw.bron": { nl: "Bron", en: "Source", fr: "Source", es: "Fuente", de: "Quelle", pt: "Fonte" },
  "nieuw.bron.warm": { nl: "Warm contact (ken ik al)", en: "Warm contact (I know them)", fr: "Contact chaud (je le connais)", es: "Contacto cálido (ya lo conozco)", de: "Warmer Kontakt (kenne ich)", pt: "Contato quente (já conheço)" },
  "nieuw.bron.social": { nl: "Social media", en: "Social media", fr: "Réseaux sociaux", es: "Redes sociales", de: "Social Media", pt: "Redes sociais" },
  "nieuw.bron.doorverwijzing": { nl: "Doorverwijzing", en: "Referral", fr: "Référence", es: "Referido", de: "Empfehlung", pt: "Indicação" },
  "nieuw.bron.koud": { nl: "Koud contact", en: "Cold contact", fr: "Contact froid", es: "Contacto frío", de: "Kalter Kontakt", pt: "Contato frio" },
  "nieuw.prioriteit": { nl: "Prioriteit", en: "Priority", fr: "Priorité", es: "Prioridad", de: "Priorität", pt: "Prioridade" },
  "nieuw.prioriteit.hoog": { nl: "⭐ Hoog", en: "⭐ High", fr: "⭐ Haute", es: "⭐ Alta", de: "⭐ Hoch", pt: "⭐ Alta" },
  "nieuw.prioriteit.normaal": { nl: "Normaal", en: "Normal", fr: "Normale", es: "Normal", de: "Normal", pt: "Normal" },
  "nieuw.prioriteit.laag": { nl: "Laag", en: "Low", fr: "Basse", es: "Baja", de: "Niedrig", pt: "Baixa" },
  "nieuw.pipeline_fase": { nl: "Pipeline fase", en: "Pipeline stage", fr: "Étape pipeline", es: "Fase del pipeline", de: "Pipeline-Phase", pt: "Fase do pipeline" },
  "nieuw.notities": { nl: "Notities", en: "Notes", fr: "Notes", es: "Notas", de: "Notizen", pt: "Notas" },
  "nieuw.notities_placeholder": { nl: "Wat weet je over deze persoon? Wat is hun situatie?", en: "What do you know about this person? What is their situation?", fr: "Que savez-vous sur cette personne ? Quelle est sa situation ?", es: "¿Qué sabes sobre esta persona? ¿Cuál es su situación?", de: "Was weißt du über diese Person? Was ist ihre Situation?", pt: "O que você sabe sobre essa pessoa? Qual é a situação dela?" },
  "nieuw.toevoegen": { nl: "Nieuw toevoegen", en: "Add new", fr: "Ajouter", es: "Añadir", de: "Hinzufügen", pt: "Adicionar" },
  "nieuw.naam_verplicht": { nl: "Naam is verplicht", en: "Name is required", fr: "Le nom est obligatoire", es: "El nombre es obligatorio", de: "Name ist erforderlich", pt: "Nome é obrigatório" },
  "nieuw.niet_ingelogd": { nl: "Niet ingelogd", en: "Not logged in", fr: "Non connecté", es: "No conectado", de: "Nicht eingeloggt", pt: "Não conectado" },
  "nieuw.fout": { nl: "Kon prospect niet opslaan", en: "Could not save prospect", fr: "Impossible d'enregistrer le prospect", es: "No se pudo guardar el prospecto", de: "Kontakt konnte nicht gespeichert werden", pt: "Não foi possível salvar o prospecto" },
  "nieuw.toegevoegd": { nl: "toegevoegd!", en: "added!", fr: "ajouté !", es: "añadido!", de: "hinzugefügt!", pt: "adicionado!" },

  // ===== PROSPECT DETAIL =====
  "prospect.hoge_prioriteit": { nl: "⭐ Hoge prioriteit", en: "⭐ High priority", fr: "⭐ Priorité haute", es: "⭐ Alta prioridad", de: "⭐ Hohe Priorität", pt: "⭐ Alta prioridade" },
  "prospect.toegevoegd": { nl: "Toegevoegd op", en: "Added on", fr: "Ajouté le", es: "Añadido el", de: "Hinzugefügt am", pt: "Adicionado em" },
  "prospect.bestellingen": { nl: "Productbestellingen", en: "Product orders", fr: "Commandes produits", es: "Pedidos de productos", de: "Produktbestellungen", pt: "Pedidos de produtos" },
  "prospect.herinnering": { nl: "🔔 Herinnering:", en: "🔔 Reminder:", fr: "🔔 Rappel :", es: "🔔 Recordatorio:", de: "🔔 Erinnerung:", pt: "🔔 Lembrete:" },
  "prospect.coach_gesprekken": { nl: "🌟 ELEVA Mentor gesprekken", en: "🌟 ELEVA Mentor conversations", fr: "🌟 Conversations ELEVA Mentor", es: "🌟 Conversaciones ELEVA Mentor", de: "🌟 ELEVA Mentor Gespräche", pt: "🌟 Conversas ELEVA Mentor" },
  "prospect.nieuw_gesprek": { nl: "+ Nieuw gesprek", en: "+ New conversation", fr: "+ Nouvelle conversation", es: "+ Nueva conversación", de: "+ Neues Gespräch", pt: "+ Nova conversa" },
  "prospect.geen_gesprekken": { nl: "Nog geen coach gesprekken over dit contact.", en: "No coach conversations about this contact yet.", fr: "Pas encore de conversations coach à propos de ce contact.", es: "Aún no hay conversaciones de coach sobre este contacto.", de: "Noch keine Coach-Gespräche über diesen Kontakt.", pt: "Ainda não há conversas de coach sobre este contato." },
  "prospect.coach_gesprek": { nl: "Coach gesprek", en: "Coach conversation", fr: "Conversation coach", es: "Conversación de coach", de: "Coach-Gespräch", pt: "Conversa de coach" },

  // ===== SCRIPTS =====
  "scripts.titel": { nl: "Scriptbibliotheek", en: "Script Library", fr: "Bibliothèque de scripts", es: "Biblioteca de guiones", de: "Skriptbibliothek", pt: "Biblioteca de scripts" },
  "scripts.subtitel": { nl: "Alle uitnodigingen, bezwaren en follow-up scripts op één plek", en: "All invitations, objections and follow-up scripts in one place", fr: "Toutes les invitations, objections et scripts de suivi en un seul endroit", es: "Todas las invitaciones, objeciones y scripts de seguimiento en un lugar", de: "Alle Einladungen, Einwände und Follow-up-Skripte an einem Ort", pt: "Todos os convites, objeções e scripts de acompanhamento em um lugar" },
  "scripts.zoeken": { nl: "Zoek in scripts...", en: "Search scripts...", fr: "Rechercher dans les scripts...", es: "Buscar en guiones...", de: "Skripte durchsuchen...", pt: "Pesquisar scripts..." },
  "scripts.niet_gevonden": { nl: "Geen scripts gevonden voor deze zoekopdracht.", en: "No scripts found for this search.", fr: "Aucun script trouvé pour cette recherche.", es: "No se encontraron guiones para esta búsqueda.", de: "Keine Skripte für diese Suche gefunden.", pt: "Nenhum script encontrado para esta pesquisa." },
  "scripts.alle": { nl: "Alle scripts", en: "All scripts", fr: "Tous les scripts", es: "Todos los guiones", de: "Alle Skripte", pt: "Todos os scripts" },
  "scripts.uitnodiging": { nl: "📤 Uitnodigingen", en: "📤 Invitations", fr: "📤 Invitations", es: "📤 Invitaciones", de: "📤 Einladungen", pt: "📤 Convites" },
  "scripts.bezwaar": { nl: "🛡️ Bezwaren", en: "🛡️ Objections", fr: "🛡️ Objections", es: "🛡️ Objeciones", de: "🛡️ Einwände", pt: "🛡️ Objeções" },
  "scripts.followup": { nl: "🔄 Follow-up", en: "🔄 Follow-up", fr: "🔄 Suivi", es: "🔄 Seguimiento", de: "🔄 Follow-up", pt: "🔄 Acompanhamento" },
  "scripts.sluiting": { nl: "🎯 Sluiting", en: "🎯 Closing", fr: "🎯 Conclusion", es: "🎯 Cierre", de: "🎯 Abschluss", pt: "🎯 Fechamento" },
  "scripts.presentatie": { nl: "🎤 Presentatie", en: "🎤 Presentation", fr: "🎤 Présentation", es: "🎤 Presentación", de: "🎤 Präsentation", pt: "🎤 Apresentação" },
  "scripts.meer": { nl: "Volledig tonen ↓", en: "Show full ↓", fr: "Afficher en entier ↓", es: "Mostrar completo ↓", de: "Vollständig anzeigen ↓", pt: "Mostrar completo ↓" },
  "scripts.minder": { nl: "Minder tonen ↑", en: "Show less ↑", fr: "Réduire ↑", es: "Mostrar menos ↑", de: "Weniger anzeigen ↑", pt: "Mostrar menos ↑" },
  "scripts.kopieer": { nl: "📋 Kopieer", en: "📋 Copy", fr: "📋 Copier", es: "📋 Copiar", de: "📋 Kopieren", pt: "📋 Copiar" },
  "scripts.gekopieerd": { nl: "gekopieerd!", en: "copied!", fr: "copié !", es: "copiado!", de: "kopiert!", pt: "copiado!" },

  // ===== TEAM =====
  "team.titel": { nl: "Mijn Team", en: "My Team", fr: "Mon Équipe", es: "Mi Equipo", de: "Mein Team", pt: "Minha Equipe" },
  "team.dag": { nl: "Dag", en: "Day", fr: "Jour", es: "Día", de: "Tag", pt: "Dia" },
  "team.uitnodigen": { nl: "Teamlid uitnodigen", en: "Invite team member", fr: "Inviter un membre", es: "Invitar miembro", de: "Teammitglied einladen", pt: "Convidar membro" },
  "team.uitnodiging_subtitel": { nl: "Stuur deze link naar je nieuwe teamleden. Ze worden automatisch aan jouw team gekoppeld.", en: "Send this link to your new team members. They will be automatically linked to your team.", fr: "Envoie ce lien à tes nouveaux membres. Ils seront automatiquement liés à ton équipe.", es: "Envía este enlace a tus nuevos miembros. Se vincularán automáticamente a tu equipo.", de: "Sende diesen Link an deine neuen Teammitglieder. Sie werden automatisch mit deinem Team verknüpft.", pt: "Envie este link para seus novos membros. Eles serão automaticamente vinculados à sua equipe." },
  "team.level_direct": { nl: "Level 1 (direct)", en: "Level 1 (direct)", fr: "Niveau 1 (direct)", es: "Nivel 1 (directo)", de: "Level 1 (direkt)", pt: "Nível 1 (direto)" },
  "team.totaal": { nl: "Totaal in team", en: "Total in team", fr: "Total dans l'équipe", es: "Total en el equipo", de: "Gesamt im Team", pt: "Total na equipe" },
  "team.levels": { nl: "Levels diep", en: "Levels deep", fr: "Niveaux de profondeur", es: "Niveles de profundidad", de: "Level Tiefe", pt: "Níveis de profundidade" },
  "team.duplicatie": { nl: "Duplicatie", en: "Duplication", fr: "Duplication", es: "Duplicación", de: "Duplikation", pt: "Duplicação" },
  "team.per_level": { nl: "Per level", en: "Per level", fr: "Par niveau", es: "Por nivel", de: "Pro Level", pt: "Por nível" },
  "team.structuur": { nl: "Teamstructuur", en: "Team structure", fr: "Structure de l'équipe", es: "Estructura del equipo", de: "Teamstruktur", pt: "Estrutura da equipe" },
  "team.geen_leden": { nl: "Nog geen teamleden", en: "No team members yet", fr: "Pas encore de membres", es: "Aún no hay miembros", de: "Noch keine Teammitglieder", pt: "Ainda sem membros" },
  "team.geen_uitleg": { nl: "Deel de uitnodigingslink hierboven om je eerste teamlid toe te voegen.", en: "Share the invitation link above to add your first team member.", fr: "Partage le lien d'invitation ci-dessus pour ajouter ton premier membre.", es: "Comparte el enlace de invitación arriba para añadir tu primer miembro.", de: "Teile den Einladungslink oben, um dein erstes Teammitglied hinzuzufügen.", pt: "Compartilhe o link de convite acima para adicionar seu primeiro membro." },

  // ===== ZOEKEN =====
  "zoeken.titel": { nl: "Zoeken", en: "Search", fr: "Rechercher", es: "Buscar", de: "Suchen", pt: "Pesquisar" },
  "zoeken.subtitel": { nl: "Zoek contacten, gesprekken en notities", en: "Search contacts, conversations and notes", fr: "Rechercher contacts, conversations et notes", es: "Buscar contactos, conversaciones y notas", de: "Kontakte, Gespräche und Notizen suchen", pt: "Pesquisar contatos, conversas e notas" },
  "zoeken.placeholder": { nl: "Naam, notitie, telefoonnummer, e-mail...", en: "Name, note, phone number, email...", fr: "Nom, note, numéro de téléphone, e-mail...", es: "Nombre, nota, teléfono, correo...", de: "Name, Notiz, Telefonnummer, E-Mail...", pt: "Nome, nota, telefone, e-mail..." },
  "zoeken.laden": { nl: "Zoeken...", en: "Searching...", fr: "Recherche...", es: "Buscando...", de: "Suchen...", pt: "Pesquisando..." },
  "zoeken.niets": { nl: "Niets gevonden", en: "Nothing found", fr: "Rien trouvé", es: "Nada encontrado", de: "Nichts gefunden", pt: "Nada encontrado" },
  "zoeken.andere": { nl: "Probeer een andere zoekterm", en: "Try a different search term", fr: "Essaie un autre terme de recherche", es: "Intenta con otro término de búsqueda", de: "Versuche einen anderen Suchbegriff", pt: "Tente outro termo de pesquisa" },
  "zoeken.type": { nl: "Type een naam of zoekterm", en: "Type a name or search term", fr: "Tape un nom ou un terme de recherche", es: "Escribe un nombre o término de búsqueda", de: "Gib einen Namen oder Suchbegriff ein", pt: "Digite um nome ou termo de pesquisa" },
  "zoeken.zoekt_in": { nl: "Zoekt in contacten, notities, telefoonnummers en coach gesprekken", en: "Searches in contacts, notes, phone numbers and coach conversations", fr: "Recherche dans les contacts, notes, numéros et conversations", es: "Busca en contactos, notas, teléfonos y conversaciones", de: "Sucht in Kontakten, Notizen, Telefonnummern und Coach-Gesprächen", pt: "Pesquisa em contatos, notas, telefones e conversas" },
  "zoeken.contacten": { nl: "Contacten", en: "Contacts", fr: "Contacts", es: "Contactos", de: "Kontakte", pt: "Contatos" },
  "zoeken.gesprekken": { nl: "Coach gesprekken", en: "Coach conversations", fr: "Conversations coach", es: "Conversaciones de coach", de: "Coach-Gespräche", pt: "Conversas de coach" },

  // ===== ACTIE FORM =====
  "actie.bijhouden": { nl: "Bijhouden wat besproken", en: "Track what was discussed", fr: "Suivi de ce qui a été discuté", es: "Registrar lo discutido", de: "Erfassen was besprochen wurde", pt: "Registrar o que foi discutido" },
  "actie.aantekening": { nl: "📝 Aantekening toevoegen", en: "📝 Add note", fr: "📝 Ajouter une note", es: "📝 Añadir nota", de: "📝 Notiz hinzufügen", pt: "📝 Adicionar nota" },
  "actie.bestelling_knop": { nl: "📦 Bestelling registreren", en: "📦 Register order", fr: "📦 Enregistrer commande", es: "📦 Registrar pedido", de: "📦 Bestellung erfassen", pt: "📦 Registrar pedido" },
  "actie.type_contact": { nl: "Type contact", en: "Contact type", fr: "Type de contact", es: "Tipo de contacto", de: "Kontaktart", pt: "Tipo de contato" },
  "actie.bellen": { nl: "Bellen", en: "Call", fr: "Appel", es: "Llamar", de: "Anrufen", pt: "Ligar" },
  "actie.nieuwe_fase": { nl: "Nieuwe fase", en: "New stage", fr: "Nouvelle étape", es: "Nueva fase", de: "Neue Phase", pt: "Nova fase" },
  "actie.besproken": { nl: "Wat is er besproken?", en: "What was discussed?", fr: "Qu'est-ce qui a été discuté ?", es: "¿Qué se discutió?", de: "Was wurde besprochen?", pt: "O que foi discutido?" },
  "actie.besproken_placeholder": { nl: "Korte samenvatting van het gesprek...", en: "Brief summary of the conversation...", fr: "Bref résumé de la conversation...", es: "Resumen breve de la conversación...", de: "Kurze Zusammenfassung des Gesprächs...", pt: "Breve resumo da conversa..." },
  "actie.volgende": { nl: "Volgende actie plannen (optioneel)", en: "Plan next action (optional)", fr: "Planifier la prochaine action (optionnel)", es: "Planificar siguiente acción (opcional)", de: "Nächste Aktion planen (optional)", pt: "Planejar próxima ação (opcional)" },
  "actie.datum": { nl: "Datum", en: "Date", fr: "Date", es: "Fecha", de: "Datum", pt: "Data" },
  "actie.wat_doen": { nl: "Wat ga je doen?", en: "What will you do?", fr: "Que vas-tu faire ?", es: "¿Qué vas a hacer?", de: "Was wirst du tun?", pt: "O que você vai fazer?" },
  "actie.wat_placeholder": { nl: "Bijv. Follow-up bellen", en: "E.g. Follow-up call", fr: "Ex. Appel de suivi", es: "Ej. Llamada de seguimiento", de: "Z.B. Follow-up anrufen", pt: "Ex. Ligação de acompanhamento" },
  "actie.opslaan": { nl: "Aantekening opslaan", en: "Save note", fr: "Enregistrer la note", es: "Guardar nota", de: "Notiz speichern", pt: "Salvar nota" },
  "actie.herinnering_info": { nl: "Na 21 dagen, na 51 dagen en na 81 dagen krijg je automatisch herinneringen om contact op te nemen voor een herbestelling.", en: "After 21, 51 and 81 days you will automatically receive reminders to contact them for a reorder.", fr: "Après 21, 51 et 81 jours vous recevrez automatiquement des rappels pour une recommande.", es: "Después de 21, 51 y 81 días recibirás recordatorios automáticos para un nuevo pedido.", de: "Nach 21, 51 und 81 Tagen erhältst du automatisch Erinnerungen für eine Nachbestellung.", pt: "Após 21, 51 e 81 dias você receberá lembretes automáticos para uma recompra." },
  "actie.besteldatum": { nl: "Besteldatum", en: "Order date", fr: "Date de commande", es: "Fecha del pedido", de: "Bestelldatum", pt: "Data do pedido" },
  "actie.product": { nl: "Product omschrijving", en: "Product description", fr: "Description du produit", es: "Descripción del producto", de: "Produktbeschreibung", pt: "Descrição do produto" },
  "actie.product_placeholder": { nl: "Bijv. Startpakket, Maandbestelling...", en: "E.g. Starter pack, Monthly order...", fr: "Ex. Pack de démarrage, Commande mensuelle...", es: "Ej. Paquete inicial, Pedido mensual...", de: "Z.B. Startpaket, Monatsbestellung...", pt: "Ex. Pacote inicial, Pedido mensal..." },
  "actie.bestelling_opslaan": { nl: "Bestelling registreren", en: "Register order", fr: "Enregistrer la commande", es: "Registrar pedido", de: "Bestellung erfassen", pt: "Registrar pedido" },
  "actie.opgeslagen": { nl: "Aantekening opgeslagen en prospect bijgewerkt", en: "Note saved and prospect updated", fr: "Note enregistrée et prospect mis à jour", es: "Nota guardada y prospecto actualizado", de: "Notiz gespeichert und Kontakt aktualisiert", pt: "Nota salva e prospecto atualizado" },
  "actie.bestelling_opgeslagen": { nl: "Bestelling opgeslagen — herinnering aangemaakt voor 21 dagen later!", en: "Order saved — reminder created for 21 days later!", fr: "Commande enregistrée — rappel créé pour dans 21 jours !", es: "Pedido guardado — recordatorio creado para 21 días después!", de: "Bestellung gespeichert — Erinnerung für 21 Tage erstellt!", pt: "Pedido salvo — lembrete criado para 21 dias depois!" },
  "actie.fout": { nl: "Kon niet opslaan", en: "Could not save", fr: "Impossible d'enregistrer", es: "No se pudo guardar", de: "Konnte nicht gespeichert werden", pt: "Não foi possível salvar" },
  "actie.bestelling_fout": { nl: "Kon bestelling niet opslaan", en: "Could not save order", fr: "Impossible d'enregistrer la commande", es: "No se pudo guardar el pedido", de: "Bestellung konnte nicht gespeichert werden", pt: "Não foi possível salvar o pedido" },

  // ===== CONTACT GEGEVENS FORM =====
  "contact.gegevens": { nl: "Contactgegevens", en: "Contact details", fr: "Coordonnées", es: "Datos de contacto", de: "Kontaktdaten", pt: "Dados de contato" },
  "contact.bewerken": { nl: "✏️ Bewerken", en: "✏️ Edit", fr: "✏️ Modifier", es: "✏️ Editar", de: "✏️ Bearbeiten", pt: "✏️ Editar" },
  "contact.gegevens_bewerken": { nl: "Contactgegevens bewerken", en: "Edit contact details", fr: "Modifier les coordonnées", es: "Editar datos de contacto", de: "Kontaktdaten bearbeiten", pt: "Editar dados de contato" },
  "contact.naam": { nl: "Volledige naam", en: "Full name", fr: "Nom complet", es: "Nombre completo", de: "Vollständiger Name", pt: "Nome completo" },
  "contact.bron": { nl: "Bron", en: "Source", fr: "Source", es: "Fuente", de: "Quelle", pt: "Fonte" },
  "contact.prioriteit": { nl: "Prioriteit", en: "Priority", fr: "Priorité", es: "Prioridad", de: "Priorität", pt: "Prioridade" },
  "contact.bijgewerkt": { nl: "Contactgegevens bijgewerkt", en: "Contact details updated", fr: "Coordonnées mises à jour", es: "Datos de contacto actualizados", de: "Kontaktdaten aktualisiert", pt: "Dados de contato atualizados" },
  "contact.fout": { nl: "Kon wijzigingen niet opslaan", en: "Could not save changes", fr: "Impossible d'enregistrer les modifications", es: "No se pudieron guardar los cambios", de: "Änderungen konnten nicht gespeichert werden", pt: "Não foi possível salvar as alterações" },
  "contact.extra_info": { nl: "Extra informatie over dit contact...", en: "Extra information about this contact...", fr: "Informations supplémentaires sur ce contact...", es: "Información adicional sobre este contacto...", de: "Zusätzliche Informationen über diesen Kontakt...", pt: "Informações adicionais sobre este contato..." },

  // ===== STATISTIEKEN / KPI =====
  "nav.statistieken": { nl: "Statistieken", en: "Statistics", fr: "Statistiques", es: "Estadísticas", de: "Statistiken", pt: "Estatísticas" },
  "stats.titel": { nl: "Statistieken & KPI's", en: "Statistics & KPIs", fr: "Statistiques & KPI", es: "Estadísticas & KPIs", de: "Statistiken & KPIs", pt: "Estatísticas & KPIs" },
  "stats.subtitel": { nl: "Jouw voortgang over de hele 60 dagenrun", en: "Your progress across the entire 60-day run", fr: "Votre progression sur l'ensemble des 60 jours", es: "Tu progreso durante los 60 días", de: "Dein Fortschritt über den gesamten 60-Tage-Lauf", pt: "Seu progresso ao longo dos 60 dias" },

  // Totalen kaarten
  "stats.totaal_contacten": { nl: "Totaal contacten", en: "Total contacts", fr: "Total contacts", es: "Total contactos", de: "Kontakte gesamt", pt: "Total contatos" },
  "stats.totaal_uitnodigingen": { nl: "Totaal uitnodigingen", en: "Total invitations", fr: "Total invitations", es: "Total invitaciones", de: "Einladungen gesamt", pt: "Total convites" },
  "stats.totaal_followups": { nl: "Totaal follow-ups", en: "Total follow-ups", fr: "Total suivis", es: "Total seguimientos", de: "Follow-ups gesamt", pt: "Total acompanhamentos" },
  "stats.totaal_presentaties": { nl: "Totaal presentaties", en: "Total presentations", fr: "Total présentations", es: "Total presentaciones", de: "Präsentationen gesamt", pt: "Total apresentações" },
  "stats.totaal_klanten": { nl: "Nieuwe shoppers", en: "New shoppers", fr: "Nouveaux shoppers", es: "Nuevos shoppers", de: "Neue Shoppers", pt: "Novos shoppers" },
  "stats.totaal_partners": { nl: "Nieuwe members", en: "New members", fr: "Nouveaux members", es: "Nuevos members", de: "Neue Members", pt: "Novos members" },

  // KPI sectie
  "stats.kpi_titel": { nl: "Key Performance Indicators", en: "Key Performance Indicators", fr: "Indicateurs clés de performance", es: "Indicadores clave de rendimiento", de: "Leistungskennzahlen", pt: "Indicadores chave de desempenho" },
  "stats.gem_contacten_dag": { nl: "Gem. contacten per dag", en: "Avg. contacts per day", fr: "Moy. contacts par jour", es: "Prom. contactos por día", de: "Ø Kontakte pro Tag", pt: "Méd. contatos por dia" },
  "stats.conversie_uitnodiging": { nl: "Conversie naar uitnodiging", en: "Invitation conversion rate", fr: "Taux de conversion invitation", es: "Tasa de conversión invitación", de: "Einladungs-Konversionsrate", pt: "Taxa de conversão convite" },
  "stats.conversie_presentatie": { nl: "Conversie naar presentatie", en: "Presentation conversion rate", fr: "Taux de conversion présentation", es: "Tasa de conversión presentación", de: "Präsentations-Konversionsrate", pt: "Taxa de conversão apresentação" },
  "stats.conversie_klant_partner": { nl: "Conversie naar klant/partner", en: "Customer/partner conversion", fr: "Conversion en client/partenaire", es: "Conversión a cliente/socio", de: "Kunden/Partner-Konversion", pt: "Conversão para cliente/parceiro" },
  "stats.actieve_dagen": { nl: "Actieve dagen", en: "Active days", fr: "Jours actifs", es: "Días activos", de: "Aktive Tage", pt: "Dias ativos" },
  "stats.consistentie": { nl: "Consistentie score", en: "Consistency score", fr: "Score de régularité", es: "Puntuación de consistencia", de: "Konsistenz-Score", pt: "Pontuação de consistência" },
  "stats.streak": { nl: "Huidige streak", en: "Current streak", fr: "Série en cours", es: "Racha actual", de: "Aktuelle Serie", pt: "Sequência atual" },
  "stats.langste_streak": { nl: "Langste streak", en: "Longest streak", fr: "Série la plus longue", es: "Racha más larga", de: "Längste Serie", pt: "Sequência mais longa" },
  "stats.beste_dag": { nl: "Beste dag", en: "Best day", fr: "Meilleur jour", es: "Mejor día", de: "Bester Tag", pt: "Melhor dia" },
  "stats.dagen": { nl: "dagen", en: "days", fr: "jours", es: "días", de: "Tage", pt: "dias" },

  // Grafiek secties
  "stats.activiteit_grafiek": { nl: "Dagelijkse activiteit", en: "Daily activity", fr: "Activité quotidienne", es: "Actividad diaria", de: "Tägliche Aktivität", pt: "Atividade diária" },
  "stats.cumulatief_grafiek": { nl: "Cumulatieve groei", en: "Cumulative growth", fr: "Croissance cumulative", es: "Crecimiento acumulado", de: "Kumulatives Wachstum", pt: "Crescimento cumulativo" },
  "stats.pipeline_funnel": { nl: "Pipeline funnel", en: "Pipeline funnel", fr: "Entonnoir pipeline", es: "Embudo de pipeline", de: "Pipeline-Trichter", pt: "Funil de pipeline" },
  "stats.weekoverzicht": { nl: "Weekoverzicht", en: "Weekly overview", fr: "Aperçu hebdomadaire", es: "Resumen semanal", de: "Wochenübersicht", pt: "Visão semanal" },

  // Prognose
  "stats.prognose": { nl: "Prognose einde run", en: "End-of-run forecast", fr: "Prévision fin de course", es: "Pronóstico fin de carrera", de: "Prognose Laufende", pt: "Previsão fim da corrida" },
  "stats.huidig_tempo": { nl: "Huidig tempo", en: "Current pace", fr: "Rythme actuel", es: "Ritmo actual", de: "Aktuelles Tempo", pt: "Ritmo atual" },
  "stats.verwacht_einde": { nl: "Verwacht bij dag 60", en: "Expected at day 60", fr: "Prévu au jour 60", es: "Esperado en el día 60", de: "Erwartet am Tag 60", pt: "Esperado no dia 60" },

  // Leeg
  "stats.geen_data": { nl: "Nog geen data beschikbaar. Begin met het bijhouden van je dagelijkse activiteiten op het dashboard!", en: "No data available yet. Start tracking your daily activities on the dashboard!", fr: "Pas encore de données disponibles. Commencez à suivre vos activités quotidiennes !", es: "Aún no hay datos disponibles. ¡Comienza a registrar tus actividades diarias!", de: "Noch keine Daten verfügbar. Beginne mit dem Erfassen deiner täglichen Aktivitäten!", pt: "Nenhum dado disponível ainda. Comece a registrar suas atividades diárias!" },

  // DagStatForm labels
  "stats.contacten": { nl: "Contacten", en: "Contacts", fr: "Contacts", es: "Contactos", de: "Kontakte", pt: "Contatos" },
  "stats.uitnodigingen": { nl: "Uitnodigingen", en: "Invitations", fr: "Invitations", es: "Invitaciones", de: "Einladungen", pt: "Convites" },
  "stats.followups": { nl: "Follow-ups", en: "Follow-ups", fr: "Suivis", es: "Seguimientos", de: "Follow-ups", pt: "Acompanhamentos" },
  "stats.presentaties": { nl: "Presentaties", en: "Presentations", fr: "Présentations", es: "Presentaciones", de: "Präsentationen", pt: "Apresentações" },
  "stats.nieuwe_klanten": { nl: "Nieuwe shoppers", en: "New shoppers", fr: "Nouveaux shoppers", es: "Nuevos shoppers", de: "Neue Shoppers", pt: "Novos shoppers" },
  "stats.nieuwe_partners": { nl: "Nieuwe members", en: "New members", fr: "Nouveaux members", es: "Nuevos members", de: "Neue Members", pt: "Novos members" },
  "stats.opgeslagen": { nl: "Opgeslagen", en: "Saved", fr: "Enregistré", es: "Guardado", de: "Gespeichert", pt: "Salvo" },

  // ===== EXTRA LABELS =====
  "algemeen.telefoon": { nl: "Telefoon", en: "Phone", fr: "Téléphone", es: "Teléfono", de: "Telefon", pt: "Telefone" },
  "namenlijst.leeg": { nl: "Leeg", en: "Empty", fr: "Vide", es: "Vacío", de: "Leer", pt: "Vazio" },

  // ===== TOPBAR =====
  "topbar.fase": { nl: "Fase", en: "Phase", fr: "Phase", es: "Fase", de: "Phase", pt: "Fase" },

  // ===== TEAM EXTRA =====
  "team.actief": { nl: "Actief", en: "Active", fr: "Actif", es: "Activo", de: "Aktiv", pt: "Ativo" },
  "team.bezig": { nl: "Bezig", en: "In progress", fr: "En cours", es: "En progreso", de: "In Arbeit", pt: "Em andamento" },
  "team.direct_label": { nl: "direct", en: "direct", fr: "direct", es: "directo", de: "direkt", pt: "direto" },
  "team.totaal_label": { nl: "totaal", en: "total", fr: "total", es: "total", de: "gesamt", pt: "total" },

  // ===== KOPIEER LINK =====
  "link.gekopieerd": { nl: "Link gekopieerd!", en: "Link copied!", fr: "Lien copié !", es: "¡Enlace copiado!", de: "Link kopiert!", pt: "Link copiado!" },
  "link.kopieer": { nl: "Kopieer", en: "Copy", fr: "Copier", es: "Copiar", de: "Kopieren", pt: "Copiar" },

  // ===== CONTACT LOG =====
  "contactlog.dm": { nl: "DM", en: "DM", fr: "DM", es: "DM", de: "DM", pt: "DM" },
  "contactlog.bel": { nl: "Bel", en: "Call", fr: "Appel", es: "Llamada", de: "Anruf", pt: "Ligação" },
  "contactlog.presentatie": { nl: "Presentatie", en: "Presentation", fr: "Présentation", es: "Presentación", de: "Präsentation", pt: "Apresentação" },
  "contactlog.followup": { nl: "Follow-up", en: "Follow-up", fr: "Suivi", es: "Seguimiento", de: "Follow-up", pt: "Acompanhamento" },
  "contactlog.notitie": { nl: "Notitie", en: "Note", fr: "Note", es: "Nota", de: "Notiz", pt: "Nota" },
  "contactlog.geen_notities": { nl: "Geen notities", en: "No notes", fr: "Pas de notes", es: "Sin notas", de: "Keine Notizen", pt: "Sem notas" },
  "contactlog.geen_aantekeningen": { nl: "Nog geen aantekeningen toegevoegd.", en: "No notes added yet.", fr: "Aucune note ajoutée.", es: "Sin notas añadidas.", de: "Noch keine Notizen.", pt: "Nenhuma nota adicionada." },
  "contactlog.gebruik_hint": { nl: "Gebruik \"Aantekeningen\" hierboven om te beginnen.", en: "Use \"Notes\" above to get started.", fr: "Utilisez \"Notes\" ci-dessus pour commencer.", es: "Usa \"Notas\" arriba para comenzar.", de: "Verwende \"Notizen\" oben, um zu beginnen.", pt: "Use \"Notas\" acima para começar." },
  "contactlog.titel": { nl: "Aantekeningen", en: "Notes", fr: "Notes", es: "Notas", de: "Notizen", pt: "Notas" },

  // ===== NAMENLIJST EXTRA =====
  "namenlijst.geen_contacten": { nl: "Nog geen contacten in je pipeline.", en: "No contacts in your pipeline yet.", fr: "Pas encore de contacts dans votre pipeline.", es: "Aún no hay contactos en tu pipeline.", de: "Noch keine Kontakte in deiner Pipeline.", pt: "Ainda sem contatos no seu pipeline." },
  "namenlijst.contacten_in_pipeline": { nl: "contacten in jouw pipeline", en: "contacts in your pipeline", fr: "contacts dans votre pipeline", es: "contactos en tu pipeline", de: "Kontakte in deiner Pipeline", pt: "contatos no seu pipeline" },
  "namenlijst.hoog": { nl: "Hoog", en: "High", fr: "Haute", es: "Alta", de: "Hoch", pt: "Alta" },

  // ===== COACH CAPABILITIES =====
  "coach.kan_dm": { nl: "DM-scripts schrijven op maat voor een specifiek prospect", en: "Write personalized DM scripts for a specific prospect", fr: "Écrire des scripts DM personnalisés pour un prospect", es: "Escribir scripts DM personalizados para un prospecto", de: "Personalisierte DM-Skripte für einen Kontakt schreiben", pt: "Escrever scripts DM personalizados para um prospecto" },
  "coach.kan_bezwaar": { nl: "Bezwaren behandelen met Feel-Felt-Found", en: "Handle objections with Feel-Felt-Found", fr: "Traiter les objections avec Feel-Felt-Found", es: "Manejar objeciones con Feel-Felt-Found", de: "Einwände mit Feel-Felt-Found behandeln", pt: "Lidar com objeções com Feel-Felt-Found" },
  "coach.kan_followup": { nl: "Follow up berichten formuleren", en: "Write follow-up messages", fr: "Formuler des messages de suivi", es: "Formular mensajes de seguimiento", de: "Follow-up Nachrichten formulieren", pt: "Formular mensagens de acompanhamento" },
  "coach.kan_closing": { nl: "De Doel-Tijd-Termijn closing toepassen", en: "Apply the Goal-Time-Deadline closing", fr: "Appliquer la clôture Objectif-Temps-Délai", es: "Aplicar el cierre Objetivo-Tiempo-Plazo", de: "Die Ziel-Zeit-Termin-Abschluss anwenden", pt: "Aplicar o fechamento Meta-Tempo-Prazo" },
  "coach.kan_strategie": { nl: "Strategisch advies per pipeline-fase", en: "Strategic advice per pipeline phase", fr: "Conseils stratégiques par phase pipeline", es: "Consejos estratégicos por fase de pipeline", de: "Strategische Beratung pro Pipeline-Phase", pt: "Conselhos estratégicos por fase do pipeline" },
  "coach.kan_mindset": { nl: "Mindset coaching en motivatie", en: "Mindset coaching and motivation", fr: "Coaching mindset et motivation", es: "Coaching de mentalidad y motivación", de: "Mindset-Coaching und Motivation", pt: "Coaching de mentalidade e motivação" },
  "coach.kan_accountability": { nl: "Accountability — houd jij je aan jouw dagelijkse acties?", en: "Accountability — are you keeping up with your daily actions?", fr: "Responsabilité — respectes-tu tes actions quotidiennes ?", es: "Responsabilidad — ¿cumples con tus acciones diarias?", de: "Accountability — hältst du deine täglichen Aktionen ein?", pt: "Responsabilidade — você está cumprindo suas ações diárias?" },
  "coach.kan_drieweg": { nl: "3-weg gesprek opzetten met sponsor (stap-voor-stap scripts + geslacht keuze)", en: "Set up a 3-way conversation with sponsor (step-by-step scripts + gender selection)", fr: "Mettre en place une conversation à 3 avec le sponsor (scripts étape par étape)", es: "Organizar conversación a 3 con el sponsor (scripts paso a paso)", de: "3-Wege-Gespräch mit Sponsor einrichten (Schritt-für-Schritt-Skripte)", pt: "Organizar conversa a 3 com o sponsor (scripts passo a passo)" },
  "coach.snel.drieweg": { nl: "3-weg gesprek", en: "3-way chat", fr: "Chat à 3", es: "Chat a 3", de: "3-Wege-Chat", pt: "Chat a 3" },
  "coach.snel.mentor": { nl: "Mentor gesprek", en: "Mentor chat", fr: "Discussion mentor", es: "Conversación mentor", de: "Mentor-Gespräch", pt: "Conversa mentor" },

  // ===== STATS EXTRA =====
  "stats.vorige_dagen": { nl: "Vorige dagen aanvullen", en: "Fill in previous days", fr: "Compléter les jours précédents", es: "Completar días anteriores", de: "Vorherige Tage ausfüllen", pt: "Preencher dias anteriores" },
  "stats.datum_kiezen": { nl: "Kies een datum", en: "Choose a date", fr: "Choisir une date", es: "Elegir una fecha", de: "Datum wählen", pt: "Escolher uma data" },
};

export function vertaal(sleutel: string, taal: Taal = "nl"): string {
  return t[sleutel]?.[taal] || t[sleutel]?.["nl"] || sleutel;
}
