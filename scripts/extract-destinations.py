# -*- coding: utf-8 -*-
"""Build js/destinations.js from PDF extracts + curated SEO fields."""
from pathlib import Path
import re
import json

ROOT = Path(__file__).resolve().parents[1]
EXTRACT = ROOT / ".tmp_pdf_extract"

CURATED = {
  "goa": {
    "metaDescription": "Explore the best places to visit in Goa, from North and South Goa beaches to Old Goa, Fontainhas, Dudhsagar, hidden places, itineraries and travel tips.",
    "intro": "Goa is easy to misunderstand. Search online and you will see the same version again and again: a beach, a sunset, a scooter, a party.\n\nAll of that exists. But it is only one version of Goa. Leave the beach road and you find villages surrounded by paddy fields. Walk through Panaji and colourful homes line Fontainhas. Drive toward Old Goa and centuries-old churches replace beach cafes. Travel farther inland and the landscape rises toward the Western Ghats.\n\nAt Loop Trips, the useful question is not which ten beaches to tick. It is which version of Goa you want to experience.",
    "faqs": [
      {"q": "Which is the most beautiful place in Goa?", "a": "There is no single answer. Palolem and Agonda suit travellers looking for beautiful beaches, Fontainhas offers architectural character, Dudhsagar brings dramatic inland scenery, and Old Goa appeals to heritage travellers."},
      {"q": "Which are the top places to visit in Goa for first-time travellers?", "a": "A strong first trip includes Panaji and Fontainhas, Old Goa, Fort Aguada, one North Goa beach area, one South Goa beach and, if time allows, an inland nature experience."},
      {"q": "Is three days enough for Goa?", "a": "Three days is enough for a short focused trip, but concentrate on one region rather than trying to cover North Goa, South Goa and the hinterland."},
      {"q": "Is five days enough for Goa?", "a": "Yes. Five days gives first-time visitors enough time to combine beaches, heritage, Panaji and at least one slower or inland experience without making every day a long transfer."},
      {"q": "Which is better: North Goa or South Goa?", "a": "North Goa generally suits travellers looking for nightlife, restaurants, markets and busier beaches. South Goa is better suited to quieter beaches and a slower holiday. Neither is universally better."},
      {"q": "What are the best places to visit in Goa with family?", "a": "Candolim, Panaji, Old Goa, Benaulim, Varca, Cavelossim, Palolem and Bondla are good places to consider depending on the family's interests and preferred pace."},
      {"q": "Is Goa worth visiting during monsoon?", "a": "Yes, if you want greenery, waterfalls, heritage and slower travel. It is less suitable if your priority is uninterrupted beach weather and water activities."},
      {"q": "Is Dudhsagar worth visiting?", "a": "Yes for travellers interested in waterfalls and the Western Ghats, but access should always be confirmed immediately before visiting because seasonal and forest conditions matter."},
    ],
  },
  "kerala": {
    "metaDescription": "Discover the best places to visit in Kerala, from Munnar and Alleppey to Varkala and Wayanad, with backwaters, itineraries, beaches, food, and travel tips.",
    "intro": "Kerala does not ask you to travel faster. It asks you to slow down.\n\nTo watch mist move across a tea-covered hill in Munnar. To sit beside a canal while a small boat disappears between coconut palms. To hear waves below Varkala's cliffs. To wake before the forest does in Thekkady.\n\nSearch for the best places to visit in Kerala and you will find Munnar, Alleppey, Kochi, Thekkady, Varkala and Wayanad. They are famous for good reasons. Kerala becomes more interesting when you look beyond the standard Kochi–Munnar–houseboat–airport itinerary.\n\nAt Loop Trips, we help you build Kerala as a journey, not collect it as a checklist.",
    "faqs": [
      {"q": "How many days are ideal for Kerala?", "a": "Around seven days works well for a first focused trip, ten days gives you a more relaxed classic route, and roughly two weeks allows a broader combination including northern destinations."},
      {"q": "Which is better, Munnar or Alleppey?", "a": "They should not be compared directly. Munnar is a mountain destination; Alappuzha is a backwater destination. The classic Kerala itinerary works because you can experience both."},
      {"q": "Which is better, Munnar or Wayanad?", "a": "Munnar fits the classic central Kerala route and is best known for tea landscapes. Wayanad works better for forest, plantation and adventure-focused trips, particularly through North Kerala."},
      {"q": "Is Kerala good for couples?", "a": "Yes. Munnar, Kumarakom, Varkala, Wayanad, Fort Kochi, Vagamon, Alappuzha and Bekal can all work well depending on whether you prefer hills, beaches, culture or slow travel."},
      {"q": "Is Kerala good for family trips?", "a": "Yes. Kochi, Munnar, Thekkady, Alappuzha, Kumarakom, Wayanad and Kovalam can form family-friendly itineraries when long road transfers are limited."},
      {"q": "Is Kerala worth visiting during monsoon?", "a": "Yes, especially for green landscapes, waterfalls, Ayurveda-focused stays and a different atmosphere, but travellers should monitor current rain, road and weather conditions closely."},
      {"q": "Which Kerala airport should I use?", "a": "Kochi suits central Kerala and the classic Munnar–Alappuzha circuit. Thiruvananthapuram suits Varkala and south Kerala. Kozhikode works well for Wayanad and Malabar; Kannur is useful for Kannur and Kasaragod."},
      {"q": "Is North Kerala worth visiting?", "a": "Yes. Kozhikode, Wayanad, Kannur, Muzhappilangad, Beypore, Bekal and North Malabar culture offer a side of Kerala many first-time itineraries ignore."},
    ],
  },
  "himachal-pradesh": {
    "intro": "Himachal Pradesh does not give you one version of the mountains. It gives you dozens.\n\nOne road leads to Shimla. Another follows the Beas toward Manali. Drive farther and green mountains turn into the stark landscapes of Lahaul and Spiti. Travel west and Dharamshala sits beneath the Dhauladhar range. Go deeper into Kinnaur and apple orchards give way to villages surrounded by enormous Himalayan peaks.\n\nAt Loop Trips, the goal is not to squeeze all of Himachal into one holiday. It is to help you choose which Himachal belongs in this trip.",
    "faqs": [
      {"q": "What are the best places to visit in Himachal Pradesh for a first trip?", "a": "Shimla, Manali, Dharamshala with McLeod Ganj, and Dalhousie with Khajjiar are the easiest starting points. Add Bir, Tirthan, Kinnaur or Spiti when season, fitness and road time allow."},
      {"q": "How many days do I need for Himachal?", "a": "A short hill break can work in four to five days. A classic Manali or Shimla–Manali trip usually needs six to eight. Spiti, Kinnaur or multi-valley routes need longer and should not be rushed."},
      {"q": "Is Spiti suitable for first-time travellers?", "a": "Spiti suits travellers who accept long mountain roads, altitude, and limited services. It is not the best first Himachal trip if you want an easy hill-station holiday."},
      {"q": "What is the best time to visit Himachal Pradesh?", "a": "Summer suits most valley and hill-station travel. Winter brings snow to selected areas but also road closures. Spiti and Kinnaur seasons are shorter — confirm current road status before locking dates."},
      {"q": "Is Himachal good for families?", "a": "Yes, when road days stay realistic. Shimla, Manali, Dharamshala, Dalhousie, Khajjiar, Palampur and Kasauli are strong family choices."},
      {"q": "Where should couples go in Himachal?", "a": "Manali for a classic mountain holiday, Tirthan for slower nature, Bir for adventure, Dharamshala for cafes and culture, Kinnaur for a road trip, and Dalhousie for an easier hill stay."},
      {"q": "Can I see snow in Himachal?", "a": "Snow cannot be guaranteed on a specific date. Travellers commonly look at Manali and higher surroundings, Solang, Shimla's higher belts, Dalhousie/Khajjiar and selected winter windows — always check recent conditions."},
      {"q": "Should I self-drive in Himachal?", "a": "Self-drive works for confident mountain drivers on suitable routes. Many guests prefer a private vehicle with a local driver so the day stays about the place, not the clutch."},
    ],
  },
  "ladakh": {
    "intro": "Ladakh does not reward the traveller who rushes. The landscape is enormous, the roads are slow, and altitude changes what a normal sightseeing day feels like.\n\nYou may begin in Leh surrounded by monasteries and the Indus Valley. A few days later you can be crossing into Nubra, standing beside Pangong Tso, watching stars above Hanle, or following the road west toward Lamayuru, Kargil and Zanskar.\n\nOfficial guidance requires at least 48 hours of acclimatization after arriving in Leh before travelling to higher-altitude areas. At Loop Trips, we build Ladakh around geography and recovery first — not a list of viral locations.",
    "faqs": [
      {"q": "How many days are enough for Ladakh?", "a": "A first trip focused on Leh, Nubra and Pangong usually needs seven to nine days including acclimatization. Adding Tso Moriri, Hanle or Zanskar needs more time."},
      {"q": "Do I need a permit for Ladakh in 2026?", "a": "As of September 2026, domestic tourists generally do not require an Inner Line Permit for core tourist circuits, while foreign travellers may still need PAP/RAP for notified areas. Always verify current Ladakh Tourism advisories before travel."},
      {"q": "Why is acclimatization important in Ladakh?", "a": "Altitude sickness is real. Official guidance asks for at least 48 hours in Leh before going to higher areas such as Khardung La, Pangong or Tso Moriri."},
      {"q": "What is the best first Ladakh itinerary?", "a": "Build around Leh, Nubra Valley and Pangong Tso. Add Sham Valley or Lamayuru for easier early-trip culture. Extend toward Tso Moriri and Hanle only with enough days."},
      {"q": "Is Ladakh suitable for families?", "a": "Yes for families who can pace altitude carefully, keep travel days realistic, and accept basic road conditions. It is not ideal for rushed school-holiday sightseeing."},
      {"q": "When is the best time to visit Ladakh?", "a": "Most summer circuits run roughly June to September. Shoulder seasons vary by pass status. Winter Ladakh is a different trip and needs specialist planning."},
      {"q": "Is the Manali–Leh road better than flying into Leh?", "a": "Flying into Leh saves days but still needs acclimatization. The Manali–Leh road is an experience in itself and suits travellers with more time who accept mountain road realities."},
      {"q": "Can I do Pangong and Nubra without rushing?", "a": "Yes — if you keep Leh rest days and avoid cramming every high pass into consecutive long drives. Loop Trips designs routes so the landscape stays the point."},
    ],
  },
  "rajasthan": {
    "intro": "Rajasthan does not introduce itself quietly. A fort appears above Jaipur before breakfast. By afternoon you are bargaining inside a centuries-old bazaar. A few days later, blue houses spread beneath Mehrangarh Fort in Jodhpur.\n\nDrive farther west and cities disappear into the Thar Desert. Turn south and Udaipur's lakes reflect palaces with the Aravallis behind them.\n\nAt Loop Trips, Rajasthan is better understood as a journey than a checklist. The secret to a good itinerary is deciding what not to include.",
    "faqs": [
      {"q": "What are the best places to visit in Rajasthan for a first trip?", "a": "Start with Jaipur, Jodhpur and Udaipur. Add Jaisalmer when the desert is a main reason for travelling."},
      {"q": "How many days do I need for Rajasthan?", "a": "A classic Golden Triangle-style Rajasthan circuit often needs seven to ten days. Ten days can cover Jaipur, Pushkar, Jodhpur, Jaisalmer and Udaipur if transfers stay sensible."},
      {"q": "Is Rajasthan good in summer?", "a": "Peak heat is intense in the desert cities. Winter and early spring are more comfortable for forts, markets and outdoor days. Monsoon can be beautiful in parts of southern Rajasthan."},
      {"q": "What is better for families in Rajasthan?", "a": "Jaipur, Udaipur, Jodhpur and carefully paced desert stays work well. Avoid stacking too many overnight transfers with young children."},
      {"q": "Should couples choose Udaipur or Jaisalmer?", "a": "Udaipur suits lakes, palaces and slower evenings. Jaisalmer suits dunes, forts and desert nights. Many couples want both if days allow."},
      {"q": "Is Pushkar worth adding?", "a": "Yes when you want a slower spiritual and cultural stop between Jaipur and the west. It is less essential if your trip is already packed."},
      {"q": "Can I include Ranthambore on a Rajasthan trip?", "a": "Yes, when wildlife is a priority and you accept safari logistics. Do not treat tiger sightings as guaranteed."},
      {"q": "How does Loop Trips plan Rajasthan differently?", "a": "Fewer unnecessary transfers, more time inside each city, and routes that match season, energy and the story you want to bring home."},
    ],
  },
  "uttarakhand": {
    "intro": "Uttarakhand can be a yoga retreat, a lake holiday, a wildlife safari, a ski trip, a pilgrimage, a high-altitude trek or a slow Himalayan road journey — sometimes within the same state.\n\nRishikesh sits beside the Ganga. Mussoorie rises above the Doon Valley. Nainital gathers around a mountain lake. Auli looks toward high peaks. Chopta opens into meadows. Corbett brings forest. Farther north, Valley of Flowers, Kedarnath, Badrinath, Harsil and Munsiyari change the scale completely.\n\nAt Loop Trips, the useful question is not what are all the places in Uttarakhand. It is which region, route and season fit this trip.",
    "faqs": [
      {"q": "What are the best places to visit in Uttarakhand for a first trip?", "a": "Strong starting points include Rishikesh, Mussoorie, Nainital, Jim Corbett and either Auli or Chopta depending on season and trip style."},
      {"q": "Garhwal or Kumaon — which should I choose?", "a": "Garhwal covers Rishikesh, Mussoorie, Auli, Chopta and many pilgrimage routes. Kumaon covers Nainital, Ranikhet, Kausani and Munsiyari. Choose by mood and road logic, not by collecting both in one rushed week."},
      {"q": "How many days do I need for Uttarakhand?", "a": "A short hill or Rishikesh break can work in four to six days. A broader circuit with wildlife or high meadows usually needs seven to ten. Char Dham and serious trek routes need longer."},
      {"q": "Is Uttarakhand good for families?", "a": "Yes for Mussoorie, Nainital, Corbett and carefully paced hill loops. High-altitude pilgrimage and long trek days need different fitness and planning."},
      {"q": "When should I visit Valley of Flowers?", "a": "It is a seasonal alpine trek destination, not a casual day trip. Confirm opening windows, permits and weather before locking dates."},
      {"q": "Can I combine Char Dham with leisure hill stations?", "a": "Usually as separate trip styles. Pilgrimage pacing, altitude and road days rarely mix well with a relaxed lake holiday in the same short window."},
      {"q": "Is Auli only for winter skiing?", "a": "Winter is famous for snow sports, but Auli also works as a high meadow and mountain-view destination in open seasons when roads and weather allow."},
      {"q": "Is Rishikesh only for adventure sports?", "a": "No. Rishikesh serves spirituality, yoga, Ganga evenings and adventure. The Loop Trips angle is to match the version you want rather than forcing every activity into one stay."},
    ],
  },
  "jammu-and-kashmir": {
    "intro": "Jammu and Kashmir does not fit into one postcard.\n\nOne morning can begin on Dal Lake. Another can start in Gulmarg with snow under your boots. Pahalgam changes the mood with pine forests and the Lidder River. Drive toward Gurez and the landscape feels quieter. Travel south toward Jammu and the trip becomes about temples, Dogra culture, pilgrimage and the lower Himalayas.\n\nAt Loop Trips, the useful question is not only where to go. It is which valley, season and pace belong in this journey.",
    "faqs": [
      {"q": "What are the best places to visit in Jammu and Kashmir for a first trip?", "a": "For a first Kashmir Valley trip, the classic core is Srinagar, Gulmarg, Pahalgam and Sonamarg. Add Yusmarg or Doodhpathri for a quieter meadow day when time allows."},
      {"q": "How many days do I need for Kashmir?", "a": "A focused valley trip usually needs six to eight days. Adding Gurez or combining Jammu–Katra–Patnitop needs more time and should not share the same rushed calendar."},
      {"q": "Is Kashmir good in winter?", "a": "Winter can be magical for snow and Gulmarg, but weather and road status shape every day. Confirm conditions close to travel and keep buffers."},
      {"q": "Should I include Jammu and Katra with Srinagar?", "a": "Only when pilgrimage or Jammu-side hills are part of the purpose. They are a different circuit from a classic Kashmir Valley holiday."},
      {"q": "Is Gulmarg worth it in summer?", "a": "Yes for meadows, gondola views and mountain air. Winter is a different trip built around snow."},
      {"q": "How many nights should I spend in Pahalgam?", "a": "Give Pahalgam more than a day trip when possible. One proper overnight lets the valley feel like a stay, not a transfer stop."},
      {"q": "Is Gurez suitable for first-time visitors?", "a": "Gurez suits travellers with enough days who want a quieter, more remote road journey. It is not essential on a short first Kashmir itinerary."},
      {"q": "Is Kashmir suitable for families?", "a": "Yes when pacing stays gentle, houseboat or hotel stays are chosen carefully, and long mountain days are limited for younger children."},
    ],
  },
}

