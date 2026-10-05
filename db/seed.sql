-- =====================================================================
--  Katalog: Med, Melem, Čaj. Briše postojeći katalog pa ga upisuje ponovo,
--  pa se može pokretati više puta:
--    npm run db:seed:local
--    npx wrangler d1 execute libraherbal_db --remote --file db/seed.sql
--  Cene su u parama (1 RSD = 100) — privremene, po kategoriji.
--  Opisi proizvoda su nacrt (bez tvrdnji o lečenju), opisi sastojaka su još Lorem Ipsum.
-- =====================================================================

-- ---------------------------------------------------------------------
--  Brisanje starog kataloga (deca pre roditelja zbog FOREIGN KEY)
-- ---------------------------------------------------------------------
DELETE FROM popular_products;
DELETE FROM product_recommendations;
DELETE FROM product_ingredients;
DELETE FROM product_purposes;
DELETE FROM prices;
DELETE FROM images;
DELETE FROM reviews;
DELETE FROM products;
DELETE FROM ingredients;
DELETE FROM purposes;
DELETE FROM categories;

-- ---------------------------------------------------------------------
--  Kategorije (sve glavne, bez roditelja) i svrhe
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, slug) VALUES
  (1, 'Med',   'med'),
  (2, 'Melem', 'melem'),
  (3, 'Čaj',   'caj');

INSERT INTO purposes (id, name, slug, sort_order) VALUES
  (1, 'Imunitet',            'imunitet',            1),
  (2, 'Krvna slika',         'krvna-slika',         2),
  (3, 'Varenje i prostata',  'varenje-i-prostata',  3),
  (4, 'Energija',            'energija',            4),
  (5, 'Smirenje i spavanje', 'smirenje-i-spavanje', 5);

