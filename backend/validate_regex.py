import re

pattern = r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://[\w-]+\.lovableproject\.com|https://[\w-]+\.lovable\.app"
re.compile(pattern)
print('CORS regex OK')
