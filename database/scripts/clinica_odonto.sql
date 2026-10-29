create database clinica_odonto;

use clinia_odonto;

CREATE TABLE especialidades (
    id_especialidade int PRIMARY KEY AUTO_INCREMENT,
    nome_especialidade VARCHAR(45) NOT NULL,
    descricao_especialidade VARCHAR(255)
);

CREATE TABLE funcionarios (
    id_funcionario int PRIMARY KEY AUTO_INCREMENT,
    nome_funcionario VARCHAR(45) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo ENUM('ADMIN', 'RECEPCIONISTA', 'DENTISTA') NOT NULL,
    fk_especialidade INT,
    Foreign Key (fk_especialidade) REFERENCES especialidades(id_especialidade)
);

CREATE TABLE pacientes (
    id_paciente int PRIMARY KEY AUTO_INCREMENT,
    nome_paciente VARCHAR(45) NOT NULL,
    telefone VARCHAR(15) NOT NULL
);

CREATE TABLE servicos (
    id_servico int PRIMARY KEY AUTO_INCREMENT,
    nome_servico VARCHAR(45) NOT NULL,
    descricao_servico VARCHAR(255) NOT NULL,
    valor decimal(10,2) NOT NULL
);


CREATE TABLE agendamentos (
    id_agendamento INT PRIMARY KEY AUTO_INCREMENT,
    data_agendamento DATE NOT NULL,
    horario TIME NOT NULL,

    fk_paciente INT NOT NULL,
    fk_funcionario INT NOT NULL,
    fk_servico INT NOT NULL,

    tem_desconto BOOLEAN NOT NULL DEFAULT FALSE,
    valor_desconto DECIMAL(10,2) DEFAULT 0.00,
    valor_final DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (fk_paciente)
        REFERENCES pacientes(id_paciente),

    FOREIGN KEY (fk_funcionario)
        REFERENCES funcionarios(id_funcionario),

    FOREIGN KEY (fk_servico)
        REFERENCES servicos(id_servico)
);