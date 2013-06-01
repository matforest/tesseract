
-- Master table
/*create table if not exists master (
the_geom geometry,
id 
);*/

-- Adult Community Education Providers table
create table if not exists gis_schema.ace (
  provider_name varchar,
  region varchar,
  phone varchar,
  email varchar,
  contact varchar,
  address varchar,
  latitude double precision,
  longitude double precision
);

--COPY gis_schema.ace(provider_name, region, phone, email, contact, address, latitude, longitude) FROM '/path/to/csv/dfeest-listed-adult-community-education-providers-2012-13.csv' DELIMITER ',' CSV;
--\copy gis_schema.ace(provider_name, region, phone, email, contact, address, latitude, longitude) FROM '/home/ubuntu/tesseract/data/dfeest-listed-adult-community-education-providers-2012-13.csv' WITH DELIMITER ',';

/*alter table gis_schema.ace
  add column geom geometry;

UPDATE gis_schema.ace 
  SET geom = ST_SetSRID(ST_MakePoint(longitude,latitude),4326);

CREATE INDEX idx_ace_geom ON gis_schema.ace USING GIST(geom);*/

-- Schools Sites and Services
create table if not exists gis_schema.schools (
  name varchar,
  latitude double precision,
  longitude double precision,
  geom geometry
);

/*COPY gis_schema.schools(name, latitude, longitude) FROM '/home/ubuntu/tesseract/data/sites-and-services.csv' DELIMITER ',' CSV;

UPDATE gis_schema.schools
  SET geom = ST_SetSRID(ST_MakePoint(longitude,latitude),4326);

CREATE INDEX idx_schools_geom ON gis_schema.schools USING GIST(geom);*/

-- libraries of SA excluding the state library
create table if not exists gis_schema.libraries (
  id serial PRIMARY KEY,
  name varchar, 
  address varchar,
  phone varchar,
  email varchar,
  website varchar,
  comment varchar,
  hours varchar,
  council varchar,
  latitude double precision,
  longitude double precision,
  geom geometry
);

COPY gis_schema.libraries(name, address, phone, email, website, comment, hours, council, latitude, longitude) FROM '/home/ubuntu/tesseract/data/sa-libraries.csv' DELIMITER ',' CSV;

/*UPDATE gis_schema.libraries
  SET geom = ST_SetSRID(ST_MakePoint(longitude,latitude),4326);

CREATE INDEX idx_libraries_geom ON gis_schema.libraries USING GIST(geom);*/