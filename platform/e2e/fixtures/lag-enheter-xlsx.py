"""Lager e2e/fixtures/enheter.xlsx: 24 leiligheter i fire etasjer, som et regneark fra en utbygger.

Kjør på nytt hvis innholdet skal endres: python3 e2e/fixtures/lag-enheter-xlsx.py
Tall er lagret som tall (ikke tekst), slik Excel gjør det.
"""

from pathlib import Path

from openpyxl import Workbook

book = Workbook()
sheet = book.active
sheet.title = "Prisliste"
sheet.append(["Prisliste Fjordparken"])
sheet.append([])
sheet.append(["Bolignr", "Etasje", "Antall rom", "Soverom", "BRA-i", "Prisantydning", "Omk.", "Fellesgjeld", "Felleskost./mnd.", "Status", "Eierform"])
for floor in range(1, 5):
    for number in range(1, 7):
        index = (floor - 1) * 6 + number
        price = 3_200_000 + index * 85_000
        status = "Solgt" if index % 7 == 0 else "Reservert" if index % 5 == 0 else "Ledig"
        sheet.append([f"B-{floor}0{number}", floor, 2 + number % 3, 1 + number % 3, 54 + number + 0.5, price, round(price * 0.025), 0, 3450, status, "Selveier"])

book.save(Path(__file__).with_name("enheter.xlsx"))
