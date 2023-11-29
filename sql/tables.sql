CREATE TABLE expense (
   id serial primary key,
   expense text not null,
   amount numeric not null, 
    total numeric not null default 0,
   category_id int not null,
   foreign key (category_id) references category(id)
);

-- CREATE TABLE category (
--    id serial primary key,
--    category_type text NOT NULL
-- );