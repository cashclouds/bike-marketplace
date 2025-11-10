-- Insert Brands
INSERT INTO brands (name, country, logo_url) VALUES
('Trek', 'USA', 'https://www.trek.com/logo.png'),
('Giant', 'Taiwan', 'https://www.giant-bicycles.com/logo.png'),
('Specialized', 'USA', 'https://www.specialized.com/logo.png'),
('Cannondale', 'USA', 'https://www.cannondale.com/logo.png'),
('Scott', 'Switzerland', 'https://www.scott-sports.com/logo.png'),
('Merida', 'Taiwan', 'https://www.merida.com/logo.png'),
('Cube', 'Germany', 'https://www.cube.eu/logo.png'),
('Canyon', 'Germany', 'https://www.canyon.com/logo.png'),
('Orbea', 'Spain', 'https://www.orbea.com/logo.png'),
('Bianchi', 'Italy', 'https://www.bianchi.com/logo.png')
ON CONFLICT (name) DO NOTHING;

-- Insert Trek Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'FX 3', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
UNION ALL
SELECT id, 'Marlin 5', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
UNION ALL
SELECT id, 'Domane AL 2', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
UNION ALL
SELECT id, 'Slash 5', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
UNION ALL
SELECT id, 'Dual Sport 2', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
UNION ALL
SELECT id, 'X-Caliber 6', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Trek'
ON CONFLICT DO NOTHING;

-- Insert Giant Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Escape 3', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Giant'
UNION ALL
SELECT id, 'Talon 3', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Giant'
UNION ALL
SELECT id, 'Contend 3', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Giant'
UNION ALL
SELECT id, 'Stance 2', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Giant'
UNION ALL
SELECT id, 'Quick-E+ 45', 'E-bike', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Giant'
ON CONFLICT DO NOTHING;

-- Insert Specialized Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Rockhopper Sport', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Specialized'
UNION ALL
SELECT id, 'Allez Elite', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Specialized'
UNION ALL
SELECT id, 'Crosstrail 2', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Specialized'
UNION ALL
SELECT id, 'Stumpjumper Comp', 'Mountain', 'Carbon', '2020-2025' FROM brands WHERE name = 'Specialized'
UNION ALL
SELECT id, 'Turbo Vado 4', 'E-bike', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Specialized'
UNION ALL
SELECT id, 'Gravel Expert', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Specialized'
ON CONFLICT DO NOTHING;

-- Insert Cannondale Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Topstone 3', 'Gravel', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cannondale'
UNION ALL
SELECT id, 'Trail SL 3', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cannondale'
UNION ALL
SELECT id, 'Caad 13', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cannondale'
UNION ALL
SELECT id, 'Quick 2', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cannondale'
UNION ALL
SELECT id, 'Bad Boy 3', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cannondale'
UNION ALL
SELECT id, 'SuperX 3', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Cannondale'
ON CONFLICT DO NOTHING;

-- Insert Scott Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Aspect 770', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Scott'
UNION ALL
SELECT id, 'Speedster 20', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Scott'
UNION ALL
SELECT id, 'Scale 970', 'Mountain', 'Carbon', '2020-2025' FROM brands WHERE name = 'Scott'
UNION ALL
SELECT id, 'Addict Eride 10', 'E-bike', 'Carbon', '2020-2025' FROM brands WHERE name = 'Scott'
UNION ALL
SELECT id, 'Gravel 10', 'Gravel', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Scott'
ON CONFLICT DO NOTHING;

-- Insert Merida Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Big.Nine 20', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Merida'
UNION ALL
SELECT id, 'Scultura 2000', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Merida'
UNION ALL
SELECT id, 'Matts 7.10', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Merida'
UNION ALL
SELECT id, 'Silex 300', 'Gravel', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Merida'
UNION ALL
SELECT id, 'eTwo-Forty 600', 'E-bike', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Merida'
ON CONFLICT DO NOTHING;

-- Insert Cube Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Acid', 'Hybrid', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cube'
UNION ALL
SELECT id, 'Attention', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cube'
UNION ALL
SELECT id, 'Attain', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Cube'
UNION ALL
SELECT id, 'AMS 100', 'Mountain', 'Carbon', '2020-2025' FROM brands WHERE name = 'Cube'
UNION ALL
SELECT id, 'Nuroad Pro', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Cube'
ON CONFLICT DO NOTHING;

-- Insert Canyon Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Spectral 6', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Canyon'
UNION ALL
SELECT id, 'Ultimate CF 7', 'Road', 'Carbon', '2020-2025' FROM brands WHERE name = 'Canyon'
UNION ALL
SELECT id, 'Neuron AL 5', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Canyon'
UNION ALL
SELECT id, 'Endurace CF 7', 'Road', 'Carbon', '2020-2025' FROM brands WHERE name = 'Canyon'
UNION ALL
SELECT id, 'Grail CF 7', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Canyon'
UNION ALL
SELECT id, 'Exceed CF 7', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Canyon'
ON CONFLICT DO NOTHING;

-- Insert Orbea Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Alma M29', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Orbea'
UNION ALL
SELECT id, 'Avant', 'Road', 'Carbon', '2020-2025' FROM brands WHERE name = 'Orbea'
UNION ALL
SELECT id, 'Occam H30', 'Mountain', 'Carbon', '2020-2025' FROM brands WHERE name = 'Orbea'
UNION ALL
SELECT id, 'Urrun', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Orbea'
UNION ALL
SELECT id, 'Gain M20', 'E-bike', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Orbea'
ON CONFLICT DO NOTHING;

-- Insert Bianchi Models
INSERT INTO models (brand_id, name, type, frame_materials, years_available)
SELECT id, 'Mtb Hardtail', 'Mountain', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Bianchi'
UNION ALL
SELECT id, 'Via Nirone', 'Road', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Bianchi'
UNION ALL
SELECT id, 'Infinito CV', 'Road', 'Carbon', '2020-2025' FROM brands WHERE name = 'Bianchi'
UNION ALL
SELECT id, 'Gravel SVL', 'Gravel', 'Carbon', '2020-2025' FROM brands WHERE name = 'Bianchi'
UNION ALL
SELECT id, 'E-Omnia', 'E-bike', 'Aluminum', '2020-2025' FROM brands WHERE name = 'Bianchi'
ON CONFLICT DO NOTHING;

-- Insert Components
INSERT INTO components (category, subcategory, brand, model, compatibility) VALUES
('Groupset', 'Road Groupset', 'Shimano', '105', 'All Road Bikes'),
('Groupset', 'Road Groupset', 'SRAM', 'Rival', 'All Road Bikes'),
('Groupset', 'Road Groupset', 'Campagnolo', 'Veloce', 'All Road Bikes'),
('Groupset', 'MTB Groupset', 'Shimano', 'Deore', 'All Mountain Bikes'),
('Groupset', 'MTB Groupset', 'SRAM', 'GX Eagle', 'All Mountain Bikes'),
('Wheels', 'Road Wheels', 'DT Swiss', 'PR 1600', 'Road Bikes'),
('Wheels', 'MTB Wheels', 'Mavic', 'Crossride', 'Mountain Bikes'),
('Brakes', 'Disc Brakes', 'Shimano', 'BR-M6020', 'All Bikes'),
('Brakes', 'Road Brakes', 'Shimano', 'Ultegra', 'Road Bikes'),
('Fork', 'MTB Fork', 'RockShox', 'Judy', 'Mountain Bikes')
ON CONFLICT DO NOTHING;
