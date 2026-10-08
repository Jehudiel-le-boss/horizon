# Horizon — feuille de route vers la mise en production

> Document de cadrage des travaux restant à réaliser pour transformer la maquette en application de suivi des frais scolaires utilisable en production.
>
> **État du document :** préparé le 7 octobre 2026 à partir du dépôt `main`.
> **État du produit :** maquette frontend Next.js avec Supabase Auth, schéma PostgreSQL initial, protections RLS et contrôle d’accès par adhésion/lien vérifié ; les API métier, les comptes autorisés de l’établissement et les données réelles restent à brancher.

## 1. Objectif et périmètre

Horizon doit permettre à un établissement scolaire et aux familles de gérer les frais annuels, échéanciers, paiements, reçus et notifications.

### Espace famille

- Consulter les enfants associés, leur classe et leur situation financière.
- Consulter les frais, le solde dû et les échéances.
- Retrouver les paiements et télécharger/consulter des reçus.
- Recevoir les notifications de l’établissement.
- Mettre à jour son profil et ses préférences.
- À confirmer : effectuer un paiement en ligne ou seulement consulter les paiements enregistrés par l’école.

### Espace administration

- Administrer les classes, apprenants, parents et années scolaires.
- Définir les frais, échéanciers et dates d’échéance.
- Enregistrer, rapprocher et corriger les paiements.
- Produire des reçus et des rapports fiables.
- Notifier les familles et gérer les paramètres de l’établissement.
- À confirmer : rôles supplémentaires (comptable, direction, agent de caisse) et permissions associées.

### Contraintes métier déjà visibles dans la maquette

- Interface en français et montants en FCFA.
- Parcours parent et administration séparés sous `/parent` et `/admin`.
- Données de démonstration existantes à conserver pendant la transition backend.
- Les données mockées ne sont pas des données de production : certaines statistiques et résumés du tableau de bord sont encore illustratifs.

## 2. État actuel

### Déjà en place

- Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui et Lucide React.
- Routes distinctes pour la page publique, la connexion, l’espace parent et l’administration.
- Composants organisés par domaine (`parent`, `admin`, `portal`, `auth`, `marketing`, `shared`).
- Maquette responsive et parcours frontend de démonstration.
- Données initiales dans `lib/mock-data.ts`.
- Création de données, recherches, filtres, reçus simulés, exports CSV et notifications simulées dans plusieurs écrans.
- État de démonstration partagé entre les pages du portail et conservé dans `sessionStorage`.
- Build de production et contrôle TypeScript précédemment validés.

### Pas encore en place — bloque l’utilisation réelle

- Aucune API métier.
- Le schéma PostgreSQL initial et ses politiques RLS sont installés ; aucune donnée scolaire réelle n’a été créée.
- La connexion, la récupération de mot de passe et le contrôle serveur Supabase Auth sont branchés. L’administration exige une adhésion de personnel active ; l’espace parent exige un lien parent-enfant vérifié. La base ne contient pas encore de comptes/adhésions autorisés.
- Prisma a introspecté les entités de l’application ; Supabase Auth reste géré par Supabase et les migrations SQL demeurent la source de vérité pour les contraintes, fonctions et politiques RLS.
- Les écrans métier restent alimentés par les mocks ; le produit cible une seule école par déploiement.
- Aucune personnalisation persistée (identité, logo, année scolaire et paramètres métier propres à cette installation).
- Aucun encaissement en ligne ni rapprochement de transactions avec un prestataire.
- Aucune intégration d’envoi SMS/e-mail.
- Aucune génération de reçu certifiée côté serveur.
- Aucun déploiement de production, nom de domaine ou environnement de secrets documenté.
- Les formulaires métier restent des interactions de maquette ; le mode démo explicite conserve les données fictives en développement.

## 3. Plan de travail

Les cases sont à cocher au fil du développement. Les phases dépendent des décisions et accès indiqués plus bas.

### Phase 0 — Cadrer le produit et les règles de gestion

