import math
from typing import List, Tuple

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees).
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0  # Radius of Earth in kilometers
    return round(c * r, 2)

def filter_and_sort_by_distance(
    user_lat: float,
    user_lon: float,
    locations: List[dict],
    max_radius_km: float = 10.0
) -> List[dict]:
    """
    Given a list of location dicts with 'latitude' and 'longitude',
    calculates distance, filters within max_radius_km, and returns sorted by distance.
    """
    results = []
    for loc in locations:
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        if lat is not None and lon is not None:
            dist = haversine_distance(user_lat, user_lon, lat, lon)
            if dist <= max_radius_km:
                loc_copy = dict(loc)
                loc_copy["distance_km"] = dist
                results.append(loc_copy)
    
    # Sort nearest first
    results.sort(key=lambda x: x["distance_km"])
    return results
