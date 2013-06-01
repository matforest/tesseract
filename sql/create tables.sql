
-- Master table
create table if not exists master (
the_geom geometry,
id 
);

-- Adult Community Education Providers table
create table if not exists ace (
  provider_name varchar,
  region varchar,
  phone varchar,
  email varchar,
  contact varchar,
  address varchar,
  latitude double precision,
  longitude double precision
);