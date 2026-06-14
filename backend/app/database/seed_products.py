import random

from sqlalchemy import text

from app.database.connection import Base, SessionLocal, engine
from app.database.product_images import get_image_for_product
from app.models import all_models  # noqa: F401 — register models with Base
from app.models.product import Product

PRODUCTS_PER_CATEGORY = 100

CATEGORIES = [
    "Electronics",
    "Fashion",
    "Groceries",
    "Books",
    "Home & Kitchen",
    "Beauty",
]

CATEGORY_TEMPLATES = {
    "Electronics": [
        ("Wireless Bluetooth Headphones", "Noise-cancelling over-ear headphones with long battery life.", 2499, 3499),
        ("Smart Watch Pro", "Fitness tracking, heart rate monitor, and AMOLED display.", 3999, 5499),
        ("USB-C Fast Charger 65W", "GaN dual-port charger for laptop and phone.", 899, 1299),
        ("Portable Bluetooth Speaker", "360° sound with 12-hour playtime.", 1499, 2199),
        ("Gaming Mouse RGB", "Ergonomic design with adjustable DPI.", 799, 1199),
        ("Mechanical Keyboard", "Tactile switches with backlight.", 2999, 4299),
        ("HD Webcam 1080p", "Auto-focus camera for video calls.", 1299, 1899),
        ("Tablet 10 inch", "HD display for reading and streaming.", 8999, 11999),
        ("Power Bank 20000mAh", "Fast charging for multiple devices.", 999, 1499),
        ("LED Monitor 24 inch", "Full HD IPS display.", 7999, 10999),
        ("WiFi 6 Router", "High-speed home networking.", 2499, 3499),
        ("SSD 1TB NVMe", "Ultra-fast storage upgrade.", 4499, 5999),
        ("Wireless Earbuds", "True wireless with charging case.", 1999, 2999),
        ("Smart LED Bulb Pack", "App-controlled color bulbs.", 699, 999),
        ("Fitness Band", "Step counter and sleep tracking.", 1499, 2199),
        ("Laptop Stand Aluminum", "Ergonomic adjustable stand.", 899, 1299),
        ("Action Camera 4K", "Waterproof sports camera.", 5999, 8499),
        ("Mini Drone", "HD camera with stable flight.", 3499, 4999),
        ("Smart Plug 2-Pack", "Voice-controlled home automation.", 599, 899),
        ("Bluetooth Tracker", "Find keys and bags easily.", 499, 749),
        ("Phone Gimbal", "Stabilized video recording.", 2199, 3199),
        ("Car Phone Mount", "Secure dashboard holder.", 299, 449),
        ("USB Hub 7-Port", "Expand laptop connectivity.", 699, 999),
        ("Graphics Tablet", "Digital drawing pad for creators.", 3299, 4599),
        ("Noise Cancelling Earbuds", "Premium ANC in compact form.", 2799, 3999),
    ],
    "Fashion": [
        ("Men's Casual Shirt", "Cotton slim-fit shirt in multiple colors.", 899, 1299),
        ("Women's Running Shoes", "Lightweight breathable workout shoes.", 1999, 2799),
        ("Denim Jacket", "Classic blue denim with modern fit.", 1499, 2199),
        ("Cotton T-Shirt Pack", "Pack of 3 soft crew-neck tees.", 599, 899),
        ("Formal Trousers", "Wrinkle-free office wear.", 999, 1499),
        ("Summer Floral Dress", "Lightweight cotton midi dress.", 1299, 1899),
        ("Leather Belt", "Genuine leather with metal buckle.", 499, 749),
        ("Sports Cap", "Adjustable UV protection cap.", 299, 449),
        ("Wool Sweater", "Warm knit for winter.", 1199, 1699),
        ("Silk Saree", "Elegant traditional wear.", 2499, 3499),
        ("Kids Hoodie", "Soft fleece hoodie for children.", 699, 999),
        ("Ankle Socks Pack", "Pack of 6 cotton socks.", 249, 349),
        ("Polarized Sunglasses", "UV400 protection stylish frames.", 799, 1199),
        ("Leather Wallet", "Slim bifold with card slots.", 599, 899),
        ("Canvas Sneakers", "Everyday casual footwear.", 1499, 2199),
        ("Polo Shirt", "Classic collared cotton polo.", 749, 1099),
        ("Joggers", "Comfortable stretch track pants.", 899, 1299),
        ("Blazer Slim Fit", "Smart casual office blazer.", 1999, 2999),
        ("Kurti Set", "Printed cotton kurti with dupatta.", 1099, 1599),
        ("Raincoat", "Waterproof lightweight coat.", 699, 999),
        ("Thermal Wear Set", "Winter inner wear combo.", 799, 1199),
        ("Wool Scarf", "Soft winter accessory.", 399, 599),
        ("Handbag", "Spacious everyday tote bag.", 1299, 1899),
        ("Analog Wristwatch", "Stainless steel classic watch.", 1799, 2599),
        ("Ethnic Kurta", "Festive cotton kurta for men.", 999, 1499),
    ],
    "Groceries": [
        ("Organic Grocery Pack", "Assorted organic fruits and vegetables.", 599, 799),
        ("Fresh Milk 1L Pack", "Farm-fresh toned milk pack of 2.", 89, 110),
        ("Basmati Rice 5kg", "Premium aged aromatic rice.", 449, 599),
        ("Brown Bread", "Whole wheat loaf freshly baked.", 45, 55),
        ("Free Range Eggs", "Dozen farm eggs.", 99, 125),
        ("Extra Virgin Olive Oil", "Cold-pressed 500ml bottle.", 399, 549),
        ("Peanut Butter", "Creamy natural 340g jar.", 199, 279),
        ("Mixed Dry Fruits", "Almonds, cashews and raisins 250g.", 349, 479),
        ("Green Tea Bags", "Antioxidant rich pack of 50.", 149, 199),
        ("Coffee Beans 250g", "Medium roast arabica beans.", 299, 399),
        ("Pure Honey Jar", "Natural forest honey 500g.", 249, 329),
        ("Tomato Ketchup", "Family pack 1kg bottle.", 89, 119),
        ("Pasta Penne 500g", "Italian durum wheat pasta.", 79, 99),
        ("Cheese Slices", "Processed cheese 200g pack.", 119, 149),
        ("Butter 100g", "Salted table butter.", 55, 65),
        ("Greek Yogurt", "High protein cup 400g.", 69, 89),
        ("Bananas 1 dozen", "Fresh ripe bananas.", 49, 59),
        ("Apples 1kg", "Crisp red apples.", 129, 159),
        ("Potatoes 2kg", "Washed cooking potatoes.", 59, 79),
        ("Onions 1kg", "Fresh red onions.", 39, 49),
        ("Tomatoes 1kg", "Farm fresh tomatoes.", 49, 59),
        ("Spinach Bunch", "Organic leafy greens.", 29, 39),
        ("Orange Juice 1L", "No added sugar juice.", 99, 129),
        ("Mineral Water 2L", "Pack of 6 bottles.", 89, 109),
        ("Breakfast Cereal", "Multigrain flakes 500g.", 199, 259),
    ],
    "Books": [
        ("The Art of Coding", "Beginner-friendly software development guide.", 449, 599),
        ("Atomic Habits", "Build good habits — bestseller.", 399, 499),
        ("Python Crash Course", "Hands-on Python programming.", 549, 699),
        ("Rich Dad Poor Dad", "Personal finance classic.", 349, 449),
        ("Sapiens", "Brief history of humankind.", 429, 549),
        ("Deep Work", "Focus in a distracted world.", 399, 499),
        ("Think and Grow Rich", "Success and motivation.", 299, 399),
        ("Harry Potter Box Set", "Complete collection paperback.", 2499, 3299),
        ("Wings of Fire", "APJ Abdul Kalam autobiography.", 249, 349),
        ("NCERT Mathematics X", "Class 10 maths textbook.", 199, 249),
        ("CBSE Science Guide", "Class 10 science reference.", 299, 399),
        ("Oxford Dictionary", "English dictionary paperback.", 449, 599),
        ("World Atlas", "Illustrated geography atlas.", 399, 549),
        ("Comic Collection", "Graphic novel anthology.", 349, 449),
        ("Poetry Anthology", "Classic poems collection.", 249, 329),
        ("Indian Cookbook", "Traditional recipes guide.", 399, 499),
        ("Yoga for Beginners", "Postures and wellness guide.", 299, 399),
        ("Medical Handbook", "First aid and health basics.", 349, 449),
        ("History of India", "Comprehensive history volume.", 499, 649),
        ("Biography Collection", "Inspiring life stories.", 379, 479),
        ("Self Help Guide", "Productivity and mindset.", 299, 399),
        ("Puzzle Book", "Brain teasers and logic.", 199, 249),
        ("Coloring Book", "Adult relaxation coloring.", 149, 199),
        ("Personal Journal", "Lined notebook 200 pages.", 179, 229),
        ("Magazine Bundle", "3-month lifestyle magazines.", 299, 399),
    ],
    "Home & Kitchen": [
        ("Kitchen Blender 500W", "Multi-speed smoothie blender.", 1799, 2499),
        ("Non-stick Cookware Set", "5-piece induction-compatible set.", 1299, 1899),
        ("LED Desk Lamp", "Adjustable brightness with USB port.", 699, 999),
        ("Air Fryer 4L", "Oil-free healthy cooking.", 3499, 4999),
        ("Microwave Oven 20L", "Grill and reheat functions.", 4999, 6999),
        ("Electric Rice Cooker", "Automatic keep-warm cooker.", 1499, 2199),
        ("Vacuum Flask 1L", "Stainless steel insulated bottle.", 499, 699),
        ("Dinner Set 24pc", "Ceramic plates and bowls set.", 1999, 2799),
        ("Bamboo Cutting Board", "Eco-friendly kitchen board.", 399, 549),
        ("Chef Knife Set", "3-piece stainless steel knives.", 899, 1299),
        ("Storage Container Set", "Airtight 10-piece containers.", 599, 849),
        ("Wall Clock Modern", "Silent quartz movement clock.", 449, 649),
        ("Cushion Covers 5pc", "Cotton decorative covers.", 499, 699),
        ("Cotton Bed Sheet Set", "King size 300 thread count.", 999, 1399),
        ("Bath Towel Set", "Soft absorbent 4-piece set.", 699, 999),
        ("Curtain Panel Pair", "Blackout window curtains.", 799, 1099),
        ("Shoe Rack 4-Tier", "Metal stackable organizer.", 899, 1299),
        ("Ironing Board", "Foldable with heat-resistant cover.", 699, 999),
        ("Laundry Basket", "Collapsible fabric hamper.", 399, 549),
        ("Floor Mop Set", "Microfiber spin mop bucket.", 799, 1099),
        ("Pedal Trash Bin", "Stainless steel 12L bin.", 999, 1399),
        ("Soap Dispenser", "Automatic touchless dispenser.", 599, 849),
        ("Spice Rack Organizer", "Rotating 16-jar rack.", 699, 999),
        ("Electric Kettle 1.7L", "Boil-dry protection kettle.", 899, 1299),
        ("Water Purifier Filter", "Replacement filter cartridge.", 499, 699),
    ],
    "Beauty": [
        ("Skincare Essentials Kit", "Cleanser, moisturizer and sunscreen.", 1299, 1799),
        ("Lipstick Combo Pack", "4 matte lipsticks trending shades.", 499, 699),
        ("Hair Care Bundle", "Shampoo, conditioner and serum.", 799, 1099),
        ("Gentle Face Wash", "Sulphate-free daily cleanser.", 299, 399),
        ("Body Lotion 400ml", "Deep hydration shea butter.", 349, 479),
        ("Sunscreen SPF 50", "Broad spectrum UV protection.", 399, 549),
        ("Eau de Parfum 50ml", "Long-lasting floral fragrance.", 999, 1399),
        ("Nail Polish Set", "6 vibrant chip-resistant colors.", 399, 549),
        ("Makeup Brush Set", "12 professional synthetic brushes.", 599, 849),
        ("Hair Dryer 1800W", "Ionic technology fast drying.", 1299, 1799),
        ("Sheet Face Mask Pack", "Hydrating masks pack of 10.", 299, 399),
        ("Beard Grooming Oil", "Natural beard softener 30ml.", 249, 349),
        ("Roll-on Deodorant", "48-hour freshness protection.", 199, 279),
        ("Talc Powder 400g", "Cooling fresh talc.", 149, 199),
        ("Vitamin C Serum", "Brightening anti-aging serum.", 449, 629),
        ("Anti-Dandruff Shampoo", "Medicated scalp care 340ml.", 279, 379),
        ("Smooth Conditioner", "Frizz control conditioner.", 249, 349),
        ("Coconut Hair Oil", "Nourishing traditional oil.", 179, 249),
        ("Tinted Lip Balm", "SPF 15 moisturizing balm.", 149, 199),
        ("Compact Powder", "Matte finish oil control.", 299, 399),
        ("Kajal Pencil Duo", "Smudge-proof kohl 2-pack.", 199, 279),
        ("Liquid Foundation", "Full coverage 24hr wear.", 499, 699),
        ("Makeup Primer", "Pore minimizing base.", 399, 549),
        ("Night Repair Cream", "Overnight skin renewal.", 549, 749),
        ("Charcoal Face Scrub", "Deep cleansing exfoliator.", 249, 349),
    ],
}


