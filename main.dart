import 'package:flutter/material.dart';

void main() {
  runApp(Appglobal(title: 'Conta funcionario'));
}

class Paleta {
  final Color fundo;
  final Color card;
  final Color borda;
  final Color campo;
  final Color bordaCampo;
  final Color texto;
  final Color textoSuave;
  final Color destaque;
  final Color botao;

  const Paleta({
    required this.fundo,
    required this.card,
    required this.borda,
    required this.campo,
    required this.bordaCampo,
    required this.texto,
    required this.textoSuave,
    required this.destaque,
    required this.botao,
  });

  static const escuro = Paleta(
    fundo: Color(0xFF050B16),
    card: Color(0xFF0A111F),
    borda: Color(0xFF1C2638),
    campo: Color(0xFF070D19),
    bordaCampo: Color(0xFF22304A),
    texto: Color(0xFFFFFFFF),
    textoSuave: Color(0xFF8B97AB),
    destaque: Color(0xFF4DA3FF),
    botao: Color(0xFF1E7AE0),
  );

  static const claro = Paleta(
    fundo: Color(0xFFF3F6FB),
    card: Color(0xFFFFFFFF),
    borda: Color(0xFFD9E1EC),
    campo: Color(0xFFF7F9FC),
    bordaCampo: Color(0xFFCBD5E3),
    texto: Color(0xFF0B1220),
    textoSuave: Color(0xFF5B6679),
    destaque: Color(0xFF1E7AE0),
    botao: Color(0xFF1E7AE0),
  );
}

class Appglobal extends StatelessWidget {
  final String title;
  final ValueNotifier<bool> temaEscuro = ValueNotifier<bool>(true);

  Appglobal({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: temaEscuro,
      builder: (context, escuro, _) {
        final p = escuro ? Paleta.escuro : Paleta.claro;
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            brightness: escuro ? Brightness.dark : Brightness.light,
            scaffoldBackgroundColor: p.fundo,
          ),
          home: TelaLogin(title: title, temaEscuro: temaEscuro),
        );
      },
    );
  }
}

class TelaLogin extends StatefulWidget {
  final String title;
  final ValueNotifier<bool> temaEscuro;

  const TelaLogin({super.key, required this.title, required this.temaEscuro});

  @override
  State<TelaLogin> createState() => _TelaLoginState();
}

class _TelaLoginState extends State<TelaLogin> {
  final nome_entrada = TextEditingController();
  final senha_entrada = TextEditingController();

  @override
  void dispose() {
    nome_entrada.dispose();
    senha_entrada.dispose();
    super.dispose();
  }

