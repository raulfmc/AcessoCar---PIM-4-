# Integração da API

Cada página configura e chama a própria API no seu arquivo JavaScript. Não há persistência local de clientes, veículos, locações, parcelas ou manutenções. `accessocar-utils.js` contém somente funções de apresentação, datas e compatibilidade corporal; não faz requisições nem controla o estado das páginas.

## Configuração

Em cada arquivo abaixo, informe a URL-base e preencha os valores vazios de `API_ROUTES` com as rotas reais do backend:

| Página | Arquivo JavaScript | Rotas necessárias |
| --- | --- | --- |
| Login | `PG_LOGIN.js` | `login` |
| Painel | `PG_HOME.js` | `dashboard` |
| Clientes | `clientes.js` | `customers`, `installments`, `customerById` |
| Cadastro de cliente | `cadastro-cliente.js` | `customers` |
| Veículos | `veiculos.js` | `vehicles`, `vehicleById` |
| Cadastro de veículo | `cadastro-veiculo.js` | `vehicles` |
| Locações | `locacoes.js` | `customers`, `vehicles`, `rentals`, `createRental` |
| Financeiro | `financeiro.js` | `customers`, `installments`, `confirmPayment` |
| Manutenção | `manutencao.js` | `vehicles`, `maintenance`, `createMaintenance`, `releaseMaintenance` |

As rotas com `:id` são modelos de caminho; o código substitui esse trecho pelo identificador codificado do registro. As rotas de lista devem responder com um array JSON ou `{ "data": [] }`. Respostas de erro podem usar `{ "message": "..." }`; a mensagem será exibida na página.

## Contratos específicos esperados

- **Painel:** a rota `dashboard` retorna números `pendingInstallments`, `receivableCount`, `receivableTotal`, `overdueCustomers`, `overdueInstallments`, `overdueTotal`, `confirmedPayments`, `activeRentals`, `availableVehicles`, `rentedVehicles` e `maintenanceVehicles`, além de `monthlyPayments: [{ "month": "Jan", "value": 0 }]`.
- **Clientes:** clientes incluem `id`, `name`, `cpf` e `bodyRegions`. A lista de parcelas usa `customerId`, `status` (`pending`, `overdue` ou `paid`); excluir cliente usa `DELETE customerById/:id`. O backend deve impedir exclusão com dependências.
- **Veículos:** veículos incluem `id`, `name`, `plate`, `year`, `dailyRate`, `bodyRegions` e `status` (`available`, `rented` ou `maintenance`). Excluir usa `DELETE vehicleById/:id`; o backend deve impedir exclusão com dependências.
- **Cadastros:** as rotas `customers` e `vehicles` recebem `POST` JSON com os campos do formulário e geram o identificador.
- **Locações:** o `POST createRental` recebe `customerId`, `vehicleId`, `startDate`, `returnDate`, `paymentMethod`, `installments`, `firstDueDate` e `notes`. O backend deve validar disponibilidade e criar a locação e suas parcelas atomicamente.
- **Financeiro:** parcelas incluem `customerId`, `rentalId`, `number`, `amount`, `dueDate`, `status`, `paidAt` e `notes`. `PATCH confirmPayment/:id` recebe `{ "status": "paid", "paidAt": "AAAA-MM-DD" }`.
- **Manutenção:** veículos incluem seu `status`; os registros de manutenção incluem `id`, `vehicleId`, `status`, `report`, `cost` e `date`. `POST createMaintenance` recebe `vehicleId`, `cost`, `report` e `date`; `PATCH releaseMaintenance/:id` conclui o registro e libera o veículo.
- **Login:** `POST login` recebe `{ "login": "...", "password": "..." }`. O exemplo usa sessão por cookie; se o backend retornar token, adapte o tratamento de autenticação em `PG_LOGIN.js` e nos demais arquivos de página.

Enquanto URL-base ou rota estiver vazia, a página informa que a integração precisa ser configurada, em vez de apresentar dados de demonstração. As chamadas enviam credenciais de sessão por cookie; habilite credenciais e a origem do frontend no CORS do backend. Sirva os arquivos do frontend por HTTP; abrir as páginas diretamente por `file://` pode bloquear as chamadas da API.
