<script setup lang="ts">
import { contact } from '~/data/footer'

usePageSeo({
  title: 'Uslovi korišćenja',
  description: 'Uslovi korišćenja sajta Libra Herbal: poručivanje, cene, plaćanje pouzećem, dostava širom Srbije, povraćaj robe i reklamacije.',
})

const sections = [
  { id: 'uvod', title: 'Uvod' },
  { id: 'koriscenje-sajta', title: 'Korišćenje sajta' },
  { id: 'korisnicki-nalog', title: 'Korisnički nalog' },
  { id: 'porucivanje-i-cene', title: 'Poručivanje i cene' },
  { id: 'nacin-placanja', title: 'Način plaćanja' },
  { id: 'dostava', title: 'Dostava' },
  { id: 'povracaj-robe', title: 'Pravo na povraćaj robe' },
  { id: 'kvalitet-i-reklamacije', title: 'Kvalitet i reklamacije' },
  { id: 'intelektualna-svojina', title: 'Intelektualna svojina' },
  { id: 'ogranicenje-odgovornosti', title: 'Ograničenje odgovornosti' },
  { id: 'izmene-uslova', title: 'Izmene uslova' },
  { id: 'kontakt', title: 'Kontakt' },
]

const link = 'font-semibold text-forest underline underline-offset-4 transition-colors hover:text-sun-dark'
</script>