CONFIGS = [
  {
    "file": "Looptrips_Goa_Travel_Guide_2026_Internal_Linking.txt",
    "slug": "goa",
    "name": "Goa",
    "path": "/places-to-visit-in-goa",
    "metaTitle": "Best Places to Visit in Goa 2026 | Looptrips",
    "h1": "Best Places to Visit in Goa: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Goa",
    "countryMatchers": ["Goa", "Goa & Karnataka"],
    "tripIds": ["goa-coast", "goa-gokarna"],
    "imageFrom": "goa-coast",
  },
  {
    "file": "Looptrips_Kerala_Travel_Guide_2026_Internal_Linking.txt",
    "slug": "kerala",
    "name": "Kerala",
    "path": "/places-to-visit-in-kerala",
    "metaTitle": "Best Places to Visit in Kerala 2026 | Looptrips",
    "h1": "Best Places to Visit in Kerala: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Kerala",
    "countryMatchers": ["Kerala"],
    "tripIds": [
      "backwater-spices",
      "munnar-hills",
      "wayanad-green",
      "kerala-ex-kochi-5n",
      "kerala-ex-kochi-4n",
      "solo-malabar",
    ],
    "imageFrom": "backwater-spices",
  },
  {
    "file": "Looptrips_Himachal_Pradesh_Travel_Guide_2026_Internal_Linkin.txt",
    "slug": "himachal-pradesh",
    "name": "Himachal Pradesh",
    "path": "/places-to-visit-in-himachal-pradesh",
    "metaTitle": "Best Places to Visit in Himachal Pradesh 2026 | Looptrips",
    "metaDescription": "Discover the best places to visit in Himachal Pradesh, from Manali and Shimla to Spiti, Dharamshala, Kinnaur, hidden valleys, itineraries and travel tips.",
    "h1": "Best Places to Visit in Himachal Pradesh: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Himachal Pradesh",
    "countryMatchers": ["Himachal", "Spiti"],
    "tripIds": [
      "shimla-manali",
      "manali-snowy-peaks",
      "manali-kasol",
      "solo-hills",
      "company-ridge",
      "spiti-circuit",
    ],
    "imageFrom": "shimla-manali",
  },
  {
    "file": "Looptrips_Ladakh_Travel_Guide_2026_Internal_Linking.txt",
    "slug": "ladakh",
    "name": "Ladakh",
    "path": "/places-to-visit-in-ladakh",
    "metaTitle": "Best Places to Visit in Ladakh 2026 | Looptrips",
    "metaDescription": "Discover the best places to visit in Ladakh, from Leh and Nubra to Pangong, Tso Moriri, Zanskar, itineraries, permits and travel tips.",
    "h1": "Best Places to Visit in Ladakh: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Ladakh",
    "countryMatchers": ["Ladakh"],
    "tripIds": ["himalayan-expedition", "ladakh-ex-leh", "high-road-leh"],
    "imageFrom": "himalayan-expedition",
  },
  {
    "file": "Looptrips_Rajasthan_Travel_Guide_2026.txt",
    "slug": "rajasthan",
    "name": "Rajasthan",
    "path": "/places-to-visit-in-rajasthan",
    "metaTitle": "Best Places to Visit in Rajasthan 2026 | Looptrips",
    "metaDescription": "Discover the best places to visit in Rajasthan, from Jaipur and Udaipur to Jaisalmer, hidden gems, road trips, itineraries and travel tips.",
    "h1": "Best Places to Visit in Rajasthan: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Rajasthan",
    "countryMatchers": ["Rajasthan"],
    "tripIds": ["forts-and-palaces", "rajasthan-trio", "thar-iron", "haveli-family"],
    "imageFrom": "forts-and-palaces",
  },
  {
    "file": "Looptrips_Uttarakhand_Travel_Guide_2026_Internal_Linking.txt",
    "slug": "uttarakhand",
    "name": "Uttarakhand",
    "path": "/places-to-visit-in-uttarakhand",
    "metaTitle": "Best Places to Visit in Uttarakhand 2026 | Looptrips",
    "metaDescription": "Discover the best places to visit in Uttarakhand, from Rishikesh and Nainital to Auli, Chopta, Corbett, Valley of Flowers, itineraries and travel tips.",
    "h1": "Best Places to Visit in Uttarakhand: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Uttarakhand",
    "countryMatchers": ["Uttarakhand", "Rishikesh"],
    "tripIds": ["char-dham-path"],
    "imageFrom": "char-dham-path",
  },
  {
    "file": "Looptrips_Jammu_Kashmir_Travel_Guide_2026_Internal_Linking.txt",
    "slug": "jammu-and-kashmir",
    "name": "Jammu and Kashmir",
    "path": "/places-to-visit-in-jammu-and-kashmir",
    "metaTitle": "Best Places to Visit in Jammu and Kashmir 2026 | Looptrips",
    "metaDescription": "Discover the best places to visit in Jammu and Kashmir, from Srinagar and Gulmarg to Pahalgam, Jammu, Katra, Gurez, itineraries and travel tips.",
    "h1": "Best Places to Visit in Jammu and Kashmir: Complete 2026 Travel Guide",
    "primaryKeyword": "best places to visit in Jammu and Kashmir",
    "countryMatchers": ["Kashmir", "Jammu", "Jammu and Kashmir", "Jammu & Kashmir"],
    "tripIds": ["valley-of-serenity", "kashmir-dal"],
    "imageFrom": "valley-of-serenity",
  },
]


