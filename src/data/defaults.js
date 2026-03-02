export const INITIAL_PACK = [
  {id:1,name:'Passport',cat:'documents'},{id:2,name:'Travel insurance documents',cat:'documents'},{id:3,name:'Flight confirmations (printed)',cat:'documents'},{id:4,name:'Hotel/AirBnB confirmations',cat:'documents'},{id:6,name:'Explorer Pass (if purchased)',cat:'documents'},{id:7,name:'Emergency contact list (UK)',cat:'documents'},
  {id:8,name:'Waterproof rain jacket (essential!)',cat:'clothing'},{id:9,name:'Warm fleece / mid-layer',cat:'clothing'},{id:10,name:'Waterproof hiking boots',cat:'clothing'},{id:11,name:'Comfortable walking shoes / sneakers',cat:'clothing'},{id:12,name:'Light scarf',cat:'clothing'},{id:13,name:'Compact travel umbrella',cat:'clothing'},{id:14,name:'Warm hat & gloves (Scotland)',cat:'clothing'},{id:50,name:'Underwear (x10)',cat:'clothing'},{id:51,name:'Socks — everyday (x7)',cat:'clothing'},{id:52,name:'Socks — thick/hiking (x3)',cat:'clothing'},{id:53,name:'T-shirts / casual tops (x5)',cat:'clothing'},{id:54,name:'Long-sleeve shirts (x3)',cat:'clothing'},{id:55,name:'Jeans or casual trousers (x2)',cat:'clothing'},{id:56,name:'Comfortable everyday pants (x1)',cat:'clothing'},{id:57,name:'Shorts (x2, for warmer London days)',cat:'clothing'},{id:58,name:'Nicer outfit for dinners out (x1)',cat:'clothing'},{id:59,name:'Lightweight cardigan or zip-up',cat:'clothing'},{id:60,name:'Pajamas / loungewear',cat:'clothing'},{id:61,name:'Swimsuit (just in case)',cat:'clothing'},
  {id:16,name:'Toothbrush & toothpaste',cat:'toiletries'},{id:17,name:'Floss & mouthwash',cat:'toiletries'},{id:18,name:'Shampoo & conditioner',cat:'toiletries'},{id:19,name:'Body wash / soap',cat:'toiletries'},{id:20,name:'Deodorant',cat:'toiletries'},{id:21,name:'Face wash & moisturizer',cat:'toiletries'},{id:22,name:'SPF sunscreen',cat:'toiletries'},{id:23,name:'Lip balm with SPF',cat:'toiletries'},{id:24,name:'Razor & shaving cream',cat:'toiletries'},{id:25,name:'Feminine hygiene products',cat:'toiletries'},{id:26,name:'Hair brush / comb',cat:'toiletries'},{id:27,name:'Hair ties / clips',cat:'toiletries'},{id:28,name:'Travel hair dryer or adapter (UK voltage)',cat:'toiletries'},{id:29,name:'Cotton rounds / swabs',cat:'toiletries'},{id:30,name:'Hand lotion',cat:'toiletries'},{id:31,name:'Hand sanitizer',cat:'toiletries'},{id:32,name:'Prescription medications',cat:'toiletries'},{id:33,name:'Ibuprofen / pain reliever',cat:'toiletries'},{id:34,name:'Antihistamines / allergy meds',cat:'toiletries'},{id:35,name:'Motion sickness medication',cat:'toiletries'},{id:36,name:'Digestive aids (Pepto, antacids)',cat:'toiletries'},{id:37,name:'First aid kit (bandages, antiseptic)',cat:'toiletries'},{id:38,name:'Blister plasters (lots of walking!)',cat:'toiletries'},
  {id:39,name:'Phone & charging cable',cat:'electronics'},{id:40,name:'UK Type G plug adapters (x2 min)',cat:'electronics'},{id:41,name:'Universal travel power strip',cat:'electronics'},{id:42,name:'Portable power bank (large)',cat:'electronics'},{id:43,name:'Camera + battery + memory cards',cat:'electronics'},{id:44,name:'Camera charging cable',cat:'electronics'},{id:45,name:'Noise-cancelling headphones',cat:'electronics'},{id:46,name:'Headphone charging cable',cat:'electronics'},{id:47,name:'Laptop or tablet (if needed)',cat:'electronics'},{id:48,name:'Laptop charger',cat:'electronics'},{id:49,name:'E-reader / Kindle',cat:'electronics'},
  {id:62,name:'Insect repellent — MIDGES!',cat:'scotland'},{id:63,name:'Hiking daypack',cat:'scotland'},{id:64,name:'Binoculars (wildlife & scenery)',cat:'scotland'},{id:65,name:'Reusable water bottle',cat:'scotland'},{id:66,name:'Trail snacks (long days out)',cat:'scotland'},
].map(i => ({...i, checked: false}));

export const INITIAL_EXPENSES = [
  {id:1,name:'Flights SLC to/from London (x6)',cat:'Flights',amount:0},
  {id:2,name:'London AirBnB (2 nights)',cat:'Accommodation',amount:0},
  {id:3,name:'Inverness AirBnB (4 nights)',cat:'Accommodation',amount:0},
  {id:4,name:'Charlestown AirBnB (4 nights)',cat:'Accommodation',amount:0},
  {id:5,name:'Rental Car (Scotland, ~9 days)',cat:'Transport',amount:0},
  {id:6,name:'London → Inverness flights (x6)',cat:'Flights',amount:0},
  {id:7,name:'WOW Scotland Isle of Skye Tour (x6)',cat:'Activities',amount:0},
  {id:8,name:'Explorer Pass (x6)',cat:'Activities',amount:0},
];

export const INITIAL_NOTES = [
  {id:1,text:'Confirm early check-in with London AirBnB host',day:2},
  {id:2,text:'Pick up Oyster cards at Heathrow for London public transit',day:2},
  {id:3,text:'Confirm British Airways flight number for London → Inverness',day:4},
  {id:4,text:'Confirm rental car — large enough for 6 adults + luggage',day:4},
  {id:5,text:'Pre-order lunch for WOW Scotland Skye tour (May 29)',day:5},
  {id:6,text:"Make dinner reservation at Hootenanny's for May 29 (card required — £15/person no-show fee)",day:5},
  {id:7,text:'Book Ben Nevis Inn or Grog & Gruel for May 31 group dinner',day:7},
  {id:8,text:'Buy/register Explorer Pass for castles & sites',day:null},
  {id:9,text:'Book Edinburgh Castle 10:00 AM entry + Afternoon Tea (June 2)',day:9},
  {id:10,text:'Book Stirling Castle 11:00 AM reservation (June 3)',day:10},
  {id:11,text:'Decide flight home: Option A (via JFK, arrive SLC 10 PM) or Option B (via ATL, arrive SLC 5:20 PM)',day:12},
  {id:12,text:'Decide: Charlestown → Edinburgh by Park & Ride (Ferrytoll is closest) or car',day:9},
  {id:13,text:"Book Mary King's Close underground tour (June 2)",day:9},
  {id:14,text:'Book Holyrood Palace tour if desired (June 2)',day:9},
].map(n => ({...n, done: false}));
