-- Active: 1746258881402@@127.0.0.1@3306@ecommerce_api

-- ================================================================
-- Comprehensive Sample Data for Ecommerce API
-- Based on the exact schema from Ecommerce_API.sql
-- Includes: 10 Categories, 50 Products, Product Images, Tags
-- Excludes: Users, Orders (as requested)
-- ================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- CLEAR EXISTING DATA (IN CORRECT ORDER)
-- ================================================================
DELETE FROM `product_tag`;
DELETE FROM `cart_items`;
DELETE FROM `carts`;
DELETE FROM `product_images`;
DELETE FROM `products`;
DELETE FROM `categories`;
DELETE FROM `tags`;

-- ================================================================
-- CATEGORIES (10 Main Categories)
-- ================================================================

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `created_at`, `updated_at`) VALUES
(1, 'Electronics', 'electronics', 'Electronic devices, gadgets, and accessories for modern life', NULL, NOW(), NOW()),
(2, 'Fashion & Clothing', 'fashion-clothing', 'Trendy apparel and fashion accessories for all ages and styles', NULL, NOW(), NOW()),
(3, 'Home & Garden', 'home-garden', 'Home improvement, furniture, and garden supplies for better living', NULL, NOW(), NOW()),
(4, 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment, outdoor gear, and fitness accessories', NULL, NOW(), NOW()),
(5, 'Books & Media', 'books-media', 'Books, e-books, audiobooks, and digital media content', NULL, NOW(), NOW()),
(6, 'Health & Beauty', 'health-beauty', 'Personal care, cosmetics, and wellness products for self-care', NULL, NOW(), NOW()),
(7, 'Automotive', 'automotive', 'Car accessories, parts, and automotive maintenance tools', NULL, NOW(), NOW()),
(8, 'Toys & Games', 'toys-games', 'Educational toys, board games, and entertainment for all ages', NULL, NOW(), NOW()),
(9, 'Food & Beverages', 'food-beverages', 'Gourmet foods, beverages, and premium kitchen essentials', NULL, NOW(), NOW()),
(10, 'Arts & Crafts', 'arts-crafts', 'Art supplies, craft materials, and creative tools for artists', NULL, NOW(), NOW());

-- ================================================================
-- TAGS (for product categorization)
-- ================================================================

INSERT INTO `tags` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'New Arrival', 'new-arrival', NOW(), NOW()),
(2, 'Best Seller', 'best-seller', NOW(), NOW()),
(3, 'Premium', 'premium', NOW(), NOW()),
(4, 'Eco-Friendly', 'eco-friendly', NOW(), NOW()),
(5, 'Limited Edition', 'limited-edition', NOW(), NOW()),
(6, 'Wireless', 'wireless', NOW(), NOW()),
(7, 'Portable', 'portable', NOW(), NOW()),
(8, 'Waterproof', 'waterproof', NOW(), NOW()),
(9, 'Smart', 'smart', NOW(), NOW()),
(10, 'Vintage', 'vintage', NOW(), NOW());

-- ================================================================
-- PRODUCTS (50 High-Quality Products with Detailed Descriptions)
-- ================================================================

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `stock_quantity`, `category_id`, `image_url`, `is_active`, `created_at`, `updated_at`) VALUES

