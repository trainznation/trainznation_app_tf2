# [Release 0.0.18 - Shop System](https://github.com/trainznation/trainznation_app_tf2/releases/tag/v0.0.18)

## Release 0.0.18
La Page `shop` est terminé et est prête à être utilisé par les utilisateurs.

Plusieurs Correction ont été apporter au système [#Correction](#correction)

## Effort de développement Notable

Le système d'affichage des mods disponible est maintenant terminer. Des développements
supplémentaire seront à prévoir notamment pour la fonction de téléchargement.


## Changelog

Plus d'infos sur les différences entre les versions [ici](https://github.com/trainznation/trainznation_app_tf2/compare/v0.0.4...v0.0.18)

### Nouvelle Fonction

- Page `Shop` affiche les mods disponible en téléchargement.
- Page `Shop Info` affiche les informations relative à un mod en particulier.
- Une notification s'affiche à l'utilisateur sir l'application n'arrive pas ou plus
à joindre le serveur.
- Le carousel de la gallerie dans la page `Shop Info` affiche bien les images et vidéo, 
mais un bug empêche sont fonctionnement global. Une tache [#11](https://github.com/trainznation/trainznation_app_tf2/issues/11) a été ouvert en 
conséquence

### Correction

- Close [#9](https://github.com/trainznation/trainznation_app_tf2/issues/11): L'onglet Bienvenue s'affiche
maintenant correctement.
- Close [#10](https://github.com/trainznation/trainznation_app_tf2/issues/10): Une correction à été apporté au preloader en vue de la rectification
de la tache #10.
- Correction du tooltip des features `undefinied` > `Type de feature` sur l'icone
- Nettoyage du processus principal
- Correction de la frameBar
- Le menu `Site de Trainznation` est opérationnel
- Correction du système de notification (UI)
- Correction du preloader si l'application est lancer couramment : Le système provoquai une erreur inconnue lors du lancement de l'application, une suppression de la fonction en cause ne posent aucun problème apparent.



