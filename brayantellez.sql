CREATE DATABASE IF NOT EXISTS brayantellez;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS brayantellez.project (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(140) NOT NULL,
    repository VARCHAR(140) NOT NULL,
    preview TEXT UNIQUE NOT NULL,
    description TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_update_at
BEFORE UPDATE ON brayantellez.project
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
