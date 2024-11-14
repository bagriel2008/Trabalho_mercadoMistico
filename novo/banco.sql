drop database senacmais;

create database senacmais;

use senacmais;

create table usuarios (
    id int not null auto_increment primary key,
    nome varchar(255) not null,
    email varchar(255) not null,
    senha varchar(255) not null,
    status enum ('Ativo', 'Inativo') default ('Ativo'),
    created_at timestamp default current_timestamp 
);

create table publicacoes (
    id int not null auto_increment primary key,
    titulo varchar(255) not null,
    descricao varchar(255) not null,
    created_at timestamp default current_timestamp 
);