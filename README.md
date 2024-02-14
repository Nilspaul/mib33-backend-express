# Build4Bytes: Express-Server

## ✨ Demo
_folgt_

## 🚀 Verwendung

Es muss eine `.env`-Datei angelegt werden. Als Vorlage dient `.env-example`.

**Entwicklung:**  
`npm run dev`  
*startet den Server mit Hot-Reload*

**Build:**  
`npm run start`  
*startet den Server ohne Hot-Reload*

**Migrate:**  
`npm run migrate:init`  
*Erstellt die Datenbank-Schemas*

`npm run migrate:update`  
*Führt aktualisierungen der Datenbank-Schemas durch*

`npm run migrate:import`  
*Importiert Daten aus einem Google-Sheet in die Datenbank - ID in `.env` nicht vergessen!*

`npm run migrate:drop TABLENAME`  
*Dropt/löscht eine Datenbank-Tabelle*

## 👥 Authoren
- Nils Paul ([@npal61](https://git.thm.de/npal61))
- Pascal Straßel ([@psrs54](https://git.thm.de/psrs54))
- Leander Theiß ([@lths23](https://git.thm.de/lths23))