export type StudentRecord = {
  id: string

  firstName: string

  lastName: string

  className: string

  level: string

  parent: string

  total: string

  paid: string

  remaining: string

  status: string
}

export const mockStudents: StudentRecord[] = [
  {
    id: "HZN-0261",

    firstName: "David",

    lastName: "Koffi",

    className: "CM2 A",

    level: "Primaire",

    parent: "Aminata Koffi",

    total: "450 000",

    paid: "300 000",

    remaining: "150 000",

    status: "À jour",
  },

  {
    id: "HZN-0258",

    firstName: "Sarah",

    lastName: "Koffi",

    className: "3ème B",

    level: "Secondaire",

    parent: "Aminata Koffi",

    total: "500 000",

    paid: "375 000",

    remaining: "125 000",

    status: "À jour",
  },

  {
    id: "HZN-0244",

    firstName: "Samuel",

    lastName: "Mensah",

    className: "6ème A",

    level: "Secondaire",

    parent: "Kojo Mensah",

    total: "500 000",

    paid: "200 000",

    remaining: "300 000",

    status: "En retard",
  },

  {
    id: "HZN-0231",

    firstName: "Grâce",

    lastName: "Koffi",

    className: "Grande Section",

    level: "Maternelle",

    parent: "Aminata Koffi",

    total: "300 000",

    paid: "100 000",

    remaining: "200 000",

    status: "À suivre",
  },

  {
    id: "HZN-0220",

    firstName: "Esther",

    lastName: "N’Guessan",

    className: "CE2 B",

    level: "Primaire",

    parent: "Marie N’Guessan",

    total: "350 000",

    paid: "350 000",

    remaining: "0",

    status: "Soldé",
  },
]

export type ParentRecord = {
  name: string

  phone: string

  email: string

  children: string

  due: string

  paid: string

  status: string
}

export const mockParents: ParentRecord[] = [
  {
    name: "Aminata Koffi",

    phone: "+225 07 00 00 00 00",

    email: "aminata.koffi@example.com",

    children: "3",

    due: "1 250 000",

    paid: "775 000",

    status: "À jour",
  },

  {
    name: "Kojo Mensah",

    phone: "+225 05 11 22 33 44",

    email: "kojo.m@example.com",

    children: "2",

    due: "900 000",

    paid: "400 000",

    status: "En retard",
  },

  {
    name: "Marie N’Guessan",

    phone: "+225 01 44 55 66 77",

    email: "marie.n@example.com",

    children: "1",

    due: "350 000",

    paid: "350 000",

    status: "Soldé",
  },

  {
    name: "Fatou Diarra",

    phone: "+225 07 88 99 00 11",

    email: "fatou.d@example.com",

    children: "2",

    due: "750 000",

    paid: "500 000",

    status: "À suivre",
  },
]

export type ClassRecord = {
  name: string

  level: "Maternelle" | "Primaire" | "Secondaire"
}

export const mockClasses: ClassRecord[] = [
  ...["Petite Section", "Moyenne Section", "Grande Section"].map((name) => ({
    name,

    level: "Maternelle" as const,
  })),

  ...["CI", "CP", "CE1", "CE2", "CM1", "CM2", "CE2 B", "CM2 A"].map((name) => ({
    name,
    level: "Primaire" as const,
  })),

  ...[
    "6ème",
    "5ème",
    "4ème",
    "3ème",
    "Seconde",
    "Première",
    "Terminale",
    "3ème B",
    "6ème A",
    "5ème A",
  ].map((name) => ({ name, level: "Secondaire" as const })),
]

export type PaymentPlanRecord = {
  name: string

  amount: string

  installments: string

  students: string

  status: string
}

