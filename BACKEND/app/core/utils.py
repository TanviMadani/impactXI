def normalize_name(name: str):
    return name.lower().strip()


def safe_int(v):
    try:
        return int(v)
    except:
        return None