(1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'The most advanced iPhone ever with titanium design, A17 Pro chip, and professional camera system. Features a 6.7-inch Super Retina XDR display, up to 2TB storage, and all-day battery life. Perfect for professionals and tech enthusiasts.', 1199.99, 25, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Revolutionary smartphone with S Pen, 200MP camera, and AI-powered features. Built with premium materials and featuring a 6.8-inch Dynamic AMOLED display. Ideal for productivity and creative professionals.', 1299.99, 30, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(3, 'MacBook Pro 16-inch M3', 'macbook-pro-16-m3', 'Ultimate laptop for professionals with M3 chip, 18-hour battery life, and stunning Liquid Retina XDR display. Features advanced thermal design and professional-grade performance for demanding workflows.', 2499.99, 15, 1, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(4, 'Sony WH-1000XM5 Headphones', 'sony-wh-1000xm5', 'Industry-leading noise canceling wireless headphones with exceptional sound quality. Features 30-hour battery life, quick charge, and premium comfort for all-day listening.', 399.99, 50, 1, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(5, 'Apple Watch Series 9', 'apple-watch-series-9', 'Most advanced smartwatch with health monitoring, fitness tracking, and cellular connectivity. Features Always-On Retina display and advanced health sensors for comprehensive wellness tracking.', 429.99, 40, 1, 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(6, 'iPad Pro 12.9-inch M2', 'ipad-pro-129-m2', 'Professional tablet with M2 chip and Liquid Retina XDR display. Perfect for creative professionals with Apple Pencil support and all-day battery life.', 1099.99, 20, 1, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(7, 'Nintendo Switch OLED', 'nintendo-switch-oled', 'Enhanced gaming console with vibrant 7-inch OLED screen, improved audio, and versatile play modes. Perfect for gaming on-the-go or at home with family and friends.', 349.99, 35, 1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(8, 'Canon EOS R6 Mark II', 'canon-eos-r6-mark-ii', 'Professional mirrorless camera with 24.2MP full-frame sensor, 40fps continuous shooting, and 8K video recording. Ideal for photographers and videographers seeking exceptional image quality.', 2499.99, 12, 1, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(9, 'Bose QuietComfort Earbuds', 'bose-quietcomfort-earbuds', 'Premium true wireless earbuds with world-class noise cancellation and superior sound quality. Features secure fit, weather resistance, and up to 6 hours of battery life.', 279.99, 45, 1, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(10, 'Tesla Model Y Wireless Charger', 'tesla-model-y-wireless-charger', 'Official Tesla wireless charging pad designed specifically for Model Y. Features premium materials, LED indicators, and fast charging capabilities for compatible devices.', 125.99, 60, 1, 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(11, 'Premium Cashmere Sweater', 'premium-cashmere-sweater', 'Luxurious 100% cashmere sweater crafted from the finest Mongolian cashmere. Features timeless design, exceptional softness, and perfect for both casual and formal occasions.', 299.99, 25, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(12, 'Designer Denim Jacket', 'designer-denim-jacket', 'Classic denim jacket with modern fit and premium Japanese denim. Features vintage-inspired details, sustainable production methods, and timeless style that never goes out of fashion.', 189.99, 40, 2, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(13, 'Luxury Silk Scarf', 'luxury-silk-scarf', 'Hand-printed silk scarf with exclusive artistic design. Made from 100% pure mulberry silk with hand-rolled edges. Perfect accessory for elevating any outfit.', 149.99, 30, 2, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(14, 'Athletic Performance Sneakers', 'athletic-performance-sneakers', 'High-performance running shoes with advanced cushioning technology and breathable mesh upper. Designed for serious athletes and casual runners alike.', 159.99, 50, 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(15, 'Tailored Business Suit', 'tailored-business-suit', 'Professional business suit crafted from premium wool blend. Features modern slim fit, wrinkle-resistant fabric, and expert tailoring for the contemporary professional.', 699.99, 15, 2, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(16, 'Handcrafted Leather Handbag', 'handcrafted-leather-handbag', 'Artisan-made leather handbag using traditional craftsmanship. Features premium full-grain leather, multiple compartments, and timeless design that improves with age.', 449.99, 20, 2, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(17, 'Merino Wool Base Layer Set', 'merino-wool-base-layer', 'Premium merino wool thermal underwear set for outdoor enthusiasts. Features natural odor resistance, temperature regulation, and ultra-soft comfort for all-day wear.', 199.99, 35, 2, 'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(18, 'Vintage Leather Boots', 'vintage-leather-boots', 'Handcrafted leather boots with vintage-inspired design and modern comfort features. Made from premium full-grain leather with Goodyear welt construction for durability.', 299.99, 25, 2, 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(19, 'Organic Cotton T-Shirt Collection', 'organic-cotton-tshirt', 'Sustainable t-shirt made from 100% organic cotton with fair trade certification. Features perfect fit, superior softness, and environmentally conscious production.', 39.99, 100, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(20, 'Designer Sunglasses', 'designer-sunglasses', 'Luxury sunglasses with polarized lenses and titanium frame. Features UV400 protection, scratch-resistant coating, and iconic design that combines style with functionality.', 349.99, 30, 2, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(21, 'Smart Home Security System', 'smart-home-security-system', 'Complete wireless security system with 4K cameras, smart detection, and mobile app control. Features night vision, two-way audio, and cloud storage for ultimate home protection.', 599.99, 20, 3, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(22, 'Ergonomic Office Chair', 'ergonomic-office-chair', 'Premium office chair with advanced ergonomic design and lumbar support. Features breathable mesh back, adjustable armrests, and 12-hour comfort guarantee for productive work sessions.', 449.99, 25, 3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(23, 'Solid Wood Dining Table', 'solid-wood-dining-table', 'Handcrafted dining table made from sustainable hardwood with natural finish. Seats 6-8 people comfortably and features timeless design that complements any dining room style.', 899.99, 12, 3, 'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(24, 'Professional Garden Tool Set', 'professional-garden-tool-set', 'Complete gardening toolkit with premium stainless steel tools and ergonomic handles. Includes spade, rake, pruners, and storage bag for the serious gardener.', 129.99, 40, 3, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(25, 'Smart Thermostat', 'smart-thermostat', 'Energy-efficient smart thermostat with learning capabilities and smartphone control. Features scheduling, geofencing, and energy reports to optimize home comfort and savings.', 249.99, 35, 3, 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa9?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(26, 'Premium Bedding Set', 'premium-bedding-set', 'Luxury hotel-quality bedding set made from Egyptian cotton with 800 thread count. Includes fitted sheet, flat sheet, and pillowcases for ultimate sleep comfort.', 199.99, 30, 3, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(27, 'Outdoor Fire Pit Table', 'outdoor-fire-pit-table', 'Stylish propane fire pit table perfect for outdoor entertaining. Features weather-resistant construction, adjustable flame, and includes lava rocks and protective cover.', 699.99, 15, 3, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(28, 'Robot Vacuum Cleaner', 'robot-vacuum-cleaner', 'Advanced robot vacuum with smart mapping, powerful suction, and self-emptying base. Features app control, voice commands, and works on all floor types for effortless cleaning.', 549.99, 22, 3, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(29, 'Ceramic Cookware Set', 'ceramic-cookware-set', 'Professional-grade ceramic cookware set with non-toxic coating and even heat distribution. Includes 10 pieces with ergonomic handles and oven-safe design up to 500°F.', 299.99, 28, 3, 'https://images.unsplash.com/photo-1556909114-4f6e33bbe017?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(30, 'LED Smart Lighting Kit', 'led-smart-lighting-kit', 'Complete smart lighting solution with color-changing LED bulbs and hub. Features voice control, scheduling, and millions of colors to create the perfect ambiance.', 179.99, 45, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(31, 'Professional Mountain Bike', 'professional-mountain-bike', 'High-performance mountain bike with carbon frame, 21-speed transmission, and hydraulic disc brakes. Perfect for trail riding and cross-country adventures with superior durability.', 1299.99, 10, 4, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(32, 'Camping Tent for 4 People', 'camping-tent-4-person', 'Spacious 4-person camping tent with waterproof design and easy setup. Features dual vestibules, gear storage, and weather protection for comfortable outdoor adventures.', 249.99, 20, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(33, 'Yoga Mat Premium', 'yoga-mat-premium', 'Eco-friendly yoga mat made from natural rubber with superior grip and cushioning. Features alignment marks and carrying strap for dedicated yoga practitioners seeking comfort.', 89.99, 50, 4, 'https://images.unsplash.com/photo-1506629905607-3e6f7e8b2c67?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(34, 'Fitness Tracker Watch', 'fitness-tracker-watch', 'Advanced fitness tracker with heart rate monitoring, GPS, and 20+ sport modes. Features 7-day battery life and comprehensive health tracking capabilities for active lifestyles.', 199.99, 35, 4, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(35, 'Adjustable Dumbbells Set', 'adjustable-dumbbells-set', 'Space-saving adjustable dumbbell set with quick weight selection. Ranges from 5-50 lbs per dumbbell and includes storage stand for home gym enthusiasts.', 399.99, 18, 4, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(36, 'Rock Climbing Harness', 'rock-climbing-harness', 'Professional climbing harness with comfort padding and gear loops. Features adjustable leg loops, belay loop, and meets all safety standards for serious climbers.', 129.99, 25, 4, 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(37, 'Kayak Single Person', 'kayak-single-person', 'Lightweight recreational kayak perfect for lakes and calm waters. Features comfortable seating, storage compartments, and stable design for beginners and experienced paddlers.', 699.99, 8, 4, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(38, 'Ski Equipment Bundle', 'ski-equipment-bundle', 'Complete ski package including skis, boots, poles, and bindings. Professionally fitted and perfect for intermediate to advanced skiers seeking high performance on the slopes.', 899.99, 12, 4, 'https://images.unsplash.com/photo-1551524164-6cf6ac833fb4?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(39, 'Golf Club Set Professional', 'golf-club-set-professional', 'Premium golf club set with driver, irons, wedges, and putter. Crafted with precision engineering and designed for serious golfers seeking to improve their game performance.', 1199.99, 15, 4, 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(40, 'Swimming Pool Accessories', 'swimming-pool-accessories', 'Complete pool maintenance kit including skimmer, vacuum, chemicals, and testing supplies. Everything needed to keep your pool crystal clear and swimming-ready all season long.', 299.99, 30, 4, 'https://images.unsplash.com/photo-1560346034-5a2c4c2b1d05?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(41, 'Programming Mastery Collection', 'programming-mastery-collection', 'Comprehensive programming book series covering JavaScript, Python, React, and Node.js. Written by industry experts with practical examples and real-world projects for developers of all levels.', 149.99, 40, 5, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(42, 'Digital Art Course Bundle', 'digital-art-course-bundle', 'Complete digital art learning package including video tutorials, software guides, and practice exercises. Perfect for aspiring digital artists and graphic designers seeking creative mastery.', 199.99, 25, 5, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(43, 'Business Strategy Audiobooks', 'business-strategy-audiobooks', 'Collection of bestselling business and strategy audiobooks narrated by industry leaders. Includes titles on entrepreneurship, leadership, and innovation for business professionals.', 89.99, 60, 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(44, 'Photography Masterclass', 'photography-masterclass', 'Professional photography course with equipment guides, composition techniques, and post-processing tutorials. Suitable for beginners to advanced photographers seeking artistic excellence.', 179.99, 35, 5, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(45, 'Language Learning Software', 'language-learning-software', 'Interactive language learning platform supporting 20+ languages with speech recognition, gamification, and personalized learning paths for effective language acquisition and fluency.', 129.99, 50, 5, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(46, 'Organic Skincare Set', 'organic-skincare-set', 'Complete organic skincare routine with cleanser, toner, serum, and moisturizer. Made from natural ingredients, cruelty-free, and suitable for all skin types seeking radiant health.', 199.99, 30, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(47, 'Professional Hair Care Kit', 'professional-hair-care-kit', 'Salon-quality hair care products including shampoo, conditioner, treatments, and styling tools. Formulated for damaged hair restoration and promoting healthy growth and shine.', 149.99, 25, 6, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(48, 'Wellness Supplement Bundle', 'wellness-supplement-bundle', 'Premium vitamin and mineral supplement collection including multivitamins, omega-3, probiotics, and immune support. Third-party tested for purity and potency assurance.', 119.99, 40, 6, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(49, 'Aromatherapy Essential Oils', 'aromatherapy-essential-oils', 'Pure essential oil collection with diffuser for relaxation and wellness. Includes lavender, eucalyptus, peppermint, and tea tree oils with therapeutic benefits for mind and body.', 89.99, 35, 6, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=400&fit=crop', TRUE, NOW(), NOW()),
(50, 'Fitness Nutrition Powder', 'fitness-nutrition-powder', 'High-quality protein powder with amino acids for muscle recovery and growth. Available in multiple flavors, third-party tested, and perfect for athletes and fitness enthusiasts.', 79.99, 50, 6, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', TRUE, NOW(), NOW());


-- ================================================================
-- PRODUCT IMAGES (Multiple images per product for better showcase)
-- ================================================================

INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `is_primary`, `created_at`, `updated_at`) VALUES

(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop', 'iPhone 15 Pro Max front view', TRUE, NOW(), NOW()),
(1, 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&h=600&fit=crop', 'iPhone 15 Pro Max side profile', FALSE, NOW(), NOW()),
(1, 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=800&h=600&fit=crop', 'iPhone 15 Pro Max camera system', FALSE, NOW(), NOW()),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop', 'Samsung Galaxy S24 Ultra display', TRUE, NOW(), NOW()),
(2, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop', 'Samsung Galaxy S24 Ultra with S Pen', FALSE, NOW(), NOW()),

(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop', 'MacBook Pro 16-inch open', TRUE, NOW(), NOW()),
(3, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop', 'MacBook Pro keyboard detail', FALSE, NOW(), NOW()),

(4, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop', 'Sony WH-1000XM5 side view', TRUE, NOW(), NOW()),
(4, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=600&fit=crop', 'Sony headphones folded', FALSE, NOW(), NOW()),

(5, 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&h=600&fit=crop', 'Apple Watch Series 9 display', TRUE, NOW(), NOW()),
(5, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=600&fit=crop', 'Apple Watch sport band', FALSE, NOW(), NOW()),
(11, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop', 'Cashmere sweater front view', TRUE, NOW(), NOW()),
(11, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop', 'Cashmere sweater texture detail', FALSE, NOW(), NOW()),
(12, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&h=600&fit=crop', 'Denim jacket front view', TRUE, NOW(), NOW()),
(12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop', 'Denim jacket styling', FALSE, NOW(), NOW()),
(21, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop', 'Security camera system', TRUE, NOW(), NOW()),
(21, 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&h=600&fit=crop', 'Mobile app interface', FALSE, NOW(), NOW()),
(31, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', 'Mountain bike side view', TRUE, NOW(), NOW()),
(31, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', 'Mountain bike in action', FALSE, NOW(), NOW()),
(46, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', 'Skincare products layout', TRUE, NOW(), NOW()),
(46, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop', 'Skincare ingredients', FALSE, NOW(), NOW());

-- ================================================================
-- PRODUCT-TAG RELATIONSHIPS (Connect products with relevant tags)
-- ================================================================

INSERT INTO `product_tag` (`product_id`, `tag_id`, `created_at`, `updated_at`) VALUES

(1, 1, NOW(), NOW()),
(1, 2, NOW(), NOW()),
(1, 3, NOW(), NOW()),
(1, 6, NOW(), NOW()),
(1, 9, NOW(), NOW()),

(2, 1, NOW(), NOW()),
(2, 3, NOW(), NOW()),
(2, 9, NOW(), NOW()),

(3, 2, NOW(), NOW()),
(3, 3, NOW(), NOW()),
(3, 7, NOW(), NOW()),

(4, 2, NOW(), NOW()),
(4, 3, NOW(), NOW()),
(4, 6, NOW(), NOW()),

(5, 1, NOW(), NOW()),
(5, 8, NOW(), NOW()),
(5, 9, NOW(), NOW()),

(11, 3, NOW(), NOW()),
(11, 4, NOW(), NOW()),

(12, 10, NOW(), NOW()),
(12, 4, NOW(), NOW()),

(21, 9, NOW(), NOW()),
(21, 6, NOW(), NOW()),

(31, 3, NOW(), NOW()),
(31, 8, NOW(), NOW()),

(46, 4, NOW(), NOW()),
(46, 3, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Product Images' as table_name, COUNT(*) as count FROM product_images
UNION ALL
SELECT 'Tags' as table_name, COUNT(*) as count FROM tags
UNION ALL
SELECT 'Product-Tag Relations' as table_name, COUNT(*) as count FROM product_tag;

SELECT
    c.name as category_name,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

SELECT
    p.name as product_name,
    p.price,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.price
ORDER BY p.price DESC;