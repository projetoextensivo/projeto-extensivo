# DentalCare

Sistema web acadêmico para apoiar a gestão de uma clínica odontológica. O projeto está sendo desenvolvido de forma incremental e reúne uma aplicação web, uma API REST e materiais de modelagem do banco de dados.

> **Status:** em desenvolvimento. A API possui um endpoint de demonstração. Os módulos de negócio, a autenticação e a integração com o banco ainda serão implementados.

## Visão do produto

O DentalCare tem como objetivo centralizar informações de clientes e consultas, apoiar a comunicação sobre agendamentos e disponibilizar dados para acompanhamento e análise da clínica.

O escopo proposto não inclui rede social nem processamento de pagamentos.

## Funcionalidades previstas

- [ ] Cadastro e gerenciamento de clientes
- [ ] Criação e acompanhamento de agendamentos
- [ ] Envio de mensagens relacionadas às consultas
- [ ] Autenticação e autorização de usuários
- [ ] Armazenamento de informações da clínica
- [ ] Disponibilização de dados para dashboards e análises

## Tecnologias

| Componente | Tecnologia |
| --- | --- |
| Frontend | React, JavaScript e Vite |
| Backend | Java 21, Spring Boot e Maven |
| Documentação da API | Swagger UI e OpenAPI |
| Banco de dados previsto | MySQL |
| Versionamento | Git e GitHub |

## Organização do repositório

```text
.
├── backend/                 # API REST em Java e Spring Boot
│   └── src/
│       ├── main/java/       # Código da aplicação
│       ├── main/resources/  # Configurações
│       └── test/java/       # Espaço para testes
├── database/                # Modelagens e scripts SQL
└── frontend/                # Aplicação web em React e Vite
    ├── public/              # Arquivos estáticos públicos
    └── src/                 # Código-fonte da interface
        ├── assets/          # Imagens e recursos visuais
        ├── App.jsx           # Componente principal
        ├── App.css           # Estilos do componente principal
        ├── index.css         # Estilos globais
        └── main.jsx          # Inicialização do React
```

O backend utiliza o pacote base `br.com.dentalcare`, organizado em `config`, `controller`, `dto`, `exception`, `mapper`, `model`, `repository`, `security` e `service`.

## Executar localmente

### Pré-requisitos

- JDK 21 ou superior e Maven 3.9 ou superior para o backend
- Node.js e npm para o frontend

### Backend

No terminal, a partir da raiz do repositório:

```bash
cd backend
mvn spring-boot:run
```

Quando a aplicação estiver ativa, os endereços disponíveis são:

| Recurso | Endereço |
| --- | --- |
| Endpoint de demonstração | `http://localhost:8080/api/hello` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| Especificação OpenAPI | `http://localhost:8080/api-docs` |

O endpoint `GET /api/hello` retorna `Hello World!`.

### Frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm install
npm run dev
```

O Vite informa no terminal o endereço local para abrir a aplicação. Para gerar a versão de produção, execute `npm run build` dentro de `frontend/`.

## Banco de dados

O diretório `database/` contém materiais de modelagem e scripts SQL. O MySQL está previsto para o projeto, mas a conexão JDBC ainda não está configurada no backend.

## Contexto acadêmico

Projeto desenvolvido para a disciplina **Pesquisa e Inovação III**, com atividades de definição do produto apoiadas por Lean Inception e planejamento incremental baseado em Scrum.

### Desenvolvedores

- Ketellyn Santos
- Lucas Ciriaco
- Lucas Máximo
- Manuela Garcia
- Pablo Cordeiro
- Vinicius Francelino

## Licença

Projeto acadêmico. Uma licença de distribuição ainda não foi definida.