- [x] Définir le modèle de service : une école cliente par déploiement. `school_id` est une clé interne de propriété des données de cette installation, pas une fonctionnalité de plateforme multi-écoles.
- [ ] Préparer un démarrage rapide pour une future école : nouvelle installation isolée, fiche établissement, logo/couleurs, années, classes, tarifs, échéanciers et modèles de reçus configurables sans branche applicative spécifique.
- [x] Confirmer le pays d’exploitation, la devise (FCFA/XOF), le fuseau horaire et le format des dates : Bénin, XOF/FCFA, fuseau `Africa/Porto-Novo`, interface en français.
- [x] Définir l’année scolaire et les statuts d’admission : chaque inscription est rattachée à une année et à une classe ; une inscription reste en attente tant que l’administration n’a pas accepté/refusé le dossier. Un parent peut confirmer une association proposée, mais ne peut pas s’auto-déclarer admis.
- [x] Définir le lien parent-enfant : invitation créée par l’école ou l’administration, acceptation/vérification par le parent, puis validation par l’école avant accès aux données sensibles. Aucune recherche libre ne doit permettre de découvrir des élèves.
- [x] Définir les rôles initiaux : `owner` (configuration globale), `director` (gestion complète), `accountant` (frais, rapports, remboursements/corrections autorisés), `cashier` (enregistrement des paiements manuels, lecture limitée) et `parent` (lecture limitée à ses enfants, reçu et profil). Appliquer le moindre privilège côté base/API.
- [x] Définir les états de paiement : `pending`, `confirmed`, `failed`, `cancelled`, `refund_pending`, `partially_refunded`, `refunded`. Pour FedaPay, une redirection navigateur ne confirme jamais le paiement : seule la vérification serveur/webhook authentifié confirme. Un paiement comptant/manual n’est confirmé qu’après enregistrement par un rôle autorisé.
- [x] Définir la politique de correction : ne jamais supprimer ni réécrire silencieusement un paiement confirmé ; remboursement/annulation par écriture compensatrice, motif, acteur et événement d’audit.
- [x] Définir la règle de reçu : numéro unique séquentiel par établissement/année scolaire, émis uniquement à la confirmation, français et XOF, données figées au moment de l’émission ; en cas de remboursement, conserver le reçu original et émettre une trace/reçu correctif. Ne pas présenter comme facture fiscale sans validation comptable/légale locale.
- [x] Définir les canaux prévus : e-mail, WhatsApp et notification temps réel ; le fournisseur, les modèles, l’opt-in, les coûts et les règles WhatsApp restent à décider avant leur activation. L’in-app reste la source de vérité.
- [x] Définir le principe de confidentialité : minimiser les données, vérifier les liens d’accès, journaliser les consultations/modifications sensibles, ne jamais stocker de données de carte ; faire confirmer par l’établissement/conseil local les mentions légales et durées obligatoires au Bénin avant production.
- [x] Définir les données de test : fixtures synthétiques/anonymisées, identifiants et contacts factices, clés sandbox seulement ; aucun dossier réel d’élève/parent dans Git ou les tests.
- [x] Choisir le backend : Supabase (PostgreSQL, Auth, RLS et Storage à évaluer).
- [x] Confirmer le paiement : modèle hybride (saisie de paiement physique + paiement en ligne FedaPay, sandbox obligatoire avant production).
- [x] Confirmer l’hébergement : Vercel gratuit pour les aperçus/MVP après vérification de ses limites et conditions, puis migration possible vers un VPS avec domaine.

**Décisions qui restent à valider avant production :** échéances légales de conservation, contenus légaux, validation fiscale des reçus, fournisseurs e-mail/WhatsApp et moyens FedaPay effectivement disponibles sur le compte marchand béninois. Les recommandations ci-dessus sont les valeurs de départ du modèle, pas un avis juridique ou comptable.

**Livrable :** règles de gestion confirmées et critères d’acceptation pour chaque rôle.

### Phase 1 — Architecture backend, environnements et sécurité