  void _entrar(Paleta p) {
    if (nome_entrada.text == 'A' && senha_entrada.text == '1') {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => tela_dois(temaEscuro: widget.temaEscuro),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: p.card,
          behavior: SnackBarBehavior.floating,
          content: Text(
            'Login ou senha incorretos. Confira os dados e tente de novo.',
            style: TextStyle(color: p.texto, fontSize: 13),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final escuro = widget.temaEscuro.value;
    final p = escuro ? Paleta.escuro : Paleta.claro;

    return Scaffold(
      backgroundColor: p.fundo,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _Logo(p: p),
                  Row(
                    children: [
                      Text(
                        escuro ? 'Tema escuro' : 'Tema claro',
                        style: TextStyle(color: p.texto, fontSize: 11),
                      ),
                      const SizedBox(width: 8),
                      Transform.scale(
                        scale: 0.75,
                        child: Switch(
                          value: escuro,
                          onChanged: (v) => widget.temaEscuro.value = v,
                          activeColor: Colors.white,
                          activeTrackColor: p.botao,
                          inactiveThumbColor: Colors.white,
                          inactiveTrackColor: p.bordaCampo,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: p.card,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: p.borda),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'BEM-VINDO DE VOLTA',
                            style: TextStyle(
                              color: p.destaque,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.4,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Entrar na sua conta',
                            style: TextStyle(
                              color: p.texto,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Informe seus dados para continuar.',
                            style: TextStyle(color: p.textoSuave, fontSize: 13),
                          ),
                          const SizedBox(height: 24),
                          _rotulo('Login', p),
                          const SizedBox(height: 8),
                          _campo(
                            controller: nome_entrada,
                            dica: 'Digite seu login',
                            icone: Icons.person_outline,
                            p: p,
                          ),
                          const SizedBox(height: 18),
                          _rotulo('Senha', p),
                          const SizedBox(height: 8),
                          _campo(
                            controller: senha_entrada,
                            dica: 'Digite sua senha',
                            icone: Icons.lock_outline,
                            p: p,
                            senha: true,
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              onPressed: () => _entrar(p),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: p.botao,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Acessar minha conta',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward, size: 16),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: Column(
                children: [
                  Text(
                    'Uma viagem melhor começa com acesso.',
                    style: TextStyle(color: p.textoSuave, fontSize: 10),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '© 2026 AcessoCar',
                    style: TextStyle(color: p.textoSuave, fontSize: 10),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _rotulo(String texto, Paleta p) => Text(
        texto,
        style: TextStyle(
          color: p.texto,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      );

  Widget _campo({
    required TextEditingController controller,
    required String dica,
    required IconData icone,
    required Paleta p,
    bool senha = false,
  }) {
    OutlineInputBorder borda(Color cor) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: cor),
        );

    return TextField(
      controller: controller,
      obscureText: senha,
      style: TextStyle(color: p.texto, fontSize: 14),
      cursorColor: p.destaque,
      decoration: InputDecoration(
        hintText: dica,
        hintStyle: TextStyle(color: p.textoSuave, fontSize: 13),
        prefixIcon: Icon(icone, size: 18, color: p.textoSuave),
        filled: true,
        fillColor: p.campo,
        contentPadding: const EdgeInsets.symmetric(vertical: 15),
        enabledBorder: borda(p.bordaCampo),
        focusedBorder: borda(p.destaque),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  final Paleta p;
  const _Logo({required this.p});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 30,
          height: 30,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: p.destaque, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: p.destaque.withOpacity(0.35),
                blurRadius: 10,
              ),
            ],
          ),
          child: Text(
            'A\nC',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: p.destaque,
              fontSize: 9,
              height: 1.0,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(width: 10),
        RichText(
          text: TextSpan(
            style: TextStyle(
              color: p.texto,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
            children: [
              const TextSpan(text: 'Acesso'),
              TextSpan(text: 'Car', style: TextStyle(color: p.destaque)),
            ],
          ),
        ),
      ],
    );
  }
}

class Carro {
  final String modelo;
  final String cor;
  final String placa;
  final String chassi;
  final String conservacao;
  final bool abastecido;
  final String tempoParado;
  final int vezesOficina;
  final String tipoAdaptacao;
  final String? adaptacaoPcd;
  final String status;

  const Carro({
    required this.modelo,
    required this.cor,
    required this.placa,
    required this.chassi,
    required this.conservacao,
    required this.abastecido,
    required this.tempoParado,
    required this.vezesOficina,
    required this.tipoAdaptacao,
    this.adaptacaoPcd,
    this.status = 'Disponível',
  });

  bool get possuiPcd => adaptacaoPcd != null;

  bool combina(String q) {
    final t = q.trim().toLowerCase();
    if (t.isEmpty) return true;
    return [modelo, cor, placa, status].any((c) => c.toLowerCase().contains(t));
  }
}

class Aluguel {
  final Carro carro;
  final String nome;
  final String cpf;
  final String localizacao;
  final String cnh;
  final String? pcdUsuario;
  final DateTime dataAluguel;
  final DateTime dataEntrega;

  const Aluguel({
    required this.carro,
    required this.nome,
    required this.cpf,
    required this.localizacao,
    required this.cnh,
    required this.dataAluguel,
    required this.dataEntrega,
    this.pcdUsuario,
  });

  int get diasRestantes {
    final agora = DateTime.now();
    final hoje = DateTime(agora.year, agora.month, agora.day);
    final entrega =
        DateTime(dataEntrega.year, dataEntrega.month, dataEntrega.day);
    return entrega.difference(hoje).inDays;
  }

  String get status {
    final d = diasRestantes;
    if (d < 0) return 'Atrasado';
    if (d == 0) return 'Devolve hoje';
    return 'Em dia';
  }

  int get tom {
    final d = diasRestantes;
    if (d < 0) return 2;
    if (d <= 1) return 1;
    return 0;
  }

  bool combina(String q) {
    final t = q.trim().toLowerCase();
    if (t.isEmpty) return true;
    return [nome, carro.modelo, carro.cor, carro.placa, status]
        .any((c) => c.toLowerCase().contains(t));
  }
}

String _fmt(DateTime d) =>
    '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

class tela_dois extends StatefulWidget {
  final ValueNotifier<bool> temaEscuro;
  const tela_dois({super.key, required this.temaEscuro});

  @override
  State<tela_dois> createState() => _TelaDoisState();
}

class _TelaDoisState extends State<tela_dois>
    with SingleTickerProviderStateMixin {
  final TextEditingController pesquisaController = TextEditingController();
  late final TabController _tabs;
  String busca = '';

  late final List<Aluguel> _alugueis;
  late final List<Carro> _estoque;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _tabs.addListener(() {
      if (_tabs.indexIsChanging) return;

      pesquisaController.clear();
      setState(() => busca = '');
    });

    final hoje = DateTime.now();
    DateTime dia(int delta) => hoje.add(Duration(days: delta));

    _alugueis = [
      Aluguel(
        carro: const Carro(
          modelo: 'Onix 1.0',
          cor: 'Prata',
          placa: 'ABC-1D23',
          chassi: '9BGKS48U0LG123456',
          conservacao: 'Bom',
          abastecido: true,
          tempoParado: '12 dias',
          vezesOficina: 2,
          tipoAdaptacao: 'Câmbio automático',
        ),
        nome: 'João Silva',
        cpf: '123.456.789-00',
        localizacao: 'São José do Rio Preto - SP',
        cnh: '04512398765',
        dataAluguel: dia(-6),
        dataEntrega: dia(1),
      ),
      Aluguel(
        carro: const Carro(
          modelo: 'HB20 Sense',
          cor: 'Branco',
          placa: 'EFG-4H56',
          chassi: '9BHBG51CAMP654321',
          conservacao: 'Excelente',
          abastecido: false,
          tempoParado: '3 dias',
          vezesOficina: 0,
          tipoAdaptacao: 'Comando de acelerador manual',
          adaptacaoPcd: 'Acelerador e freio manuais',
        ),
        nome: 'Maria Souza',
        cpf: '987.654.321-00',
        localizacao: 'Mirassol - SP',
        cnh: '07894561230',
        pcdUsuario: 'Acelerador e freio manuais',
        dataAluguel: dia(-4),
        dataEntrega: dia(6),
      ),
      Aluguel(
        carro: const Carro(
          modelo: 'Argo Drive',
          cor: 'Preto',
          placa: 'IJK-7L89',
          chassi: '9BD358A1NMY987654',
          conservacao: 'Regular',
          abastecido: true,
          tempoParado: '25 dias',
          vezesOficina: 4,
          tipoAdaptacao: 'Nenhuma',
        ),
        nome: 'Carlos Lima',
        cpf: '456.123.789-55',
        localizacao: 'Bady Bassitt - SP',
        cnh: '01234567890',
        dataAluguel: dia(-10),
        dataEntrega: dia(-1),
      ),
    ];

    _estoque = const [
      Carro(
        modelo: 'Onix Plus',
        cor: 'Cinza',
        placa: 'LMN-1A23',
        chassi: '9BGEA69B0NG111222',
        conservacao: 'Excelente',
        abastecido: true,
        tempoParado: '5 dias',
        vezesOficina: 1,
        tipoAdaptacao: 'Nenhuma',
        status: 'Disponível',
      ),
      Carro(
        modelo: 'Creta Action',
        cor: 'Vermelho',
        placa: 'OPQ-2B34',
        chassi: '9BHBH41CAMP333444',
        conservacao: 'Bom',
        abastecido: false,
        tempoParado: '18 dias',
        vezesOficina: 3,
        tipoAdaptacao: 'Câmbio automático',
        adaptacaoPcd: 'Rampa de acesso e volante com manopla',
        status: 'Em revisão',
      ),
      Carro(
        modelo: 'Mobi Like',
        cor: 'Azul',
        placa: 'RST-3C45',
        chassi: '9BD195A1NMY555666',
        conservacao: 'Regular',
        abastecido: true,
        tempoParado: '40 dias',
        vezesOficina: 5,
        tipoAdaptacao: 'Nenhuma',
        status: 'Aguardando limpeza',
      ),
      Carro(
        modelo: 'Polo Track',
        cor: 'Branco',
        placa: 'UVW-4D56',
        chassi: '9BWAH5BZ0NP777888',
        conservacao: 'Bom',
        abastecido: true,
        tempoParado: '9 dias',
        vezesOficina: 1,
        tipoAdaptacao: 'Embreagem eletrônica',
        adaptacaoPcd: 'Embreagem eletrônica no volante',
        status: 'Disponível',
      ),
    ];
  }

  @override
  void dispose() {
    pesquisaController.dispose();
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: widget.temaEscuro,
      builder: (context, escuro, _) {
        final p = escuro ? Paleta.escuro : Paleta.claro;
        final alugados = _alugueis.where((a) => a.combina(busca)).toList();
        final estoque = _estoque.where((c) => c.combina(busca)).toList();

        return Scaffold(
          backgroundColor: p.fundo,
          body: SafeArea(
            child: Column(
              children: [
                _cabecalho(p, escuro),
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1000),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FROTA',
                              style: TextStyle(
                                color: p.destaque,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.4,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Gestão de veículos',
                              style: TextStyle(
                                color: p.texto,
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _barraAbas(p),
                            const SizedBox(height: 16),
                            _barraPesquisa(p),
                            const SizedBox(height: 12),
                            Expanded(
                              child: TabBarView(
                                controller: _tabs,
                                children: [
                                  _abaAlugados(alugados, p),
                                  _abaEstoque(estoque, p),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _cabecalho(Paleta p, bool escuro) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 10, 20, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: Icon(Icons.arrow_back, color: p.texto, size: 20),
                tooltip: 'Voltar',
              ),
              _Logo(p: p),
            ],
          ),
          Transform.scale(
            scale: 0.75,
            child: Switch(
              value: escuro,
              onChanged: (v) => widget.temaEscuro.value = v,
              activeColor: Colors.white,
              activeTrackColor: p.botao,
              inactiveThumbColor: Colors.white,
              inactiveTrackColor: p.bordaCampo,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ),
        ],
      ),
    );
  }

  Widget _barraAbas(Paleta p) {
    Widget aba(IconData icone, String texto) => Tab(
          height: 44,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icone, size: 16),
              const SizedBox(width: 8),
              Text(texto),
            ],
          ),
        );

    return Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: p.borda)),
      ),
      child: TabBar(
        controller: _tabs,
        isScrollable: true,
        tabAlignment: TabAlignment.start,
        indicatorColor: p.destaque,
        indicatorWeight: 2.5,
        dividerColor: Colors.transparent,
        labelColor: p.destaque,
        unselectedLabelColor: p.textoSuave,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        unselectedLabelStyle:
            const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        overlayColor: WidgetStatePropertyAll(p.destaque.withOpacity(0.08)),
        tabs: [
          aba(Icons.key_outlined, 'Carros Alugados'),
          aba(Icons.warehouse_outlined, 'Carros em Estoque'),
        ],
      ),
    );
  }

  Widget _barraPesquisa(Paleta p) {
    OutlineInputBorder borda(Color cor) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cor),
        );

    return TextField(
      controller: pesquisaController,
      style: TextStyle(color: p.texto, fontSize: 14),
      cursorColor: p.destaque,
      onChanged: (v) => setState(() => busca = v),
      decoration: InputDecoration(
        hintText: 'Pesquisar por nome, modelo, placa...',
        hintStyle: TextStyle(color: p.textoSuave, fontSize: 13),
        prefixIcon: Icon(Icons.search, size: 20, color: p.textoSuave),
        suffixIcon: busca.isEmpty
            ? null
            : IconButton(
                icon: Icon(Icons.close, size: 18, color: p.textoSuave),
                onPressed: () {
                  pesquisaController.clear();
                  setState(() => busca = '');
                },
              ),
        filled: true,
        fillColor: p.card,
        contentPadding: const EdgeInsets.symmetric(vertical: 15),
        enabledBorder: borda(p.borda),
        focusedBorder: borda(p.destaque),
      ),
    );
  }

  Widget _abaAlugados(List<Aluguel> lista, Paleta p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _contador(lista.length, p),
        Expanded(
          child: lista.isEmpty
              ? _vazio(p, 'Nenhum aluguel encontrado')
              : LayoutBuilder(
                  builder: (context, c) {
                    if (c.maxWidth < 700) {
                      return ListView.separated(
                        padding: const EdgeInsets.only(bottom: 20),
                        itemCount: lista.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, i) =>
                            _cardAluguel(lista[i], p),
                      );
                    }
                    return _tabela(
                      p: p,
                      colunas: const [
                        'Usuário',
                        'Modelo',
                        'Cor',
                        'Placa',
                        'Status'
                      ],
                      larguras: const {
                        0: FlexColumnWidth(2.2),
                        1: FlexColumnWidth(1.8),
                        2: FlexColumnWidth(1.3),
                        3: FlexColumnWidth(1.4),
                        4: FlexColumnWidth(1.6),
                      },
                      linhas: [
                        for (final a in lista)
                          _LinhaTabela(
                            onTap: () => _abrirDetalhesAluguel(a, p),
                            celulas: [
                              Text(a.nome,
                                  style: TextStyle(
                                      color: p.texto,
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700)),
                              Text(a.carro.modelo,
                                  style: TextStyle(
                                      color: p.texto, fontSize: 13.5)),
                              Text(a.carro.cor,
                                  style: TextStyle(
                                      color: p.texto, fontSize: 13.5)),
                              _chipPlaca(a.carro.placa, p),
                              _chipStatus(a.status, a.tom),
                            ],
                          ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _cardAluguel(Aluguel a, Paleta p) {
    return _cardBase(
      p: p,
      onTap: () => _abrirDetalhesAluguel(a, p),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _iconeQuadrado(Icons.person_outline, p, 38),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  a.nome,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: p.texto,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              _chipStatus(a.status, a.tom),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: p.borda, height: 1),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _info('Modelo', a.carro.modelo, p)),
              Expanded(child: _info('Cor', a.carro.cor, p)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _infoW('Placa', _chipPlaca(a.carro.placa, p), p)),
              const Expanded(child: SizedBox()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _abaEstoque(List<Carro> lista, Paleta p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _contador(lista.length, p),
        Expanded(
          child: lista.isEmpty
              ? _vazio(p, 'Nenhum carro encontrado')
              : LayoutBuilder(
                  builder: (context, c) {
                    if (c.maxWidth < 700) {
                      return ListView.separated(
                        padding: const EdgeInsets.only(bottom: 20),
                        itemCount: lista.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, i) => _cardCarro(lista[i], p),
                      );
                    }
                    return _tabela(
                      p: p,
                      colunas: const ['Modelo', 'Cor', 'Placa', 'Status'],
                      larguras: const {
                        0: FlexColumnWidth(2.2),
                        1: FlexColumnWidth(1.5),
                        2: FlexColumnWidth(1.5),
                        3: FlexColumnWidth(2),
                      },
                      linhas: [
                        for (final car in lista)
                          _LinhaTabela(
                            onTap: () => _abrirDetalhesCarro(car, p),
                            celulas: [
                              Text(car.modelo,
                                  style: TextStyle(
                                      color: p.texto,
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700)),
                              Text(car.cor,
                                  style: TextStyle(
                                      color: p.texto, fontSize: 13.5)),
                              _chipPlaca(car.placa, p),
                              _chipStatus(car.status, _tomEstoque(car.status)),
                            ],
                          ),
                      ],
                    );
                  },
                ),
        ),
      ],
    );
  }

  int _tomEstoque(String status) => status == 'Disponível' ? 0 : 1;

  Widget _cardCarro(Carro car, Paleta p) {
    return _cardBase(
      p: p,
      onTap: () => _abrirDetalhesCarro(car, p),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _iconeQuadrado(Icons.directions_car_outlined, p, 38),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  car.modelo,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: p.texto,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              _chipStatus(car.status, _tomEstoque(car.status)),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: p.borda, height: 1),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _info('Cor', car.cor, p)),
              Expanded(child: _infoW('Placa', _chipPlaca(car.placa, p), p)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _contador(int n, Paleta p) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(
          '$n ${n == 1 ? 'resultado' : 'resultados'}',
          style: TextStyle(color: p.textoSuave, fontSize: 11),
        ),
      );

  Widget _vazio(Paleta p, String titulo) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.directions_car_outlined, size: 40, color: p.textoSuave),
          const SizedBox(height: 10),
          Text(
            titulo,
            style: TextStyle(
                color: p.texto, fontSize: 14, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            'Tente outra pesquisa.',
            style: TextStyle(color: p.textoSuave, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _cardBase({
    required Paleta p,
    required VoidCallback onTap,
    required Widget child,
  }) {
    return Material(
      color: p.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: p.borda),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(padding: const EdgeInsets.all(16), child: child),
      ),
    );
  }

  Widget _iconeQuadrado(IconData icone, Paleta p, double tam) {
    return Container(
      width: tam,
      height: tam,
      decoration: BoxDecoration(
        color: p.campo,
        borderRadius: BorderRadius.circular(tam > 40 ? 12 : 10),
        border: Border.all(color: p.bordaCampo),
      ),
      child: Icon(icone, size: tam * 0.52, color: p.destaque),
    );
  }

  Widget _tabela({
    required Paleta p,
    required List<String> colunas,
    required Map<int, TableColumnWidth> larguras,
    required List<_LinhaTabela> linhas,
  }) {
    Widget celula(Widget child, {VoidCallback? onTap}) {
      final conteudo = Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Align(alignment: Alignment.centerLeft, child: child),
      );
      return onTap == null ? conteudo : InkWell(onTap: onTap, child: conteudo);
    }

    final rows = <TableRow>[
      TableRow(
        decoration: BoxDecoration(color: p.campo),
        children: colunas
            .map((c) => celula(Text(
                  c.toUpperCase(),
                  style: TextStyle(
                    color: p.textoSuave,
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                  ),
                )))
            .toList(),
      ),
      for (final l in linhas)
        TableRow(
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: p.borda)),
          ),
          children: [for (final c in l.celulas) celula(c, onTap: l.onTap)],
        ),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 20),
      child: Material(
        color: p.card,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: p.borda),
        ),
        clipBehavior: Clip.antiAlias,
        child: Table(
          columnWidths: larguras,
          defaultVerticalAlignment: TableCellVerticalAlignment.middle,
          children: rows,
        ),
      ),
    );
  }

