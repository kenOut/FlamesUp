/*
  # Fix Meat Press / Meat Tongs image mismatch

  ## Overview
  A visual QA pass over all catalog-linked product images found that two smallware
  entries from the granular catalog migration were mislabeled relative to their actual
  photo: the row captioned "Meat Tongs" in the source PDF actually shows a round
  patty/meat press (black handle, flat disc), and the row captioned "Meat Press" actually
  shows a curved bench/bowl scraper. This corrects both names, descriptions, features and
  image paths to match their real photos. No image files need to move — the URLs are
  simply repointed to the photo that actually matches each corrected name.

  Order matters: "Meat Press" is freed up (renamed to "Bowl Scraper") before "Meat Tongs"
  is renamed to "Meat Press", to avoid a transient duplicate name.
*/

UPDATE products
SET name = 'Bowl Scraper',
    description = 'Bowl Scraper - curved bench/bowl scraper for portioning and cleaning mixing bowls',
    image_url = '/catalog/meat-press.jpg',
    features = ARRAY['Curved blade edge','Comfortable handle','Multi-purpose kitchen scraper']
WHERE name = 'Meat Press';

UPDATE products
SET name = 'Meat Press',
    description = 'Meat Press - round press with non-stick disc for forming uniform patties',
    image_url = '/catalog/meat-tongs.jpg',
    features = ARRAY['Non-stick press plate','Ergonomic handle','Uniform patty thickness']
WHERE name = 'Meat Tongs';
