/**
 * Nigeria Geographic Data: 36 States + FCT, 774 Local Government Areas (LGAs),
 * major commercial hubs, popular neighborhood areas, and coordinates for interactive mapping.
 */

export interface NigerianStateData {
  state: string;
  capital: string;
  lat: number;
  lng: number;
  lgas: {
    name: string;
    popularAreas?: string[];
  }[];
}

export const NIGERIA_STATES: NigerianStateData[] = [
  {
    state: "Lagos",
    capital: "Ikeja",
    lat: 6.5244,
    lng: 3.3792,
    lgas: [
      {
        name: "Ikeja",
        popularAreas: [
          "Allen Avenue",
          "Opebi",
          "Alausa",
          "GRA Ikeja",
          "Agidingbi",
          "Computer Village",
          "Anifowoshe",
          "Oregun",
        ],
      },
      {
        name: "Eti-Osa",
        popularAreas: [
          "Victoria Island",
          "Ikoyi",
          "Lekki Phase 1",
          "Oniru",
          "Ikate",
          "Osapa London",
          "Chevron",
          "Jakande",
          "Agungi",
          "VGC",
        ],
      },
      {
        name: "Ibeju-Lekki",
        popularAreas: [
          "Sangotedo",
          "Awoyaya",
          "Lakowe",
          "Bogije",
          "Eleko",
          "Free Trade Zone",
        ],
      },
      {
        name: "Lagos Mainland",
        popularAreas: ["Yaba", "Ebute Metta", "Akoka", "Alagomeji", "Adekunle", "Abule Oja"],
      },
      {
        name: "Surulere",
        popularAreas: [
          "Adeniran Ogunsanya",
          "Bode Thomas",
          "Masha",
          "Aguda",
          "Itire",
          "Ojuelegba",
          "Ijesha",
        ],
      },
      {
        name: "Kosofe",
        popularAreas: [
          "Magodo Phase 1 & 2",
          "Gbagada Phase 1 & 2",
          "Ogudu GRA",
          "Anthony Village",
          "Ketu",
          "Ojota",
          "Mile 12",
        ],
      },
      {
        name: "Lagos Island",
        popularAreas: ["Marina", "Broad Street", "Idumota", "TBS", "CMS", "Onikan"],
      },
      {
        name: "Alimosho",
        popularAreas: ["Egbeda", "Idimu", "Iyana Ipaja", "Igando", "Ikotun", "Gowon Estate"],
      },
      {
        name: "Oshodi-Isolo",
        popularAreas: ["Isolo", "Ajao Estate", "Mafoluku", "Oshodi", "Okota", "Ejigbo"],
      },
      {
        name: "Shomolu",
        popularAreas: ["Palmgrove", "Fadeyi", "Bariga", "Onipanu", "Bajulaiye"],
      },
      {
        name: "Mushin",
        popularAreas: ["Ilupeju", "Mushin Market", "Palm Avenue", "Olateju"],
      },
      {
        name: "Amuwo-Odofin",
        popularAreas: ["Festac Town", "Amuwo Odofin GRA", "Mile 2", "Satellite Town", "Kirikiri"],
      },
      {
        name: "Agege",
        popularAreas: ["Pen Cinema", "Orile Agege", "Dopemu", "Oko Oba"],
      },
      {
        name: "Ifako-Ijaiye",
        popularAreas: ["Ogba", "Iju Ishaga", "Fagba", "Ojokoro"],
      },
      {
        name: "Ikorodu",
        popularAreas: ["Ikorodu Garage", "Agbede", "Ebute", "Igbogbo", "Ogolonto"],
      },
      {
        name: "Ojo",
        popularAreas: ["Alaba International", "Trade Fair Complex", "Iba", "Okokomaiko"],
      },
      {
        name: "Apapa",
        popularAreas: ["Apapa Wharf", "Apapa GRA", "Liverpool", "Tincan"],
      },
      {
        name: "Badagry",
        popularAreas: ["Badagry Town", "Seme Border", "Ajara", "Aradagun"],
      },
      {
        name: "Epe",
        popularAreas: ["Epe Town", "Poka", "Mojoda", "Alaro City"],
      },
      {
        name: "Ajeromi-Ifelodun",
        popularAreas: ["Ajegunle", "Olodi Apapa", "Boundary", "Layeni"],
      },
    ],
  },
  {
    state: "FCT - Abuja",
    capital: "Abuja",
    lat: 9.0765,
    lng: 7.3986,
    lgas: [
      {
        name: "Abuja Municipal (AMAC)",
        popularAreas: [
          "Maitama",
          "Wuse 2",
          "Wuse Zone 1-7",
          "Garki 1 & 2",
          "Asokoro",
          "Guzape",
          "Jabi",
          "Utako",
          "Central Business District (CBD)",
          "Gwarinpa",
          "Mabushi",
          "Apo Resettlement",
          "Apo Legislative Quarters",
          "Lokogoma",
          "Lugbe",
          "Life Camp",
          "Kaura",
          "Kado",
          "Durumi",
          "Katampe & Katampe Extension",
        ],
      },
      {
        name: "Bwari",
        popularAreas: ["Kubwa", "Dutse", "Bwari Town", "Ushafa", "Mpape", "Dawaki", "Buma"],
      },
      {
        name: "Gwagwalada",
        popularAreas: ["Gwagwalada Central", "University Campus", "Zuba", "Dobi", "Paiko"],
      },
      {
        name: "Kuje",
        popularAreas: ["Kuje Town", "Chibiri", "Gaube", "Rubochi"],
      },
      {
        name: "Kwali",
        popularAreas: ["Kwali Town", "Yangoji", "Ashara", "Kilankwa"],
      },
      {
        name: "Abaji",
        popularAreas: ["Abaji Town", "Nuku", "Rimba", "Agyana"],
      },
    ],
  },
  {
    state: "Rivers",
    capital: "Port Harcourt",
    lat: 4.8156,
    lng: 7.0498,
    lgas: [
      {
        name: "Port Harcourt",
        popularAreas: [
          "Old GRA",
          "New GRA",
          "Peter Odili Road",
          "D-Line",
          "Trans Amadi Industrial Layout",
          "Rumuola",
          "Aba Road",
          "Borokiri",
          "Town",
          "Diobu",
          "Oroworukwo",
        ],
      },
      {
        name: "Obio-Akpor",
        popularAreas: [
          "Rumuokoro",
          "Rumuigbo",
          "Rumuodara",
          "Ada George",
          "Woji",
          "Choba",
          "Alakahia",
          "Rumuokparali",
          "Eliozu",
          "Eneka",
        ],
      },
      {
        name: "Eleme",
        popularAreas: ["Aleto", "Agbonchia", "Ogale", "Onne", "Eleme Petrochemicals"],
      },
      {
        name: "Ikwerre",
        popularAreas: ["Isiokpo", "Aluu", "Igwuruta", "Omagwa (Airport Area)"],
      },
      {
        name: "Oyigbo",
        popularAreas: ["Oyigbo Town", "Komkom", "Mirinwanyi", "Obeama"],
      },
      {
        name: "Degema",
        popularAreas: ["Degema Town", "Bakana", "Tombia", "Usokun"],
      },
      {
        name: "Bonny",
        popularAreas: ["Bonny Island", "Finima", "NLNG Camp"],
      },
      {
        name: "Okrika",
        popularAreas: ["Okrika Island", "Ogoloma", "Ibaka", "Ogan"],
      },
      {
        name: "Ahoada East",
        popularAreas: ["Ahoada Town", "Ula-Upata", "Odiabidi"],
      },
      {
        name: "Ogba/Egbema/Ndoni",
        popularAreas: ["Omoku", "Erema", "Obite", "Kreigani"],
      },
    ],
  },
  {
    state: "Oyo",
    capital: "Ibadan",
    lat: 7.3775,
    lng: 3.947,
    lgas: [
      {
        name: "Ibadan North",
        popularAreas: ["Bodija", "Agodi GRA", "Samonda", "Sango", "UI / Agbowo", "Mokola"],
      },
      {
        name: "Ibadan North-West",
        popularAreas: ["Dugbe", "Onireke", "Adamasingba", "Eleyele", "Jericho"],
      },
      {
        name: "Ibadan South-West",
        popularAreas: ["Ring Road", "Oluyole Estate", "Challenge", "Molete", "Liberty Road"],
      },
      {
        name: "Ibadan North-East",
        popularAreas: ["Iwo Road", "Agodi Gate", "Oje", "Idi-Ape"],
      },
      {
        name: "Ibadan South-East",
        popularAreas: ["Mapo", "Bode", "Orita Challenge", "Idi Arere"],
      },
      {
        name: "Oluyole",
        popularAreas: ["Idi Ayunre", "Omi Adio", "Toll Gate", "Sanyo"],
      },
      {
        name: "Egbeda",
        popularAreas: ["Alakia", "Egbeda Town", "Ibadan Airport Area", "Gbagi Market"],
      },
      {
        name: "Oyo East",
        popularAreas: ["Kosobo", "Oyo Town", "Jabata"],
      },
      {
        name: "Ogbomosho North",
        popularAreas: ["LAUTECH Campus", "Oja Igbo", "Takie", "Arowomole"],
      },
    ],
  },
  {
    state: "Ogun",
    capital: "Abeokuta",
    lat: 7.1475,
    lng: 3.3619,
    lgas: [
      {
        name: "Abeokuta South",
        popularAreas: ["Ibire", "Kuto", "Asero", "Itoku", "Sapon"],
      },
      {
        name: "Abeokuta North",
        popularAreas: ["Ijaiye", "Oke-Ilewo", "Ibikunle", "Lafenwa", "Ibara GRA"],
      },
      {
        name: "Obafemi Owode",
        popularAreas: ["Arepo", "Mowe", "Ibafo", "Magboro", "Ofada", "Redemption Camp"],
      },
      {
        name: "Ifo",
        popularAreas: ["Ojodu Berger Border", "Akute", "Alagbole", "Agbado", "Ifo Town"],
      },
      {
        name: "Ado-Odo/Ota",
        popularAreas: ["Ota Industrial Area", "Covenant University Area", "Sango Ota", "Itele"],
      },
      {
        name: "Sagamu",
        popularAreas: ["Sagamu Interchange", "GRA Sagamu", "Sabon Gari", "Makun"],
      },
      {
        name: "Ijebu Ode",
        popularAreas: ["Ijebu Ode GRA", "Folagbade", "Molipa", "Imowo"],
      },
    ],
  },
  {
    state: "Kano",
    capital: "Kano",
    lat: 12.0022,
    lng: 8.592,
    lgas: [
      {
        name: "Nassarawa",
        popularAreas: ["Bompai Industrial Area", "Nassarawa GRA", "Badawa", "Giginyu"],
      },
      {
        name: "Fagge",
        popularAreas: ["Fagge Central", "Kwanar Singer", "Sabon Gari Market", "Kwairanga"],
      },
      {
        name: "Dala",
        popularAreas: ["Dala Hill", "Gwammaja", "Yalwa", "Bakinkasuwa"],
      },
      {
        name: "Kano Municipal",
        popularAreas: ["Kano City Central", "Emir's Palace Area", "Kano State Secretariat", "Kurmi Market"],
      },
      {
        name: "Tarauni",
        popularAreas: ["Gyadi-Gyadi", "Hotoro", "Unguwa Uku", "Farm Centre"],
      },
      {
        name: "Gwale",
        popularAreas: ["Dorayi", "Kabuga", "Goron Dutse", "Gwale Town"],
      },
    ],
  },
  {
    state: "Kaduna",
    capital: "Kaduna",
    lat: 10.5105,
    lng: 7.4165,
    lgas: [
      {
        name: "Kaduna North",
        popularAreas: ["Ungwan Rimi", "Malali GRA", "Badarawa", "Kawo", "Doka", "City Centre"],
      },
      {
        name: "Kaduna South",
        popularAreas: ["Barnawa GRA", "Kakuri Industrial Area", "Makera", "Television", "Tudun Wada"],
      },
      {
        name: "Chikun",
        popularAreas: ["Narayi High Cost", "Sabon Tasha", "Kamazo", "Romie", "Gbagyi Villa"],
      },
      {
        name: "Zaria",
        popularAreas: ["ABU Samaru Campus", "Kongo Campus", "Sabon Gari Zaria", "Zaria City", "PZ"],
      },
    ],
  },
  {
    state: "Anambra",
    capital: "Awka",
    lat: 6.2209,
    lng: 7.0722,
    lgas: [
      {
        name: "Awka South",
        popularAreas: ["Ifite Awka", "UNIZIK Junction", "Aroma", "Agu Awka GRA", "Amawbia"],
      },
      {
        name: "Onitsha North",
        popularAreas: ["Onitsha Main Market", "GRA Onitsha", "New Market Road", "Marine"],
      },
      {
        name: "Onitsha South",
        popularAreas: ["Fegge", "Ochanja Market", "Bridgehead", "Woliwo"],
      },
      {
        name: "Idemili North",
        popularAreas: ["Ogidi", "Nkpor", "Obosi", "Umoji"],
      },
      {
        name: "Nnewi North",
        popularAreas: ["Otolo", "Umudim", "Uruagu", "Nnewichi", "Bank Road Nnewi"],
      },
    ],
  },
  {
    state: "Enugu",
    capital: "Enugu",
    lat: 6.4584,
    lng: 7.5464,
    lgas: [
      {
        name: "Enugu North",
        popularAreas: ["New Haven", "GRA Enugu", "Ogui New Layout", "Asata", "Coal Camp"],
      },
      {
        name: "Enugu South",
        popularAreas: ["Achara Layout", "Uwani", "Gariki Awkunanaw", "Amechi", "Topland"],
      },
      {
        name: "Enugu East",
        popularAreas: ["Trans-Ekulu", "Abakpa Nike", "Emene Industrial Area", "Thinkers Corner"],
      },
      {
        name: "Nsukka",
        popularAreas: ["UNN Campus Area", "Odenigbo", "Total Roundabout", "Onuiyi"],
      },
    ],
  },
  {
    state: "Delta",
    capital: "Asaba",
    lat: 6.1989,
    lng: 6.7335,
    lgas: [
      {
        name: "Oshimili South",
        popularAreas: ["Asaba GRA", "Nnebisi Road", "Okpanam Road", "Cable Point", "Anwai"],
      },
      {
        name: "Warri South",
        popularAreas: ["Warri GRA", "Enerhen Road", "Airport Road Warri", "Okumagba Layout", "Main Market"],
      },
      {
        name: "Uvwie",
        popularAreas: ["Effurun Roundabout", "PTI Road", "Jakpa Road", "Refinery Area"],
      },
      {
        name: "Sapele",
        popularAreas: ["Sapele Town", "Amukpe", "Olympia", "Ajogodo"],
      },
      {
        name: "Ughelli North",
        popularAreas: ["Ughelli Town", "Otovwodo", "Ekiugbo", "Agbarho"],
      },
    ],
  },
  {
    state: "Edo",
    capital: "Benin City",
    lat: 6.335,
    lng: 5.6037,
    lgas: [
      {
        name: "Oredo",
        popularAreas: ["Benin GRA", "Ring Road (Kings Square)", "Airport Road", "Sapele Road", "Sakponba"],
      },
      {
        name: "Ikpoba-Okha",
        popularAreas: ["Aduwawa", "Upper Mission", "Ikpoba Hill", "Ramat Park", "Eyean"],
      },
      {
        name: "Egor",
        popularAreas: ["Uselu", "Ugbowo (UNIBEN Area)", "Siluko Road", "Medical Stores"],
      },
    ],
  },
  {
    state: "Kwara",
    capital: "Ilorin",
    lat: 8.4799,
    lng: 4.5418,
    lgas: [
      {
        name: "Ilorin South",
        popularAreas: ["Fate Road", "Tanke (UNILORIN Road)", "GRA Ilorin", "Gaa Akanbi"],
      },
      {
        name: "Ilorin West",
        popularAreas: ["Taiwo Road", "Oja Oba", "Adewole Estate", "Mandate Market", "Pakata"],
      },
      {
        name: "Ilorin East",
        popularAreas: ["Maraba", "Gambari", "Ipata Market", "Sobi Area"],
      },
    ],
  },
  {
    state: "Akwa Ibom",
    capital: "Uyo",
    lat: 5.0377,
    lng: 7.9128,
    lgas: [
      {
        name: "Uyo",
        popularAreas: ["Ewet Housing Estate", "Shelter Afrique", "Osong Ama Estate", "Ikot Ekpene Road", "Oron Road", "Plaza"],
      },
      {
        name: "Ikot Ekpene",
        popularAreas: ["Ikot Ekpene Town", "Raffia City Central"],
      },
      {
        name: "Eket",
        popularAreas: ["Eket Town", "Mobil Housing Estate", "Idua"],
      },
    ],
  },
  {
    state: "Imo",
    capital: "Owerri",
    lat: 5.4891,
    lng: 7.0176,
    lgas: [
      {
        name: "Owerri Municipal",
        popularAreas: ["Ikenegbu Layout", "Aladinma", "Wetheral Road", "Douglas Road", "Tetlow"],
      },
      {
        name: "Owerri North",
        popularAreas: ["Uratta", "Orji", "Toronto Junction", "Emekuku"],
      },
      {
        name: "Owerri West",
        popularAreas: ["World Bank Housing Estate", "Umuguma", "Nekede (FUTO Area)", "Irette"],
      },
    ],
  },
  {
    state: "Abia",
    capital: "Umuahia",
    lat: 5.5249,
    lng: 7.4943,
    lgas: [
      {
        name: "Aba South",
        popularAreas: ["Ariaria Market Area", "Asa Road", "Faulks Road", "Main Market Aba"],
      },
      {
        name: "Aba North",
        popularAreas: ["Eziama", "Umungasi", "Ogbor Hill", "Brass Junction"],
      },
      {
        name: "Umuahia North",
        popularAreas: ["Umuahia GRA", "Bende Road", "Isigate", "Bank Road Umuahia"],
      },
    ],
  },
  {
    state: "Plateau",
    capital: "Jos",
    lat: 9.8965,
    lng: 8.8583,
    lgas: [
      {
        name: "Jos North",
        popularAreas: ["Rayfield", "Terminus", "Tafawa Balewa", "Bauchi Road", "Rundown"],
      },
      {
        name: "Jos South",
        popularAreas: ["Bukuru", "Lamingo", "Zawan", "Kufang"],
      },
    ],
  },
  {
    state: "Ondo",
    capital: "Akure",
    lat: 7.2571,
    lng: 5.2058,
    lgas: [
      {
        name: "Akure South",
        popularAreas: ["Alagbaka GRA", "Oba Adesida Road", "FUTA South Gate", "Ijapo Estate"],
      },
      {
        name: "Ondo West",
        popularAreas: ["Yaba Ondo", "Enuowa", "Laje"],
      },
    ],
  },
  {
    state: "Osun",
    capital: "Osogbo",
    lat: 7.7827,
    lng: 4.5418,
    lgas: [
      {
        name: "Osogbo",
        popularAreas: ["Alekuwodo", "Ogo Oluwa", "Station Road", "Oke Fia", "Osogbo GRA"],
      },
      {
        name: "Ife Central",
        popularAreas: ["OAU Campus Area", "Mayfair", "Lagere", "Enuwa"],
      },
    ],
  },
  {
    state: "Benue",
    capital: "Makurdi",
    lat: 7.7322,
    lng: 8.5214,
    lgas: [
      {
        name: "Makurdi",
        popularAreas: ["High Level", "Wurukum", "Modern Market Area", "North Bank", "Makurdi GRA"],
      },
    ],
  },
  {
    state: "Cross River",
    capital: "Calabar",
    lat: 4.9757,
    lng: 8.3417,
    lgas: [
      {
        name: "Calabar Municipal",
        popularAreas: ["State Housing Estate", "Marian Road", "UNICAL Area", "Murtala Mohammed Highway"],
      },
      {
        name: "Calabar South",
        popularAreas: ["Watt Market Area", "Anantigha", "Cobham Town"],
      },
    ],
  },
  {
    state: "Bayelsa",
    capital: "Yenagoa",
    lat: 4.9267,
    lng: 6.2676,
    lgas: [
      {
        name: "Yenagoa",
        popularAreas: ["Amarata", "Kpansia", "Etegwe (Tombia Roundabout)", "Yenizue-Gene", "Opolo"],
      },
    ],
  },
  {
    state: "Borno",
    capital: "Maiduguri",
    lat: 11.8311,
    lng: 13.151,
    lgas: [
      {
        name: "Maiduguri",
        popularAreas: ["Monday Market", "Custom Area", "Bama Road", "UNIMAID Campus Area", "GRA Maiduguri"],
      },
    ],
  },
  {
    state: "Adamawa",
    capital: "Yola",
    lat: 9.2035,
    lng: 12.4954,
    lgas: [
      {
        name: "Yola North",
        popularAreas: ["Jimeta", "Dougirei GRA", "Karewa", "Bekaji"],
      },
      {
        name: "Yola South",
        popularAreas: ["Yola Town", "AUN Area", "Namtari"],
      },
    ],
  },
  {
    state: "Bauchi",
    capital: "Bauchi",
    lat: 10.3158,
    lng: 9.8442,
    lgas: [
      {
        name: "Bauchi",
        popularAreas: ["Bauchi GRA", "Wunti Market", "Yelwa", "Fadaman Mada"],
      },
    ],
  },
  {
    state: "Ebonyi",
    capital: "Abakaliki",
    lat: 6.3249,
    lng: 8.1137,
    lgas: [
      {
        name: "Abakaliki",
        popularAreas: ["Kpirikpiri", "Water Works Road", "Ogoja Road", "Abakaliki GRA"],
      },
    ],
  },
  {
    state: "Ekiti",
    capital: "Ado-Ekiti",
    lat: 7.621,
    lng: 5.2215,
    lgas: [
      {
        name: "Ado-Ekiti",
        popularAreas: ["Ado GRA", "Okesa", "Fajuyi", "Ajilosun", "Basiri"],
      },
    ],
  },
  {
    state: "Gombe",
    capital: "Gombe",
    lat: 10.2897,
    lng: 11.1673,
    lgas: [
      {
        name: "Gombe",
        popularAreas: ["Gombe GRA", "Main Market", "Tudun Wada", "Pantami"],
      },
    ],
  },
  {
    state: "Jigawa",
    capital: "Dutse",
    lat: 11.7562,
    lng: 9.339,
    lgas: [
      {
        name: "Dutse",
        popularAreas: ["Dutse GRA", "Takur Commercial", "Kudai", "Fatara"],
      },
    ],
  },
  {
    state: "Katsina",
    capital: "Katsina",
    lat: 12.9908,
    lng: 7.6018,
    lgas: [
      {
        name: "Katsina",
        popularAreas: ["Katsina GRA", "Central Market", "Kofar Kaura", "Kofar Marusa"],
      },
    ],
  },
  {
    state: "Kebbi",
    capital: "Birnin Kebbi",
    lat: 12.4539,
    lng: 4.1975,
    lgas: [
      {
        name: "Birnin Kebbi",
        popularAreas: ["Birnin Kebbi GRA", "Haliru Abdu Secretariat", "Nassarawa"],
      },
    ],
  },
  {
    state: "Kogi",
    capital: "Lokoja",
    lat: 7.7969,
    lng: 6.7405,
    lgas: [
      {
        name: "Lokoja",
        popularAreas: ["Ganaja Village", "Lokoja GRA", "Adankolo", "Felele"],
      },
    ],
  },
  {
    state: "Nasarawa",
    capital: "Lafia",
    lat: 8.4937,
    lng: 8.5153,
    lgas: [
      {
        name: "Lafia",
        popularAreas: ["Lafia GRA", "Bukan Sidi", "Shabu", "Kwandere"],
      },
      {
        name: "Karu",
        popularAreas: ["Mararaba", "Nyanya Border", "Masaka", "New Karu", "Ado"],
      },
    ],
  },
  {
    state: "Niger",
    capital: "Minna",
    lat: 9.6139,
    lng: 6.5569,
    lgas: [
      {
        name: "Chanchaga",
        popularAreas: ["Minna GRA", "Tunga", "Bosso", "Maitumbi", "Kpakungu"],
      },
      {
        name: "Suleja",
        popularAreas: ["Suleja Town", "Madalla", "Field Area"],
      },
    ],
  },
  {
    state: "Sokoto",
    capital: "Sokoto",
    lat: 13.0059,
    lng: 5.2476,
    lgas: [
      {
        name: "Sokoto North",
        popularAreas: ["Sultan's Palace Area", "Central Market", "Sokoto GRA", "Runjin Sambo"],
      },
      {
        name: "Sokoto South",
        popularAreas: ["Gidan Dare", "Mabera", "Mana"],
      },
    ],
  },
  {
    state: "Taraba",
    capital: "Jalingo",
    lat: 8.8937,
    lng: 11.3596,
    lgas: [
      {
        name: "Jalingo",
        popularAreas: ["Jalingo GRA", "Mile Six", "Nyamusala", "Road Block"],
      },
    ],
  },
  {
    state: "Yobe",
    capital: "Damaturu",
    lat: 11.747,
    lng: 11.9608,
    lgas: [
      {
        name: "Damaturu",
        popularAreas: ["Damaturu GRA", "Maisandari", "Nayi Nawa", "Waziri Ibrahim Estate"],
      },
    ],
  },
  {
    state: "Zamfara",
    capital: "Gusau",
    lat: 12.1628,
    lng: 6.6614,
    lgas: [
      {
        name: "Gusau",
        popularAreas: ["Gusau GRA", "Tudun Wada Gusau", "Samaru Gusau", "Kantin Sani"],
      },
    ],
  },
];

