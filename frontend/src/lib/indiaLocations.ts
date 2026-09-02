export interface CityLocation {
  city: string;
  areas: string[];
}

export interface StateLocation {
  state: string;
  cities: CityLocation[];
}

export const INDIA_STATES_CITIES: StateLocation[] = [
  {
    state: "Andhra Pradesh",
    cities: [
      {
        city: "Vijayawada",
        areas: ["MG Road", "Benz Circle", "Governorpet", "Tarapet (Railway Station)", "Auto Nagar", "Patamata", "Suryaraopet", "Kanchuru", "Bhavanipuram"]
      },
      {
        city: "Visakhapatnam",
        areas: ["RK Beach Promenade", "Siripuram", "Dwaraka Nagar", "Gajuwaka", "Rushikonda IT Park", "Jagadamba Junction", "Madhurawada", "Maddilapalem"]
      },
      {
        city: "Guntur",
        areas: ["Lakshmipuram", "Brodipet", "Pattabhipuram", "Arundelpet", "Vidya Nagar", "Kothapet"]
      },
      {
        city: "Tirupati",
        areas: ["Alipiri Foothills", "KT Road", "Tata Nagar", "Kapila Theertham", "Bypass Road", "Korlagunta"]
      },
      {
        city: "Nellore",
        areas: ["Pogathota", "Magunta Layout", "Trunk Road", "VRC Centre"]
      },
      {
        city: "Kakinada",
        areas: ["Main Road", "Subhash Nagar", "Bhanugudi Junction", "Sarpavaram"]
      },
      {
        city: "Rajahmundry",
        areas: ["Danavaipeta", "Kotipalli Bus Stand", "AV Apparao Road", "Morampudi"]
      },
      {
        city: "Kurnool",
        areas: ["Nandyal Check Post", "Park Road", "Collectorate Area", "Fort Giri"]
      }
    ]
  },
  {
    state: "Telangana",
    cities: [
      {
        city: "Hyderabad",
        areas: ["HITEC City", "Madhapur", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Secunderabad", "Ameerpet", "Kukatpally", "Kondapur", "Begumpet", "Somajiguda", "Financial District"]
      },
      {
        city: "Warangal",
        areas: ["Station Road", "Kazipet", "Hanamkonda", "Subedari", "Naimnagar"]
      },
      {
        city: "Nizamabad",
        areas: ["Khaleelwadi", "Subhash Nagar", "Phulong", "Armoor Road"]
      },
      {
        city: "Karimnagar",
        areas: ["Collectorate Complex", "Bus Stand Road", "Mankammathota"]
      },
      {
        city: "Khammam",
        areas: ["Wyra Road", "Mayuri Centre", "Naya Bazar"]
      }
    ]
  },
  {
    state: "Karnataka",
    cities: [
      {
        city: "Bengaluru",
        areas: ["MG Road", "Koramangala", "Whitefield", "Indiranagar", "Electronic City", "HSR Layout", "Jayanagar", "JP Nagar", "Marathahalli", "Hebbal", "Yelahanka"]
      },
      {
        city: "Mysore",
        areas: ["Sayyaji Rao Road", "Gokulam", "Jayalakshmipuram", "KRS Road", "Devaraja Market"]
      },
      {
        city: "Hubli-Dharwad",
        areas: ["Vidya Nagar", "Gokul Road", "CBT Area", "Court Circle"]
      },
      {
        city: "Mangalore",
        areas: ["MG Road", "Hampankatta", "Kodialbail", "Kadri", "Panambur"]
      }
    ]
  },
  {
    state: "Tamil Nadu",
    cities: [
      {
        city: "Chennai",
        areas: ["T. Nagar", "OMR Perungudi", "Anna Nagar", "Adyar", "Velachery", "Nungambakkam", "Mylapore", "Guindy", "Egmore"]
      },
      {
        city: "Coimbatore",
        areas: ["Gandhipuram", "RS Puram", "Peelamedu", "Race Course", "TIDEL Park"]
      },
      {
        city: "Madurai",
        areas: ["Town Hall Road", "Anna Nagar", "KK Nagar", "Goripalayam"]
      },
      {
        city: "Tiruchirappalli",
        areas: ["Thillai Nagar", "Cantonment", "Chatram Bus Stand", "Srirangam"]
      }
    ]
  },
  {
    state: "Maharashtra",
    cities: [
      {
        city: "Mumbai",
        areas: ["Bandra Kurla Complex (BKC)", "Lower Parel", "Andheri West", "Nariman Point", "Powai", "Juhu", "Colaba", "Dadar", "Thane West", "Navi Mumbai Vashi"]
      },
      {
        city: "Pune",
        areas: ["Koregaon Park", "Viman Nagar", "Hinjewadi IT Park", "Baner", "Shivaji Nagar", "Kothrud", "Aundh", "FC Road"]
      },
      {
        city: "Nagpur",
        areas: ["Dharampeth", "Sitabuldi", "Civil Lines", "Wardha Road"]
      },
      {
        city: "Nashik",
        areas: ["College Road", "Gangapur Road", "Indira Nagar", "Mumbai Naka"]
      }
    ]
  },
  {
    state: "Delhi NCR",
    cities: [
      {
        city: "New Delhi",
        areas: ["Connaught Place", "South Extension", "Saket", "Karol Bagh", "Chanakyapuri", "Lajpat Nagar", "Nehru Place", "Dwarka"]
      },
      {
        city: "Gurgaon",
        areas: ["DLF Cyber City", "Sector 29", "Golf Course Road", "Sohna Road", "Udyog Vihar", "Sector 56"]
      },
      {
        city: "Noida",
        areas: ["Sector 18 Atta Market", "Sector 62 IT Hub", "Greater Noida West", "Sector 137", "Botanical Garden"]
      },
      {
        city: "Faridabad",
        areas: ["Sector 15", "Mathura Road", "NIT Faridabad"]
      },
      {
        city: "Ghaziabad",
        areas: ["Indirapuram", "Vaishali", "Raj Nagar Extension"]
      }
    ]
  },
  {
    state: "Gujarat",
    cities: [
      {
        city: "Ahmedabad",
        areas: ["CG Road", "SG Highway", "Prahlad Nagar", "Navrangpura", "Bodakdev", "Satellite", "Maninagar"]
      },
      {
        city: "Surat",
        areas: ["Ring Road", "Vesu", "Ghoddod Road", "Varachha", "Adajan"]
      },
      {
        city: "Vadodara",
        areas: ["Alkapuri", "Old Padra Road", "RC Dutt Road", "Fatehgunj"]
      },
      {
        city: "Rajkot",
        areas: ["Yagnik Road", "Kalawad Road", "Race Course Road"]
      }
    ]
  },
  {
    state: "West Bengal",
    cities: [
      {
        city: "Kolkata",
        areas: ["Park Street", "Salt Lake Sector V", "New Town", "Camac Street", "Ballygunge", "Alipore", "Esplanade", "Howrah Station"]
      },
      {
        city: "Durgapur",
        areas: ["City Centre", "Benachity", "Bidhannagar"]
      },
      {
        city: "Siliguri",
        areas: ["Hill Cart Road", "Sevoke Road", "Matigara"]
      }
    ]
  },
  {
    state: "Kerala",
    cities: [
      {
        city: "Kochi",
        areas: ["Marine Drive", "MG Road", "Kakkanad InfoPark", "Edappally", "Fort Kochi", "Palarivattom"]
      },
      {
        city: "Thiruvananthapuram",
        areas: ["Technopark", "MG Road", "Palayam", "Kowdiar", "Kazhakkoottam"]
      },
      {
        city: "Kozhikode",
        areas: ["Mavoor Road", "Beach Road", "Thondayad Junction"]
      }
    ]
  },
  {
    state: "Rajasthan",
    cities: [
      {
        city: "Jaipur",
        areas: ["MI Road", "C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Raja Park", "Mansarovar"]
      },
      {
        city: "Jodhpur",
        areas: ["Ratanada", "Sardarpura", "Shastri Nagar"]
      },
      {
        city: "Udaipur",
        areas: ["Fatehsagar Lake Road", "Panchwati", "Hiran Magri"]
      }
    ]
  },
  {
    state: "Uttar Pradesh",
    cities: [
      {
        city: "Lucknow",
        areas: ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Charbagh"]
      },
      {
        city: "Kanpur",
        areas: ["Civil Lines", "Swaroop Nagar", "Mall Road", "Kalyanpur"]
      },
      {
        city: "Varanasi",
        areas: ["Godowlia", "Cantonment", "Lanka BHU", "Sigra"]
      },
      {
        city: "Agra",
        areas: ["Fatehabad Road", "Sanjay Place", "Taj Ganj"]
      }
    ]
  },
  {
    state: "Punjab",
    cities: [
      {
        city: "Ludhiana",
        areas: ["Ferozepur Road", "Mall Road", "Model Town", "Sarabha Nagar"]
      },
      {
        city: "Amritsar",
        areas: ["Mall Road", "Golden Temple Zone", "Ranjit Avenue"]
      },
      {
        city: "Mohali",
        areas: ["Phase 7", "Phase 3B2", "Sector 70"]
      }
    ]
  },
  {
    state: "Chandigarh",
    cities: [
      {
        city: "Chandigarh",
        areas: ["Sector 17 Plaza", "Sector 35", "Sector 8", "Elante Mall Zone Sector 82"]
      }
    ]
  },
  {
    state: "Goa",
    cities: [
      {
        city: "Panaji",
        areas: ["MG Road", "Campal", "Miramar Beach Promenade"]
      },
      {
        city: "Margao",
        areas: ["Abade Faria Road", "Pajifond"]
      }
    ]
  }
];

export const ALL_INDIAN_STATES = INDIA_STATES_CITIES.map(s => s.state);

export const getCitiesForState = (stateName: string): string[] => {
  if (!stateName || stateName === "ALL") {
    return Array.from(new Set(INDIA_STATES_CITIES.flatMap(s => s.cities.map(c => c.city)))).sort();
  }
  const found = INDIA_STATES_CITIES.find(s => s.state.toLowerCase() === stateName.toLowerCase());
  return found ? found.cities.map(c => c.city) : [];
};

export const getAreasForCity = (stateName: string, cityName: string): string[] => {
  if (!cityName || cityName === "ALL") {
    // Return all areas across the selected state (or all states if ALL)
    if (!stateName || stateName === "ALL") {
      return Array.from(new Set(INDIA_STATES_CITIES.flatMap(s => s.cities.flatMap(c => c.areas)))).sort();
    }
    const foundState = INDIA_STATES_CITIES.find(s => s.state.toLowerCase() === stateName.toLowerCase());
    return foundState ? Array.from(new Set(foundState.cities.flatMap(c => c.areas))).sort() : [];
  }

  // Find specific city
  for (const st of INDIA_STATES_CITIES) {
    if (stateName && stateName !== "ALL" && st.state.toLowerCase() !== stateName.toLowerCase()) {
      continue;
    }
    const foundCity = st.cities.find(c => c.city.toLowerCase() === cityName.toLowerCase());
    if (foundCity) {
      return foundCity.areas;
    }
  }
  return [];
};