def clean_text(s: str) -> str:
    s = s.replace("\uf0b7", "-").replace("\u2022", "-").replace("\xa0", " ")
    s = re.sub(r"\\n===== PAGE \d+ =====\\n", "\n", s)
    s = re.sub(r"\n===== PAGE \d+ =====\n", "\n", s)
    s = re.sub(r"LOOPTRIPS\s*\|[^\n]*", "", s)
    s = re.sub(r"Looptrips\s*\|[^\n]*", "", s)
    s = re.sub(r"Page \d+", "", s)
    s = re.sub(r"Recommended[^\n]*", "", s)
    s = re.sub(r"Future pages:[^\n]*", "", s)
    s = re.sub(r"travel-guide/", "", s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def resolve_file(name: str):
    path = EXTRACT / name
    if path.exists():
        return path
    cands = list(EXTRACT.glob(name[:45] + "*"))
    return cands[0] if cands else None


def parse_overview(text: str) -> str:
    m = re.search(
        r"What Are the Best Places to Visit in[^\n]*\n([\s\S]{80,1200}?)(?=\n\s*1\.\s)",
        text,
    )
    if not m:
        return ""
    return clean_text(re.sub(r"\s+", " ", m.group(1)))


def parse_places(text: str):
    places = []
    m = re.search(r"What Are the Best Places to Visit in[^\n]*\n", text)
    body = text[m.end() :] if m else text
    for cut in [
        "Frequently Asked",
        "Internal Linking",
        "Build Your",
        "Trip Planning Questions",
        "Best Places to Visit in Himachal Pradesh With Family",
        "Best Places to Visit in",
        "How many days",
        "Best time to visit",
    ]:
        # only cut later "Best Places..." family sections, not the heading we already passed
        pass
    # Prefer cutting at FAQ / linking / family section headings that appear after place 1.
    for cut in [
        "Frequently Asked Questions",
        "Internal Linking Plan",
        "Build Your Goa Loop",
        "Build Your",
        "Trip Planning Questions People Actually Search",
        "Content Cluster",
        "Page Cluster",
    ]:
        i = body.find(cut)
        if i > 800:
            body = body[:i]
            break
    # Also cut family-intent sections that reuse "Best Places to Visit"
    fam = re.search(r"\nBest Places to Visit in .{0,40}(?:With Family|for Couples)", body)
    if fam and fam.start() > 800:
        body = body[: fam.start()]

    pattern = re.compile(r"(?m)^\s*(\d{1,2})\.\s+([^\n]{8,140})\n")
    matches = list(pattern.finditer(body))
    for idx, match in enumerate(matches[:12]):
        title = clean_text(match.group(2))
        title = re.sub(r"\s*:\s*$", "", title)
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        para = clean_text(body[start:end])
        para = re.sub(r"\s+", " ", para)
        if len(para) > 520:
            cut_at = para.find(". ", 280)
            if cut_at > 0:
                para = para[: cut_at + 1]
            else:
                para = para[:520].rsplit(" ", 1)[0] + "…"
        if title and para and len(para) > 50:
            places.append({"title": title, "body": para})
    return places


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


destinations = []
for cfg in CONFIGS:
    path = resolve_file(cfg["file"])
    text = path.read_text(encoding="utf-8") if path else ""
    curated = CURATED.get(cfg["slug"], {})
    overview = parse_overview(text)
    places = parse_places(text)
    item = {
        "slug": cfg["slug"],
        "name": cfg["name"],
        "path": cfg["path"],
        "metaTitle": cfg["metaTitle"],
        "metaDescription": curated.get("metaDescription") or cfg.get("metaDescription", ""),
        "h1": cfg["h1"],
        "primaryKeyword": cfg["primaryKeyword"],
        "imageFrom": cfg["imageFrom"],
        "intro": curated["intro"],
        "overview": overview,
        "countryMatchers": cfg["countryMatchers"],
        "tripIds": cfg["tripIds"],
        "places": places,
        "faqs": curated["faqs"],
    }
    print(cfg["slug"], "places", len(places), "overview", len(overview))
    destinations.append(item)

(EXTRACT / "destinations.json").write_text(
    json.dumps(destinations, ensure_ascii=False, indent=2), encoding="utf-8"
)

lines = [
    "/* Destination SEO pillars — from Looptrips 2026 travel guide PDFs. */",
    "(function (global) {",
    "  const destinations = [",
]
for d in destinations:
    lines.append("    {")
    for key in [
        "slug",
        "name",
        "path",
        "metaTitle",
        "metaDescription",
        "h1",
        "primaryKeyword",
        "imageFrom",
        "intro",
        "overview",
    ]:
        lines.append(f"      {key}: {js_string(d[key])},")
    lines.append(f"      countryMatchers: {json.dumps(d['countryMatchers'], ensure_ascii=False)},")
    lines.append(f"      tripIds: {json.dumps(d['tripIds'], ensure_ascii=False)},")
    lines.append("      places: [")
    for p in d["places"]:
        lines.append(f"        {{ title: {js_string(p['title'])}, body: {js_string(p['body'])} }},")
    lines.append("      ],")
    lines.append("      faqs: [")
    for f in d["faqs"]:
        lines.append(f"        {{ q: {js_string(f['q'])}, a: {js_string(f['a'])} }},")
    lines.append("      ],")
    lines.append("    },")
lines += [
    "  ];",
    "",
    "  function bySlug(slug) {",
    "    if (!slug) return null;",
    "    const key = String(slug).toLowerCase();",
    "    return destinations.find((d) => d.slug === key) || null;",
    "  }",
    "",
    "  function matchJourney(journey) {",
    "    if (!journey) return null;",
    "    const id = journey.id;",
    "    for (const d of destinations) {",
    "      if (d.tripIds && d.tripIds.includes(id)) return d;",
    "    }",
    "    const country = String(journey.country || \"\");",
    "    const hay = `${country} ${(journey.locations || []).join(\" \")}`.toLowerCase();",
    "    for (const d of destinations) {",
    "      if ((d.countryMatchers || []).some((m) => hay.includes(String(m).toLowerCase()))) return d;",
    "    }",
    "    return null;",
    "  }",
    "",
    "  function journeysFor(dest, allJourneys) {",
    "    if (!dest || !Array.isArray(allJourneys)) return [];",
    "    const byId = new Map(allJourneys.map((j) => [j.id, j]));",
    "    const ordered = [];",
    "    const seen = new Set();",
    "    (dest.tripIds || []).forEach((id) => {",
    "      const j = byId.get(id);",
    "      if (j) { ordered.push(j); seen.add(id); }",
    "    });",
    "    allJourneys.forEach((j) => {",
    "      if (seen.has(j.id)) return;",
    "      const matched = matchJourney(j);",
    "      if (matched && matched.slug === dest.slug) {",
    "        ordered.push(j);",
    "        seen.add(j.id);",
    "      }",
    "    });",
    "    return ordered;",
    "  }",
    "",
    "  global.LOOP_DESTINATIONS = {",
    "    list: destinations,",
    "    bySlug,",
    "    matchJourney,",
    "    journeysFor,",
    "  };",
    "})(window);",
    "",
]

out = ROOT / "js" / "destinations.js"
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, "bytes", out.stat().st_size)
