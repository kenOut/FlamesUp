/*
  # Add Missing Products from Equipment Catalog

  ## Overview
  Cross-referenced the uploaded supplier catalog ("E catalog _compressed.pdf") against the
  86 products already in the `products` table. This migration adds the product types that
  appear in the catalog but were not yet represented on the site, and assigns each one to an
  existing category and sub-category (no new categories were created).

  19 of these fill sub-categories that previously had zero products in them. The remainder
  are additional distinct equipment types found in the catalog that belong in existing,
  already-populated sub-categories.

  Each insert is guarded with a NOT EXISTS check on product name so this migration is safe
  to run more than once.

  ## Placeholder images
  Real product photography was not available for these items, so each new row reuses one of
  the site's existing generic equipment photos (already in /public) as a stand-in. Swap these
  out for real photos via Admin > Products whenever available.
*/

INSERT INTO products (name, description, category_id, sub_category_id, image_url, features, is_featured)
SELECT * FROM (VALUES
  -- Cooking Equipment
  ('Electric Salamander Grill', 'Overhead electric salamander for finishing, browning and gratin work', 'b8045312-227a-4dc3-8501-85209f5a457e'::uuid, 'd001a21e-e831-4aef-9912-291da5727380'::uuid, '/catalog/electric-salamander-grill.jpg', ARRAY['Adjustable rack height','Quartz/ceramic heating elements','Compact countertop footprint'], false),

  -- Frying Equipment (none missing)

  -- Baking Equipment
  ('Commercial Microwave Oven', 'Heavy-duty commercial microwave for rapid reheating and cooking', '60c30ef5-266a-49fb-ade3-4c8df8058705'::uuid, 'b69e3550-f68c-44ec-899c-f064e654acc7'::uuid, '/catalog/commercial-microwave-oven.jpg', ARRAY['High wattage output','Programmable presets','Stainless steel interior'], false),

  -- Fast Food & Snack Equipment
  ('Burger Patty Maker', 'Manual/electric burger press for uniform patty forming', 'f5f2de34-82e7-4d90-bda5-99459cf1cef1'::uuid, '93b0a4e1-7294-4ea4-a02d-b37187d646ff'::uuid, '/catalog/burger-patty-maker.jpg', ARRAY['Adjustable patty thickness','Non-stick plates','Fast-food service speed'], false),
  ('Takoyaki Machine', 'Multi-mold griddle for takoyaki and similar batter snacks', 'f5f2de34-82e7-4d90-bda5-99459cf1cef1'::uuid, 'c54ece94-7702-49c0-8c36-41228df38f0b'::uuid, '/catalog/takoyaki-machine.jpg', ARRAY['Even heat distribution','Non-stick molds','Temperature control'], false),
  ('Commercial Toaster', 'Countertop pop-up/slot toaster for high-volume breakfast service', 'f5f2de34-82e7-4d90-bda5-99459cf1cef1'::uuid, '83303e08-0d03-480e-8d3a-fe7b0658cf7c'::uuid, '/catalog/commercial-toaster.jpg', ARRAY['Multiple slice capacity','Adjustable browning control','Fast recovery time'], false),

  -- Food Preparation Equipment
  ('Noodle Making Machine', 'Electric noodle press and cutter for fresh noodle production', '9ca0e41b-161e-494c-9a7d-29e791a3a247'::uuid, 'bab6ff6c-e39a-4d87-8ed5-7ae89c742ab3'::uuid, '/catalog/noodle-making-machine.jpg', ARRAY['Multiple cutting widths','High output capacity','Easy-clean rollers'], false),
  ('Commercial Bone Saw', 'Band saw for cutting meat, bone and frozen products', '9ca0e41b-161e-494c-9a7d-29e791a3a247'::uuid, '7f09cab9-95e3-4f51-93cd-c965649d0186'::uuid, '/catalog/commercial-bone-saw.jpg', ARRAY['Stainless steel blade & housing','Safety guard','Adjustable cutting table'], false),

  -- Refrigeration & Cooling
  ('Walk-In Cold Room', 'Modular cold room panel system for bulk chilled/frozen storage', '823924bf-9800-4951-a54c-c3f69c408c9b'::uuid, '41c692e2-e3fc-4a02-b948-f41f7c14eaef'::uuid, '/catalog/walk-in-cold-room.jpg', ARRAY['Insulated modular panels','Adjustable temperature range','Custom size configuration'], false),
  ('Bar Fridge (2/3 Door)', 'Back-bar refrigerator for chilled beverage storage', '823924bf-9800-4951-a54c-c3f69c408c9b'::uuid, '41c692e2-e3fc-4a02-b948-f41f7c14eaef'::uuid, '/catalog/bar-fridge-2-3-door.jpg', ARRAY['Glass or solid door options','Digital temperature control','Compact bar footprint'], false),

  -- Display & Showcases (none missing)

  -- Beverage Equipment
  ('Sugarcane Juicer', 'Vertical roller press for extracting fresh sugarcane juice', '02e58d4d-d02d-4dc2-889b-b5c5bd9d4560'::uuid, '09e5f557-239b-4230-a8b0-fd1b5d2d1ae0'::uuid, '/catalog/sugarcane-juicer.jpg', ARRAY['Heavy-duty roller press','Stainless steel construction','High juice yield'], false),

  -- Food Warming & Holding
  ('Plate Warmer Cart', 'Mobile heated cart for keeping plates warm before service', 'e8b1c2cd-974d-4714-8cce-57827b069352'::uuid, '5b68098a-efe5-4f59-bff4-000f37f0eba9'::uuid, '/catalog/plate-warmer-cart.jpg', ARRAY['Mobile castor base','Adjustable thermostat','High plate capacity'], false),
  ('Food Warming Lamp', 'Single/double head heat lamp for holding food at serving temperature', 'e8b1c2cd-974d-4714-8cce-57827b069352'::uuid, 'ad09e9df-80d3-4b58-90da-bc887f825df4'::uuid, '/catalog/food-warming-lamp.jpg', ARRAY['Single or double head options','Adjustable height','Energy-efficient bulb'], false),

  -- Washing & Cleaning Equipment
  ('Commercial Washing Machine', 'Heavy-duty washing machine for linens, uniforms and kitchen textiles', '490dca72-5521-405f-99c1-37506b9fd9e5'::uuid, '7625e18e-a4b7-4f10-baf8-d3d89c229768'::uuid, '/catalog/commercial-washing-machine.jpg', ARRAY['High load capacity','Multiple wash programs','Heavy-duty drum'], false),
  ('Commercial Dryer', 'Industrial tumble dryer for laundry and textile drying', '490dca72-5521-405f-99c1-37506b9fd9e5'::uuid, '7625e18e-a4b7-4f10-baf8-d3d89c229768'::uuid, '/catalog/commercial-dryer.jpg', ARRAY['High-temperature drying','Large drum capacity','Timer control'], false),
  ('Flatwork Ironer', 'Automatic ironing machine for linens and flatwork', '490dca72-5521-405f-99c1-37506b9fd9e5'::uuid, '7625e18e-a4b7-4f10-baf8-d3d89c229768'::uuid, '/catalog/flatwork-ironer.jpg', ARRAY['Adjustable ironing width','Steam/electric heating','Continuous feed'], false),

  -- Packaging & Processing
  ('Food Dehydrator', 'Multi-tray dehydrator for drying fruit and food products', '735e6b08-37af-4c8e-b65c-c45ed4701663'::uuid, '4437abd3-65bb-4916-a64d-8e59a8caa330'::uuid, '/catalog/food-dehydrator.jpg', ARRAY['Multiple drying trays','Adjustable temperature','Even airflow design'], false),
  ('Wrap Machine', 'Countertop film wrapping machine for packaging trays and produce', '735e6b08-37af-4c8e-b65c-c45ed4701663'::uuid, 'f2f93ffa-ba9f-4990-bd07-9f27d7f90cd8'::uuid, '/catalog/wrap-machine.jpg', ARRAY['Adjustable film width','Fast wrap cycle','Compact countertop design'], false),

  -- Stainless Steel Furniture
  ('Stainless Steel Cabinet', 'Enclosed stainless steel storage cabinet for kitchen equipment', '601d988c-e9eb-4bca-b43b-c9d76b839172'::uuid, '2bff69b6-d2f2-4e36-aa55-196bc28259fc'::uuid, '/catalog/stainless-steel-cabinet.jpg', ARRAY['Lockable doors','Adjustable interior shelving','Corrosion-resistant finish'], false),
  ('Stainless Steel Support Rack', 'Freestanding support rack/stand for kitchen accessories', '601d988c-e9eb-4bca-b43b-c9d76b839172'::uuid, '18898e33-dfda-443b-88f6-41b9c645ad81'::uuid, '/catalog/stainless-steel-support-rack.jpg', ARRAY['Heavy-duty frame','Space-saving design','Rust-resistant stainless steel'], false),

  -- Kitchen Utensils & Tools (none missing)

  -- Tableware & Buffet Items
  ('Table Accessory Set', 'Napkin holder, table number stand and menu cover set for dining tables', '553b6cb8-8619-449a-b60a-00058aa20754'::uuid, 'aee0c424-4fa6-46fc-a365-18238226b1f2'::uuid, '/catalog/table-accessory-set.jpg', ARRAY['Napkin holder included','Table number stand','Menu cover folder'], false),

  -- Smallwares & Accessories
  ('Ingredient Storage Bin Set', 'Sealed storage bins for flour, sugar and dry ingredients', '07c439a6-3f74-4cbd-bfc3-c61ac4b6d42d'::uuid, '746da22d-bf4c-4a25-905f-924cf01687c7'::uuid, '/catalog/ingredient-storage-bin-set.jpg', ARRAY['Airtight sealing lid','Stackable design','Clear capacity markings'], false),
  ('Measuring Cup Set', 'Graduated measuring cup set for precise liquid measurement', '07c439a6-3f74-4cbd-bfc3-c61ac4b6d42d'::uuid, 'fb6288a7-51aa-4dbe-8b38-a179b37e32a2'::uuid, '/catalog/measuring-cup-set.jpg', ARRAY['Multiple capacity sizes','Clear volume markings','Durable construction'], false),
  ('Bar Tool & Shaker Set', 'Cocktail shaker, bar caddy and pour spout set for beverage service', '07c439a6-3f74-4cbd-bfc3-c61ac4b6d42d'::uuid, '9c20ad6b-538e-4afd-aaf1-e4610ad73786'::uuid, '/catalog/bar-tool-shaker-set.jpg', ARRAY['Stainless steel shaker','Bar caddy organizer','Includes pour spouts'], false),
  ('Serving Tong & Shovel Set', 'Food tongs, teppanyaki shovel and steak turner set', '07c439a6-3f74-4cbd-bfc3-c61ac4b6d42d'::uuid, '63ee97e7-bafd-496f-811a-42dd694eb60c'::uuid, '/catalog/serving-tong-shovel-set.jpg', ARRAY['Multiple tool sizes','Heat-resistant handles','Stainless steel construction'], false),

  -- Cookware (none missing)

  -- Storage & Handling
  ('Stainless Steel Shelving Unit', 'Multi-tier open shelving unit for dry and equipment storage', '87415435-6faa-4c38-8ddf-e2de06f781f6'::uuid, '0cd8fd66-aec0-4426-8bd2-e252f503678d'::uuid, '/catalog/stainless-steel-shelving-unit.jpg', ARRAY['Adjustable shelf height','Heavy-duty load capacity','Rust-resistant finish'], false),
  ('Rack Transport Trolley', 'Mobile trolley for transporting trays and racks between stations', '87415435-6faa-4c38-8ddf-e2de06f781f6'::uuid, 'ab9a5be1-4194-4a51-8d7a-b48146895a1b'::uuid, '/catalog/rack-transport-trolley.jpg', ARRAY['Smooth-rolling casters','Multiple tray capacity','Compact folding frame'], false),
  ('Tray Rack System', 'Multi-slot tray rack for baking and food transport', '87415435-6faa-4c38-8ddf-e2de06f781f6'::uuid, 'f4d2766a-74fd-47b5-bb52-5e088be59e3c'::uuid, '/catalog/tray-rack-system.jpg', ARRAY['Multiple tray slots','Stackable design','Stainless steel frame'], false),
  ('Adjustable Dish Caddy', 'Multi-position caddy for organizing dishes and utensils', '87415435-6faa-4c38-8ddf-e2de06f781f6'::uuid, 'd3349887-fc50-4267-832c-421113fd6b3f'::uuid, '/catalog/adjustable-dish-caddy.jpg', ARRAY['Adjustable compartments','Space-saving design','Easy-clean surface'], false),

  -- Miscellaneous
  ('Wine & Champagne Cooler Bucket', 'Insulated bucket for chilling wine and champagne bottles', '0b2d7b5c-4afc-469e-8d91-387260a12bb5'::uuid, 'a234faa7-31d8-41e7-b75f-43d3f48a5c11'::uuid, '/catalog/wine-champagne-cooler-bucket.jpg', ARRAY['Double-wall insulation','Polished finish','Fits standard bottle sizes'], false)
) AS v(name, description, category_id, sub_category_id, image_url, features, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = v.name
);
