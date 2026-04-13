export type Taal = "nl" | "en" | "fr" | "es" | "de" | "pt";

export const TAAL_OPTIES: { code: Taal; label: string; vlag: string }[] = [
  { code: "nl", label: "Nederlands", vlag: "\u{1F1F3}\u{1F1F1}" },
  { code: "en", label: "English", vlag: "\u{1F1EC}\u{1F1E7}" },
  { code: "fr", label: "Fran\u00e7ais", vlag: "\u{1F1EB}\u{1F1F7}" },
  { code: "es", label: "Espa\u00f1ol", vlag: "\u{1F1EA}\u{1F1F8}" },
  { code: "de", label: "Deutsch", vlag: "\u{1F1E9}\u{1F1EA}" },
  { code: "pt", label: "Portugu\u00eas", vlag: "\u{1F1E7}\u{1F1F7}" },
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
    nl: "AI Coach", en: "AI Coach", fr: "Coach IA",
    es: "Coach IA", de: "KI Coach", pt: "Coach IA",
  },
  "nav.scripts": {
    nl: "Scripts", en: "Scripts", fr: "Scripts",
    es: "Guiones", de: "Skripte", pt: "Scripts",
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
    nl: "AI Coach raadplegen", en: "Consult AI Coach", fr: "Consulter le Coach IA",
    es: "Consultar Coach IA", de: "KI Coach befragen", pt: "Consultar Coach IA",
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
    nl: "AI Coach", en: "AI Coach", fr: "Coach IA",
    es: "Coach IA", de: "KI Coach", pt: "Coach IA",
  },
  "coach.subtitel": {
    nl: "Jouw persoonlijke DM & outreach coach \u2014 altijd klaar",
    en: "Your personal DM & outreach coach \u2014 always ready",
    fr: "Ton coach personnel DM & outreach \u2014 toujours pr\u00eat",
    es: "Tu coach personal de DM & outreach \u2014 siempre listo",
    de: "Dein pers\u00f6nlicher DM & Outreach Coach \u2014 immer bereit",
    pt: "Seu coach pessoal de DM & outreach \u2014 sempre pronto",
  },
  "coach.wat_kan": {
    nl: "Wat kan de coach voor jou doen?", en: "What can the coach do for you?",
    fr: "Que peut faire le coach pour toi ?", es: "\u00bfQu\u00e9 puede hacer el coach por ti?",
    de: "Was kann der Coach f\u00fcr dich tun?", pt: "O que o coach pode fazer por voc\u00ea?",
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
    nl: "Nog geen gesprekken. Start een nieuw gesprek met de coach!",
    en: "No conversations yet. Start a new conversation with the coach!",
    fr: "Pas encore de conversations. D\u00e9marre une nouvelle conversation avec le coach !",
    es: "\u00a1Sin conversaciones a\u00fan. \u00a1Inicia una nueva conversaci\u00f3n con el coach!",
    de: "Noch keine Gespr\u00e4che. Starte ein neues Gespr\u00e4ch mit dem Coach!",
    pt: "Sem conversas ainda. Comece uma nova conversa com o coach!",
  },
  "coach.placeholder": {
    nl: "Stel je vraag aan de coach...", en: "Ask the coach a question...",
    fr: "Pose ta question au coach...", es: "Haz tu pregunta al coach...",
    de: "Stelle dem Coach eine Frage...", pt: "Fa\u00e7a sua pergunta ao coach...",
  },
  "coach.stel_vraag": {
    nl: "Stel je vraag aan de coach of kies een snelle vraag hieronder.",
    en: "Ask the coach a question or choose a quick question below.",
    fr: "Pose ta question au coach ou choisis une question rapide ci-dessous.",
    es: "Haz tu pregunta al coach o elige una pregunta r\u00e1pida a continuaci\u00f3n.",
    de: "Stelle dem Coach eine Frage oder w\u00e4hle eine Schnellfrage unten.",
    pt: "Fa\u00e7a sua pergunta ao coach ou escolha uma pergunta r\u00e1pida abaixo.",
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
    nl: "+ Nieuw prospect", en: "+ New prospect", fr: "+ Nouveau prospect",
    es: "+ Nuevo prospecto", de: "+ Neuer Kontakt", pt: "+ Novo prospecto",
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
    nl: "De AI-coach stelt je een paar vragen over jouw situatie, je dromen en wat je echt drijft. Wees eerlijk \u2014 hoe opener je bent, hoe krachtiger je WHY wordt. Het duurt ongeveer 5 tot 10 minuten.",
    en: "The AI coach will ask you a few questions about your situation, your dreams and what truly drives you. Be honest \u2014 the more open you are, the more powerful your WHY becomes. It takes about 5 to 10 minutes.",
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
};

export function vertaal(sleutel: string, taal: Taal = "nl"): string {
  return t[sleutel]?.[taal] || t[sleutel]?.["nl"] || sleutel;
}