/**
 * Fast Lookup Helpers
 */

export function getAllStateNames(): string[] {
  return NIGERIA_STATES.map((s) => s.state);
}

export function getStateData(stateName: string): NigerianStateData | undefined {
  return NIGERIA_STATES.find(
    (s) => s.state.toLowerCase() === stateName.trim().toLowerCase()
  );
}

export function getLgasForState(stateName: string): string[] {
  const data = getStateData(stateName);
  return data ? data.lgas.map((l) => l.name) : [];
}

export function getPopularAreasForState(stateName: string): string[] {
  const data = getStateData(stateName);
  if (!data) return [];
  const areas: string[] = [];
  data.lgas.forEach((l) => {
    if (l.popularAreas) {
      areas.push(...l.popularAreas);
    } else {
      areas.push(l.name);
    }
  });
  return Array.from(new Set(areas));
}

export interface LocationSearchResult {
  state: string;
  lga: string;
  area: string;
  fullLabel: string;
}

/**
 * Search across all 36 states, LGAs, and neighborhood areas
 */
export function searchNigerianLocations(query: string, limit = 10): LocationSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: LocationSearchResult[] = [];

  for (const s of NIGERIA_STATES) {
    for (const l of s.lgas) {
      // Check LGA name
      if (l.name.toLowerCase().includes(q)) {
        results.push({
          state: s.state,
          lga: l.name,
          area: l.name,
          fullLabel: `${l.name}, ${s.state}`,
        });
      }

      // Check specific popular areas
      if (l.popularAreas) {
        for (const pa of l.popularAreas) {
          if (pa.toLowerCase().includes(q) && !results.some((r) => r.area === pa && r.state === s.state)) {
            results.push({
              state: s.state,
              lga: l.name,
              area: pa,
              fullLabel: `${pa}, ${l.name}, ${s.state}`,
            });
          }
        }
      }

      if (results.length >= limit) return results;
    }
  }

  return results;
}