- [x] Choisir la base de données et la cible initiale : Supabase/PostgreSQL ; Vercel pour l’application Next.js avant éventuelle migration vers VPS. : superbase  et hebergement grtuit sur vercel après vps + nom de domaine, tout le projet est en next
- [ ] Créer les environnements `development`, `staging` et `production` ainsi que leurs bases distinctes.
- [x] Préparer `.env.example`, les clients Supabase navigateur/serveur et le `proxy.ts` de renouvellement de session Next.js 16 ; conserver la maquette si aucune configuration Supabase n’est fournie.
- [x] Brancher l’authentification par e-mail/mot de passe, le callback de récupération et le contrôle serveur initial sur les routes parent/administration ; le mode démo reste distinct et limité au développement.
- [x] Ajouter Prisma 7 avec l’adaptateur PostgreSQL ; utiliser la connexion Supavisor poolée à l’exécution et une transaction serveur qui vérifie l’utilisateur Supabase puis rétablit le rôle et les claims RLS. Les migrations SQL Supabase restent la source de vérité.
- [x] Ébaucher le schéma relationnel versionné : établissements, rôles, années/classes, familles/apprenants/inscriptions, frais/plans, factures/paiements/remboursements/reçus, audit et notifications.
- [x] Ajouter `DATABASE_URL` et `DIRECT_URL`, appliquer et enregistrer les migrations initiales, introspecter le schéma avec Prisma et générer le client ; seul le schéma, sans fixtures métier, a été créé.
- [x] Vérifier l’isolation RLS avec des identités et dossiers synthétiques transactionnels (direction, parent avec lien vérifié et utilisateur sans lien) ; annuler toutes les fixtures après test.
- [ ] Définir une stratégie de persistance des données mockées et d’import initial contrôlé.
- [x] Définir des schémas Zod réutilisables pour valider les formulaires de paiement manuel, parent, apprenant, classe et échéancier avant toute écriture.
- [ ] Définir la validation d’entrée côté serveur et les réponses d’erreur typées.
- [ ] Ajouter journalisation structurée, corrélation des requêtes et suivi des erreurs, sans secrets ni données sensibles dans les logs.
- [ ] Mettre en place sauvegardes automatiques, rétention, test de restauration et procédure de reprise.
- [ ] Ajouter limitation de débit sur connexion, OTP, récupération de mot de passe et endpoints publics.
- [ ] Configurer CORS/CSRF, cookies sécurisés, en-têtes de sécurité et politique CSP adaptée à Next.js.
- [ ] Vérifier la séparation des données entre rôles/familles au niveau API et base de données ; une installation correspond à une seule école.
- [ ] Définir la gestion des clés et secrets : coffre de secrets du fournisseur, rotation et séparation par environnement.
- [ ] Établir les règles de migration sans supprimer les mocks avant validation de la parité fonctionnelle.

**Livrable :** environnement de staging avec schéma versionné, accès restreints et sauvegarde restaurable.

### Phase 2 — Modèle de données et API métier

- [x] Versionner une migration initiale des entités `School`, `SchoolYear`, `User/Profile`, `Role`, `Parent/Guardian`, `Student`, `Class` et `Enrollment`.
- [x] Versionner `FeeCategory`, `FeeConfiguration`, `PaymentPlan`, `Installment`, `Invoice`, `Payment`, `Refund`, `Receipt`, `AuditEvent` et les notifications.
- [ ] Définir identifiants stables, unicité, clés étrangères, index et règles d’archivage.
- [x] Utiliser des montants en unités entières de FCFA/XOF, jamais des nombres flottants dans le modèle SQL.
- [x] Définir une première commande transactionnelle idempotente de paiement manuel, avec contrôle de rôle, reçu figé et journal d’audit.
- [x] Centraliser le parsing/formatage XOF entier et vérifier les montants des formulaires mockés contre le solde restant.
- [ ] Valider les contraintes, transitions d’état, RLS et comportements concurrents en base de développement.
- [ ] Ajouter les écritures de remboursement/correction et les traitements FedaPay confirmés côté serveur.
- [ ] Ajouter API serveur pour les opérations de lecture/écriture, pagination, tri, filtres et recherche.
- [ ] Ajouter validation de permissions au niveau de chaque ressource et endpoint.
- [ ] Ajouter idempotence aux opérations susceptibles d’être réessayées (paiement, webhook, émission de reçu).
- [ ] Définir un contrat d’API et les erreurs métier : non autorisé, conflit, donnée invalide, introuvable, indisponibilité.
- [ ] Écrire les migrations et jeux de seeds uniquement pour `development`/`staging`.

