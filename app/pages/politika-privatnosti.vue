<script setup lang="ts">
import { contact } from '~/data/footer'

usePageSeo({
  title: 'Politika privatnosti',
  description: 'Kako Libra Herbal prikuplja, koristi i čuva vaše lične podatke: porudžbine, korisnički nalog, newsletter, kolačići i vaša prava.',
})

const sections = [
  { id: 'uvod', title: 'Uvod' },
  { id: 'podaci-koje-prikupljamo', title: 'Podaci koje prikupljamo' },
  { id: 'svrha-obrade', title: 'Svrha obrade' },
  { id: 'pravni-osnov', title: 'Pravni osnov' },
  { id: 'deljenje-podataka', title: 'Deljenje podataka' },
  { id: 'cuvanje-podataka', title: 'Čuvanje podataka' },
  { id: 'bezbednost', title: 'Bezbednost' },
  { id: 'vasa-prava', title: 'Vaša prava' },
  { id: 'kolacici', title: 'Kolačići' },
  { id: 'izmene-politike', title: 'Izmene politike' },
  { id: 'kontakt', title: 'Kontakt' },
]

const link = 'font-semibold text-forest underline underline-offset-4 transition-colors hover:text-sun-dark'
</script>

<template>
  <LegalPage title="Politika privatnosti" icon="lucide:shield-check" updated="4. oktobar 2026." :sections="sections">
    <LegalSection id="uvod">
      <p>
        Libra Herbal (u daljem tekstu „mi”) poštuje vašu privatnost i posvećena je zaštiti vaših ličnih podataka. Ova Politika
        privatnosti objašnjava koje podatke prikupljamo, kako ih koristimo, čuvamo i štitimo kada koristite sajt
        <NuxtLink to="/" :class="link">libraherbal.rs</NuxtLink>.
      </p>
      <p>Podatke obrađujemo u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.</p>
    </LegalSection>

    <LegalSection id="podaci-koje-prikupljamo">
      <p>Prikupljamo samo podatke koji su nam neophodni:</p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Podaci o kupcu', text: 'ime i prezime, email adresa i broj telefona (pri registraciji ili poručivanju).' },
          { term: 'Podaci za dostavu', text: 'adresa, grad i poštanski broj.' },
          { term: 'Podaci o porudžbini', text: 'poručeni proizvodi, količina, iznos i napomena uz porudžbinu.' },
          { term: 'Poruke', text: 'sadržaj poruke i kontakt podaci koje pošaljete putem kontakt forme.' },
          { term: 'Tehnički podaci', text: 'IP adresa i podaci o pokušajima prijave, radi zaštite od zloupotrebe.' },
        ]"
      />
      <LegalCallout>
        Ne tražimo podatke o zdravlju, veri ili političkim uverenjima. Molimo vas da takve podatke ne navodite u porukama i napomenama.
      </LegalCallout>
    </LegalSection>

    <LegalSection id="svrha-obrade">
      <p>Vaše podatke koristimo isključivo za:</p>
      <LegalList
        :items="[
          'Obradu i isporuku porudžbina.',
          'Komunikaciju u vezi sa porudžbinom i odgovore na vaše poruke.',
          'Pristup korisničkom nalogu i pregled istorije porudžbina.',
          'Slanje newslettera i ponuda (samo uz vašu saglasnost).',
          'Zaštitu sajta od zloupotrebe.',
          'Ispunjavanje zakonskih obaveza.',
        ]"
      />
    </LegalSection>

    <LegalSection id="pravni-osnov">
      <p>Podatke obrađujemo na osnovu:</p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Izvršenja ugovora', text: 'za obradu i isporuku porudžbine.' },
          { term: 'Saglasnosti', text: 'za newsletter i ponude; saglasnost možete povući u svakom trenutku.' },
          { term: 'Zakonske obaveze', text: 'za vođenje poslovne i poreske evidencije.' },
          { term: 'Legitimnog interesa', text: 'za bezbednost sajta i sprečavanje prevara.' },
        ]"
      />
    </LegalSection>

    <LegalSection id="deljenje-podataka">
      <p>Vaše podatke ne prodajemo. Delimo ih samo sa partnerima neophodnim za pružanje usluge:</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <LegalCard icon="lucide:truck" title="Kurirska služba">
          Ime, adresa i telefon, radi isporuke porudžbine.
        </LegalCard>
        <LegalCard icon="lucide:server" title="Hosting">
          Sajt i baza podataka se nalaze na Cloudflare infrastrukturi.
        </LegalCard>
        <LegalCard icon="lucide:landmark" title="Državni organi">
          Samo na zakonit zahtev nadležnog organa.
        </LegalCard>
      </div>
      <p>Naši partneri su obavezni da čuvaju poverljivost vaših podataka.</p>
    </LegalSection>

    <LegalSection id="cuvanje-podataka">
      <LegalList
        variant="dot"
        :items="[
          { term: 'Podaci o porudžbinama', text: 'onoliko dugo koliko nalažu poreski i računovodstveni propisi.' },
          { term: 'Podaci o nalogu', text: 'dok je nalog aktivan ili do zahteva za brisanje.' },
          { term: 'Poruke', text: 'dok je potrebno da odgovorimo na vaš upit.' },
          { term: 'Newsletter', text: 'do odjave.' },
        ]"
      />
      <p>Po isteku ovih rokova podaci se trajno brišu ili anonimizuju.</p>
    </LegalSection>

    <LegalSection id="bezbednost">
      <p>
        Primenjujemo tehničke i organizacione mere zaštite: šifrovanu komunikaciju (HTTPS), lozinke koje čuvamo isključivo u
        heširanom obliku, zaključavanje prijave posle više neuspešnih pokušaja i pristup podacima samo ovlašćenim licima.
      </p>
      <p>Plaćanje se vrši pouzećem, tako da ne prikupljamo niti čuvamo podatke o platnim karticama.</p>
    </LegalSection>

    <LegalSection id="vasa-prava">
      <p>U skladu sa Zakonom o zaštiti podataka o ličnosti, imate pravo na:</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <LegalCard icon="lucide:eye" title="Pristup">
          Da saznate koje podatke o vama čuvamo.
        </LegalCard>
        <LegalCard icon="lucide:pencil" title="Ispravku">
          Da ispravite netačne ili nepotpune podatke.
        </LegalCard>
        <LegalCard icon="lucide:trash-2" title="Brisanje">
          Da zatražite brisanje svojih podataka.
        </LegalCard>
        <LegalCard icon="lucide:hand" title="Prigovor">
          Da se usprotivite obradi i povučete saglasnost.
        </LegalCard>
      </div>
      <p>
        Zahtev pošaljite na <a :href="`mailto:${contact.email}`" :class="link">{{ contact.email }}</a>. Odgovaramo u roku od 30 dana.
        Ako smatrate da su vam prava povređena, možete se obratiti Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.
      </p>
    </LegalSection>

    <LegalSection id="kolacici">
      <p>Sajt koristi samo ono što je neophodno za njegov rad:</p>
      <LegalList
        variant="dot"
        :items="[
          { term: 'Kolačić sesije', text: 'čuva vašu prijavu na nalog; briše se odjavom ili istekom sesije.' },
          { term: 'Lokalno skladište pregledača', text: 'pamti sadržaj korpe na vašem uređaju.' },
        ]"
      />
      <p>Ne koristimo kolačiće za analitiku ni oglašavanje. Kolačiće možete obrisati u podešavanjima pregledača, ali tada se odjavljujete sa naloga.</p>
    </LegalSection>

    <LegalSection id="izmene-politike">
      <p>
        Zadržavamo pravo da izmenimo ovu Politiku privatnosti u bilo kom trenutku. Izmene stupaju na snagu objavljivanjem na sajtu,
        a datum poslednje izmene naveden je na vrhu stranice.
      </p>
    </LegalSection>

    <LegalSection id="kontakt">
      <p>Za sva pitanja u vezi sa zaštitom podataka, obratite nam se:</p>
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
