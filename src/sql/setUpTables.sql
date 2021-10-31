use simpleshopdb;

create table if not exists users (username varchar(255) NOT NULL PRIMARY KEY, password varchar(255) NOT NULL, token varchar(255));

create table if not exists inventory ( productId int not null auto_increment primary key, productName varchar(255) not null, price decimal(10,2), quantity int not null);

create table if not exists orders ( orderId int not null auto_increment primary key, productId int not null, quantity int not null, price decimal(10,2), username varchar(255) not null, foreign key (username) references users(username), foreign key (productId) references inventory(productId));