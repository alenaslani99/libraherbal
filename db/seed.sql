-- =====================================================================
--  Početni katalog (iz dosadašnjih mock podataka). Pokrenuti JEDNOM na praznoj bazi:
--    npm run db:seed:local
--    npx wrangler d1 execute libraherbal_db --remote --file db/seed.sql
--  Cene su u parama (1 RSD = 100).
-- =====================================================================

INSERT INTO categories (id, name, slug) VALUES
  (1, 'Med',    'med'),
  (2, 'Čaj',    'caj'),
  (3, 'Melem',  'melem'),
  (4, 'Setovi', 'setovi');

INSERT INTO purposes (id, name, slug, sort_order) VALUES
  (1, 'Imunitet',            'imunitet',            1),
  (2, 'Krvna slika',         'krvna-slika',         2),
  (3, 'Varenje i prostata',  'varenje-i-prostata',  3),
  (4, 'Energija',            'energija',            4),
  (5, 'Smirenje i spavanje', 'smirenje-i-spavanje', 5);

INSERT INTO products (id, category_id, name, slug, description, usage_instructions, nutrition_info, weight_label, stock) VALUES
  (1,  1, 'Bronhi Med',        'bronhi-med',        'Bagremov med obogaćen pažljivo usitnjenim listom koprive iz domaće berbe. Blag, biljni i dovoljno svakodnevan.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '500g',  50),
  (2,  1, 'Cisto Med',         'cisto-med',         'Domaći med sa biljnim dodacima za svakodnevnu podršku organizmu.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '500g',  50),
  (3,  2, 'UroBalans',         'urobalans',         'Biljni čaj za podršku urinarnom traktu i dobrom varenju.', 'Jednu kesicu preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '100g',  50),
  (4,  2, 'OpustiSe',          'opustise',          'Umirujuća mešavina bilja za opuštanje posle napornog dana.', 'Jednu kesicu preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti uveče.', NULL, '100g',  50),
  (5,  1, 'Med sa koprivom',   'med-sa-koprivom',   'Bagremov med sa koprivom, bogat gvožđem i mineralima.', 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '500g',  50),
  (6,  1, 'Energi Med',        'energi-med',        'Med sa dodacima za više energije tokom dana.', 'Jedna kašičica ujutru, samostalno ili uz čaj.', 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.', '250g',  50),
  (7,  2, 'Imuno Čaj',         'imuno-caj',         'Biljni čaj za jačanje imuniteta u hladnijim mesecima.', 'Jednu kesicu preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti 2–3 šolje dnevno.', NULL, '100g',  50),
  (8,  3, 'Neven Melem',       'neven-melem',       'Melem od nevena za negu suve i nadražene kože.', 'Naneti tanak sloj na čistu kožu 2–3 puta dnevno.', NULL, '50ml',  50),
  (9,  4, 'Set za imunitet',   'set-za-imunitet',   'Bronhi Med, Imuno Čaj i Med sa koprivom u jednom paketu.', 'Pogledajte uputstvo na svakom proizvodu iz seta.', NULL, '3 kom', 50),
  (10, 2, 'Miran San',         'miran-san',         'Večernji čaj za miran i dubok san.', 'Jednu kesicu preliti sa 200 ml vrele vode, poklopiti i ostaviti 5–7 minuta. Piti pola sata pre spavanja.', NULL, '100g',  50),
  (11, 4, 'Set Dobro varenje', 'set-dobro-varenje', 'UroBalans čaj i Cisto Med za lakše varenje.', 'Pogledajte uputstvo na svakom proizvodu iz seta.', NULL, '2 kom', 50);

INSERT INTO product_purposes (product_id, purpose_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 5), (5, 2), (5, 4), (6, 4),
  (7, 1), (8, 1), (9, 1), (9, 4), (10, 5), (11, 3);

INSERT INTO prices (product_id, price) VALUES
  (1, 149000), (2, 120000), (3, 70000), (4, 70000), (5, 110000), (6, 85000),
  (7, 65000), (8, 95000), (9, 240000), (10, 70000), (11, 180000);

INSERT INTO images (product_id, src, alt_text, sort_order, is_primary) VALUES
  (1,  '/assets/img/med-kopriva.jpg', 'Bronhi Med — tegla meda sa koprivom',   0, 1),
  (1,  '/assets/img/cisto-med.jpg',   'Bronhi Med — tegla na kamenu sa saćem', 1, 0),
  (1,  '/assets/img/uro-balans.jpg',  'Bronhi Med — uz biljni čaj',            2, 0),
  (2,  '/assets/img/cisto-med.jpg',   'Cisto Med',         0, 1),
  (3,  '/assets/img/uro-balans.jpg',  'UroBalans',         0, 1),
  (4,  '/assets/img/opusti-se.jpg',   'OpustiSe',          0, 1),
  (5,  '/assets/img/med-kopriva.jpg', 'Med sa koprivom',   0, 1),
  (6,  '/assets/img/cisto-med.jpg',   'Energi Med',        0, 1),
  (7,  '/assets/img/uro-balans.jpg',  'Imuno Čaj',         0, 1),
  (8,  '/assets/img/opusti-se.jpg',   'Neven Melem',       0, 1),
  (9,  '/assets/img/med-kopriva.jpg', 'Set za imunitet',   0, 1),
  (10, '/assets/img/opusti-se.jpg',   'Miran San',         0, 1),
  (11, '/assets/img/uro-balans.jpg',  'Set Dobro varenje', 0, 1);

INSERT INTO ingredients (id, name, description) VALUES
  (1, 'Propolis',             'Poznat kao prirodni antibiotik, štiti organizam od bakterija, virusa i gljivica, umiruje grlo i jača imunitet.'),
  (2, 'Nana',                 'Osvežava, umiruje stomak, ublažava kašalj i doprinosi boljoj probavi.'),
  (3, 'Ulje divljeg origana', 'Prirodno antimikrobno sredstvo, pomaže u borbi protiv infekcija i ojačava odbrambene mehanizme organizma.');

INSERT INTO product_ingredients (product_id, ingredient_id, sort_order) VALUES
  (1, 1, 1), (1, 2, 2), (1, 3, 3);

INSERT INTO popular_products (product_id, sort_order) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4);

INSERT INTO product_recommendations (product_id, recommended_product_id, sort_order) VALUES
  (1, 7, 1), (1, 9, 2), (1, 5, 3), (1, 2, 4);
