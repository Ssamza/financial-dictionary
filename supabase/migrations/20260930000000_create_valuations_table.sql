CREATE TABLE IF NOT EXISTS valuations (
  id         text PRIMARY KEY,
  ticker     text NOT NULL,
  price      numeric NOT NULL,
  scenarios  jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON valuations FOR ALL TO anon USING (true) WITH CHECK (true);
