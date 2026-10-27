UPDATE users
SET email = 'harunekici@gmail.com',
    updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE email = 'harunekiici@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'harunekici@gmail.com'
  );