**Livrable :** API documentée, migrations testées et tests d’intégration de base.

### Phase 3 — Authentification et gestion des accès

- [x] Choisir Supabase Auth et préparer les clients SSR navigateur/serveur ainsi que le renouvellement de session par Proxy.
- [x] Brancher la connexion e-mail/mot de passe au fournisseur d’identité ; remplacer les mots de passe préremplis par un accès démo explicite limité au développement.
- [x] Implémenter connexion réelle avec vérification d’identité.
- [x] Implémenter déconnexion réelle ; le renouvellement de session est préparé par Proxy.
- [ ] Ajouter les URL locales et de production de `/auth/callback` aux URL de redirection autorisées dans la configuration Supabase Auth.
- [ ] Implémenter invitation/activation de compte parent et association sécurisée aux enfants.
- [ ] Implémenter création/invitation des comptes d’administration et activation contrôlée.
- [x] Implémenter récupération et changement de mot de passe sans révéler l’existence d’un compte.
- [ ] Si nécessaire, mettre en place vérification par SMS/e-mail/OTP, expiration et limitation des tentatives.
- [x] Vérifier côté serveur une adhésion de personnel active ou un lien parent-enfant vérifié, dans une transaction Prisma qui transmet l’identité Supabase à RLS ; ne pas accorder l’accès sur le seul choix UI ou `app_metadata`.
- [ ] Ajouter protection contre brute force, réutilisation de jetons, fixation de session et élévation de privilèges.
- [ ] Valider les scénarios de compte désactivé, utilisateur supprimé, invitation expirée et accès révoqué.

**Livrable :** tests de permission démontrant qu’un parent ne peut consulter que les enfants qui lui sont associés.

### Phase 4 — Rendre les modules parent et administration réellement persistants

#### Familles, apprenants et classes

- [ ] Remplacer les listes mockées dans les écrans apprenants, parents, enfants et classes par l’API.
- [ ] Créer, modifier, archiver et consulter dossiers parents/apprenants avec validation côté serveur.
- [ ] Gérer les associations parent/enfant et les changements d’année/classe.
- [ ] Prévenir les doublons de dossiers selon des règles explicites ; tracer les modifications.
- [ ] Ajouter états de chargement, erreurs réseau, absence de résultats et reprise après erreur.
- [ ] Vérifier que les recherches, filtres, tris et pagination sont réellement côté serveur si le volume l’exige.

#### Frais et échéanciers

- [ ] Remplacer les configurations locales de frais par des configurations persistées par année/niveau/classe.
- [ ] Gérer catégories, montants, activation, exceptions et historique des changements.
- [x] Relier chaque échéancier à une ou plusieurs classes créées dans l’administration (maquette et schéma).
- [x] Définir le plan comme un calendrier de tranches : les montants sont calculés d’après les frais propres à chaque apprenant, même lorsqu’un plan vise plusieurs classes.
- [ ] Gérer plans, nombre de tranches, dates limites et statut actif/archivé.
- [ ] Valider les totaux, arrondis, échéances et soldes côté serveur.
- [ ] Définir ce qui arrive aux échéanciers déjà affectés lorsqu’une configuration est modifiée.
- [ ] Calculer les soldes à partir des écritures validées plutôt que des valeurs libres du navigateur.

#### Paiements, reçus et caisse

- [ ] Remplacer l’enregistrement de paiement simulé par une commande API autorisée.
- [ ] Prendre en charge les paiements enregistrés manuellement (mode, date, référence, utilisateur, commentaire).
- [ ] Détecter références en double et éviter qu’un navigateur puisse déclarer arbitrairement un paiement comme payé.
- [ ] Calculer et mettre à jour soldes dans une transaction cohérente ; gérer paiements partiels et surpaiements selon la règle décidée.
- [ ] Générer un reçu côté serveur à partir d’un paiement confirmé, avec référence immuable et données exactes.
- [ ] Produire un PDF téléchargeable/imprimable, puis tester impression sur mobile et desktop.
- [ ] Gérer annulations/remboursements par écritures correctrices, rôles autorisés et motif obligatoire.
- [ ] Ajouter rapprochement de caisse et export de clôture si requis.
- [ ] Séparer reçus de paiement validé et tentative de paiement en ligne.

