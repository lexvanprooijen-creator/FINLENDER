# FinFit Labels Service (Render)

Doel: centrale opslag/serving van actieve labels + links naar voorwaarden/acceptatiegidsen.
Plugin op WordPress haalt hier JSON op via `/labels`.

## Quick start (Render)
1) Nieuw **Web Service** project in Render -> **Node**
2) Repo of direct deploy via Git (dit mapje)
3) Build command: *(leeg laten)*
4) Start command: `node server.js`
5) Environment: none (optioneel later een token toevoegen)
6) Zet PDF's in `public/guides` (of host elders en verwijs met URL's)
7) Plaats per label een JSON bestand in `data/labels/` met velden:
   ```json
   {
     "id": "rabobank-basis",
     "label": "Rabobank Basis",
     "provider": "Rabobank",
     "type": "Basis",
     "active": true,
     "notes": "opt.",
     "conditions_url": "https://.../voorwaarden.pdf",
     "acceptance_url": "https://.../acceptatiegids.pdf"
   }
   ```

## Opruimen of nieuw project?
- **Aanrader:** start **nieuw project** om oude MoneyView-artefacten te scheiden.
- Wil je opruimen:
  - verwijder oude services, env vars, cron jobs, disks
  - controleer redirects/domains
  - hou een **labels**-service *los* van andere services (single responsibility).

## Endpoints
- `GET /labels` → lijst van **alleen actieve** labels (gesorteerd op label)
- `GET /guides/...` → statische PDF's (optioneel)

## Security
- Option: voeg simpele tokencheck toe via header `Authorization: Bearer <token>` en valideer in Express voordat je JSON serveert.
