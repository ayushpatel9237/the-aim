// The AIM product data — edit names, prices, categories and descriptions here.
// gallery[0] is the HERO (main photo); the rest are the extra photos.
// video: paste an Instagram / Facebook / YouTube link OR a file path like
//        "videos/clip.mp4". Leave "" for photos-only. Any product can have one.
const PRODUCTS = [
  {
    "id": "01_starry_sky_moon_lamp",
    "sku": "AIM-001",
    "name": "Starry Sky Moon Lamp",
    "category": "Room",
    "price": 1299,
    "desc": "3D-printed moon lamp with starry-sky projection modes — touch control, USB rechargeable.",
    "hero": "images/products/01_starry_sky_moon_lamp_hero.webp",
    "gallery": [
      "images/products/01_starry_sky_moon_lamp_hero.webp",
      "images/products/01_starry_sky_moon_lamp_02.webp",
      "images/products/01_starry_sky_moon_lamp_05.webp",
      "images/products/01_starry_sky_moon_lamp_06.webp",
      "images/products/01_starry_sky_moon_lamp_07.webp",
      "images/products/01_starry_sky_moon_lamp_08.webp",
      "images/products/01_starry_sky_moon_lamp_09.webp",
      "images/products/01_starry_sky_moon_lamp_10.webp"
    ],
    "thumb": "images/products/01_starry_sky_moon_lamp_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "11_magnetic_pocket_phone_stand",
    "sku": "AIM-002",
    "name": "Magnetic Pocket Phone Stand",
    "category": "Desk",
    "price": 499,
    "desc": "Card-thin magnetic stand that lives in your pocket and props your phone anywhere.",
    "hero": "images/products/11_magnetic_pocket_phone_stand_hero.webp",
    "gallery": [
      "images/products/11_magnetic_pocket_phone_stand_hero.webp",
      "images/products/11_magnetic_pocket_phone_stand_01.webp",
      "images/products/11_magnetic_pocket_phone_stand_02.webp",
      "images/products/11_magnetic_pocket_phone_stand_03.webp"
    ],
    "thumb": "images/products/11_magnetic_pocket_phone_stand_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "12_typec_docking_station_stand",
    "sku": "AIM-003",
    "name": "Type-C Docking Station Stand",
    "category": "Desk",
    "price": 1499,
    "desc": "Phone stand with a built-in Type-C hub — charge and connect while you work.",
    "hero": "images/products/12_typec_docking_station_stand_hero.webp",
    "gallery": [
      "images/products/12_typec_docking_station_stand_hero.webp",
      "images/products/12_typec_docking_station_stand_01.webp",
      "images/products/12_typec_docking_station_stand_02.webp",
      "images/products/12_typec_docking_station_stand_03.webp",
      "images/products/12_typec_docking_station_stand_04.webp"
    ],
    "thumb": "images/products/12_typec_docking_station_stand_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "13_wooden_coaster_set",
    "sku": "AIM-004",
    "name": "Wooden Coaster Set",
    "category": "Desk",
    "price": 399,
    "desc": "Solid wood coasters with a holder — keeps rings off your desk, looks good doing it.",
    "hero": "images/products/13_wooden_coaster_set_hero.webp",
    "gallery": [
      "images/products/13_wooden_coaster_set_hero.webp",
      "images/products/13_wooden_coaster_set_01.webp",
      "images/products/13_wooden_coaster_set_02.webp"
    ],
    "thumb": "images/products/13_wooden_coaster_set_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "14_gift_pack_cable_storage_box",
    "sku": "AIM-005",
    "name": "Gift Pack Cable Storage Box",
    "category": "Storage",
    "price": 599,
    "desc": "Compartment box that untangles your cable drawer — gift-ready packaging.",
    "hero": "images/products/14_gift_pack_cable_storage_box_hero.webp",
    "gallery": [
      "images/products/14_gift_pack_cable_storage_box_hero.webp",
      "images/products/14_gift_pack_cable_storage_box_01.webp",
      "images/products/14_gift_pack_cable_storage_box_02.webp",
      "images/products/14_gift_pack_cable_storage_box_03.webp",
      "images/products/14_gift_pack_cable_storage_box_04.webp",
      "images/products/14_gift_pack_cable_storage_box_05.webp"
    ],
    "thumb": "images/products/14_gift_pack_cable_storage_box_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "17_glue_handbag_phone_case",
    "sku": "AIM-006",
    "name": "Handbag Phone Case",
    "category": "Gadgets",
    "price": 699,
    "desc": "Phone case with a handbag-style strap — carry hands-free, drop-protected.",
    "hero": "images/products/17_glue_handbag_phone_case_HERO.webp",
    "gallery": [
      "images/products/17_glue_handbag_phone_case_HERO.webp",
      "images/products/17_glue_handbag_phone_case_01.webp",
      "images/products/17_glue_handbag_phone_case_02.webp",
      "images/products/17_glue_handbag_phone_case_03.webp",
      "images/products/17_glue_handbag_phone_case_04.webp"
    ],
    "thumb": "images/products/17_glue_handbag_phone_case_HERO.thumb.webp",
    "video": ""
  },
  {
    "id": "18_diamond_gemstone_phone_case",
    "sku": "AIM-007",
    "name": "Diamond Gemstone Phone Case",
    "category": "Gadgets",
    "price": 799,
    "desc": "Gemstone-studded case that turns your phone into jewellery.",
    "hero": "images/products/18_diamond_gemstone_phone_case_HERO.webp",
    "gallery": [
      "images/products/18_diamond_gemstone_phone_case_HERO.webp",
      "images/products/18_diamond_gemstone_phone_case_01.webp",
      "images/products/18_diamond_gemstone_phone_case_02.webp"
    ],
    "thumb": "images/products/18_diamond_gemstone_phone_case_HERO.thumb.webp",
    "video": ""
  },
  {
    "id": "19_bluetooth_finger_robot",
    "sku": "AIM-008",
    "name": "Bluetooth Finger Robot",
    "category": "Gadgets",
    "price": 999,
    "desc": "Tiny Bluetooth robot that physically taps buttons and switches on command.",
    "hero": "images/products/19_bluetooth_finger_robot_hero.webp",
    "gallery": [
      "images/products/19_bluetooth_finger_robot_hero.webp",
      "images/products/19_bluetooth_finger_robot_01.webp",
      "images/products/19_bluetooth_finger_robot_02.webp"
    ],
    "thumb": "images/products/19_bluetooth_finger_robot_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "20_magnetic_neck_fan",
    "sku": "AIM-009",
    "name": "Magnetic Neck Fan",
    "category": "Gadgets",
    "price": 899,
    "desc": "Hands-free neck fan with magnetic mount — bladeless airflow, USB rechargeable.",
    "hero": "images/products/20_magnetic_neck_fan_hero.webp",
    "gallery": [
      "images/products/20_magnetic_neck_fan_hero.webp",
      "images/products/20_magnetic_neck_fan_01.webp",
      "images/products/20_magnetic_neck_fan_02.webp"
    ],
    "thumb": "images/products/20_magnetic_neck_fan_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "21_ai_face_tracking_selfie_stick",
    "sku": "AIM-010",
    "name": "AI Face-Tracking Selfie Stick",
    "category": "Gadgets",
    "price": 1499,
    "desc": "Selfie stick that follows your face automatically — no cameraman needed.",
    "hero": "images/products/21_ai_face_tracking_selfie_stick_hero.webp",
    "gallery": [
      "images/products/21_ai_face_tracking_selfie_stick_hero.webp",
      "images/products/21_ai_face_tracking_selfie_stick_01.webp",
      "images/products/21_ai_face_tracking_selfie_stick_02.webp",
      "images/products/21_ai_face_tracking_selfie_stick_03.webp"
    ],
    "thumb": "images/products/21_ai_face_tracking_selfie_stick_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "22_butterfly_phone_stand",
    "sku": "AIM-011",
    "name": "Butterfly Phone Stand",
    "category": "Desk",
    "price": 1000,
    "desc": "Butterfly-shaped aluminum desktop stand that holds your phone or tablet at a 360°-adjustable angle and folds flat when not in use. A decorative, sturdy stand for video calls, recipes, or hands-free viewing.",
    "hero": "images/products/22_butterfly_phone_stand_hero.webp",
    "gallery": [
      "images/products/22_butterfly_phone_stand_hero.webp",
      "images/products/22_butterfly_phone_stand_01.webp",
      "images/products/22_butterfly_phone_stand_02.webp",
      "images/products/22_butterfly_phone_stand_03.webp",
      "images/products/22_butterfly_phone_stand_04.webp"
    ],
    "thumb": "images/products/22_butterfly_phone_stand_hero.thumb.webp",
    "video": "https://www.youtube.com/watch?v=ScMzIvxBSi4"
  },
  {
    "id": "23_nail_art_steel_plates",
    "sku": "AIM-012",
    "name": "Nail Art Steel Plates",
    "category": "Daily Essentials",
    "price": 349,
    "desc": "Etched steel stamping plates for salon-grade nail art at home.",
    "hero": "images/products/23_nail_art_steel_plates_hero.webp",
    "gallery": [
      "images/products/23_nail_art_steel_plates_hero.webp",
      "images/products/23_nail_art_steel_plates_01.webp",
      "images/products/23_nail_art_steel_plates_02.webp",
      "images/products/23_nail_art_steel_plates_03.webp",
      "images/products/23_nail_art_steel_plates_04.webp",
      "images/products/23_nail_art_steel_plates_05.webp"
    ],
    "thumb": "images/products/23_nail_art_steel_plates_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "240w_folding_stand_data_cable",
    "sku": "AIM-013",
    "name": "240W Folding Stand Cable",
    "category": "Desk",
    "price": 399,
    "desc": "Fast-charge cable that folds into a phone stand — Type-C to Type-C, 240W.",
    "hero": "images/products/240w_folding_stand_data_cable_hero.webp",
    "gallery": [
      "images/products/240w_folding_stand_data_cable_hero.webp",
      "images/products/240w_folding_stand_data_cable_01.webp",
      "images/products/240w_folding_stand_data_cable_02.webp",
      "images/products/240w_folding_stand_data_cable_03.webp",
      "images/products/240w_folding_stand_data_cable_04.webp"
    ],
    "thumb": "images/products/240w_folding_stand_data_cable_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "24_silicone_folding_water_bottle",
    "sku": "AIM-014",
    "name": "Silicone Folding Water Bottle",
    "category": "Daily Essentials",
    "price": 449,
    "desc": "Collapses to half its size when empty — leak-proof, food-grade silicone.",
    "hero": "images/products/24_silicone_folding_water_bottle_hero.webp",
    "gallery": [
      "images/products/24_silicone_folding_water_bottle_hero.webp",
      "images/products/24_silicone_folding_water_bottle_01.webp",
      "images/products/24_silicone_folding_water_bottle_02.webp",
      "images/products/24_silicone_folding_water_bottle_03.webp",
      "images/products/24_silicone_folding_water_bottle_04.webp"
    ],
    "thumb": "images/products/24_silicone_folding_water_bottle_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "25_keychain_shopping_tote",
    "sku": "AIM-015",
    "name": "Keychain Shopping Tote",
    "category": "Daily Essentials",
    "price": 299,
    "desc": "Full-size tote that packs into a keychain pouch — always on you.",
    "hero": "images/products/25_keychain_shopping_tote_hero.webp",
    "gallery": [
      "images/products/25_keychain_shopping_tote_hero.webp",
      "images/products/25_keychain_shopping_tote_01.webp",
      "images/products/25_keychain_shopping_tote_02.webp"
    ],
    "thumb": "images/products/25_keychain_shopping_tote_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "26_foldable_bluetooth_keyboard",
    "sku": "AIM-016",
    "name": "Foldable Bluetooth Keyboard",
    "category": "Desk",
    "price": 1799,
    "desc": "Full keyboard that folds to pocket size — pairs with phone, tablet, laptop.",
    "hero": "images/products/26_foldable_bluetooth_keyboard_hero.webp",
    "gallery": [
      "images/products/26_foldable_bluetooth_keyboard_hero.webp",
      "images/products/26_foldable_bluetooth_keyboard_01.webp",
      "images/products/26_foldable_bluetooth_keyboard_02.webp",
      "images/products/26_foldable_bluetooth_keyboard_03.webp",
      "images/products/26_foldable_bluetooth_keyboard_04.webp"
    ],
    "thumb": "images/products/26_foldable_bluetooth_keyboard_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "27_photography_fill_light_stand",
    "sku": "AIM-017",
    "name": "Photography Fill Light Stand",
    "category": "Gadgets",
    "price": 1299,
    "desc": "Adjustable fill light on a stand — even lighting for calls and content.",
    "hero": "images/products/27_photography_fill_light_stand_hero.webp",
    "gallery": [
      "images/products/27_photography_fill_light_stand_hero.webp",
      "images/products/27_photography_fill_light_stand_01.webp",
      "images/products/27_photography_fill_light_stand_02.webp",
      "images/products/27_photography_fill_light_stand_03.webp"
    ],
    "thumb": "images/products/27_photography_fill_light_stand_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "28_ai_face_tracking_phone_bracket",
    "sku": "AIM-018",
    "name": "AI Face-Tracking Phone Bracket",
    "category": "Gadgets",
    "price": 1399,
    "desc": "Desk bracket that rotates to keep your face in frame automatically.",
    "hero": "images/products/28_ai_face_tracking_phone_bracket_hero.webp",
    "gallery": [
      "images/products/28_ai_face_tracking_phone_bracket_hero.webp",
      "images/products/28_ai_face_tracking_phone_bracket_01.webp",
      "images/products/28_ai_face_tracking_phone_bracket_02.webp",
      "images/products/28_ai_face_tracking_phone_bracket_03.webp"
    ],
    "thumb": "images/products/28_ai_face_tracking_phone_bracket_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "disposable_travel_compression_socks",
    "sku": "AIM-019",
    "name": "Travel Compression Socks",
    "category": "Daily Essentials",
    "price": 249,
    "desc": "Disposable compression socks for long flights and train rides.",
    "hero": "images/products/disposable_travel_compression_socks_hero.webp",
    "gallery": [
      "images/products/disposable_travel_compression_socks_hero.webp",
      "images/products/disposable_travel_compression_socks_01.webp",
      "images/products/disposable_travel_compression_socks_03.webp",
      "images/products/disposable_travel_compression_socks_03.webp"
    ],
    "thumb": "images/products/disposable_travel_compression_socks_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "flexible_deformable_device_stand",
    "sku": "AIM-020",
    "name": "Flexible Deformable Device Stand",
    "category": "Desk",
    "price": 899,
    "desc": "Bendable stand that holds any device at any angle — reshapes in seconds.",
    "hero": "images/products/flexible_deformable_device_stand_hero.webp",
    "gallery": [
      "images/products/flexible_deformable_device_stand_hero.webp",
      "images/products/flexible_deformable_device_stand_01.webp",
      "images/products/flexible_deformable_device_stand_02.webp",
      "images/products/flexible_deformable_device_stand_03.webp",
      "images/products/flexible_deformable_device_stand_04.webp",
      "images/products/flexible_deformable_device_stand_05.webp",
      "images/products/flexible_deformable_device_stand_06.webp"
    ],
    "thumb": "images/products/flexible_deformable_device_stand_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "folding_nail_clippers_keychain",
    "sku": "AIM-021",
    "name": "Folding Nail Clippers Keychain",
    "category": "Daily Essentials",
    "price": 199,
    "desc": "Folding clippers that clip to your keys — sharp, compact, always there.",
    "hero": "images/products/folding_nail_clippers_keychain_hero.webp",
    "gallery": [
      "images/products/folding_nail_clippers_keychain_hero.webp",
      "images/products/folding_nail_clippers_keychain_01.webp",
      "images/products/folding_nail_clippers_keychain_02.webp",
      "images/products/folding_nail_clippers_keychain_03.webp",
      "images/products/folding_nail_clippers_keychain_04.webp"
    ],
    "thumb": "images/products/folding_nail_clippers_keychain_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "large_capacity_travel_tote_bag",
    "sku": "AIM-022",
    "name": "Large Capacity Travel Tote Bag",
    "category": "Storage",
    "price": 999,
    "desc": "Oversized travel tote with structured compartments — carry-on friendly.",
    "hero": "images/products/large_capacity_travel_tote_bag_hero.webp",
    "gallery": [
      "images/products/large_capacity_travel_tote_bag_hero.webp",
      "images/products/large_capacity_travel_tote_bag_01.webp",
      "images/products/large_capacity_travel_tote_bag_02.webp",
      "images/products/large_capacity_travel_tote_bag_03.webp",
      "images/products/large_capacity_travel_tote_bag_04.webp"
    ],
    "thumb": "images/products/large_capacity_travel_tote_bag_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "magnetic_multi_device_holder",
    "sku": "AIM-023",
    "name": "Magnetic Multi-Device Holder",
    "category": "Desk",
    "price": 799,
    "desc": "Magnetic arms hold phone, tablet, and accessories in one folding stand.",
    "hero": "images/products/magnetic_multi_device_holder_hero.webp",
    "gallery": [
      "images/products/magnetic_multi_device_holder_hero.webp",
      "images/products/magnetic_multi_device_holder_01.webp",
      "images/products/magnetic_multi_device_holder_02.webp",
      "images/products/magnetic_multi_device_holder_03.webp",
      "images/products/magnetic_multi_device_holder_04.webp"
    ],
    "thumb": "images/products/magnetic_multi_device_holder_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "no_drill_telescopic_towel_rack",
    "sku": "AIM-024",
    "name": "No-Drill Telescopic Towel Rack",
    "category": "Room",
    "price": 549,
    "desc": "Telescopic rack that mounts without drilling — strong hold on any wall.",
    "hero": "images/products/no_drill_telescopic_towel_rack_hero.webp",
    "gallery": [
      "images/products/no_drill_telescopic_towel_rack_hero.webp",
      "images/products/no_drill_telescopic_towel_rack_01.webp",
      "images/products/no_drill_telescopic_towel_rack_02_.webp",
      "images/products/no_drill_telescopic_towel_rack_03_.webp",
      "images/products/no_drill_telescopic_towel_rack_04.webp",
      "images/products/no_drill_telescopic_towel_rack_05.webp"
    ],
    "thumb": "images/products/no_drill_telescopic_towel_rack_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "portable_cable_storage_box",
    "sku": "AIM-025",
    "name": "Portable Cable Storage Box",
    "category": "Storage",
    "price": 449,
    "desc": "Zip-shut box that keeps cables, adapters, and drives in one place.",
    "hero": "images/products/portable_cable_storage_box_hero.webp",
    "gallery": [
      "images/products/portable_cable_storage_box_hero.webp",
      "images/products/portable_cable_storage_box_01.webp",
      "images/products/portable_cable_storage_box_02.webp",
      "images/products/portable_cable_storage_box_03.webp",
      "images/products/portable_cable_storage_box_04.webp"
    ],
    "thumb": "images/products/portable_cable_storage_box_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "travel_duffel_bag_with_trolley_rod",
    "sku": "AIM-026",
    "name": "Travel Duffel Bag with Trolley Rod",
    "category": "Storage",
    "price": 1299,
    "desc": "Duffel with a built-in trolley sleeve — sits on your suitcase handle.",
    "hero": "images/products/travel_duffel_bag_with_trolley_rod_hero.webp",
    "gallery": [
      "images/products/travel_duffel_bag_with_trolley_rod_hero.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_01.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_02.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_03.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_04.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_05.webp",
      "images/products/travel_duffel_bag_with_trolley_rod_06.webp"
    ],
    "thumb": "images/products/travel_duffel_bag_with_trolley_rod_hero.thumb.webp",
    "video": ""
  },
  {
    "id": "wireless_remote_light_switch",
    "sku": "AIM-027",
    "name": "Wireless Remote Light Switch",
    "category": "Room",
    "price": 1499,
    "desc": "Control any light switch from your bed — sticks on, no wiring needed.",
    "hero": "images/products/wireless_remote_light_switch_hero.webp",
    "gallery": [
      "images/products/wireless_remote_light_switch_hero.webp",
      "images/products/wireless_remote_light_switch_01.webp",
      "images/products/wireless_remote_light_switch_02.webp",
      "images/products/wireless_remote_light_switch_03.webp"
    ],
    "thumb": "images/products/wireless_remote_light_switch_hero.thumb.webp",
    "video": ""
  }
];