#### Notifications et paramètres

- [ ] Enregistrer les notifications envoyées et leur état de distribution/échec.
- [ ] Contrôler précisément les destinataires par établissement, classe, niveau ou famille.
- [ ] Implémenter préférences et consentements, désinscription si légalement applicable, relance et déduplication.
- [ ] Persister les préférences de compte, le profil et les réglages d’établissement.
- [ ] Remplacer la sélection locale de logo par un stockage de fichiers sécurisé.

**Livrable :** les parcours métier fonctionnent après actualisation, fermeture de session et connexion depuis un autre appareil.

### Phase 5 — Passerelle de paiement (si paiement en ligne retenu)

- [ ] Choisir un prestataire actif dans le pays cible et les moyens voulus (ex. Mobile Money, carte, Wave selon disponibilité contractuelle).
- [ ] Créer les comptes marchands et obtenir les identifiants de sandbox avant toute clé de production.
- [ ] Définir initiation, redirection/confirmation, expiration, annulation et rapprochement.
- [ ] Créer des endpoints serveur pour initier et vérifier une transaction ; ne jamais placer une clé secrète dans le navigateur.
- [ ] Vérifier signature, horodatage, montant, devise, référence, bénéficiaire et idempotence des webhooks.
- [ ] Ne marquer payé qu’après vérification côté serveur auprès du prestataire.
- [ ] Traiter webhooks dupliqués, désordonnés, absents et rejoués ; fournir une tâche de rapprochement.
- [ ] Ajouter l’écran d’état des transactions et les procédures de remboursement/contestations.
- [ ] Tester en sandbox toutes les issues et faire approuver un test de paiement réel de faible montant avant lancement.
- [ ] Documenter responsabilités contractuelles, commissions et délais de règlement.

**Livrable :** matrice de tests sandbox réussie et rapprochement comptable vérifié par l’établissement.

### Phase 6 — SMS, e-mail et stockage de fichiers

- [ ] Choisir fournisseur SMS, expéditeur/nom d’émetteur et règles d’opt-in.
- [ ] Choisir fournisseur transactionnel e-mail et valider domaine d’envoi (SPF, DKIM, DMARC).
- [ ] Créer des modèles en français pour invitation, OTP, paiement confirmé, rappel d’échéance et reçu.
- [ ] Envoyer via file d’attente/retry ; enregistrer succès/échec sans bloquer les opérations métier.
- [ ] Définir le stockage privé des PDF et pièces jointes, URL signées et expiration.
- [ ] Valider type MIME, taille, antivirus et autorisation sur téléversement/téléchargement.

**Livrable :** messages de test reçus et fichiers privés non accessibles sans permission.

### Phase 7 — Rapports, recherche et exports

- [x] Remplacer les chiffres financiers et nombres d’apprenants du tableau de bord/rapport par des agrégations cohérentes sur les données mockées, clairement présentées comme démonstration.
- [x] Calculer les totaux et taux de recouvrement par niveau depuis les montants de chaque dossier et tester la réconciliation attendu = encaissé + restant.
- [x] Calculer l’historique visible des paiements par mode et rendre disponible un export CSV du rapport mocké.
- [x] Remplacer les barres de démonstration figées par un graphique mensuel responsive (Recharts) calculé depuis l’historique des paiements mockés.
- [x] Rendre les tableaux de paiements plus accessibles : libellés sémantiques, statut avec badge adapté et état vide.
- [ ] Définir les indicateurs comptables et leur période de calcul avec l’établissement.
- [ ] Ajouter filtres année, niveau, classe, période, statut et méthode ; harmoniser leur application entre pages.
- [x] Vérifier que total attendu, encaissé et restant se réconcilient et que le taux de recouvrement est calculé sur les dossiers mockés.
- [ ] Compléter les exports CSV/Excel et ajouter génération PDF serveur si demandée.
- [ ] Empêcher l’export de données hors périmètre de l’utilisateur.
- [ ] Tester les exports avec accents, montants, gros volumes et ouverture dans Excel.

