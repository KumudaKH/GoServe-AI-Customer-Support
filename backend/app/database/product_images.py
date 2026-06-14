"""Curated Unsplash photo IDs matched to each product template name."""

import hashlib
import re

IMG_PARAMS = "?w=400&h=300&fit=crop&auto=format&q=80"
BROKEN_IMAGE_HOSTS = ("source.unsplash.com", "via.placeholder.com")


def product_image(photo_id_or_query: str) -> str:
    if photo_id_or_query.startswith("query:"):
        query = photo_id_or_query[len("query:"):]
        seed = hashlib.md5(query.encode()).hexdigest()[:12]
        return f"https://picsum.photos/seed/{seed}/400/300"

    return f"https://images.unsplash.com/photo-{photo_id_or_query}{IMG_PARAMS}"


def extract_base_name(name: str) -> str:
    return re.split(r"\s+—\s+Ed\.\s+\d+$", name, maxsplit=1)[0]


# photo-id strings — each chosen to match the product name
PRODUCT_IMAGES: dict[str, str] = {
    # Electronics
    "Wireless Bluetooth Headphones": product_image("1505740420928-5e560c06d30e"),
    "Smart Watch Pro": product_image("1523275335684-37898b6baf30"),
    "USB-C Fast Charger 65W": product_image("1583863788434-e58a363522cf"),
    "Portable Bluetooth Speaker": product_image("1608043152269-423dbba4e7e1"),
    "Gaming Mouse RGB": product_image("1527864550417-7fd91fc51a46"),
    "Mechanical Keyboard": product_image("1541140531914-e801fff58b5c"),
    "HD Webcam 1080p": product_image("1587825140708-dfaf72ae4b04"),
    "Tablet 10 inch": product_image("1544244015-0df4b3ffc6b0"),
    "Power Bank 20000mAh": product_image("1609599585939-32340db059e2"),
    "LED Monitor 24 inch": product_image("1496181133206-80ce9b88a753"),
    "WiFi 6 Router": product_image("1558618666-fcd25c85cd64"),
    "SSD 1TB NVMe": product_image("1587203453884-23f685b4fd3e"),
    "Wireless Earbuds": product_image("1598331668826-35cecc2a97ae"),
    "Smart LED Bulb Pack": product_image("1565814636199-ae8133055c1c"),
    "Fitness Band": product_image("1575311373937-040b8e1fd5b6"),
    "Laptop Stand Aluminum": product_image("1527864550417-7fd91fc51a46"),
    "Action Camera 4K": product_image("1526170375885-4d8ecf77b99f"),
    "Mini Drone": product_image("1473968512647-3eee44739a5b"),
    "Smart Plug 2-Pack": product_image("1558002038-1055907df827"),
    "Bluetooth Tracker": product_image("1625720747454-a80e22724632"),
    "Phone Gimbal": product_image("15160350693717-29a1c244fd41"),
    "Car Phone Mount": product_image("1512941937664-90a1ee58ead0"),
    "USB Hub 7-Port": product_image("1625948510531-3bfa39bd3ffb"),
    "Graphics Tablet": product_image("1618384880669-6536e4f24771"),
    "Noise Cancelling Earbuds": product_image("1572569511254-d8f925fa2f9c"),
    # Fashion
    "Men's Casual Shirt": product_image("1620799140408-edc6dcb089d6"),
    "Women's Running Shoes": product_image("1542291026-7eec264c27ff"),
    "Denim Jacket": product_image("1576995853123-5a10305d93c0"),
    "Cotton T-Shirt Pack": product_image("1521572163474-6864f9cf17ab"),
    "Formal Trousers": product_image("1624378515195-6bbdb73f2a9f"),
    "Summer Floral Dress": product_image("1595777457583-95e059d581b8"),
    "Leather Belt": product_image("1553062407-98eeb64c6a62"),
    "Sports Cap": product_image("1588850561407-ed78c282e89b"),
    "Wool Sweater": product_image("1434389677669-e08b4cac3105"),
    "Silk Saree": product_image("1610030459667-4fe1ba1fd70f"),
    "Kids Hoodie": product_image("1519236104425-f6f816c45e83"),
    "Ankle Socks Pack": product_image("1586350977777-b3b0abd50c82"),
    "Polarized Sunglasses": product_image("1572635196233-39b5ca45f038"),
    "Leather Wallet": product_image("1627123424574-724758594e93"),
    "Canvas Sneakers": product_image("1549298916-b41d501d3772"),
    "Polo Shirt": product_image("1586363104862-3a5e2ab60d99"),
    "Joggers": product_image("1506629082955-511b67f6fef9"),
    "Blazer Slim Fit": product_image("1594938298603-c8148c4dae35"),
    "Kurti Set": product_image("1598030393909-4dc91e472764"),
    "Raincoat": product_image("1539533018447-63fcce2678e3"),
    "Thermal Wear Set": product_image("1551489186-b731eb792d8e"),
    "Ethnic Kurta": product_image("1598030393909-4dc91e472764"),
    "Wool Scarf": product_image("1520903920245-6d2075e431d9"),
    "Handbag": product_image("1548036328-c9fa89d128fa"),
    "Analog Wristwatch": product_image("1524592094718-3f0994cb4b92"),
    # Groceries
    "Organic Grocery Pack": product_image("1542838132-92c53300491e"),
    "Fresh Milk 1L Pack": product_image("1563636619-e9143da7973b"),
    "Basmati Rice 5kg": product_image("1586201375761-83865001e31c"),
    "Brown Bread": product_image("1509440159596-d884aa86f961"),
    "Free Range Eggs": product_image("1582722872445-44dc5bf7b3df"),
    "Extra Virgin Olive Oil": product_image("1474979266404-7eaacbcd87c5"),
    "Peanut Butter": product_image("1479409690607-4ea90334c117"),
    "Mixed Dry Fruits": product_image("1599597630753-cbc393257389"),
    "Green Tea Bags": product_image("1556679343-c7306c1976bc"),
    "Coffee Beans 250g": product_image("1559056199-641a0ae251c4"),
    "Pure Honey Jar": product_image("1587049350792-b3dfb4c4b264"),
    "Tomato Ketchup": product_image("1472474641169-4c928d4f82d2"),
    "Pasta Penne 500g": product_image("1551462149-4bf51c3e8e38"),
    "Cheese Slices": product_image("1486297678162-4e4d3b8a0c7c"),
    "Butter 100g": product_image("1589985270684-818ac4e75f39"),
    "Greek Yogurt": product_image("1488477181941-15e4ad45bdfe"),
    "Bananas 1 dozen": product_image("1571771894821-ce9b6bd11d08"),
    "Apples 1kg": product_image("1560806887-1e4cd0b6cbd6"),
    "Potatoes 2kg": product_image("1518977676601-b53f82aba655"),
    "Onions 1kg": product_image("1518977956812-cd3db57fad54"),
    "Tomatoes 1kg": product_image("1546093354-7adb3e7f1e38"),
    "Spinach Bunch": product_image("1576040918769-41b2a5d572ce"),
    "Orange Juice 1L": product_image("1622596513520-9c8e5df2b6f6"),
    "Mineral Water 2L": product_image("1548839140-29a7492991bd"),
    "Breakfast Cereal": product_image("1517686460139-4ba897b66e38"),
    # Books
    "The Art of Coding": product_image("1544947950-fa07a98d237f"),
    "Atomic Habits": product_image("1544716278-ca5e3f4abd8c"),
    "Python Crash Course": product_image("1515879218367-8466d910aaa4"),
    "Rich Dad Poor Dad": product_image("1507003211169-0a1dd7228f2d"),
    "Sapiens": product_image("1512820790802-4ca9b220ac0f"),
    "Deep Work": product_image("1495444476603-1ba8993fe0fa"),
    "Think and Grow Rich": product_image("1516979187450-564888ad4e68"),
    "Harry Potter Box Set": product_image("1618667061667-27f4390e9e68"),
    "Wings of Fire": product_image("1512820790802-4ca9b220ac0f"),
    "NCERT Mathematics X": product_image("1635070041078-eb362a2870d5"),
    "CBSE Science Guide": product_image("1503676260728-1c00da094a0b"),
    "Oxford Dictionary": product_image("1544947950-fa07a98d237f"),
    "World Atlas": product_image("1524995993791-7ad725fc74f8"),
    "Comic Collection": product_image("1612036781132-9f959c2615d6"),
    "Poetry Anthology": product_image("1456513080510-7bf3a84b82f8"),
    "Indian Cookbook": product_image("1490645935967-1eba81f199b5"),
    "Yoga for Beginners": product_image("1544367567-0f2fcb009e0b"),
    "Medical Handbook": product_image("1576091160399-112ba8d25d1d"),
    "History of India": product_image("1524995993791-7ad725fc74f8"),
    "Biography Collection": product_image("1507003211169-0a1dd7228f2d"),
    "Self Help Guide": product_image("1495444476603-1ba8993fe0fa"),
    "Puzzle Book": product_image("1612036781132-9f959c2615d6"),
    "Coloring Book": product_image("1513475382585-d06e58bcb0ea"),
    "Personal Journal": product_image("1455390582261-844792e9535d"),
    "Magazine Bundle": product_image("1504711434969-e33886168f5c"),
    # Home & Kitchen
    "Kitchen Blender 500W": product_image("1570222094114-d054a817e56b"),
    "Non-stick Cookware Set": product_image("1556909114-f6e7ad7d3136"),
    "LED Desk Lamp": product_image("1507473885765-e6ed057f782c"),
    "Air Fryer 4L": product_image("1585515655851-f9d80740aedf"),
    "Microwave Oven 20L": product_image("1585659722913-4392082a3a7a"),
    "Electric Rice Cooker": product_image("1599496329741-27d8b09e677f"),
    "Vacuum Flask 1L": product_image("1602143407151-7111542de6e8"),
    "Dinner Set 24pc": product_image("1578507055189-86caa6f20d76"),
    "Bamboo Cutting Board": product_image("1607082349566-187342175e2f"),
    "Chef Knife Set": product_image("1593618998166-8d682b596cbb"),
    "Storage Container Set": product_image("1585515655851-f9d80740aedf"),
    "Wall Clock Modern": product_image("1563860418755-08894f53b0d3"),
    "Cushion Covers 5pc": product_image("1584100936592-c0654b4a2ab7"),
    "Cotton Bed Sheet Set": product_image("1631049307264-da0ec9d70304"),
    "Bath Towel Set": product_image("1620626011764-996317b8d101"),
    "Curtain Panel Pair": product_image("1584100936592-c0654b4a2ab7"),
    "Shoe Rack 4-Tier": product_image("1556909114-f6e7ad7d3136"),
    "Ironing Board": product_image("1582735689369-4fe4db7117d8"),
    "Laundry Basket": product_image("1582735689369-4fe4db7117d8"),
    "Floor Mop Set": product_image("1585421516923-67eb0eacb926"),
    "Pedal Trash Bin": product_image("1556909114-f6e7ad7d3136"),
    "Soap Dispenser": product_image("1620916569860-3b66dfda0a44"),
    "Spice Rack Organizer": product_image("1596040033229-a9821ebd058d"),
    "Electric Kettle 1.7L": product_image("1565538810493-2def02f0d1a4"),
    "Water Purifier Filter": product_image("1620916569860-3b66dfda0a44"),
    # Beauty
    "Skincare Essentials Kit": product_image("1556228720-195a672e8a03"),
    "Lipstick Combo Pack": product_image("1586495777744-4413f21062fa"),
    "Hair Care Bundle": product_image("1522338242992-e1a54906a8da"),
    "Gentle Face Wash": product_image("1556228578-8c89e41adf3f"),
    "Body Lotion 400ml": product_image("1556228720-195a672e8a03"),
    "Sunscreen SPF 50": product_image("1556228578-8c89e41adf3f"),
    "Eau de Parfum 50ml": product_image("1541643600915-78b084683601"),
    "Nail Polish Set": product_image("1604654770990-36fee4e3c3d2"),
    "Makeup Brush Set": product_image("1596462502278-27bfd4033486"),
    "Hair Dryer 1800W": product_image("1522338242992-e1a54906a8da"),
    "Sheet Face Mask Pack": product_image("1570175177443-35d7eead3158"),
    "Beard Grooming Oil": product_image("1621607506116-0821051a0a4e"),
    "Roll-on Deodorant": product_image("1621607506116-0821051a0a4e"),
    "Talc Powder 400g": product_image("1556228578-8c89e41adf3f"),
    "Vitamin C Serum": product_image("1570175177443-35d7eead3158"),
    "Anti-Dandruff Shampoo": product_image("1522338242992-e1a54906a8da"),
    "Smooth Conditioner": product_image("1522338242992-e1a54906a8da"),
    "Coconut Hair Oil": product_image("1522338242992-e1a54906a8da"),
    "Tinted Lip Balm": product_image("1586495777744-4413f21062fa"),
    "Compact Powder": product_image("1596462502278-27bfd4033486"),
    "Kajal Pencil Duo": product_image("1596462502278-27bfd4033486"),
    "Liquid Foundation": product_image("1596462502278-27bfd4033486"),
    "Makeup Primer": product_image("1596462502278-27bfd4033486"),
    "Night Repair Cream": product_image("1556228720-195a672e8a03"),
    "Charcoal Face Scrub": product_image("1556228578-8c89e41adf3f"),
}


def get_image_for_product(base_name: str, category: str) -> str:
    if base_name in PRODUCT_IMAGES:
        return PRODUCT_IMAGES[base_name]

    category_fallbacks = {
        "Electronics": product_image("1527864550417-7fd91fc51a46"),
        "Fashion": product_image("1542291026-7eec264c27ff"),
        "Groceries": product_image("1542838132-92c53300491e"),
        "Books": product_image("1544947950-fa07a98d237f"),
        "Home & Kitchen": product_image("1556909114-f6e7ad7d3136"),
        "Beauty": product_image("1556228720-195a672e8a03"),
    }
    return category_fallbacks.get(category, product_image("1542838132-92c53300491e"))


def normalize_image_url(
    url: str | None,
    category: str | None,
    base_name: str,
) -> str:
    if base_name in PRODUCT_IMAGES:
        return PRODUCT_IMAGES[base_name]
    if url and not any(host in url for host in BROKEN_IMAGE_HOSTS):
        return url
    return get_image_for_product(base_name, category or "Product")
