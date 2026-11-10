# OdontoAgenda — front-end

React + Vite. Atendimento exclusivamente particular.

- Administradora: dashboard, procedimentos, prontuários, agenda, pacientes e configurações da clínica.
- Secretária: cadastrar/editar pacientes, visualizar/editar agenda, agendar e reagendar consultas, além da própria conta. O cadastro público cria somente secretárias.
- Arraste uma consulta para outro dia na visão mensal ou para um horário nas visões semanal/diária. A API verifica expediente, domingo e sobreposição antes de salvar. Também é possível clicar na consulta e editar data/horário, inclusive no celular.

## Usar com Spring Boot no IntelliJ

O back-end integrado está em `../backend-integrado-spring`, com uma cópia em `../odontoagenda-backend.zip`. O esqueleto anterior em `../backend` continua separado. Abra seu `pom.xml` no IntelliJ e selecione JDK 21. Na execução de `OdontoAgendaApplication`, configure `ADMIN_EMAIL` e `ADMIN_PASSWORD`; inicie a aplicação na porta 8080. O README do back-end detalha banco, variáveis e endpoints.

Neste front-end execute `npm install` e `npm run dev`. Acesse `http://127.0.0.1:5173`. As requisições `/api` são encaminhadas para `http://127.0.0.1:8080`. Ajuste `API_PROXY_TARGET` no ambiente para outra porta. `VITE_API_BASE_URL` permite mudar a URL base; prefira `/api` com proxy para manter cookies na mesma origem. O servidor de produção também precisa encaminhar `/api` à API Spring.

Em instalação vazia, cadastre os procedimentos com a administradora antes do primeiro agendamento. Não há migração automática do banco SQLite de demonstração para o banco H2 do Spring.

## Demonstração local opcional

`npm run dev:demo` inicia a API Node/SQLite de demonstração e Vite. Login: `demo@odontoagenda.com` / `Odonto@2026` (administradora). No Spring, esse login só existe com `DEMO_MODE=true`.

## Verificações

`npm test`: API Node e arquitetura FSD. `npm run build`: build de produção. `npm run test:e2e`: fluxos no navegador contra a API Node. Para testar contra Vite + Spring em execução: `E2E_BASE_URL=http://127.0.0.1:5173 npx playwright test` (defina a variável conforme seu terminal). Os testes usam dados fictícios e precisam de uma base descartável com `DEMO_MODE=true`.

O back-end inclui testes de integração Maven para autenticação, perfis, cadastro, reagendamento e conflitos. Java 21 e Maven são requisitos do [Spring Boot](https://docs.spring.io/spring-boot/3.5/system-requirements.html).

## Acessar de outras máquinas na mesma rede

1. No terminal da pasta `frontend`, execute `npm run preparar:rede`. O comando gera `dist` com a API relativa `/api` e mostra os endereços IP privados disponíveis.
2. No IntelliJ, abra `backend-integrado-spring`, confira o JDK 21 e as variáveis `ADMIN_EMAIL`/`ADMIN_PASSWORD`. O **Working directory** da configuração de execução deve ser a pasta `backend-integrado-spring` (normalmente `$PROJECT_DIR$`). Reinicie `OdontoAgendaApplication`.
3. Nesta máquina, abra `http://localhost:8080`. Na outra máquina, abra `http://IP-DA-MAQUINA-SERVIDORA:8080`. O IPv4 do adaptador Wi-Fi/Ethernet aparece em `ipconfig`; não use o IP de WSL, VPN ou loopback. O IP pode mudar quando você troca de rede.

O Spring serve os arquivos de `../frontend/dist/` e a API na mesma porta. As outras máquinas precisam somente de navegador e acesso à mesma rede; não precisam instalar Java ou Node. Não use `localhost` na máquina visitante, pois ele aponta para a própria máquina visitante. O host deve ficar ligado, conectado e com o Java em execução. Não é necessário executar `npm run dev` nesse modo. Execute novamente `npm run preparar:rede` e reinicie o Java depois de alterar a interface.

Se o acesso local funcionar e o acesso pelo IP não, confira se o Windows está usando o perfil de rede **Privada**, permita o Java no Firewall para essa rede e verifique se o Wi-Fi bloqueia a comunicação entre dispositivos (rede de convidados). Não desative o Firewall. Se precisar de uma regra explícita, execute no PowerShell como administrador:

```powershell
New-NetFirewallRule -DisplayName 'OdontoAgenda - rede local' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -Profile Private -RemoteAddress LocalSubnet
```

Para remover somente essa regra:

```powershell
Remove-NetFirewallRule -DisplayName 'OdontoAgenda - rede local'
```

Esse modo destina-se à rede local de confiança. Para acesso pela internet e uso com dados reais, configure hospedagem e HTTPS. Não é necessário abrir portas no roteador para acessar pela mesma rede.