  Widget _info(String rotulo, String valor, Paleta p) {
    return _infoW(
      rotulo,
      Text(
        valor,
        style: TextStyle(
          color: p.texto,
          fontSize: 13.5,
          fontWeight: FontWeight.w600,
        ),
      ),
      p,
    );
  }

  Widget _infoW(String rotulo, Widget valor, Paleta p) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          rotulo.toUpperCase(),
          style: TextStyle(
            color: p.textoSuave,
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 4),
        valor,
      ],
    );
  }

  Widget _chipPlaca(String placa, Paleta p) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: p.destaque.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: p.destaque.withOpacity(0.5)),
      ),
      child: Text(
        placa,
        style: TextStyle(
          color: p.destaque,
          fontSize: 12,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _chipStatus(String texto, int tom) {
    final cor = switch (tom) {
      0 => const Color(0xFF2EBD6B),
      1 => const Color(0xFFF2A33A),
      _ => const Color(0xFFE5484D),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: cor.withOpacity(0.14),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cor.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: cor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            texto,
            style: TextStyle(
              color: cor,
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _chipSimNao(bool sim, String textoSim, String textoNao) {
    final cor = sim ? const Color(0xFF2EBD6B) : const Color(0xFFE5484D);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(sim ? Icons.check_circle : Icons.cancel, size: 16, color: cor),
        const SizedBox(width: 6),
        Text(
          sim ? textoSim : textoNao,
          style: TextStyle(
            color: cor,
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  void _abrirModal(WidgetBuilder builder) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Fechar',
      barrierColor: Colors.black.withOpacity(0.6),
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (ctx, _, __) => builder(ctx),
      transitionBuilder: (ctx, anim, _, child) {
        final curva = CurvedAnimation(parent: anim, curve: Curves.easeOutCubic);
        return FadeTransition(
          opacity: curva,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.94, end: 1.0).animate(curva),
            child: child,
          ),
        );
      },
    );
  }

  Widget _modalBase({
    required BuildContext ctx,
    required Paleta p,
    required String etiqueta,
    required Widget cabecalho,
    required List<Widget> secoes,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Material(
            color: p.card,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: p.borda),
            ),
            clipBehavior: Clip.antiAlias,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        etiqueta,
                        style: TextStyle(
                          color: p.destaque,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.4,
                        ),
                      ),
                      InkWell(
                        onTap: () => Navigator.pop(ctx),
                        borderRadius: BorderRadius.circular(20),
                        child: Padding(
                          padding: const EdgeInsets.all(4),
                          child:
                              Icon(Icons.close, size: 20, color: p.textoSuave),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  cabecalho,
                  const SizedBox(height: 20),
                  for (final s in secoes) ...[
                    s,
                    const SizedBox(height: 14),
                  ],
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: p.botao,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Fechar',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _tituloModal({
    required Paleta p,
    required IconData icone,
    required String titulo,
    required String subtitulo,
    required Widget chip,
  }) {
    return Row(
      children: [
        _iconeQuadrado(icone, p, 48),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                titulo,
                style: TextStyle(
                  color: p.texto,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitulo,
                style: TextStyle(color: p.textoSuave, fontSize: 12),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        chip,
      ],
    );
  }

  Widget _secao(String titulo, IconData icone, List<Widget> itens, Paleta p) {
    final linhas = <Widget>[];
    for (var i = 0; i < itens.length; i += 2) {
      if (i > 0) linhas.add(const SizedBox(height: 14));
      linhas.add(
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: itens[i]),
            const SizedBox(width: 12),
            Expanded(
              child: i + 1 < itens.length ? itens[i + 1] : const SizedBox(),
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: p.campo,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: p.bordaCampo),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icone, size: 15, color: p.destaque),
              const SizedBox(width: 8),
              Text(
                titulo.toUpperCase(),
                style: TextStyle(
                  color: p.destaque,
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...linhas,
        ],
      ),
    );
  }

  List<Widget> _secoesCarro(Carro c, Paleta p) {
    return [
      _secao(
        'Identificação do veículo',
        Icons.directions_car_outlined,
        [
          _info('Modelo', c.modelo, p),
          _info('Cor', c.cor, p),
          _infoW('Placa', _chipPlaca(c.placa, p), p),
          _info('Chassi', c.chassi, p),
        ],
        p,
      ),
      _secao(
        'Condição do veículo',
        Icons.build_circle_outlined,
        [
          _info('Estado / conservação', c.conservacao, p),
          _infoW(
              'Abastecido', _chipSimNao(c.abastecido, 'Sim', 'Não'), p),
          _info('Tempo sem ser alugado', c.tempoParado, p),
          _info(
            'Idas à oficina',
            '${c.vezesOficina} ${c.vezesOficina == 1 ? 'vez' : 'vezes'}',
            p,
          ),
        ],
        p,
      ),
      _secao(
        'Adaptações',
        Icons.accessible_forward_outlined,
        [
          _info('Tipo de adaptação', c.tipoAdaptacao, p),
          _infoW('Adaptação PCD', _chipSimNao(c.possuiPcd, 'Possui', 'Não possui'),
              p),
          if (c.possuiPcd) _info('Tipo de adaptação PCD', c.adaptacaoPcd!, p),
        ],
        p,
      ),
    ];
  }

  void _abrirDetalhesAluguel(Aluguel a, Paleta p) {
    _abrirModal((ctx) {
      final d = a.diasRestantes;
      final cor = switch (a.tom) {
        0 => const Color(0xFF2EBD6B),
        1 => const Color(0xFFF2A33A),
        _ => const Color(0xFFE5484D),
      };
      final numero = d < 0 ? '${-d}' : '$d';
      final legenda = d < 0
          ? (d == -1 ? 'dia de atraso na devolução' : 'dias de atraso na devolução')
          : d == 0
              ? 'devolução prevista para hoje'
              : (d == 1 ? 'dia para devolver o carro' : 'dias para devolver o carro');

      final destaque = Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cor.withOpacity(0.10),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cor.withOpacity(0.45)),
        ),
        child: Row(
          children: [
            Text(
              numero,
              style: TextStyle(
                color: cor,
                fontSize: 38,
                fontWeight: FontWeight.w800,
                height: 1.0,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    legenda,
                    style: TextStyle(
                      color: p.texto,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Entrega em ${_fmt(a.dataEntrega)}',
                    style: TextStyle(color: p.textoSuave, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      );

      return _modalBase(
        ctx: ctx,
        p: p,
        etiqueta: 'DETALHES DO ALUGUEL',
        cabecalho: _tituloModal(
          p: p,
          icone: Icons.person_outline,
          titulo: a.nome,
          subtitulo: '${a.carro.modelo} • ${a.carro.cor}',
          chip: _chipStatus(a.status, a.tom),
        ),
        secoes: [
          destaque,
          _secao(
            'Usuário e aluguel',
            Icons.badge_outlined,
            [
              _info('Nome', a.nome, p),
              _info('CPF', a.cpf, p),
              _info('Localização', a.localizacao, p),
              _info('Número da CNH', a.cnh, p),
              _info('Data do aluguel', _fmt(a.dataAluguel), p),
              _info('Data de entrega', _fmt(a.dataEntrega), p),
              _info(
                'Dias para devolver',
                d < 0 ? 'Atrasado há ${-d} ${-d == 1 ? 'dia' : 'dias'}' : '$d ${d == 1 ? 'dia' : 'dias'}',
                p,
              ),
              _info('Adaptação PCD do usuário', a.pcdUsuario ?? 'Nenhuma', p),
            ],
            p,
          ),
          ..._secoesCarro(a.carro, p),
        ],
      );
    });
  }

  void _abrirDetalhesCarro(Carro c, Paleta p) {
    _abrirModal((ctx) {
      return _modalBase(
        ctx: ctx,
        p: p,
        etiqueta: 'DETALHES DO VEÍCULO',
        cabecalho: _tituloModal(
          p: p,
          icone: Icons.directions_car_outlined,
          titulo: c.modelo,
          subtitulo: '${c.cor} • ${c.placa}',
          chip: _chipStatus(c.status, _tomEstoque(c.status)),
        ),
        secoes: _secoesCarro(c, p),
      );
    });
  }
}

class _LinhaTabela {
  final List<Widget> celulas;
  final VoidCallback onTap;
  const _LinhaTabela({required this.celulas, required this.onTap});
}
