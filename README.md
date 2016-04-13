[![Build Status](https://travis-ci.org/Oupsla/PrettyPR.svg?branch=master)](https://travis-ci.org/Oupsla/PrettyPR)

# Projet PJI - Université de Lille 1

## Sujet
Amélioration des pull requests sur git en proposant une différence sémantique.

## Lancement
- meteor
- meteor update (pour mettre à jour les différents packages)

Le serveur java est intégré dans un jar (dans le dossier server) et se lance automatiquement avec Meteor

## Découpage
- java_sources : racine du projet java utilisant gumtree
- model : collections Meteor (temp files, caches et github hook)
- public : différents fichiers de fonts utilisés par le client Angular
- tests : tests avec gargarin et mocha
- packages et node_modules : packages node
- prettyPrUpload : dossier temporaire accueillant les fichiers après upload


- client : découpe en pages, chaque page à son propre controlleur et sa propre page qui sera injecté dans index.html
    - dropfile : page d'upload de 2 fichiers
    - github : sélection d'une pull request après connection de l'utilisateur
    - history : historique des pull requests réalisées par un webhook
    - results : résultat d'un pull request

- server
    - startup : lancé au démarrage du serveur avant tout autre fichier (comprend le lancement du webhook github)
    - app.js : méthodes serveur (comparaison de fichier et pr, relation avec l'api github, ...)
    - prettyPr_jar_funct : jar de gumtree

## Fonctionnels
- Upload de 2 fichiers
- Connection à Github
- Visualisation de ses repos ou ceux d'un autre utilisateur
- Visualisation et sélection d'une pull request sur un repos
- Différence sémantique
- Webhook github acceptant les pull requests
