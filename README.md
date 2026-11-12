<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## LinksHub API

API REST LinksHub construite avec NestJS, TypeScript, Prisma et PostgreSQL.
Le frontend natif est maintenu dans le dépôt LinksHub frontend.

## Installation

```bash
$ npm install
```

## Démarrer l'API

```bash
# démarrage simple
$ npm run start

# mode développement avec rechargement
$ npm run start:dev

# compilation et mode production
$ npm run build
$ npm run start:prod
```

## Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration et migrations

Créez `.env` depuis `.env.example`, renseignez `DATABASE_URL` sans
commiter le fichier, puis générez le client Prisma et appliquez les migrations :

```powershell
npm run prisma:generate
npm run prisma:migrate
npx prisma migrate status
```

Le serveur expose les routes sous `/api`; `GET /api/health` ne nécessite pas
d'authentification. En cas d'indisponibilité PostgreSQL, les routes dépendant
des données renvoient une erreur `503` générique.

## Fonctionnalités et routes

Toutes les routes d'authentification et de données nécessitent une session
cookie, sauf inscription, connexion et `GET /api/health`.

- `POST /api/auth/register`, `POST /api/auth/login`,
  `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/categories`
- `GET /api/links` prend en charge `q`, `categoryId`, `type`, `from`, `to`,
  `sort`, `page`, `limit` et `isFavorite=true|false`.
- `GET /api/links/:id`, `POST /api/links`, `PATCH /api/links/:id`,
  `DELETE /api/links/:id`
- `PATCH /api/links/:id/favorite` avec un booléen `isFavorite`.
- `GET /api/collections`, `POST /api/collections`,
  `GET /api/collections/:id`, `PATCH /api/collections/:id`,
  `DELETE /api/collections/:id`
- `POST /api/collections/:id/links` avec `{ "linkId": "..." }`
- `DELETE /api/collections/:id/links/:linkId`

Les favoris sont stockés sur les liens. Les collections sont privées et
peuvent référencer plusieurs liens; supprimer une collection supprime ses
relations, pas les liens. Le propriétaire est déduit de la session, y compris
pour l'association d'un lien à une collection.

La migration `20261112160000_favorites_collections` ajoute le statut favori,
les collections et leur relation plusieurs-à-plusieurs. Elle doit être
appliquée avec `npm run prisma:migrate` après vérification de la base ciblée.
Cette commande n'a pas été exécutée à ce stade.

Les tests e2e vérifient la santé et le refus des routes privées sans session;
ils ne remplacent pas un test CRUD contre une base de test dédiée.

## Déploiement

No hosting platform is configured for LinksHub. Do not run deployment commands
from the generic NestJS starter documentation below; production deployment
requires a separate setup.

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
