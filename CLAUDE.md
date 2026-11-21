# Ma poésie — consignes pour Claude

## Le projet
- PWA en JavaScript pur (aucune étape de build) pour qu'un enfant de 8 ans (CE2) apprenne par cœur la poésie de la classe, seul, 5 à 7 minutes par jour, avec un adulte 2 minutes le soir.
- Tablette Android, Chrome. Interface en français. Toujours répondre en français.
- Données uniquement dans le localStorage de la tablette (`poesie.v1`, photos dans `poesie.photos.v1`) : aucun serveur applicatif, aucun compte.
- Conception et justifications pédagogiques : docs/conception.md. Vocabulaire : CONTEXT.md (respecter ces mots dans le code et l'interface).
- Ne pas publier sur un site public : les poésies de classe sont souvent sous droit d'auteur. Hébergement sur le serveur de la maison (deploy/).

## Structure
- index.html, manifest.webmanifest, css/style.css, sw.js (constante VERSION — actuellement `poesie-v4`).
- js/ : audiokey (nom des fichiers voix), consignes (phrases dites à l'enfant), poem (lecture de poesie.txt), cues (niveaux d'indice), levels (niveau de chaque strophe), planner (planning jusqu'à la récitation), session (déroulé d'une séance), store, speech, dessin (feuille de dessin au stylet), app (écrans).
- poem, cues, levels, planner, session sont des fonctions pures testées : `npm test` (node --test), à lancer avant chaque mise en ligne.
- audio/voix/ : voix Denise (Azure) générée par `npm run voices` (vers, titre, mots difficiles, consignes). Clés AZURE_SPEECH_KEY et AZURE_SPEECH_REGION dans .env (ignoré par git) : ne jamais les afficher ni les commiter.
- Tout nouveau fichier servi par l'appli doit être ajouté à ASSETS dans sw.js (sauf les voix, mises en cache au premier usage).
- Essai sur le PC : `npm run serve` puis http://localhost:8080 ; `?jour=AAAA-MM-JJ` simule une autre date.

## Nouvelle poésie
Le parent envoie la photo de la feuille. Transcrire dans poesie.txt :
- `# Titre`, `@ Auteur`, `= AAAA-MM-JJ` (date de récitation), `! mot | explication simple pour un CE2`.
- Avant chaque strophe : `> émoji | geste : idée de geste simple` (proposer, le parent et l'enfant changeront).
- Strophe de plus de 4 vers : la couper en groupes de sens de 2 à 4 vers (une image chacun) avec une ligne `> émoji | geste : …` à l'intérieur de la strophe, SANS ligne vide (la ligne vide reste réservée aux strophes de la feuille).
- Les vers EXACTEMENT comme sur la feuille : ponctuation, majuscules, apostrophes. Une ligne vide entre les strophes.
- Montrer la transcription au parent pour vérification AVANT tout le reste.
- Puis `npm run voices`, `npm test`, augmenter VERSION dans sw.js, et mettre en ligne.
- Un titre ou un auteur différent = nouvelle poésie : la progression repart de zéro, l'ancienne va dans l'archive. Garder le même titre et le même auteur pour une simple correction.

## Mettre en ligne (pour l'instant : GitHub Pages)
- Dépôt public spluckking/poesie, GitHub Pages sur la branche main (racine) : https://spluckking.github.io/poesie/
- Choix du parent (19/11/2026), en attendant le serveur de la maison : le texte de la poésie et sa lecture sont donc publics (page en noindex, robots.txt).
- Lancer les tests, augmenter VERSION dans sw.js, commit + push sur main. Sur la tablette : fermer puis rouvrir l'appli deux fois, avec internet.

## Plus tard (serveur de la maison)
Copier sur le serveur, dans deploy/site/ : index.html, manifest.webmanifest, sw.js, poesie.txt, css/, js/, fonts/, icons/, audio/. Puis `docker compose up -d` dans deploy/ (POESIE_HOST dans deploy/.env). Sur la tablette : fermer puis rouvrir l'appli deux fois.

## Règles d'apprentissage (à respecter)
- Rappel actif d'abord : chaque séance commence par ce qui est déjà appris, sans texte.
- Niveaux d'indice 0 à 5 par strophe ; +1 au plus une fois par jour, jamais le jour où la strophe est apprise ; −1 si ratée ; un vers soufflé ne compte pas comme réussi.
- La récitation du soir (adulte) prime sur l'auto-vérification.
- Rien de nouveau les 3 derniers jours ; répétition générale la veille.
- Une seule gommette par jour. Pas de séries de jours, pas de points, pas de mode libre à faire en boucle.
- Pas de défilement pendant la séance ; gros boutons ; toute consigne est dite à voix haute.
