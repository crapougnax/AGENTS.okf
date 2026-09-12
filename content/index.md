# Index de content — AGENTS.okf Knowledge Base

Bienvenue dans la base de directives, patterns d'architecture et protocoles GitFlow au format **Open Knowledge Format (OKF v0.1)**.

Cette base est conçue pour être explorée de façon progressive (**Progressive Disclosure**) par les développeurs et les agents de codage IA afin de ne charger en mémoire que les unités logiques strictement requises par leur tâche en cours.

## Catégories

* [methodology](methodology/index.md) - Philosophie logicielle, exigence d'horizon 15 ans, TDD et colocalisation des tests, JSDoc strict, anglais international et règles de qualité SonarQube.
* [workflow](workflow/index.md) - Protocole GitFlow (develop / main / semver), commits conventionnels, utilisation rigoureuse de la CLI GitHub (`gh`), environnements éphémères de preview QA et modèle de forking 3-tiers.
* [architecture](architecture/index.md) - Domain-Driven Design (DDD), typage strict sans `as any`, contrats fail-fast, state machines, injection de dépendances, bus de messages `@quatrain/queue-*`, logging structuré et local-first.
* [backend-workers](backend-workers/index.md) - Architecture d'API REST Express (Totalymage), daemons et workers asynchrones (`api-triggers`), pattern Repository Quatrain (.TYPE, Core.addClass), DDL PostgreSQL minuscules et contrôleurs MVC headless.
* [frontend-ux](frontend-ux/index.md) - Ergonomie mobile en plein soleil (high-glare, cibles 76px/96px, typographie Space Grotesk/Nunito), tokens de statuts et contraste élevé, hygiène CSS statique et mémoïsation React.
* [infrastructure](infrastructure/index.md) - Standard Containerfile Podman non-root multi-arch, recettes Docker Compose (.env.dist), manifestes Kubernetes (Totalymage), IaC Terraform multi-cloud (Tycho Traefik v3 HTTP-01), ArgoCD GitOps et matrice de permissions opérationnelles.
* [knowledge](knowledge/index.md) - Spécifications Open Knowledge Format (OKF v0.1) régissant l'organisation de cette base de connaissances.