<template>
  <LegalPage title="Uslovi korišćenja" icon="lucide:file-text" updated="4. oktobar 2026." :sections="sections">
    <LegalSection id="uvod">
      <p>
        Ovi Uslovi korišćenja uređuju odnos između Libra Herbal (u daljem tekstu „mi”) i korisnika (u daljem tekstu „vi”)
        sajta <NuxtLink to="/" :class="link">libraherbal.rs</NuxtLink>. Korišćenjem našeg sajta prihvatate ove Uslove u celosti.
        Ukoliko se ne slažete sa nekom od odredbi, molimo vas da ne koristite naše usluge.
      </p>
      <p>
        Prodaja robe putem interneta vrši se u skladu sa Zakonom o zaštiti potrošača i Zakonom o elektronskoj trgovini Republike Srbije.
      </p>
    </LegalSection>

    <LegalSection id="koriscenje-sajta">
      <p>Pristupom i korišćenjem sajta obavezujete se da:</p>
      <LegalList
        :items="[
          'Koristite sajt u skladu sa važećim propisima i ovim Uslovima.',
          'Nećete ometati rad sajta, niti pokušavati neovlašćen pristup.',
          'Nećete koristiti sadržaj sajta u komercijalne svrhe bez našeg pisanog odobrenja.',
          'Prilikom registracije i poručivanja unosite tačne i potpune podatke.',
        ]"
      />
      <p>Zadržavamo pravo da ograničimo pristup korisnicima koji krše ove Uslove.</p>
    </LegalSection>

    <LegalSection id="korisnicki-nalog">
      <p>
        Registracijom na sajtu dobijate pristup svom korisničkom nalogu, koji vam omogućava brže poručivanje i pregled istorije porudžbina.
        Poručivanje je moguće i bez naloga.
      </p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Odgovornost', text: 'vi ste odgovorni za čuvanje svoje lozinke i za sve aktivnosti pod vašim nalogom.' },
          { term: 'Tačnost podataka', text: 'obavezni ste da ažurirate svoje podatke u slučaju promene.' },
          { term: 'Brisanje naloga', text: 'možete zatražiti brisanje naloga u svakom trenutku.' },
        ]"
      />
      <p>
        Više o obradi podataka pročitajte u našoj <NuxtLink to="/politika-privatnosti" :class="link">Politici privatnosti</NuxtLink>.
      </p>
    </LegalSection>

    <LegalSection id="porucivanje-i-cene">
      <p>
        Sve cene na sajtu su izražene u dinarima (RSD). Prikazane cene važe u trenutku poručivanja i obavezuju nas do potvrde porudžbine.
      </p>
      <LegalList
        :items="[
          'Porudžbina se smatra primljenom kada dobijete potvrdu e-poštom ili telefonom.',
          'Zadržavamo pravo da odbijemo porudžbinu iz opravdanih razloga (npr. greška u ceni, nedostatak na lageru).',
          'U slučaju očigledne greške u ceni, kontaktiraćemo vas pre isporuke.',
        ]"
      />
      <LegalCallout>
        Naši proizvodi su prirodni preparati i dodaci ishrani, a ne lekovi. Ne zamenjuju raznovrsnu ishranu niti terapiju koju je propisao lekar.
        Trudnice, dojilje, deca i osobe koje koriste lekove ili su alergične na pčelinje proizvode treba da se pre upotrebe posavetuju sa lekarom.
      </LegalCallout>
    </LegalSection>

    <LegalSection id="nacin-placanja">
      <p>Trenutno omogućavamo sledeći način plaćanja:</p>
      <LegalCard icon="lucide:wallet" title="Pouzeće (prilikom preuzimanja)" highlighted>
        Plaćanje se vrši u gotovini kuriru prilikom preuzimanja porudžbine. Iznos koji plaćate je tačno onoliko koliko je prikazano
        u rezimeu porudžbine – bez skrivenih troškova.
      </LegalCard>
    </LegalSection>

    <LegalSection id="dostava">
      <p>Isporuku vršimo na teritoriji Republike Srbije preko kurirske službe.</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <LegalCard icon="lucide:truck" title="Vreme isporuke">
          1–3 radna dana od potvrde porudžbine.
        </LegalCard>
        <LegalCard icon="lucide:gift" title="Besplatna dostava">
          Za porudžbine od 4.000,00 RSD i više.
        </LegalCard>
        <LegalCard icon="lucide:banknote" title="Trošak dostave">
          Za porudžbine ispod 4.000,00 RSD dostava iznosi 350,00 RSD.
        </LegalCard>
      </div>
      <p>Rizik slučajnog gubitka ili oštećenja robe prelazi na vas u trenutku preuzimanja porudžbine od kurira.</p>
    </LegalSection>

    <LegalSection id="povracaj-robe">
      <p>
        U skladu sa Zakonom o zaštiti potrošača, imate pravo da odustanete od ugovora u roku od 14 dana od dana prijema robe,
        bez navođenja razloga.
      </p>
      <LegalList
        :items="[
          'Proizvod mora biti neotvoren, nekorišćen i u originalnom pakovanju.',
          'Troškove vraćanja robe snosite vi, osim ako je proizvod oštećen ili pogrešno isporučen.',
          'Povraćaj novca vršimo najkasnije u roku od 14 dana od dana prijema vraćene robe.',
        ]"
      />
      <LegalCallout>
        Iz higijenskih i zdravstvenih razloga, otvoreni proizvodi (med, čajevi i melemi kojima je skinuta zaštitna traka ili poklopac)
        ne mogu se vratiti, osim ako imaju nedostatak.
      </LegalCallout>
      <p>
        Za povraćaj nam pišite na <a :href="`mailto:${contact.email}`" :class="link">{{ contact.email }}</a> i navedite broj porudžbine.
      </p>
    </LegalSection>

    <LegalSection id="kvalitet-i-reklamacije">
      <p>
        Svaki proizvod proveravamo pre slanja, a svaka serija meda i bilja prolazi laboratorijsku analizu. Rok trajanja je naveden na pakovanju.
      </p>
      <LegalList
        :items="[
          'Ako paket stigne oštećen ili ste dobili pogrešan proizvod, javite nam se u roku od 3 dana od prijema, po mogućstvu sa fotografijom.',
          'Oštećen ili pogrešan proizvod zamenjujemo besplatno ili vraćamo novac.',
          'Na reklamaciju odgovaramo najkasnije u roku od 8 dana od prijema, u skladu sa zakonom.',
        ]"
      />
      <p>Kristalizacija meda je prirodan proces i znak kvaliteta, a ne nedostatak proizvoda.</p>
    </LegalSection>

    <LegalSection id="intelektualna-svojina">
      <p>Sav sadržaj na sajtu (tekstovi, fotografije, logo i dizajn) zaštićen je autorskim pravom i pripada Libra Herbal.</p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Zabranjeno', text: 'kopiranje, umnožavanje ili distribucija sadržaja bez našeg pisanog odobrenja.' },
          { term: 'Dozvoljeno', text: 'pregledanje sadržaja za ličnu upotrebu i poručivanje proizvoda.' },
        ]"
      />
    </LegalSection>

    <LegalSection id="ogranicenje-odgovornosti">
      <p>Ne snosimo odgovornost za:</p>
      <LegalList
        :items="[
          'Indirektnu štetu nastalu korišćenjem ili nemogućnošću korišćenja sajta.',
          'Posledice upotrebe proizvoda suprotno uputstvu na pakovanju.',
          'Sadržaj ili usluge trećih strana do kojih vode linkovi sa našeg sajta.',
          'Tehničke prekide rada sajta koji su van naše kontrole.',
        ]"
      />
    </LegalSection>

    <LegalSection id="izmene-uslova">
      <p>
        Zadržavamo pravo da izmenimo ove Uslove u bilo kom trenutku. Izmene stupaju na snagu objavljivanjem na sajtu, a nastavak
        korišćenja sajta smatra se prihvatanjem izmenjenih Uslova. Datum poslednje izmene naveden je na vrhu stranice.
      </p>
    </LegalSection>

    <LegalSection id="kontakt">
      <p>Za sva pitanja u vezi sa ovim Uslovima, obratite nam se:</p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Email', text: contact.email },
          { term: 'Telefon', text: contact.phone },
          { term: 'Adresa', text: `${contact.address.street}, ${contact.address.postalCode} ${contact.address.city}` },
        ]"
      />
      <p>Možete nam pisati i putem <NuxtLink to="/kontakt" :class="link">kontakt forme</NuxtLink>.</p>
    </LegalSection>
  </LegalPage>
</template>
