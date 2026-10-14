# SFR-Labor · ATmega32A

Zwei Lernbereiche: Portregister/ADMUX mit Signalwegen und ADC-Einzelschritten; LED und Pull-up/Pull-down-Schalter mit Rauchwarnung bei direktem Ausgangskonflikt.

`index.html` offline per Doppelklick öffnen. Keine Installation, externen Bibliotheken, Schriftarten oder Laufzeit-Netzabfragen. FTS-Logo und Impressum aus bestehender Lernseite übernommen.

Live: https://pirminheld.github.io/BKI2_IN_SFR_Labor/

## Unterricht
Anschluss an Woche 05, SFR und ADC kompakt. Die beiden Tabs teilen DDRA und PORTA. PA0 ist mit der LED, PA2 mit dem Schalter verknüpft. Registerlabor zeigt die prinzipielle Pin-Innenschaltung; ADC-Teil ist eine getrennte Sensorsituation mit vorgegebenen Spannungen (kein gleichzeitiger Anschluss der Sensorquelle an den Schalter!).

Zum Erproben: sicherer Eingang → Schalter schließen → DDRA2 auf Ausgang → je nach PORTA2 Kurzschluss. Den Gegenfall mit Pull-down/Schalter nach VCC vergleichen. Interner Pull-up begrenzt Strom und darf nicht mit einem aktiv treibenden Ausgang High verwechselt werden.

## Modellgrenzen
5 V Versorgung, PUD = 0, ADC-Systemtakt 8 MHz/Teiler 64. LED 2 V, äußerer Pull 10 kΩ, interner Pull beispielhaft 40 kΩ. Keine thermische oder zeitabhängige Schadensberechnung. Rauch nur als Warnsymbol bei direkter Verbindung eines Ausgangs zur entgegengesetzten Versorgung; Widerstandszweige sind kein Kurzschluss. Offene Pins werden als unbestimmt angezeigt. LED ohne aktive Quelle legt keinen sicheren Digitalpegel fest. ADC-Zuordnung idealisiert ohne Rauschen und Toleranzen. Sonder-MUX-Codes/externe Referenz nicht simuliert. Keine realen Boards angeschlossen.

Quelle: Microchip ATmega32A, DS40002072A (2018), Portkonfiguration S. 57–63, ADC S. 203–217. Die Software abstrahiert Transistorstufen und Schutzschaltungen. Reale AREF-/Versorgungsbeschaltung und Taktquelle vor Umsetzung prüfen.

## Prüfung
`node test-model.cjs` prüft elektrische Zustände und ADC-Aufteilung. Browserprüfung separat: Tabs, Bitfelder, LED/Schalter, Kurzschlussbehebung, ADC-Ablauf, Tastatur, Offlinebetrieb, Standard/Beamer und mobile Breiten.