**Livrable :** rapprochement vérifié entre rapports, paiements et reçus d’un jeu de données connu.

### Phase 8 — Qualité fonctionnelle, accessibilité et responsive

- [ ] Tester toutes les routes publiques, parent et administration sur desktop, tablette et mobile.
- [ ] Tester dialogues : Escape, fermeture au clic extérieur, focus, lecteur d’écran et navigation clavier.
- [x] Piéger le focus des fenêtres modales, gérer Escape et restaurer le focus après fermeture.
- [ ] Vérifier formulaires : labels, erreurs accessibles, champs requis, formats et doubles soumissions.
- [ ] Contrôler débordements des tableaux, filtres et modales sur petites largeurs.
- [ ] Ajouter tests unitaires aux calculs de montants, soldes, échéances, statuts et permissions.
- [x] Ajouter un premier jeu de tests unitaires sans service externe pour montants XOF et validations d’entrée des formulaires.
- [x] Tester les agrégations financières, le taux par niveau, l’historique par mode, l’absence de données et l’incohérence de surpaiement.
- [ ] Ajouter tests d’intégration des API et tests end-to-end des parcours critiques.
- [ ] Ajouter tests spécifiques aux webhooks/paiements, concurrence et relances.
- [ ] Tester fuseaux horaires, changement de jour/année et limites d’arrondi monétaire.
- [ ] Vérifier les états vides, chargement lent, indisponibilité backend et erreurs de fournisseur.
- [ ] Faire une revue accessibilité (clavier, contraste, lecteurs d’écran) et corriger les blocages WCAG prioritaires.
- [x] Auditer les dépendances de production (`pnpm audit --prod`) : aucune vulnérabilité connue détectée.
- [ ] Résoudre l’alerte élevée de `braces@3.0.3` dans l’outil shadcn de développement ; le registre npm consulté ne publie pas encore la version corrective annoncée `3.0.4`.
- [ ] Compléter l’audit de toutes les dépendances et le contrôle des secrets avant release.

**Parcours end-to-end minimum**

1. L’administration invite un parent et lui associe un apprenant.
2. L’administration configure des frais et un plan de paiement.
3. Le parent se connecte, ne voit que sa famille et consulte le solde/échéancier.
4. Un paiement manuel ou en ligne est enregistré une seule fois.
5. Le solde, l’historique, le reçu et la notification sont cohérents.
6. L’administration retrouve le paiement, le reçu et les rapports correspondants.
7. Une autre famille de la même école ne peut accéder à aucune donnée non associée à ses enfants.

### Phase 9 — Exploitation et lancement

- [ ] Choisir plateforme d’hébergement Next.js, région de données et méthode de déploiement.
- [ ] Définir nom de domaine, DNS, HTTPS et environnements preview/staging/production.
- [x] Ajouter une CI GitHub Actions sans clés pour le formatage, l’audit des dépendances de production, TypeScript, les tests et le build.
- [ ] Ajouter la vérification des migrations et les règles de promotion staging/production à la CI.
- [ ] Empêcher les migrations destructives et demander validation avant migration de production.
- [ ] Configurer suivi erreurs, disponibilité, alertes, journaux et métriques sans données personnelles.
- [ ] Documenter sauvegarde/restauration, incidents, contact opérateur et procédure de retour arrière.
- [ ] Préparer conditions d’utilisation, confidentialité, mentions légales et support utilisateurs.
- [ ] Former les administrateurs et définir le processus de première importation des données réelles.
- [ ] Réaliser recette métier/UAT signée par l’établissement.
- [ ] Effectuer pilote avec petit groupe, observer les erreurs et corriger avant ouverture générale.
- [ ] Définir support après lancement, délais de réponse, demandes de correction et calendrier de maintenance.

## 4. Accès et secrets à fournir — uniquement selon les choix de prestataires

