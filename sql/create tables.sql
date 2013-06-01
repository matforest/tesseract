
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

--COPY gis_schema.ace FROM '/path/to/csv/dfeest-listed-adult-community-education-providers-2012-13.csv' DELIMITER ',' CSV;

/*alter table gis_schema.ace
  add column geometry geometry(POINT, 4326);

UPDATE gis_schema.ace 
  SET geometry = ST_SetSRID(ST_MakePoint(longitude,latitude),4326);*/