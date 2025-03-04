## Project Overview
- Project name: StaffHUB
- Core purpose: Aplicatia trebuie sa gestioneze incasarile de numerar cu chitanta de la pacientii unui spital care trebuie sa plateasca diverse servicii medicale grupate in diverse categorii.
- Target users: Casierul spitalului si un administrator care poate face diverse configurari

## Technical Requirements
- Frontend: aplicatie tip Single Page Application SPA utilizind Quasar framework v.2 , vuejs with composition API and <script setup> mode , pinia for some global state management, axios for server requests
- Backend: Node JS with AdonisJS vers. 6 as a web app with controllers, models etc, Lucid ORN
- Database: MySQL
- Deployment: local deployment on a server in hospital LAN that runs Windows Server 2019
- Additional services: Basic autehntcation is needed and is already implemented, no middleware used, no AdonisJS auth package, no protected routes

## Key Features
- Feature 1: Posibilitatea de a adauga, edita sterge(inactiva) categorii de servicii medicale prestate
- Feature 2: Posibilitatea de a manageria serviciile oferite, adaugarea lor la o anumita categorie , editare, stergere, schimbare tarif
- Feature 3: Incasare efectiva de la pacient dupa selectarea si adaugarea serviciilor la chitanta, schimbare status chitanta
- Feature 4: Raport cu situatia incasarilor filtrate dupa diferite criterii (interval timp, categorie, etc)
## User Flow
Utilizatorul se logheaza cu credentialele sale si daca are rolul de CASIER vede un meniu de unde poate alege sa actualizeze oferta de servicii (operatii CRUD pe categorii si in cadrul categoriilor pe fiecare serviciu oferit). De preferat ar fi sa i se prezinta o structura grupata ierarhic 
de categorii si in cadrul lor serviciile aferente pe care le poate edita. Apoi daca se prezinta un pacient sa completeze numele pacientului , localitatea , sa primeasca automat un numar nou de chitanta , sa aleaga dintr-un fel de lista/data table/ panels/ serviciile care trebuiesc incasate si sa genereze chitanta, urmind a o valida final atunci cind a incasat efectiv banii.node ace  Tot casierul poate genera un raport cu toate incasarile dintr-o anumta perioada si/sau alte rapoarte.

## Design Preferences
- Visual style: Corporate
- UI frameworks: Quasar v2 Material default theme
- Any existing branding to incorporate? No
- Mobile-first or desktop-first approach? Desktop first approach

## Constraints & Considerations
- Minimalista, nu va fi scalata foarte mult dar posibil sa fie dezvoltata si integrata in alte sisteme software ale spitalului


Database schema design
API endpoint architecture
UI/UX wireframes and component hierarchy
System architecture diagram
Implementation roadmap