**Ne colle jamais un mot de passe, une clé privée, un token ou un secret ici dans la conversation, dans un ticket, ni dans Git.** Les valeurs doivent être ajoutées par toi dans `.env.local` pour le développement et dans la configuration secrète du fournisseur d’hébergement pour staging/production. Le fichier `.env.local` ne doit jamais être commité. Le modèle `.env.example` ne contient que les noms de variables, sans valeur réelle.

| Besoin | Accès/valeur à obtenir | Quand | Sensibilité |
|---|---|---|---|
| Base de données / Prisma | `DATABASE_URL` via le pooler de transaction Supavisor pour l’application et `DIRECT_URL` pour introspection/commandes Prisma ; mot de passe PostgreSQL de l’environnement | Avant le branchement des données ; une paire par environnement | Secrets serveur ; ne jamais préfixer par `NEXT_PUBLIC_` |
| Supabase Auth | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ; `SUPABASE_SERVICE_ROLE_KEY` uniquement si une opération serveur privilégiée le nécessite | Phase 3 | Clé publishable prévue pour le navigateur ; clé service strictement serveur |
| Authentification propriétaire, si choisie | Clé de signature des sessions (`AUTH_SECRET`) et configuration de l’URL de callback | Phase 3 | Secret serveur, aléatoire, différent par environnement |
| E-mail transactionnel | API key, domaine d’envoi vérifié, adresses expéditeur et reply-to | Phase 6 | API key secrète |
| SMS/OTP | API key/secret, Sender ID autorisé, crédits de test et documentation régionale | Phases 3 et 6 | Secret serveur |
| Paiement en ligne (optionnel) | Compte marchand, clés sandbox, identifiant marchand/site, secret de signature webhook, URL de callback | Phase 5 | Secrets serveur ; commencer par sandbox |
| Stockage fichiers (si différent du backend) | Bucket/projet, région, politique privée et identifiants serveur | Phase 6 | Secret serveur si credentials d’accès |
| Hébergement | Compte projet, droits de déploiement, variables secrètes et accès DNS si domaine géré séparément | Phase 9 | Accès administrateur ; utiliser les rôles minimums |
| Domaine e-mail/site | Accès DNS ou personne capable d’ajouter les enregistrements demandés (A/CNAME, SPF, DKIM, DMARC) | Phases 6 et 9 | Ne pas transmettre de mot de passe DNS ; déléguer les changements nécessaires |
| Identité visuelle | Logo haute définition, couleurs validées, coordonnées officielles et contenu légal | Avant recette | Pas un secret |
| Paramètres école | Année scolaire, niveaux/classes, catégories, montants, dates, reçus types et utilisateurs autorisés | Avant recette | Données à transmettre par canal approuvé ; éviter les données élèves inutiles |
| Mentions et conformité | Entité légale, pays, contact confidentialité/support, durée de conservation approuvée | Avant mise en production | Informations de l’établissement |

### Variables d’environnement indicatives

Configurer ces valeurs comme secrets serveur dans chaque environnement ; les formats de connexion PostgreSQL et paramètres TLS sont documentés dans `.env.example`. Ne pas ajouter de valeurs de production au dépôt.

```dotenv
# Supabase — URL et clé publishable côté navigateur
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Supabase Auth — optionnel, réservé aux opérations serveur privilégiées
SUPABASE_SERVICE_ROLE_KEY=

# PostgreSQL / Prisma — côté serveur uniquement
DATABASE_URL=
DIRECT_URL=

# FedaPay — credentials serveur, sandbox d’abord
FEDAPAY_ENV=test
FEDAPAY_SECRET_KEY=
FEDAPAY_PUBLIC_KEY=
FEDAPAY_WEBHOOK_SECRET=

# Notifications transactionnelles
EMAIL_API_KEY=
EMAIL_FROM=
SMS_API_KEY=
SMS_SENDER_ID=

# Stockage privé, si nécessaire
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
```

