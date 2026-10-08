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

class Aluguel {
  final String nome;
  final String carro;
  final String placa;
  final String cor;
  final String dataAluguel;
  final String dataEntrega;

  const Aluguel({
    required this.nome,
    required this.carro,
    required this.placa,
    required this.cor,
    required this.dataAluguel,
    required this.dataEntrega,
  });

  bool combina(String q) {
    final t = q.trim().toLowerCase();
    if (t.isEmpty) return true;
    return [nome, carro, placa, cor, dataAluguel, dataEntrega]
        .any((c) => c.toLowerCase().contains(t));
  }
}

class tela_dois extends StatefulWidget {
  final ValueNotifier<bool> temaEscuro;
  const tela_dois({super.key, required this.temaEscuro});

  @override
  State<tela_dois> createState() => _TelaDoisState();
}

class _TelaDoisState extends State<tela_dois> {
  final TextEditingController pesquisaController = TextEditingController();
  String busca = '';

  final List<Aluguel> _alugueis = const [
    Aluguel(
      nome: 'João Silva',
      carro: 'Onix 1.0',
      placa: 'ABC-1D23',
      cor: 'Prata',
      dataAluguel: '01/10/2026',
      dataEntrega: '08/10/2026',
    ),
    Aluguel(
      nome: 'Maria Souza',
      carro: 'HB20 Sense',
      placa: 'EFG-4H56',
      cor: 'Branco',
      dataAluguel: '03/10/2026',
      dataEntrega: '10/10/2026',
    ),
    Aluguel(
      nome: 'Carlos Lima',
      carro: 'Argo Drive',
      placa: 'IJK-7L89',
      cor: 'Preto',
      dataAluguel: '04/10/2026',
      dataEntrega: '06/10/2026',
    ),
  ];

  @override
  void dispose() {
    pesquisaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: widget.temaEscuro,
      builder: (context, escuro, _) {
        final p = escuro ? Paleta.escuro : Paleta.claro;
        final lista = _alugueis.where((a) => a.combina(busca)).toList();

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
                              'Carros alugados',
                              style: TextStyle(
                                color: p.texto,
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _barraPesquisa(p),
                            const SizedBox(height: 10),
                            Text(
                              '${lista.length} ${lista.length == 1 ? 'resultado' : 'resultados'}',
                              style: TextStyle(
                                  color: p.textoSuave, fontSize: 11),
                            ),
                            const SizedBox(height: 12),
                            Expanded(
                              child: lista.isEmpty
                                  ? _vazio(p)
                                  : LayoutBuilder(
                                      builder: (context, c) {
                                        return c.maxWidth < 700
                                            ? _listaCards(lista, p)
                                            : _tabela(lista, p);
                                      },
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
        hintText: 'Pesquisar por nome, carro, placa...',
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

  Widget _vazio(Paleta p) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.directions_car_outlined, size: 40, color: p.textoSuave),
          const SizedBox(height: 10),
          Text(
            'Nenhum aluguel encontrado',
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

  Widget _listaCards(List<Aluguel> lista, Paleta p) {
    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 20),
      itemCount: lista.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) => _cardAluguel(lista[i], p),
    );
  }

  Widget _cardAluguel(Aluguel a, Paleta p) {
    return Material(
      color: p.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: p.borda),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _abrirDetalhes(a, p),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: p.campo,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: p.bordaCampo),
                    ),
                    child: Icon(Icons.person_outline,
                        size: 20, color: p.destaque),
                  ),
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
                  _chipPlaca(a.placa, p),
                ],
              ),
              const SizedBox(height: 14),
              Divider(color: p.borda, height: 1),
              const SizedBox(height: 14),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: _info('Carro', a.carro, p)),
                  Expanded(child: _info('Cor', a.cor, p)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: _info('Data do aluguel', a.dataAluguel, p)),
                  Expanded(child: _info('Entrega do carro', a.dataEntrega, p)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _info(String rotulo, String valor, Paleta p) {
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
        const SizedBox(height: 3),
        Text(
          valor,
          style: TextStyle(
            color: p.texto,
            fontSize: 13.5,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _infoPlaca(String rotulo, String placa, Paleta p) {
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
        const SizedBox(height: 5),
        _chipPlaca(placa, p),
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

  Widget _tabela(List<Aluguel> lista, Paleta p) {
    const colunas = [
      'Nome',
      'Carro',
      'Placa',
      'Cor do carro',
      'Data do aluguel',
      'Data de entrega',
    ];
    const larguras = <int, TableColumnWidth>{
      0: FlexColumnWidth(2.2),
      1: FlexColumnWidth(1.8),
      2: FlexColumnWidth(1.4),
      3: FlexColumnWidth(1.4),
      4: FlexColumnWidth(1.6),
      5: FlexColumnWidth(1.6),
    };

    Widget celula(Widget child, {VoidCallback? onTap}) {
      final conteudo = Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: child,
      );
      return onTap == null ? conteudo : InkWell(onTap: onTap, child: conteudo);
    }

    final linhas = <TableRow>[
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
      for (final a in lista)
        TableRow(
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: p.borda)),
          ),
          children: [
            celula(
              Text(a.nome,
                  style: TextStyle(
                      color: p.texto,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700)),
              onTap: () => _abrirDetalhes(a, p),
            ),
            celula(
              Text(a.carro,
                  style: TextStyle(color: p.texto, fontSize: 13.5)),
              onTap: () => _abrirDetalhes(a, p),
            ),
            celula(
              Align(
                  alignment: Alignment.centerLeft,
                  child: _chipPlaca(a.placa, p)),
              onTap: () => _abrirDetalhes(a, p),
            ),
            celula(
              Text(a.cor, style: TextStyle(color: p.texto, fontSize: 13.5)),
              onTap: () => _abrirDetalhes(a, p),
            ),
            celula(
              Text(a.dataAluguel,
                  style: TextStyle(color: p.textoSuave, fontSize: 13.5)),
              onTap: () => _abrirDetalhes(a, p),
            ),
            celula(
              Text(a.dataEntrega,
                  style: TextStyle(color: p.textoSuave, fontSize: 13.5)),
              onTap: () => _abrirDetalhes(a, p),
            ),
          ],
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
          children: linhas,
        ),
      ),
    );
  }



  void _abrirDetalhes(Aluguel a, Paleta p) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Fechar',
      barrierColor: Colors.black.withOpacity(0.6),
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (ctx, _, __) => _modalDetalhes(ctx, a, p),
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

  Widget _modalDetalhes(BuildContext ctx, Aluguel a, Paleta p) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
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
                        'DETALHES DO ALUGUEL',
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
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: p.campo,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: p.bordaCampo),
                        ),
                        child: Icon(Icons.person_outline,
                            size: 24, color: p.destaque),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          a.nome,
                          style: TextStyle(
                            color: p.texto,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Divider(color: p.borda, height: 1),
                  const SizedBox(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _info('Carro', a.carro, p)),
                      Expanded(child: _infoPlaca('Placa', a.placa, p)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _info('Cor do carro', a.cor, p)),
                      const Expanded(child: SizedBox()),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Divider(color: p.borda, height: 1),
                  const SizedBox(height: 20),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                          child: _info('Data do aluguel', a.dataAluguel, p)),
                      Expanded(
                          child: _info('Data de entrega', a.dataEntrega, p)),
                    ],
                  ),
                  const SizedBox(height: 24),
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
}