-- ---------------------------------------------------------------------
--  Proizvodi
-- ---------------------------------------------------------------------
INSERT INTO products (id, category_id, name, slug, description, usage_instructions, nutrition_info, weight_label, stock) VALUES
  -- Med (370ml)
  (1,  1, 'Imuno Med',  'imuno-med',  'Imuno Med je domaći med obogaćen ehinaceom, đumbirom, acerolom i godži bobicama. Acerola je bogat prirodni izvor vitamina C, pa je ova mešavina dobar izbor za podršku imunitetu tokom jeseni i zime. Jedna kašičica dnevno, samostalno ili u mlakom čaju.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (2,  1, 'Bronhi Med', 'bronhi-med', 'Bronhi Med spaja domaći med sa propolisom, nanom i divljim origanom, biljem koje se tradicionalno koristi za grlo i disajne puteve. Osvežavajućeg ukusa, idealan za hladnije dane i sezonu prehlada.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (3,  1, 'Gvožđe Med', 'gvozdje-med', 'Gvožđe Med je domaći med sa semenom koprive i acerolom. Kopriva je tradicionalni izvor minerala, a vitamin C iz acerole doprinosi boljem iskorišćavanju gvožđa iz hrane. Prirodna podrška za dobru krvnu sliku.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (4,  1, 'Kids Med',   'kids-med',   'Kids Med je blaga mešavina domaćeg meda, kurkume, cimeta i propolisa, prilagođena ukusu najmlađih. Prirodna podrška imunitetu dece tokom vrtićke i školske sezone. Med nije namenjen deci mlađoj od godinu dana.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (5,  1, 'Fokus Med',  'fokus-med',  'Fokus Med kombinuje domaći med sa ginkom, ženšenom, ruzmarinom i zelenim čajem, biljem koje se tradicionalno koristi za energiju, koncentraciju i budnost. Za ispite, posao i duge radne dane.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (6,  1, 'Relax Med',  'relax-med',  'Relax Med je domaći med sa valerijanom, matičnjakom i nanom. Umirujuća mešavina za kraj dana: kašičica uveče, samostalno ili u mlakom čaju, za opuštanje i miran san.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  (7,  1, 'Ladys Med',  'ladys-med',  'Ladys Med je domaći med sa đumbirom, cimetom, srdačicom i kamilicom, biljem koje se tradicionalno koristi za žensko zdravlje i opuštanje. Topao, začinski ukus za svaki dan u mesecu.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '370ml', 50),
  -- Melem
  (8,  2, 'Melem za artritis',   'melem-za-artritis',   'Melem za artritis na bazi shea butera i pčelinjeg voska, sa uljima kantariona, nevena, tamjana i ruzmarina, mentom i vitaminom E. Za masažu ukočenih i umornih zglobova i mišića.', 'Naneti tanak sloj na čistu kožu 2–3 puta dnevno i lagano umasirati.', NULL, '50g', 50),
  (9,  2, 'Melem za pluća',      'melem-za-pluca',      'Melem za pluća od guščije masti i pčelinjeg voska, sa uljima smilja, timijana i bora, divljim origanom i eukaliptusom. Tradicionalno se utrljava na grudi i leđa tokom prehlade, za lakše disanje.', 'Naneti tanak sloj na čistu kožu 2–3 puta dnevno i lagano umasirati.', NULL, '80g', 50),
  (10, 2, 'Melem za vene',       'melem-za-vene',       'Melem za vene sa shea buterom, tamanu uljem, uljima nevena, mente, čempresa i ruzmarina, pčelinjim voskom i vitaminom E. Za negu i osveženje umornih, teških nogu.', 'Naneti tanak sloj na čistu kožu 2–3 puta dnevno i lagano umasirati.', NULL, '80g', 50),
  (11, 2, 'Melem za hemoroide',  'melem-za-hemoroide',  'Melem za hemoroide od guščije masti, pčelinjeg voska, ulja kantariona i nevena i vitamina E. Blaga, umirujuća nega za osetljivu kožu, bez veštačkih mirisa i boja.', 'Naneti tanak sloj na čistu kožu 2–3 puta dnevno i lagano umasirati.', NULL, '50g', 50),
  -- Čaj (80g)
  (12, 3, 'GastroCalm',          'gastrocalm',          'GastroCalm je biljni čaj od kima, morača, matičnjaka, kamilice, nane i kantariona. Mešavina koja se tradicionalno pije posle obroka, za lakše varenje i smiren stomak.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (13, 3, 'DetoxTea',            'detoxtea',            'DetoxTea je biljni čaj od krušine, maslačka, peršuna, crnog čaja, komorača i koprive. Mešavina za prirodno čišćenje organizma i redovno varenje. Ne preporučuje se duža upotreba bez pauze.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (14, 3, 'UroBalans',           'urobalans',           'UroBalans je biljni čaj od uve, breze, lista brusnice, rastavića, žalfije i bosiljka. Bilje koje se tradicionalno koristi kao podrška zdravlju urinarnog trakta i bešike.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (15, 3, 'PulmoRelax',          'pulmorelax',          'PulmoRelax je biljni čaj od belog sleza, sladića i podbela, bilja poznatog po blagom dejstvu na grlo i disajne puteve. Topla šolja za dane kada vas muči kašalj ili promuklost.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (16, 3, 'JetraDetox',          'jetradetox',          'JetraDetox je biljni čaj od pelina, bosiljka, majčine dušice, mlečike, kamilice i hajdučke trave. Gorka, aromatična mešavina koja se tradicionalno pije kao podrška jetri i varenju.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (17, 3, 'OpustiSe',            'opustise',            'OpustiSe je biljni čaj od valerijane, nane i matičnjaka. Blaga večernja mešavina za opuštanje posle napornog dana i lakše uspavljivanje.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti uveče.', NULL, '80g', 50),
  (18, 3, 'AngioRelax',          'angiorelax',          'AngioRelax je biljni čaj od nane, hajdučke trave, valerijane, gloga i matičnjaka. Umirujuća mešavina sa glogom, biljkom koja se tradicionalno koristi kao podrška srcu i krvnim sudovima.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50),
  (19, 3, 'Čaj za hipertenziju', 'caj-za-hipertenziju', 'Čaj za hipertenziju je mešavina lipe, valerijane, hajdučke trave, gloga, imele, breze i drugog bilja koje se tradicionalno koristi kao podrška normalnom krvnom pritisku. Ne zamenjuje terapiju koju je propisao lekar.', 'Jednu kašiku čaja preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '80g', 50);

INSERT INTO product_purposes (product_id, purpose_id) VALUES
  (1, 1), (2, 1), (4, 1), (15, 1),          -- Imunitet
  (3, 2), (19, 2),                          -- Krvna slika
  (12, 3), (13, 3), (14, 3), (16, 3),       -- Varenje i prostata
  (5, 4),                                   -- Energija
  (6, 5), (17, 5), (18, 5);                 -- Smirenje i spavanje

-- Privremene cene: Med 1490, Melem 990, Čaj 700 RSD
INSERT INTO prices (product_id, price) VALUES
  (1, 149000), (2, 149000), (3, 149000), (4, 149000), (5, 149000), (6, 149000), (7, 149000),
  (8, 99000), (9, 99000), (10, 99000), (11, 99000),
  (12, 70000), (13, 70000), (14, 70000), (15, 70000), (16, 70000), (17, 70000), (18, 70000), (19, 70000);

-- Privremene fotografije dok ne stignu prave
INSERT INTO images (product_id, src, alt_text, sort_order, is_primary) VALUES
  (1,  '/assets/img/med-kopriva.jpg', 'Imuno Med',           0, 1),
  (2,  '/assets/img/cisto-med.jpg',   'Bronhi Med',          0, 1),
  (3,  '/assets/img/med-kopriva.jpg', 'Gvožđe Med',          0, 1),
  (4,  '/assets/img/cisto-med.jpg',   'Kids Med',            0, 1),
  (5,  '/assets/img/med-kopriva.jpg', 'Fokus Med',           0, 1),
  (6,  '/assets/img/cisto-med.jpg',   'Relax Med',           0, 1),
  (7,  '/assets/img/med-kopriva.jpg', 'Ladys Med',           0, 1),
  (8,  '/assets/img/opusti-se.jpg',   'Melem za artritis',   0, 1),
  (9,  '/assets/img/opusti-se.jpg',   'Melem za pluća',      0, 1),
  (10, '/assets/img/opusti-se.jpg',   'Melem za vene',       0, 1),
  (11, '/assets/img/opusti-se.jpg',   'Melem za hemoroide',  0, 1),
  (12, '/assets/img/uro-balans.jpg',  'GastroCalm',          0, 1),
  (13, '/assets/img/opusti-se.jpg',   'DetoxTea',            0, 1),
  (14, '/assets/img/uro-balans.jpg',  'UroBalans',           0, 1),
  (15, '/assets/img/opusti-se.jpg',   'PulmoRelax',          0, 1),
  (16, '/assets/img/uro-balans.jpg',  'JetraDetox',          0, 1),
  (17, '/assets/img/opusti-se.jpg',   'OpustiSe',            0, 1),
  (18, '/assets/img/uro-balans.jpg',  'AngioRelax',          0, 1),
  (19, '/assets/img/opusti-se.jpg',   'Čaj za hipertenziju', 0, 1);

-- ---------------------------------------------------------------------
--  Sastojci (jedinstveni, dele se između proizvoda)
-- ---------------------------------------------------------------------
INSERT INTO ingredients (id, name, description) VALUES
  (1,  'Ehinacea',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (2,  'Đumbir',           'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (3,  'Acerola cherry',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (4,  'Godži bobice',     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (5,  'Propolis',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (6,  'Nana',             'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (7,  'Divlji origano',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (8,  'Seme koprive',     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (9,  'Kurkuma',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (10, 'Cimet',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (11, 'Ginko',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (12, 'Ženšen',           'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (13, 'Ruzmarin',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (14, 'Zeleni čaj',       'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (15, 'Valerijana',       'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (16, 'Matičnjak',        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (17, 'Srdačica',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (18, 'Kamilica',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (19, 'Shea butter',      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (20, 'Ulje kantariona',  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (21, 'Ulje nevena',      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (22, 'Ulje tamjana',     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (23, 'Ulje ruzmarina',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (24, 'Menta',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (25, 'Vitamin E',        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (26, 'Pčelinji vosak',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (27, 'Guščija mast',     'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (28, 'Ulje smilja',      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (29, 'Ulje timijana',    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (30, 'Eukaliptus',       'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (31, 'Ulje bora',        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (32, 'Tamanu ulje',      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (33, 'Ulje mente',       'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (34, 'Ulje čempresa',    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (35, 'Kim',              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (36, 'Morač',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (37, 'Kantarion',        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (38, 'Krušina',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (39, 'Maslačak',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (40, 'Peršun',           'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (41, 'Crni čaj',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (42, 'Komorač',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (43, 'Kopriva',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (44, 'Uva',              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (45, 'Breza',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (46, 'List brusnice',    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (47, 'Rastavić',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (48, 'Žalfija',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (49, 'Bosiljak',         'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (50, 'Beli slez',        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (51, 'Sladić',           'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (52, 'Podbel',           'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (53, 'Pelin',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (54, 'Majčina dušica',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (55, 'Mlečika',          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (56, 'Hajdučka trava',   'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (57, 'Glog',             'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (58, 'Lipa',             'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (59, 'Imela',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
  (60, 'Spiak',            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.');

-- sort_order = redosled iz recepture (01, 02, 03…)
INSERT INTO product_ingredients (product_id, ingredient_id, sort_order) VALUES
  -- Imuno Med
  (1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4),
  -- Bronhi Med
  (2, 5, 1), (2, 6, 2), (2, 7, 3),
  -- Gvožđe Med
  (3, 8, 1), (3, 3, 2),
  -- Kids Med
  (4, 9, 1), (4, 10, 2), (4, 5, 3),
  -- Fokus Med
  (5, 11, 1), (5, 12, 2), (5, 13, 3), (5, 14, 4),
  -- Relax Med
  (6, 15, 1), (6, 16, 2), (6, 6, 3),
  -- Ladys Med
  (7, 2, 1), (7, 10, 2), (7, 17, 3), (7, 18, 4),
  -- Melem za artritis
  (8, 19, 1), (8, 20, 2), (8, 21, 3), (8, 22, 4), (8, 23, 5), (8, 24, 6), (8, 25, 7), (8, 26, 8),
  -- Melem za pluća
  (9, 27, 1), (9, 28, 2), (9, 29, 3), (9, 7, 4), (9, 30, 5), (9, 31, 6), (9, 26, 7), (9, 25, 8),
  -- Melem za vene
  (10, 19, 1), (10, 32, 2), (10, 21, 3), (10, 26, 4), (10, 33, 5), (10, 34, 6), (10, 23, 7), (10, 25, 8),
  -- Melem za hemoroide
  (11, 27, 1), (11, 26, 2), (11, 20, 3), (11, 21, 4), (11, 25, 5),
  -- GastroCalm
  (12, 35, 1), (12, 36, 2), (12, 16, 3), (12, 18, 4), (12, 6, 5), (12, 37, 6),
  -- DetoxTea
  (13, 38, 1), (13, 39, 2), (13, 40, 3), (13, 41, 4), (13, 42, 5), (13, 43, 6),
  -- UroBalans
  (14, 44, 1), (14, 45, 2), (14, 46, 3), (14, 47, 4), (14, 48, 5), (14, 49, 6),
  -- PulmoRelax
  (15, 50, 1), (15, 51, 2), (15, 52, 3),
  -- JetraDetox
  (16, 53, 1), (16, 49, 2), (16, 54, 3), (16, 55, 4), (16, 18, 5), (16, 56, 6),
  -- OpustiSe
  (17, 15, 1), (17, 6, 2), (17, 16, 3),
  -- AngioRelax
  (18, 6, 1), (18, 56, 2), (18, 15, 3), (18, 57, 4), (18, 16, 5),
  -- Čaj za hipertenziju
  (19, 60, 1), (19, 58, 2), (19, 15, 3), (19, 56, 4), (19, 57, 5), (19, 59, 6), (19, 45, 7);

-- ---------------------------------------------------------------------
--  Kuriranje: "Popularni artikli" na početnoj
--  (Preporučeni ispod proizvoda: bez ručnog izbora, API dopunjava iz iste kategorije)
-- ---------------------------------------------------------------------
INSERT INTO popular_products (product_id, sort_order) VALUES
  (1, 1), (2, 2), (14, 3), (17, 4);

-- ---------------------------------------------------------------------
--  Blog: primer objave (sadrži sve vrste blokova)
-- ---------------------------------------------------------------------
INSERT INTO blog_posts (slug, title, description, body, image, image_alt, tags, featured, status, published_at) VALUES
  ('kopriva-u-svakodnevnoj-ishrani', 'Kopriva u svakodnevnoj ishrani',
   'Kako se ova poznata biljka tradicionalno koristi i zašto je cenjena generacijama.',
   'Kopriva raste svuda oko nas: uz puteve, na rubovima šume i u svakom dvorištu koje malo zapustimo. Upravo zato je lako zaboravimo, iako je generacijama bila jedna od prvih zelenih namirnica posle zime.

## Zašto baš kopriva

Mladi listovi koprive bogati su gvožđem, kalcijumom, magnezijumom i vitaminom C. U narodnoj tradiciji koristila se kao prolećna „čistka", za jačanje posle bolesti i kao zamena za spanać u pitama i čorbama.

## Kako je brati

Berite samo mlade vrhove, pre cvetanja, daleko od puteva i njiva koje se prskaju. Obavezno nosite rukavice, a žarenje nestaje čim se listovi kratko prokuvaju ili osuše.

> Najbolja kopriva je ona koju uberete u aprilu i maju, dok su listovi mekani i svetlo zeleni.

## Kopriva na tanjiru

Blanširani listovi mogu se dodati u čorbe, rižoto, pite i omlete. Osušena kopriva je odlična kao čaj: kašičica listova prelije se šoljom vrele vode i ostavi da odstoji pet do sedam minuta.

::note{title="Napomena"}
Kopriva može da utiče na dejstvo nekih lekova (npr. za razređivanje krvi ili pritisak). Ako koristite terapiju, pre redovne upotrebe se posavetujte sa lekarom.
::

## Kopriva i med

Med ublažava travnati ukus koprivinog čaja i čini ga prijatnijim za svakodnevno pijenje. Nekoliko jednostavnih kombinacija:

- Čaj od koprive sa kašičicom meda, kada se malo prohladi
- Kopriva, limun i med, kao osvežavajući hladni čaj leti
- Pesto od blanširane koprive, oraha i maslinovog ulja, sa kapljicom meda',
   '/assets/blog/kopriva-u-svakodnevnoj-ishrani.jpg', 'Tegla meda Libra Herbal među listovima koprive na šumskom proplanku',
   '["Ishrana","Saveti","Med"]', 1, 'published', '2026-10-05');

INSERT INTO blog_post_products (post_id, product_id, sort_order)
SELECT b.id, p.id, x.sort_order
FROM blog_posts b
JOIN (SELECT 'gvozdje-med' AS slug, 1 AS sort_order UNION ALL SELECT 'imuno-med', 2) x
JOIN products p ON p.slug = x.slug
WHERE b.slug = 'kopriva-u-svakodnevnoj-ishrani';
