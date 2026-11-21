# Poésie par cœur — document de conception

État : proposition, 19/11/2026. Décisions prises avec le parent (questions préalables) :

1. Ce qui compte : le **mot à mot, avec titre et auteur**. La diction se travaille avec l'adulte, l'appli ne la juge pas.
2. Appli **audio d'abord** (chaque vers peut être écouté), séances de **5 à 7 minutes**.
3. **Pas de micro en V1** : l'enfant récite à voix haute et se vérifie lui-même ; la reconnaissance vocale **locale** (sur le serveur de la maison) vient plus tard, seulement si elle se montre fiable.
4. Adulte : une **découverte** de 10 à 15 minutes, puis **2 minutes le soir avant le coucher**, sans écran. Saisie : photo de la feuille, transcrite par Claude.
5. **Appli séparée** de Dictée-Blocs, qui en reprend les briques ; **entretien léger** des anciennes poésies ; une seule récompense par jour.

Vocabulaire : voir [CONTEXT.md](../CONTEXT.md).

---

## 0. Ce que disent les sciences cognitives, et avec quelle confiance

| Principe | Niveau de preuve | Ce qu'on en fait |
|---|---|---|
| **Rappel actif** (effet test) : se forcer à retrouver le texte est bien plus efficace que le relire | **Très solide** (Roediger & Karpicke 2006 ; Dunlosky et al. 2013 le classent « utilité élevée », la relecture « faible ») | Chaque séance commence par un rappel sans texte. Le texte n'est jamais visible quand l'enfant n'en a pas besoin. |
| **Répétition espacée** : répartir sur plusieurs jours bat le bachotage, à temps total égal | **Très solide** (méta-analyse Cepeda et al. 2006) | Une strophe nouvelle tous les 1 à 3 jours ; chaque strophe revient les jours suivants ; pas de nouvelle matière les 3 derniers jours. |
| **Effet de production** : dire à voix haute retient mieux que lire en silence | **Solide** (MacLeod et al. 2010) | On récite toujours à voix haute. C'est aussi ce que demande la classe. |
| **Sommeil** : il consolide ce qui a été appris dans la journée | **Solide chez l'adulte, bien soutenu chez l'enfant** (Diekelmann & Born 2010 ; Wilhelm et al. 2008). L'idée qu'apprendre *juste avant* de dormir est mieux est **probable** mais moins certaine. | Récitation du soir juste avant le coucher, puis rappel à froid le lendemain : c'est ce rappel qui montre ce qui a vraiment tenu. |
| **Comprendre avant de mémoriser** : un texte compris s'apprend plus vite et dure plus longtemps | **Solide** (traitement en profondeur ; on retient mieux ce qui a du sens) | La découverte sert à comprendre : mots difficiles, de quoi ça parle, une image par strophe. Aucune mémorisation ce jour-là. |
| **Retour immédiat et bref** : corriger tout de suite évite de mémoriser une version fausse | **Solide** (Butler & Roediger 2008 : un test suivi d'une correction > un test seul) | Après chaque vers, on révèle et on écoute la bonne version. Un seul mot de retour, pas de leçon. |
| **Difficulté désirable** : un rappel un peu difficile renforce davantage | **Solide chez l'adulte** (Bjork). **À doser chez l'enfant** : trop d'échecs démotive, le taux de réussite doit rester élevé (environ 80 %). | Indices qui s'estompent : on retire un appui dès que l'enfant réussit, on en remet un dès qu'il échoue. |
| **Estompage des indices** (texte → trous → initiales → rien) | **Probable** (*vanishing cues* ; méthode des initiales utilisée par les comédiens, quelques études favorables) | 6 niveaux d'indice, suivis strophe par strophe. |
| **Découper en strophes**, puis les enchaîner | **Probable**. Les études anciennes « par parties ou d'un bloc » donnent des résultats mitigés ; la méthode **par parties cumulatives** (A, puis A+B, puis A+B+C) l'emporte chez l'enfant et pour les textes longs. Le point faible connu : les **transitions** d'une strophe à l'autre. | On apprend strophe par strophe, mais chaque séance récite tout le début, et on entraîne le **pont** (dernier vers de la strophe précédente → premier vers de la nouvelle). |
| **Double codage, dessin** | **Probable** : l'effet du dessin est robuste chez l'adulte pour des mots (Wammes et al. 2016) ; peu d'études sur la poésie chez l'enfant | Un dessin par strophe, **sur papier**, pendant la découverte. Souvent l'enseignante le demande déjà dans le cahier : on fait d'une pierre deux coups. |
| **Gestes** | **Probable** : faire un geste aide à retenir une phrase d'action (*enactment effect*, solide) ; moins documenté pour un poème entier | Un geste par strophe, choisi par l'enfant. Coût nul, aucun écran. |
| **Motivation, sentiment de compétence** | **Solide** dans le principe (théorie de l'autodétermination) ; **mitigé** pour les récompenses extérieures, qui peuvent faire baisser l'envie quand on paye l'activité elle-même | Une seule récompense par jour, liée au progrès (« tu sais 2 strophes sans regarder »), jamais aux points ni aux séries de jours. |

### Gadgets ou contre-productifs : à éviter

- **Écouter la poésie en boucle** (en voiture, au coucher) : c'est utile **les 2 premiers jours** pour se familiariser avec la mélodie, mais c'est de la relecture passive. Ça donne l'illusion de savoir, sans remplacer le rappel. **Écouter en dormant** : aucun effet démontré pour ce type d'apprentissage.
- **Un tuteur LLM vocal qui « fait réciter » l'enfant** : il se trompe sur le texte, dit « bravo » par complaisance, et envoie dans le cloud la voix d'un mineur. Détails dans l'approche B.
- **Les styles d'apprentissage** (« il est visuel ») : c'est un **mythe**. Image, son et geste aident tous les enfants.
- **Les séries de jours, les points par vers, les classements** : ils poussent à « faire la séance » plutôt qu'à apprendre, et casser une série décourage. Dictée-Blocs a déjà la bonne règle : pas de « farming ».
- **Un palais mental pour 16 vers** : trop coûteux à 8 ans. Un repère par strophe suffit.
- **Une note de diction calculée par la machine** : on ne sait pas la calculer de façon fiable, et un faux reproche fait plus de mal qu'aucun retour.
- **La synthèse vocale comme seul modèle de diction** : elle lit mal les vers (« e » muets, liaisons, diérèses, rythme). Elle convient pour retrouver *les mots*, pas pour le *ton*. Le ton se travaille avec l'adulte (voir les points de vigilance).

---

## 1. Trois approches contrastées

### A. Sans IA en direct : appli autonome avec auto-vérification

L'enfant voit un indice (texte, trous, initiales, image, rien), dit le vers à voix haute, appuie sur « Vérifier » : le vers s'affiche et se fait entendre, puis il dit s'il l'a « dit pareil ». La voix est préparée à l'avance (synthèse Azure Denise, comme pour Dictée-Blocs). Le soir, l'adulte écoute la récitation et note chaque strophe en trois touches.

- **Avantages** : rien ne sort de la maison pendant les séances. Aucune erreur de reconnaissance vocale. Comportement prévisible. Fonctionne hors ligne. Réutilise presque tout Dictée-Blocs.
- **Limites** : à 8 ans, l'enfant s'évalue mal (il est souvent trop optimiste) et peut « valider » un vers approximatif. **C'est la principale faiblesse**. La récitation du soir sert justement de juge : elle prime sur l'auto-vérification et recale les niveaux.
- **Risques** : vie privée et hallucinations, aucun. Temps d'écran faible (5 à 7 minutes). Risque pédagogique : un mot faux mémorisé pendant 1 jour, rattrapé le soir.
- **Effort** : un week-end pour une version utilisable.
- **Coût** : 0 € (la voix Azure tient dans le palier gratuit).

### B. Avec un LLM vocal (assistant grand public ou API temps réel)

L'enfant parle à un assistant (ChatGPT, Gemini Live, ou un agent sur une API temps réel) qui connaît le texte, le fait réciter, corrige et encourage.

- **Avantages** : très naturel, rien à coder si on prend un assistant grand public, et il sait répondre à « ça veut dire quoi, *vermeil* ? ».
- **Limites et risques** :
  - **Hallucinations et complaisance** : l'assistant « corrige » avec une version légèrement fausse du texte, dit que c'est juste quand ça ne l'est pas, improvise des encouragements disproportionnés. C'est rédhibitoire pour du mot à mot.
  - **Reconnaissance d'une voix d'enfant** : la précision baisse nettement par rapport à un adulte. Le LLM complète ce qu'il « s'attend » à entendre, donc il ne remarque pas les oublis.
  - **Vie privée** : la voix de l'enfant part chez un tiers. Les conditions des assistants grand public visent en général 13 ans et plus, et le parent ne voit pas ce qui est conservé.
  - **Temps d'écran et dérive** : la conversation sort du cadre (« raconte-moi une blague »), les séances s'allongent, et l'enfant dépend d'un outil imprévisible.
- **Effort** : très faible avec un assistant grand public (mais rien n'est maîtrisé) ; plusieurs jours pour un agent sur mesure.
- **Coût** : environ 20 à 25 €/mois d'abonnement, ou quelques euros par mois d'API.
- **Verdict** : **déconseillé**, sauf comme dictionnaire ponctuel pour le parent.

### C. Hybride : le LLM prépare (hors ligne, relu par le parent), l'appli fait réciter, la reconnaissance vocale locale vient en appui

- **Préparation, pas pendant les séances** : Claude transcrit la photo de la feuille, propose les explications des mots difficiles en mots de CE2, une idée d'image et de geste par strophe, découpe les strophes. **Le parent relit et corrige** avant publication. Seul le texte de la poésie est envoyé, aucune donnée sur l'enfant.
- **L'appli** = l'approche A (estompage des indices, auto-vérification, récitation du soir).
- **Plus tard, la reconnaissance vocale locale** : faster-whisper (ou Vosk) dans un conteneur Docker sur le serveur de la maison. L'audio est transcrit puis effacé aussitôt. Le résultat est comparé au vers avec tolérance, et ne sert **que d'aide** : « j'ai peut-être entendu *soleil* à la place de *sommeil* : vérifie ». Ce n'est jamais un verdict.
- **Avantages** : la fiabilité de A, la préparation allégée pour le parent, et une vérification plus objective plus tard, sans cloud.
- **Limites** : la reconnaissance d'une voix d'enfant reste imparfaite. Whisper **hallucine sur les silences**. Si on lui donne le texte attendu comme amorce, il tend à « entendre » ce qu'on attend, et laisse donc passer les erreurs. Il faut mesurer avant de faire confiance.
- **Risques** : vie privée maîtrisée (réseau local). Temps d'écran identique à A.
- **Effort** : un week-end pour A avec la préparation par Claude, puis 2 à 3 jours pour la reconnaissance vocale.
- **Coût** : 0 € (serveur déjà existant).

## 2. Recommandation : C, en deux temps

1. **V1 = A + préparation par Claude** : c'est utilisable dès la prochaine poésie, sans risque.
2. **V2 = la reconnaissance vocale locale**, seulement si deux conditions sont réunies. D'abord, l'auto-vérification se révèle trop optimiste : la récitation du soir contredit souvent ce que l'enfant a validé. Ensuite, la reconnaissance se montre fiable sur 20 enregistrements de ton fils : moins de 5 % de vers justes signalés à tort.

Pourquoi : la valeur pédagogique vient du **rappel espacé avec des indices qui s'estompent** et d'un **juge fiable**. Le juge le plus fiable et le moins cher, c'est toi, 2 minutes le soir. L'IA est utile là où une erreur est rattrapable et relue (la préparation), et nuisible là où elle juge seule un enfant de 8 ans (pendant la séance).

---

## 3. La solution retenue en détail

### 3.1 Le planning, de la feuille à la classe

Notations : **D** = nombre de jours entre la réception de la poésie (J0) et la date de récitation ; **S** = nombre de strophes.

- **J0, découverte avec l'adulte, 10 à 15 minutes, presque sans écran** : écouter la poésie entière (lue par toi, ou la voix de l'appli). Expliquer les mots difficiles. Demander « qu'est-ce qui se passe ? qui parle ? ». L'enfant dessine une image par strophe (au crayon, sur une feuille ou dans le cahier) et choisit un geste par strophe. Tu prends ses dessins en photo, ils deviennent les **repères** dans l'appli. **On ne mémorise rien ce jour-là.**
- **Fenêtre d'apprentissage** W = D − 4 jours. On introduit une **strophe nouvelle tous les k jours**, avec k = W ÷ S arrondi vers le bas, borné entre 1 et 3.
  - Si W < S (délai court ou poésie longue), deux strophes certains jours, et l'appli te prévient.
- **Les 3 derniers jours avant la date** : plus rien de nouveau, uniquement la poésie entière, de moins en moins aidée.
- **La veille** : **répétition générale**, debout, devant quelqu'un (toi, un frère ou une sœur, un grand-parent au téléphone), avec titre et auteur.
- **Le jour J** : une récitation le matin, sans aide, à la maison. Rien d'autre.
- **Tous les soirs** depuis J1 : récitation du soir de tout ce qui a été vu.
- **Un jour sans séance par semaine** est permis : la récitation du soir suffit ce jour-là.
- **Après la date** : entretien à J+7, J+21, puis J+60. Une récitation entière, 1 minute, glissée en début de séance de la poésie suivante.

Exemple : D = 14 jours, 4 strophes de 4 vers. W = 10, donc k = 2.

| Jour | Séance (enfant seul, 5 à 7 min) | Soir (adulte, 2 min) |
|---|---|---|
| J0 | — (découverte avec l'adulte) | — |
| J1 | Strophe 1 apprise | Récite S1 |
| J2 | Rappel S1 ; S1 avec moins d'indices | S1 |
| J3 | Rappel S1 ; **S2 apprise** ; pont S1→S2 ; S1+S2 | S1+S2 |
| J4 | Rappel S1+S2 ; consolidation | S1+S2 |
| J5 | Rappel ; **S3** ; pont S2→S3 ; S1→S3 | S1→S3 |
| J6 | Rappel ; consolidation (jour de repos possible) | S1→S3 |
| J7 | Rappel ; **S4** ; pont S3→S4 ; tout | Tout |
| J8–J10 | Rappel ; poésie entière, indices au plus bas pour chaque strophe | Tout |
| J11–J12 | Poésie entière **sans indice**, une fois, éventuellement debout | Tout |
| J13 | Courte séance, puis **répétition générale** avec l'adulte | (c'est la répétition générale) |
| J14 | Récitation le matin | — |

### 3.2 Une séance type (5 à 7 minutes, enfant seul)

L'écran d'accueil a **un seul gros bouton**, « Ma séance », avec une consigne lue à voix haute. L'appli décide de tout : l'enfant n'a jamais à choisir un mode.

1. **Rappel à froid** (environ 1 min), sauf à J1. L'appli montre le titre et les repères (dessins) des strophes déjà vues : « Dis tout ce que tu sais, sans regarder. » Puis, strophe par strophe, auto-vérification au niveau d'indice de chaque strophe. C'est la mesure la plus honnête de ce qui a tenu après le sommeil.
2. **La strophe du jour** (environ 3 min) :
   - si elle est nouvelle : écoute de la strophe 2 fois, vers surligné au rythme de la voix, ce qui aide un lecteur lent. Puis, **vers par vers**, on descend les niveaux d'indice : 0 → 1 → 2 → 3, en changeant de niveau à chaque réussite ;
   - sinon : la strophe la plus fragile (la moins bien notée la veille au soir).
3. **Le pont et l'enchaînement** (1 à 2 min) : le dernier vers de la strophe précédente puis la nouvelle strophe, enfin tout depuis le titre, au niveau d'indice le plus bas de chaque strophe.
4. **La fin** (15 s) : une phrase de bilan (« Tu sais dire 2 strophes sur 4 sans regarder ! ») et la récompense du jour. On s'arrête **sur une réussite** : si le temps est écoulé, on finit la strophe en cours, au niveau du dessous si besoin.

**Les niveaux d'indice** (pendant que l'enfant récite le vers) :

| Niveau | Ce que l'enfant voit | Exemple |
|---|---|---|
| 0 | Texte complet, et la voix lit avec lui | Le chat ouvrit les yeux |
| 1 | Texte complet, sans la voix | Le chat ouvrit les yeux |
| 2 | Un mot sur deux masqué ; le mot de la rime reste visible au début | Le ▢▢▢ ouvrit ▢▢▢ yeux |
| 3 | Les initiales seulement | L. c. o. l. y. |
| 4 | Le repère seul (son dessin) | 🖼️ |
| 5 | Rien | — |

**Une boucle vers par vers** : l'indice s'affiche → l'enfant dit le vers **à voix haute** → il appuie sur « Vérifier » → le vers s'affiche et se fait entendre → deux gros boutons, « ✓ Pareil » et « ✗ Pas pareil ».

- À tout moment, le bouton « **Souffle-moi** » fait entendre le mot suivant seulement. Un vers soufflé ne compte pas comme réussi.
- « Pas pareil » : on réécoute le vers, l'enfant le redit au niveau du dessous, puis au niveau d'avant. C'est le retour immédiat qui empêche de mémoriser une erreur.

**Ajouts du 19/11, après relecture d'une autre proposition (Gemini)** :
- **Groupes de sens** : une strophe de plus de 4 vers est coupée en groupes de 2 à 4 vers (une image chacun). Une strophe nouvelle s'apprend groupe par groupe (échelle des vers, puis le groupe), puis entière. Raison : la mémoire de travail d'un enfant de 8 ans est petite. Chaque groupe a sa propre image : ainsi chaque image correspond à une seule idée.
- **L'image comme premier souffle** : au niveau « Rien du tout », le premier « Souffle-moi » montre les images, avant de donner les mots.
- **« Touche les vers oubliés »** : après « Pas pareil » sur une strophe ou un groupe, l'enfant montre les vers qui lui ont échappé, et on ne reprend que ceux-là. C'est plus court et plus ciblé. « Je ne sais plus » reprend tout.
- **Dessin au stylet dans l'appli** (21/11) : une feuille de dessin par groupe, qui montre et fait entendre ses vers. Elle offre 9 crayons, un trait fin ou épais, une gomme, « annuler », et « tout effacer » (deux appuis). Elle est proposée dans la découverte, en fin de séance quand une strophe vient d'être apprise (« Dessiner mes images », facultatif), et dans l'onglet Repères. Le dessin devient directement l'image d'indice, sans photo. Dès qu'un stylet a touché l'écran, la paume posée ne dessine pas. Pas de tampons ni d'images toutes faites : c'est l'effort de décider quoi dessiner qui fait retenir.
- Non retenu : le jeu des erreurs glissées dans le texte (entendre une version fausse risque de la mémoriser), les vers mélangés à remettre dans l'ordre (de la reconnaissance, plus faible que le rappel), un émoji par vers (trop d'indices, et ambigus), les images générées (passives), les rappels par calendrier (le planning de l'appli et le rituel du soir suffisent).

**Les règles des niveaux** (par strophe, d'un jour à l'autre) :

- La strophe est réussie à son niveau (tous les vers « pareil », sans souffle) → **+1 niveau**, au plus une fois par jour en dehors de la découverte de la strophe. Une réussite dans la même séance n'est que de la mémoire immédiate, qui est trompeuse.
- Un vers raté → **−1 niveau** pour la strophe.
- La **récitation du soir prime** sur tout le reste :
  - « Sue » : la strophe passe au moins au niveau 4 et devient une **strophe sue** ;
  - « Hésitation » : rien ne change ;
  - « Pas sue » : −2 niveaux, et la strophe devient prioritaire le lendemain.
- Si l'auto-vérification dit « pareil » mais que le soir dit « pas sue », l'appli le note. C'est l'indicateur qui décidera si la V2 est nécessaire.

### 3.3 Les fonctionnalités

**La saisie de la poésie** (le parent, avec Claude Code, environ 5 minutes) :

1. Tu envoies la photo de la feuille. Claude écrit `poesies/AAAA-MM-JJ-titre.txt` :

   ```text
   # Le chat et le soleil
   @ Maurice Carême
   = 2026-12-04
   ! vermeil | d'un rouge doré, comme le soleil couchant
   > repère : un chat qui dort | geste : les mains sous la joue
   Le chat ouvrit les yeux,
   Le soleil y entra.
   ...

   > repère : le soleil dans les yeux | geste : deux ronds avec les doigts
   ...
   ```

   Notations : `#` titre, `@` auteur, `=` date de récitation, `!` mot difficile, `>` repère de la strophe suivante. Les strophes sont séparées par une ligne blanche. La ponctuation et les majuscules sont **exactement celles de la feuille**.

2. Tu relis la transcription. `npm run voices` enregistre alors un MP3 par vers, par strophe et pour la poésie entière (Denise, débit −15 %).
3. Dans l'espace parent : photo des dessins (repères), et réenregistrement à ta voix de tout vers mal lu par la synthèse.

**L'effacement progressif** : les 6 niveaux ci-dessus. Le choix des mots masqués au niveau 2 est fixé (pas de hasard à chaque essai), pour que l'enfant ne s'y perde pas.

**La récitation vocale** : en V1, l'auto-vérification. La V2 est décrite en 3.4.

**Le suivi des progrès** :
- côté enfant : la poésie dessinée comme un chemin de strophes, qui se colorent quand elles sont sues. Pas de pourcentage ;
- côté parent : jours restants, niveau de chaque strophe, état du planning (« à l'heure » ou « en retard d'une strophe », avec une suggestion), et l'écart entre l'auto-vérification et la récitation du soir.

**Les rappels** : une PWA ne sait pas programmer de notification locale fiable sans serveur. En V1, on ne fait pas de notification : la **routine** fait le travail (séance après le goûter, récitation du soir dans le rituel du coucher), avec une pastille sur l'icône de l'appli (Badging API) tant que la séance du jour n'est pas faite. En V2 : la tablette signale « séance faite » au serveur de la maison, et à 18 h 30 un petit script envoie une notification **ntfy** sur ton téléphone si ce n'est pas le cas.

**Les récompenses** : une par jour, à la fin de la séance. Un morceau de l'affiche de la poésie (son propre dessin) se colore, et la strophe sue fait apparaître son repère dans « Mon livre de poésies ». À la répétition générale, on enregistre (localement) sa récitation : elle rejoint le livre, et c'est un souvenir qui motive. Pas de série de jours, pas de points.

**Ce que fait l'adulte** :

| Quand | Quoi | Durée |
|---|---|---|
| Réception | Photo → transcription par Claude → relecture → voix | environ 5 min |
| J0 | Découverte : lire, expliquer, dessin et geste par strophe, photo des dessins | 10 à 15 min |
| Chaque soir | Écouter la récitation **sans support**, noter chaque strophe en 3 touches (sue, hésitation, pas sue) ; le ton se travaille ici, en imitant | 2 min |
| La veille | Répétition générale | 3 min |
| **Total par poésie** | | **environ 1 h sur 2 à 3 semaines** |

### 3.4 L'architecture technique

- **Front** : PWA en JavaScript vanilla, sans étape de build, comme Dictée-Blocs. On reprend `store.js`, `speech.js`, `audiokey.js`, `sw.js` et `tools/make-voices.js`, et `align.js` est adapté pour aligner des mots au lieu de lettres (en V2).
- **Modules** : `poem.js` (lecture du fichier texte), `planner.js` (quelle strophe quel jour), `levels.js` (règles des niveaux), `cues.js` (production des indices), `session.js` (déroulé d'une séance), `app.js`. Les quatre premiers sont des fonctions pures testées avec `node --test`.
- **Stockage** : `localStorage` (`poesie.v1`) pour l'état et la progression ; IndexedDB pour les enregistrements (ta voix, la répétition générale) et les photos des dessins. Export et import JSON dans l'espace parent, comme sauvegarde.
- **Hébergement : sur le serveur de la maison, pas sur GitHub Pages**, pour deux raisons :
  1. **Le droit d'auteur** : les poésies de CE2 (Carême, Prévert, Desnos…) sont souvent encore protégées. Publier leur texte et leur lecture sur un site public pose problème. Et même depuis un dépôt privé (offre payante), un site GitHub Pages reste lisible par tout le monde.
  2. **La V2** : le micro exige un contexte sécurisé (HTTPS), et une page publique ne peut pas appeler un service `http://` du réseau local (contenu mixte bloqué). Il faut donc **même origine, en HTTPS**.

  Concrètement : Docker Compose avec **Caddy**, qui sert les fichiers statiques. Le certificat vient de Let's Encrypt (défi DNS sur un nom de domaine à toi, pointé vers l'IP du réseau local) ou de Tailscale. La PWA, mise en cache, marche hors ligne même hors de la maison ; seule la V2 a besoin du réseau local.
- **La reconnaissance vocale (V2)** : un conteneur faster-whisper (modèle `small` en français, CPU) derrière une petite API sur `/asr`, sur la même origine.
  - Filtre de silence (VAD) activé, pas d'amorce avec le texte du vers (voir 3.5). L'audio n'est jamais écrit sur le disque et rien n'est journalisé.
  - Comparaison tolérante :
    1. normaliser (minuscules, ponctuation, apostrophes) ;
    2. passer en **clé phonétique française simplifiée**, pour que « vers / vert / verre » ou « ces / ses » ne comptent pas comme des erreurs ;
    3. aligner mot à mot (programmation dynamique, comme `align.js`).

    Le verdict est « tout bon », « peut-être X au lieu de Y », ou « je n'ai pas bien entendu ». L'enfant confirme toujours lui-même.
  - Une piste à **vérifier sur la tablette** : les versions récentes de Chrome proposent une reconnaissance sur l'appareil pour la Web Speech API. Si le français y est disponible, ce serait une alternative sans serveur. Je ne l'ai pas vérifié sur ton appareil.
- **L'enfant qui lit lentement** : gros caractères, un seul vers mis en avant à la fois, chaque consigne lue à voix haute, deux ou trois boutons au maximum, icônes. Pas de défilement, en portrait comme en paysage, comme dans Dictée-Blocs.

### 3.5 Les points de vigilance

| Risque | Comment le réduire |
|---|---|
| **Auto-vérification trop optimiste** : il valide « pareil » un vers approximatif | La récitation du soir prime ; l'appli mesure l'écart ; une réussite ne fait monter que d'un niveau par jour. Si l'écart reste grand après une poésie → V2. |
| **Réciter dans sa tête** au lieu de le dire à voix haute | Le dire à la découverte (« la poésie, ça se dit »). La V2 le rendra naturel. En V1 on ne peut pas le vérifier, c'est accepté. |
| **Mémoriser une version fausse** (une coquille dans la transcription) | Tu relis la transcription contre la feuille, en particulier la ponctuation et les majuscules. |
| **La synthèse vocale lit mal un vers** (« e » muet, liaison, diérèse) | Tu écoutes la poésie une fois à la saisie et tu réenregistres le vers à ta voix. Le ton se travaille le soir. |
| **Le blanc entre deux strophes** | L'étape du pont à chaque séance ; les repères (dessins, gestes) dans l'ordre. |
| **Dépendre de l'appli ou du contexte** (il sait la réciter devant la tablette, pas en classe) | Les derniers jours sans indice, debout, devant quelqu'un ; la répétition générale ; la récitation du soir sans écran. |
| **Trac le jour J** | La répétition générale devant un « public » ; commencer par le titre et l'auteur, comme un rituel. |
| **Temps d'écran** | La séance s'arrête seule vers 7 minutes ; le soir, rien à l'écran ; pas de mode libre à faire en boucle. |
| **Jours manqués** (maladie, vacances) | Le planning se recalcule chaque jour à partir des jours restants ; il te prévient s'il faut deux strophes par jour. |
| **Reconnaissance vocale (V2)** : faux reproches sur une voix d'enfant, hallucinations sur les silences, et une amorce avec le texte attendu qui masque les oublis | Elle ne s'active qu'après une mesure sur 20 enregistrements ; elle ne fait que suggérer ; filtre de silence ; pas d'amorce avec le texte. Les enregistrements de test restent sur le serveur et sont effacés ensuite. |
| **Droit d'auteur, vie privée** | Hébergement local, dépôt privé, aucune donnée de l'enfant vers le cloud. Seul le texte de la poésie va chez Azure (la voix) et chez Claude (la transcription). |
| **Lassitude** au fil des poésies | Une récompense liée au livre de poésies ; un entretien court ; observer et ajuster après la première poésie plutôt que tout prévoir. |

---

## 4. Plan de réalisation

### V1 : un week-end (environ 10 h avec Claude Code)

**Samedi matin, le cœur testé.** Le format du fichier et sa lecture (`poem.js`), le planning (`planner.js`), les règles des niveaux (`levels.js`) et la production des indices (`cues.js`), avec des tests `node --test`. Adapter `make-voices.js` pour enregistrer les vers, les strophes et la poésie entière.

**Samedi après-midi, la séance.** L'écran « Ma séance » : rappel à froid, strophe du jour, vers par vers avec les 6 niveaux, Vérifier, Pareil ou Pas pareil, Souffle-moi, pont, enchaînement, fin sur une réussite.

**Dimanche matin, l'espace parent.** La récitation du soir (3 touches par strophe), la date de récitation, la vue du planning, les photos des repères, l'export JSON.

**Dimanche après-midi, la mise en service.** Le service worker, Caddy en Docker avec HTTPS, l'installation sur la tablette, puis un essai avec la poésie du moment et ton fils.

**Critères de réussite** :
- il fait une séance **seul**, sans demander d'aide, en 7 minutes au plus ;
- ta récitation du soir prend 2 minutes au plus ;
- après 3 jours, la strophe 1 est sue le soir.

### V1.1 : après la première poésie (quelques heures)

- Ajuster les niveaux d'après ce que tu observes : le niveau 3, les initiales, est-il trop dur pour un lecteur lent ? Les rimes doivent-elles rester visibles plus longtemps ?
- Réenregistrer des vers à ta voix depuis l'espace parent.
- Le livre de poésies et l'enregistrement de la répétition générale.
- L'entretien des anciennes poésies.

### V2 : la vérification à la voix (2 à 3 jours, **seulement si nécessaire**)

1. Mesurer d'abord : 20 enregistrements de ton fils récitant (justes et avec des erreurs volontaires), transcrits par faster-whisper `small` puis `medium`. Compter les vers justes signalés à tort et les erreurs manquées. Tester avec et sans amorce. Sans résultat assez bon, on s'arrête là : V1 reste la solution.
2. Le conteneur faster-whisper avec son API `/asr`, sur la même origine ; la comparaison phonétique tolérante (à tester) ; le verdict qui suggère sans juger.
3. La notification ntfy « pas de séance aujourd'hui » sur ton téléphone.
4. Optionnel : essayer la reconnaissance sur l'appareil de Chrome, si elle existe en français sur la tablette.

### Plus tard, peut-être

- Un pont avec Dictée-Blocs : un seul « espace parent » ou un seul écran d'accueil pour les deux. À ne faire que si deux applis séparées gênent vraiment à l'usage.
- Une fiche papier générée pour chaque poésie (les strophes avec leurs initiales), pour réviser sans écran.
