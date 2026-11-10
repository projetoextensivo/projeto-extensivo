# OdontoAgenda — API Spring Boot
Projeto independente do front-end, com Java 21 e Spring Boot 3.5.16, conforme as versões do esqueleto original. Abra este diretório ou pom.xml no IntelliJ como projeto Maven. Selecione JDK 21 e aguarde a importação.

## Executar no IntelliJ
Na configuração de execução de OdontoAgendaApplication defina as variáveis ADMIN_EMAIL e ADMIN_PASSWORD (8 a 72 caracteres). O primeiro início cria a administradora. Não existe cadastro público de administradora.
Para explorar dados fictícios, defina DEMO_MODE=true (somente desenvolvimento). Isso disponibiliza demo@odontoagenda.com / Odonto@2026 como administradora. Sem DEMO_MODE a instalação começa vazia, sem senha padrão. Cadastre procedimentos com a administradora antes de agendar.
Execute OdontoAgendaApplication. A API escuta em http://127.0.0.1:8080/api. Com Maven instalado: mvn test e mvn spring-boot:run.
No projeto frontend: npm install e npm run dev. O Vite encaminha /api para a porta 8080. Não execute a API Node ao usar Spring.
Use sempre o mesmo hostname no navegador (localhost ou 127.0.0.1). O proxy permite cookies de sessão na mesma origem. ALLOWED_ORIGINS configura as origens permitidas; COOKIE_SECURE=true deve ser usado com HTTPS.

## Perfis
Administradora: agenda, pacientes, procedimentos, prontuários, configurações da clínica e dados usados no dashboard.
Secretária: agenda, cadastro/edição de pacientes e própria conta. Sem acesso às rotas de procedimentos, prontuários, configurações da clínica e exclusão de pacientes. O bootstrap não envia catálogo completo, prontuários nem valores financeiros de consultas. Envia somente id/nome/duração das opções necessárias ao agendamento.
O cadastro público cria apenas Secretária; enviar outro cargo é rejeitado.
Atendimento exclusivamente particular; não há convênio no modelo ou nos formulários.

## Persistência e estrutura
api/: controllers e tratamento de erros; service/: autenticação, autorização e regras; repository/: persistência JDBC; config/: sessão, origem, CORS e carga inicial.
H2 em arquivo ./data/odontoagenda.mv.db, fora do front-end. Configurável com DB_URL, DB_USER e DB_PASSWORD. Os registros de domínio são armazenados em JSON por tipo/id; usuários possuem tabela própria e senhas BCrypt. Não existe migração automática do SQLite Node. Copie o banco com a API parada para backup.
Rotas compatíveis com o React: /auth/login, /auth/register, /auth/me, /auth/logout, /bootstrap, /account, /settings, /patients, /procedures, /appointments e /records; CRUD nas coleções e ids. Erros retornam {message}; 401 sem sessão, 403 sem permissão e 409 em conflito.
Arrastar na agenda usa PUT /appointments/{id}, preserva dados e valida duração, expediente, domingo e sobreposição do dentista. Falhas não alteram a consulta. Atualizações de consultas bloqueiam a linha de configuração no banco até o commit para evitar sobreposição concorrente.

Referência: https://docs.spring.io/spring-boot/3.5/system-requirements.html
