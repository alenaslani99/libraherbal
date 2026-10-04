// Category landing pages (/med, /cajevi, /melemi): URL, SEO copy and hero text per category.
// `slug` is categories.slug in D1 — what GET /api/products?vrsta= expects.

export interface CategoryHero {
  eyebrow: string
  titleLine1: string
  titleLine2: string
  text: string
  images: [string, string]
}

export interface CategoryPage {
  slug: string
  path: string
  // breadcrumb and sidebar label
  name: string
  // what a single product is called in page titles ("Bronhi Med – prirodni med: …")
  productKind: string
  // <title> without the brand (titleTemplate adds " | Libra Herbal"), ≤ 45 characters
  title: string
  // meta description, ~150–160 characters
  description: string
  hero: CategoryHero
  // text block under the product grid
  intro: { heading: string, paragraphs: string[] }
}

export const categoryPages: CategoryPage[] = [
  {
    slug: 'med',
    path: '/med',
    name: 'Med',
    productKind: 'prirodni med',
    title: 'Prirodni med sa lekovitim biljem',
    description: 'Domaći prirodni med obogaćen lekovitim biljem: propolis, đumbir, ehinacea, kurkuma, nana. Tegle od 370 ml, dostava širom Srbije, plaćanje pouzećem.',
    hero: {
      eyebrow: 'Prirodni med',
      titleLine1: 'Med sa',
      titleLine2: 'lekovitim biljem.',
      text: 'Domaći med obogaćen pažljivo odabranim biljem, za svaki dan i svako godišnje doba.',
      images: ['/assets/img/med-kopriva.jpg', '/assets/img/cisto-med.jpg'],
    },
    intro: {
      heading: 'Domaći med obogaćen biljem',
      paragraphs: [
        'Naš med polazi od domaćeg meda proverenih pčelara, kome dodajemo lekovito bilje i prirodne dodatke kao što su propolis, đumbir, ehinacea, kurkuma i cimet. Svaka mešavina ima svoju svrhu: od podrške imunitetu u hladnijim mesecima, preko energije i fokusa, do opuštanja na kraju dana.',
        'Med pravimo u malim serijama, bez konzervansa i dodatog šećera, i pakujemo ga u staklene tegle od 370 ml. Najbolje ga je uzimati kašičicom, samostalno ili u mlakom čaju, a nikako u ključaloj tečnosti, da bi zadržao svoja prirodna svojstva.',
        'Izaberite med prema onome što vam je potrebno. Ako niste sigurni, pomoći će vam filter „Svrha“, a možete nam i pisati.',
      ],
    },
  },
  {
    slug: 'caj',
    path: '/cajevi',
    name: 'Čajevi',
    productKind: 'biljni čaj',
    title: 'Prirodni biljni čajevi od lekovitog bilja',
    description: 'Prirodni biljni čajevi od lekovitog bilja: za varenje, smirenje, detoks, disajne puteve i krvni pritisak. Pakovanja od 80 g, plaćanje pouzećem.',
    hero: {
      eyebrow: 'Biljni čajevi',
      titleLine1: 'Prirodni čajevi',
      titleLine2: 'od lekovitog bilja.',
      text: 'Mešavine bilja za svakodnevnu šolju: za varenje, smirenje, lakše disanje i dobar san.',
      images: ['/assets/img/uro-balans.jpg', '/assets/img/opusti-se.jpg'],
    },
    intro: {
      heading: 'Biljni čajevi za svaki dan',
      paragraphs: [
        'Naši biljni čajevi su mešavine lekovitog bilja koje se u narodnoj tradiciji vekovima koristi za svakodnevnu brigu o zdravlju. Kamilica, nana, matičnjak, valerijana, kopriva, glog, žalfija i hajdučka trava samo su deo bilja koje pažljivo biramo i kombinujemo.',
        'Svaka mešavina ima jasnu namenu: GastroCalm za lakše varenje, OpustiSe i AngioRelax za opuštanje, PulmoRelax za grlo i disajne puteve, DetoxTea i JetraDetox za prirodno čišćenje organizma, UroBalans za urinarni trakt, a čaj za hipertenziju kao podrška normalnom krvnom pritisku.',
        'Čajevi dolaze u pakovanjima od 80 g. Jednu kašiku čaja prelijte sa 200 ml vrele vode, poklopite i ostavite 5–7 minuta da odstoji.',
      ],
    },
  },
  {
    slug: 'melem',
    path: '/melemi',
    name: 'Melemi',
    productKind: 'prirodni melem',
    title: 'Prirodni melemi od biljnih ulja i voska',
    description: 'Prirodni melemi od biljnih ulja, pčelinjeg voska i vitamina E: za zglobove, vene, disajne puteve i osetljivu kožu. Domaća izrada, dostava širom Srbije.',
    hero: {
      eyebrow: 'Prirodni melemi',
      titleLine1: 'Melemi od',
      titleLine2: 'biljnih ulja.',
      text: 'Ručno pravljeni melemi od pčelinjeg voska, shea butera i biljnih ulja.',
      images: ['/assets/img/opusti-se.jpg', '/assets/img/med-kopriva.jpg'],
    },
    intro: {
      heading: 'Ručno pravljeni prirodni melemi',
      paragraphs: [
        'Naši melemi nastaju od jednostavnih, prirodnih sastojaka: pčelinjeg voska, shea butera, guščije masti, vitamina E i biljnih ulja kantariona, nevena, ruzmarina, smilja i čempresa. Bez veštačkih mirisa i boja.',
        'Svaki melem ima svoju namenu: za zglobove i mišiće, za vene i umorne noge, za grudi i disajne puteve tokom prehlade i za negu osetljive kože kod hemoroida.',
        'Nanesite tanak sloj na čistu kožu dva do tri puta dnevno i lagano umasirajte. Melemi su namenjeni isključivo za spoljnu upotrebu.',
      ],
    },
  },
]

export const categoryBySlug = (slug: string) => categoryPages.find(c => c.slug === slug)
export const categoryByPath = (path: string) => categoryPages.find(c => c.path === path)