def generate_all_products() -> list[dict]:
    products = []

    for category in CATEGORIES:
        templates = CATEGORY_TEMPLATES[category]
        rng = random.Random(category)

        for i in range(PRODUCTS_PER_CATEGORY):
            base_name, description, base_price, base_original = templates[i % len(templates)]
            edition = (i // len(templates)) + 1
            name = base_name if edition == 1 else f"{base_name} — Ed. {edition}"

            jitter = rng.randint(-80, 120)
            price = max(29, base_price + jitter + (edition - 1) * 50)
            markup = rng.uniform(1.18, 1.42)
            original_price = max(price + 50, round(base_original * markup))

            products.append(
                {
                    "name": name,
                    "description": description,
                    "price": float(price),
                    "original_price": float(original_price),
                    "image_url": get_image_for_product(base_name, category),
                    "category": category,
                    "stock": rng.randint(10, 120),
                }
            )

    return products


def _ensure_tables():
    Base.metadata.create_all(bind=engine)


def _ensure_original_price_column():
    with engine.connect() as conn:
        table_exists = conn.execute(
            text(
                "SELECT COUNT(*) FROM information_schema.tables "
                "WHERE table_schema = DATABASE() AND table_name = 'products'"
            )
        ).scalar()
        if not table_exists:
            return

        result = conn.execute(text("SHOW COLUMNS FROM products LIKE 'original_price'"))
        if result.fetchone() is None:
            conn.execute(
                text("ALTER TABLE products ADD COLUMN original_price FLOAT NULL")
            )
            conn.commit()


def seed_products():
    _ensure_tables()
    _ensure_original_price_column()

    all_products = generate_all_products()

    db = SessionLocal()
    try:
        for category in CATEGORIES:
            db.query(Product).filter(Product.category == category).delete()
        db.commit()

        db.bulk_insert_mappings(Product, all_products)
        db.commit()
        print(
            f"Seeded {len(all_products)} products "
            f"({PRODUCTS_PER_CATEGORY} per category × {len(CATEGORIES)} categories)."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