- [ ] Ajouter `.env.example` avec uniquement les noms et valeurs factices/vides.
- [ ] Vérifier que `.env.local`, clés privées, exports de production et certificats sont ignorés par Git.
- [ ] Ne mettre un préfixe `NEXT_PUBLIC_` qu’aux valeurs expressément conçues pour être visibles dans le navigateur.
- [ ] Ne jamais mettre `AUTH_SERVICE_ROLE_KEY`, secrets paiement, SMTP/SMS, DB credentials ou webhook secret en variable publique.
- [ ] Si une clé est exposée par erreur : la révoquer/faire tourner immédiatement, puis nettoyer l’historique Git selon une procédure dédiée.

### Informations métier à confirmer — elles ne sont pas des clés

- [x] Produit destiné à une seule école par déploiement ; les futures écoles auront leur propre installation personnalisable.
- [ ] Pays, fuseau horaire, devise et formats de date.
- [ ] Paiement en ligne ou encaissement enregistré par l’administration seulement.
- [ ] Prestataire(s) de paiement souhaité(s) et moyens réellement actifs pour l’établissement.
- [ ] Fournisseurs SMS et e-mail préférés, ou préférence pour un seul fournisseur.
- [ ] Règles d’admission des parents et de vérification du lien avec les enfants.
- [ ] Rôles d’administration et capacité à corriger/rembourser un paiement.
- [ ] Formats requis pour les reçus et rapports (PDF, CSV, Excel).
- [ ] Politique de conservation des données et exigences légales du pays.

## 5. Décision blockchain

**La blockchain n’est pas nécessaire pour ce projet et n’est pas recommandée pour la première version.**

Le besoin principal est un registre de paiements exact, contrôlé par l’établissement, consultable par les familles et rapproché avec un prestataire de paiement. Une base de données relationnelle transactionnelle, un journal d’audit append-only, des sauvegardes, des reçus numérotés et des webhooks signés répondent à ces besoins avec moins de coûts et de complexité.

Une blockchain ajouterait notamment gestion de portefeuille/clefs, frais et volatilité éventuels, intégration de paiements en monnaie locale, difficulté de correction/suppression face aux obligations de confidentialité, et davantage de support utilisateur. Elle ne garantit pas qu’une saisie manuelle initiale soit vraie, ni qu’un webhook fournisseur ait été traité correctement.

À réévaluer seulement si un besoin concret apparaît : plusieurs organisations indépendantes doivent vérifier un historique commun sans opérateur de confiance, et un audit démontre qu’un journal classique avec contrôle d’accès, signatures, sauvegardes hors site et audits indépendants est insuffisant. Même alors, commencer par un journal d’audit inviolable et des exports signés plutôt que par des paiements en cryptomonnaie.

## 6. Ordre de livraison recommandé

1. Valider les règles et le périmètre MVP (Phase 0).
2. Choisir backend, identité, hébergement et politique de données ; créer staging (Phases 1–2).
3. Faire fonctionner comptes, permissions, familles, apprenants, frais et échéanciers (Phases 3–4).
4. Livrer d’abord paiement manuel fiable ; intégrer une passerelle seulement si nécessaire (Phase 5).
5. Ajouter notifications, rapports, exports, observabilité et recettes (Phases 6–8).
6. Piloter, former, sécuriser et mettre en production (Phase 9).

## 7. Définition de « prêt à lancer »

- [ ] Aucune page métier ne dépend des mocks pour afficher ou écrire des données de production.
- [ ] Les droits parent/admin sont appliqués côté serveur et validés par tests.
- [ ] Les paiements et soldes sont cohérents, uniques, auditables et rapprochables.
- [ ] Les reçus ne peuvent être émis comme validés que pour des paiements vérifiés.
- [ ] Aucun secret n’est présent dans le dépôt, le bundle client ou les logs.
- [ ] Sauvegarde et restauration ont été exécutées avec succès.
- [ ] Tests automatisés des règles financières et parcours critiques réussis.
- [ ] Recette mobile/desktop, accessibilité prioritaire et recette métier acceptées.
- [ ] Alertes, support, procédure incident et retour arrière sont documentés.
- [ ] Les responsables de l’établissement ont approuvé les textes légaux, données réelles, paramètres et mise en ligne.
