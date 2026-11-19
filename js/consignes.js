/*
 * consignes.js — Les phrases que l'appli dit à l'enfant (enregistrées par tools/make-voices.js).
 * Courtes, au présent, sans jargon : l'enfant lit encore lentement, tout est dit à voix haute.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Consignes = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return {
    accueil: 'Appuie sur Ma séance pour commencer.',
    dejaFait: 'Ta séance est finie pour aujourd\'hui. Ce soir, récite ta poésie à un adulte.',
    decouverte: 'Aujourd\'hui, on découvre la poésie avec un adulte. Pas besoin de l\'apprendre.',
    avant: 'Ta poésie arrive bientôt.',
    jour: 'C\'est aujourd\'hui ! Récite ta poésie une fois, sans regarder.',
    apres: 'Bravo ! Tu as récité ta poésie.',
    rappel: 'Dis ce que tu sais déjà, sans regarder.',
    ecoute: 'Écoute bien.',
    repete: 'Répète avec la voix.',
    lis: 'Lis-le à voix haute.',
    dis: 'Dis-le à voix haute, puis appuie sur Vérifier.',
    disStrophe: 'Dis toute la strophe à voix haute, puis appuie sur Vérifier.',
    disGroupe: 'Dis ces vers à voix haute, puis appuie sur Vérifier.',
    quelVers: 'Touche les vers que tu as oubliés, puis appuie sur Continuer.',
    titre: 'Dis le titre et le nom de l\'auteur.',
    pont: 'On relie les deux strophes.',
    compare: 'Tu as dit pareil ?',
    bravo1: 'Bravo !',
    bravo2: 'C\'est ça !',
    bravo3: 'Super !',
    pasGrave: 'Pas grave. Écoute, et redis-le.',
    fin: 'Séance finie ! Ce soir, récite ta poésie à un adulte.',
    demain: 'Demain, on apprend la première strophe.',
    repetitionSoir: 'Ce soir, c\'est la répétition générale : récite debout, devant quelqu\'un, comme en classe.',
    bonneRecitation: 'Bonne récitation !'
  };
});
