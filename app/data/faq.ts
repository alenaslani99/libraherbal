// /cesta-pitanja — plain-text answers, so the same copy feeds the FAQPage JSON-LD.
// Keep in sync with /uslovi-koriscenja (delivery, returns, complaints).
export interface FaqItem {
  question: string
  answer: string
}

export interface FaqCategory {
  title: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    title: 'Porudžbine i plaćanje',
    items: [
      {
        question: 'Kako da poručim?',
        answer: 'Dodajte proizvode u korpu, unesite podatke za dostavu i potvrdite porudžbinu. Nalog nije obavezan, ali vam olakšava sledeće poručivanje i praćenje porudžbina.',
      },
      {
        question: 'Kako se plaća porudžbina?',
        answer: 'Plaćanje je pouzećem: porudžbinu plaćate u gotovini kuriru prilikom preuzimanja. Plaćate tačno iznos iz rezimea porudžbine, bez skrivenih troškova.',
      },
      {
        question: 'Kako da pratim svoju porudžbinu?',
        answer: 'Na stranici „Prati porudžbinu" unesite broj porudžbine i email adresu. Ako imate nalog, sve porudžbine vidite i u delu „Moje porudžbine".',
      },
    ],
  },
  {
    title: 'Dostava',
    items: [
      {
        question: 'Koliko traje dostava?',
        answer: 'Porudžbinu isporučujemo kurirskom službom za 1–3 radna dana od potvrde porudžbine.',
      },
      {
        question: 'Koliko košta dostava?',
        answer: 'Dostava je besplatna za porudžbine od 4.000,00 RSD i više. Za porudžbine ispod tog iznosa dostava košta 350,00 RSD.',
      },
      {
        question: 'Da li šaljete van Srbije?',
        answer: 'Trenutno isporučujemo samo na teritoriji Republike Srbije.',
      },
    ],
  },
  {
    title: 'Povraćaj i reklamacije',
    items: [
      {
        question: 'Mogu li da vratim proizvod?',
        answer: 'Da, u roku od 14 dana od prijema, bez navođenja razloga, ako je proizvod neotvoren, nekorišćen i u originalnom pakovanju. Iz higijenskih razloga otvoreni proizvodi se ne mogu vratiti, osim ako imaju nedostatak.',
      },
      {
        question: 'Šta ako paket stigne oštećen?',
        answer: 'Javite nam se u roku od 3 dana od prijema, po mogućstvu sa fotografijom. Oštećen ili pogrešno poslat proizvod zamenjujemo besplatno ili vraćamo novac.',
      },
      {
        question: 'Kada dobijam novac nazad?',
        answer: 'Povraćaj novca vršimo najkasnije u roku od 14 dana od dana kada primimo vraćenu robu.',
      },
    ],
  },
  {
    title: 'Proizvodi',
    items: [
      {
        question: 'Moj med se kristalisao. Da li je pokvaren?',
        answer: 'Nije. Kristalizacija je prirodan proces i znak pravog meda. Ako želite da ponovo bude tečan, zagrejte teglu u vodenom kupatilu do 40 °C.',
      },
      {
        question: 'Odakle potiču vaši proizvodi?',
        answer: 'Sarađujemo sa porodičnim pčelarima i beračima bilja iz različitih krajeva Srbije. Svaka serija meda i bilja prolazi laboratorijsku analizu.',
      },
      {
        question: 'Da li proizvode mogu da koriste trudnice i deca?',
        answer: 'Naši proizvodi su prirodni preparati, a ne lekovi. Trudnice, dojilje, deca i osobe koje koriste lekove ili su alergične na pčelinje proizvode treba da se pre upotrebe posavetuju sa lekarom.',
      },
    ],
  },
]