export const mockPaymentPlans: PaymentPlanRecord[] = [
  {
    name: "Plan standard",

    amount: "450 000 FCFA",

    installments: "5 tranches",

    students: "642 apprenants",

    status: "Actif",
  },

  {
    name: "Plan trimestriel",

    amount: "450 000 FCFA",

    installments: "3 tranches",

    students: "164 apprenants",

    status: "Actif",
  },

  {
    name: "Paiement comptant",

    amount: "450 000 FCFA",

    installments: "1 tranche",

    students: "44 apprenants",

    status: "Actif",
  },
]

export type PaymentRecord = {
  date: string
  dateISO?: string

  student: string

  reference: string

  amount: string

  method: string

  status: string

  note?: string
}

export const mockPayments: PaymentRecord[] = [
  {
    date: "02 sept. 2026",
    dateISO: "2026-09-02",

    student: "David Koffi",

    reference: "PAY-2026-00125",

    amount: "100 000 FCFA",

    method: "Espèces",

    status: "Payé",
  },

  {
    date: "18 août 2026",
    dateISO: "2026-08-18",

    student: "Sarah Koffi",

    reference: "PAY-2026-00108",

    amount: "75 000 FCFA",

    method: "Mobile Money",

    status: "Payé",
  },

  {
    date: "05 août 2026",
    dateISO: "2026-08-05",

    student: "Grâce Koffi",

    reference: "PAY-2026-00094",

    amount: "50 000 FCFA",

    method: "Virement",

    status: "Payé",
  },

  {
    date: "12 juil. 2026",
    dateISO: "2026-07-12",

    student: "David Koffi",

    reference: "PAY-2026-00072",

    amount: "100 000 FCFA",

    method: "Mobile Money",

    status: "Payé",
  },
]

export type NotificationRecord = {
  id: string

  title: string

  message: string

  audience: string

  date: string

  channel: string

  category: "payment" | "due" | "info"

  read: boolean
}

export const mockNotifications: NotificationRecord[] = [
  {
    id: "notification-1",

    title: "Rappel échéance d’octobre",

    message: "Un montant de 50 000 FCFA est attendu le 15 octobre pour David.",

    audience: "Tous les parents",

    date: "Aujourd’hui, 08:30",

    channel: "Plateforme",

    category: "due",

    read: false,
  },

  {
    id: "notification-2",

    title: "Paiement bien enregistré",

    message:
      "Votre paiement de 100 000 FCFA du 02 septembre a bien été enregistré.",

    audience: "18 destinataires",

    date: "Hier, 17:45",

    channel: "Automatique",

    category: "payment",

    read: true,
  },

  {
    id: "notification-3",

    title: "Réunion de rentrée",

    message: "Retrouvez les informations de la réunion de rentrée.",

    audience: "Classe de CM2",

    date: "02 oct., 10:00",

    channel: "E-mail",

    category: "info",

    read: true,
  },
]

export const mockParentNotifications: NotificationRecord[] = [
  {
    id: "parent-notification-1",

    title: "Votre prochaine échéance arrive dans 9 jours.",

    message: "Un montant de 50 000 FCFA est attendu le 15 octobre pour David.",

    audience: "Famille Koffi",

    date: "Il y a 2 h",

    channel: "Plateforme",

    category: "due",

    read: false,
  },

  {
    id: "parent-notification-2",

    title: "Paiement enregistré avec succès",

    message:
      "Votre paiement de 100 000 FCFA du 02 septembre a bien été enregistré.",

    audience: "Famille Koffi",

    date: "02 sept.",

    channel: "Automatique",

    category: "payment",

    read: true,
  },

  {
    id: "parent-notification-3",

    title: "Reçu disponible",

    message: "Le reçu PAY-2026-00125 est disponible dans votre espace.",

    audience: "Famille Koffi",

    date: "02 sept.",

    channel: "Plateforme",

    category: "payment",

    read: true,
  },

  {
    id: "parent-notification-4",

    title: "Bienvenue sur votre nouvel espace",

    message:
      "Retrouvez ici toutes les informations financières de vos enfants.",

    audience: "Famille Koffi",

    date: "28 août",

    channel: "Plateforme",

    category: "info",

    read: true,
  },
]
