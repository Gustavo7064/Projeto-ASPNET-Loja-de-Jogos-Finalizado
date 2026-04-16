-- ================================================================
-- ROCKETGAMES — Script de banco de dados
-- Execute este script no MySQL Workbench ou HeidiSQL
-- ================================================================

-- 1) CRIAR O BANCO
CREATE DATABASE IF NOT EXISTS bdloja2dsa;
USE bdloja2dsa;

-- 2) TABELA USUARIO
CREATE TABLE IF NOT EXISTS Usuario (
    id    INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(40) NOT NULL,
    senha VARCHAR(40) NOT NULL,
    nome  VARCHAR(40) NOT NULL,
    role  VARCHAR(20) NOT NULL DEFAULT 'user'
);

-- Se a tabela já existia SEM a coluna role, execute:
-- ALTER TABLE Usuario ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
-- UPDATE Usuario SET role = 'Funcionario' WHERE email = 'func@email.com';

-- 3) TABELA CLIENTE
CREATE TABLE IF NOT EXISTS Cliente (
    codCli  INT PRIMARY KEY AUTO_INCREMENT,
    nomeCli VARCHAR(40) NOT NULL,
    telCli  VARCHAR(40) NOT NULL,
    emailCli VARCHAR(40) NOT NULL
);

drop table Produto;

-- 4) TABELA PRODUTO (com imagemurl)
CREATE TABLE IF NOT EXISTS Produto (
    Id        INT PRIMARY KEY AUTO_INCREMENT,
    Nome      VARCHAR(40)  NOT NULL,
    Descricao VARCHAR(200) NOT NULL,
    Preco     DECIMAL(10,2) NOT NULL,
    Categoria VARCHAR(100) NOT NULL,
    imagemurl VARCHAR(300) NOT NULL DEFAULT ''
);

-- Se a tabela Produto já existia SEM imagemurl, execute:
-- ALTER TABLE Produto ADD COLUMN imagemurl VARCHAR(300) NOT NULL DEFAULT '';

-- 5) USUÁRIO FUNCIONÁRIO PADRÃO
-- Login: func@email.com | Senha: 123456
INSERT INTO Usuario (nome, email, senha, role)
VALUES ('Funcionario Loja', 'func@email.com', '123456', 'Funcionario');

-- ================================================================
-- CONSULTAS DE VERIFICAÇÃO
-- ================================================================
SELECT * FROM Usuario;
SELECT * FROM Produto;
