# Log de renomeação — Asanuma Odonto

**Data:** 10/11/2026  
**Escopo:** referências ao nome do projeto em documentação, interface, configuração, código e dados persistidos.

## Alterações realizadas

| Local | Antes | Depois |
| --- | --- | --- |
| `README.md` | DentalCare; pacote `br.com.dentalcare` | Asanuma Odonto; pacote `br.com.asanumaodonto` |
| `backend/README.md` | OdontoAgenda; `OdontoAgendaApplication`; `demo@odontoagenda.com`; `./data/odontoagenda.mv.db` | Asanuma Odonto; `AsanumaOdontoApplication`; `demo@asanumaodonto.com`; `./data/asanumaodonto.mv.db` |
| `frontend/README.md` | OdontoAgenda e e-mail antigo; instruções apontando para `backend-integrado-spring` e ZIP antigo | Asanuma Odonto e novo e-mail; instruções apontam para `../backend` e sua aplicação atual |
| `frontend/index.html` | Título e descrição OdontoAgenda | Título e descrição Asanuma Odonto |
| `frontend/src/widgets/app-shell/ui/app-shell.jsx` | Marca OdontoAgenda no menu e rodapé | Marca Asanuma Odonto no menu e rodapé |
| `frontend/src/pages/auth/ui/auth-page.jsx` | Marca OdontoAgenda na tela de autenticação e direitos autorais | Marca Asanuma Odonto |
| `frontend/src/shared/ui/index.jsx` | Texto alternativo “Logotipo OdontoAgenda” | “Logotipo Asanuma Odonto” |
| `frontend/src/features/contact-patient/ui/contact-patient.jsx` | Nome OdontoAgenda na mensagem e assunto de e-mail | Asanuma Odonto |
| `frontend/src/features/auth/ui/auth-form.jsx` | E-mail de demonstração `demo@odontoagenda.com` | `demo@asanumaodonto.com` |
| `frontend/package.json`, `frontend/package-lock.json` | Pacote npm `odontoagenda` | `asanumaodonto` |
| `backend/pom.xml` | `br.com.odontoagenda:odontoagenda-backend` | `br.com.asanumaodonto:asanumaodonto-backend` |
| `backend/src/main/java/br/com/odontoagenda/**` | Pacotes `br.com.odontoagenda` | Pacotes `br.com.asanumaodonto`; diretório movido para `backend/src/main/java/br/com/asanumaodonto/` |
| Classe principal Java | `OdontoAgendaApplication` | `AsanumaOdontoApplication` (incluindo nome do arquivo e referência de inicialização) |
| `backend/src/test/java/br/com/odontoagenda/**` | Pacote e diretório `br.com.odontoagenda` | Pacote e diretório `br.com.asanumaodonto` |
| `backend/src/main/resources/application.properties` | Caminho H2 `./data/odontoagenda` | `./data/asanumaodonto` |
| `backend/data/odontoagenda.mv.db` | Arquivo de banco com o nome antigo e configuração de clínica “OdontoAgenda” | Arquivo movido para `backend/data/asanumaodonto.mv.db`; configuração persistida atualizada para “Asanuma Odonto” |
| `backend/src/main/resources/demo.json` e `backend/src/main/java/br/com/asanumaodonto/config/SeedConfig.java` | Nome da clínica “OdontoAgenda” | “Asanuma Odonto” |
| `backend/src/main/java/br/com/asanumaodonto/config/SeedConfig.java`, `backend/src/test/java/br/com/asanumaodonto/ClinicApiTest.java` | E-mail de demonstração `demo@odontoagenda.com` | `demo@asanumaodonto.com` |
| Este arquivo | Não existia | Registro das alterações antes/depois |

## Verificações

- Busca textual dos arquivos de código, configuração e documentação fora deste próprio log por `DentalCare`, `OdontoAgenda`, `odontoagenda` e `OdontoAgendaApplication`: sem referências remanescentes.
- Os arquivos binários de modelagem (`database/modelagens/modeloBD.mwb`, `modelagemV1.pdf` e `v1.png`) foram inspecionados e não apresentaram esses nomes.
- Backend: `mvn -q -DskipTests compile` executado em `backend` com sucesso.
- Frontend: build não executado porque `npm` não está instalado/disponível neste ambiente.
- O banco H2 existente foi preservado e renomeado junto com a configuração JDBC; o campo persistido `clinicName` também foi atualizado.
