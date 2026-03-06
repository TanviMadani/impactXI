from cachetools import TTLCache

player_search_cache = TTLCache(maxsize=100, ttl=60)
leaderboard_cache = TTLCache(maxsize=50, ttl=120)