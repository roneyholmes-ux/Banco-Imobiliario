const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const rules = require('../js/rules.js');

const {
  GAME_CONFIG,
  RESTAURANT_RULESET,
  EXTERNAL_KEYS,
  getInitialMarketState,
  getInternalValues,
  calculateObjective,
  evaluateAllObjectives,
  formatObjectiveValue,
  formatExternalValue,
  assignObjectiveCards,
  createPlayerState,
  createBoardSpaces,
  applyIntervention,
  validateIntervention,
  getInterventionCost,
  getVisitFee,
  getSpaceVisitFee,
  purchaseManagement,
  releaseManagements,
  applyMandatoryCharge,
  applyFluencyCard,
  drawFluencyCard,
  getCurrentSemester,
  stepPlayerForward,
  startNewYearMarket,
  resolveTurnAdvance,
  resolveAnnualClosing,
  buildFinalStandings,
  createRequestDeduper
} = rules;

// Tabela da especificação (seção 3), usada para conferir a configuração do jogo.
const SPEC = {
  C: { values: [2, 3, 4, 5], initialLevel: 1, ficha: 'discreta', price: 3500, fee: 350, to2: [800, 1], to3: [1400, 2] },
  Ec: { values: [1, 2, 3, 4], initialLevel: 1, ficha: 'discreta', price: 4000, fee: 400, to2: [1200, 1], to3: [2000, 2] },
  Es: { values: [3, 4, 5, 6], initialLevel: 1, ficha: 'discreta', price: 3200, fee: 320, to2: [900, 1], to3: [1500, 2] },
  M: { values: [1000, 2000, 3000, 4000], initialLevel: 2, ficha: 'continua', price: 3500, fee: 350, to2: [1000, 1], to3: [1700, 2] },
  P: { values: [37, 40, 43, 46], initialLevel: 1, ficha: 'continua', price: 4000, fee: 400, to2: [700, 1], to3: [1100, 2] },
  V: { values: [4, 5, 6, 7], initialLevel: 2, ficha: 'discreta', price: 2800, fee: 280, to2: [650, 1], to3: [1100, 2] },
  S: { values: [80, 100, 120, 140], initialLevel: 1, ficha: 'continua', price: 3800, fee: 380, to2: [900, 1], to3: [1500, 2] },
  Q: { values: [1, 2, 3, 4], initialLevel: 2, ficha: 'discreta', price: 3000, fee: 300, to2: [800, 1], to3: [1300, 2] },
  N: { values: [2, 3, 4, 5], initialLevel: 1, ficha: 'discreta', price: 3300, fee: 330, to2: [850, 1], to3: [1400, 2] },
  H: { values: [6, 8, 10, 12], initialLevel: 1, ficha: 'continua', price: 3300, fee: 330, to2: [800, 1], to3: [1300, 2] },
  I: { values: [40, 60, 70, 80], initialLevel: 1, ficha: 'continua', price: 3000, fee: 300, to2: [750, 1], to3: [1250, 2] }
};

function setup(playerCount = 3) {
  const players = Array.from({ length: playerCount }, (_, i) => createPlayerState({ id: i, name: `Jogador ${i + 1}` }));
  assignObjectiveCards(players);
  return { market: getInitialMarketState(), players, boardSpaces: createBoardSpaces(), currentPlayerId: 0, turnLocked: false };
}

const spaceOf = (ctx, key) => ctx.boardSpaces.find(space => space.factorKey === key);
const objectiveResult = (ctx, id) => calculateObjective(id, ctx.market);

function assertApproximately(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Esperado ${expected}, obtido ${actual}`);
}

describe('Teste A — Estado inicial', () => {
  test('as oito fórmulas começam com os valores da especificação e nenhuma está cumprida', () => {
    const expected = { CR: 72, SP: 80, MF: 15, FI: 150, MB: 800, CE: 960, RP: 1728, AC: 14 };
    const results = evaluateAllObjectives(getInitialMarketState());
    assert.equal(results.length, 8);
    results.forEach(result => {
      assertApproximately(result.result, expected[result.symbol]);
      assert.equal(result.fulfilled, false, `${result.symbol} não deveria começar cumprido`);
    });
  });

  test('11 fatores internos com valores de nível e nível inicial da especificação', () => {
    const market = getInitialMarketState();
    assert.deepEqual(Object.keys(RESTAURANT_RULESET.internal).sort(), Object.keys(SPEC).sort());
    const internal = getInternalValues(market);
    Object.entries(SPEC).forEach(([key, spec]) => {
      assert.deepEqual(RESTAURANT_RULESET.internal[key].values, spec.values, key);
      assert.equal(market.levels[key], spec.initialLevel, key);
      assert.equal(internal[key], spec.values[spec.initialLevel], key);
      assert.equal(RESTAURANT_RULESET.internal[key].ficha, spec.ficha, key);
    });
  });

  test('os jogadores começam sem fichas (configuração editável) e a partida aceita no máximo 4 jogadores', () => {
    assert.equal(GAME_CONFIG.maxJogadores, 4);
    const player = createPlayerState({ id: 0, name: 'A' });
    assert.equal(player.fichasContinua, 0);
    assert.equal(player.fichasDiscreta, 0);
    const custom = createPlayerState({ id: 1, name: 'B' }, { ...GAME_CONFIG, fichasIniciaisContinua: 5, fichasIniciaisDiscreta: 1 });
    assert.equal(custom.fichasContinua, 5);
    assert.equal(custom.fichasDiscreta, 1);
  });
});

describe('Teste B — Compartilhamento', () => {
  test('a Carta 1 de quem não gerencia Ec é recalculada quando outro jogador altera Ec', () => {
    const ctx = setup();
    const [holder, manager] = ctx.players;
    assert.equal(holder.objective.id, 1);
    spaceOf(ctx, 'Ec').owner = manager.id;
    manager.fichasDiscreta = 1;
    ctx.currentPlayerId = manager.id;

    assert.equal(objectiveResult(ctx, holder.objective.id).result, 72);
    const intervention = applyIntervention(ctx, manager.id, 'Ec', 1);
    assert.ok(intervention.ok, intervention.error);
    assert.equal(objectiveResult(ctx, holder.objective.id).result, 108);
    assert.equal(ctx.boardSpaces.filter(space => space.owner === holder.id).length, 0);
  });

  test('um jogador sem nenhuma gerência pode vencer graças à intervenção de outro', () => {
    const ctx = setup();
    const [holder, manager] = ctx.players;
    spaceOf(ctx, 'C').owner = manager.id;
    spaceOf(ctx, 'Ec').owner = manager.id;
    manager.fichasDiscreta = 10;
    ctx.currentPlayerId = manager.id;

    assert.ok(applyIntervention(ctx, manager.id, 'C', 1).ok);
    assert.ok(applyIntervention(ctx, manager.id, 'Ec', 2).ok);
    const card = objectiveResult(ctx, holder.objective.id);
    assert.equal(card.result, 192);
    assert.equal(card.fulfilled, true);

    const outcome = resolveAnnualClosing(ctx.players, ctx.market);
    assert.equal(outcome.type, 'winner');
    assert.equal(outcome.winners[0].id, holder.id);
    assert.equal(holder.money, GAME_CONFIG.startingMoney);
  });

  test('vários jogadores podem cumprir o objetivo com a mesma intervenção', () => {
    const ctx = setup();
    const [a, manager, c] = ctx.players;
    a.objective = { id: 1 };
    c.objective = { id: 1 };
    spaceOf(ctx, 'C').owner = manager.id;
    spaceOf(ctx, 'Ec').owner = manager.id;
    manager.fichasDiscreta = 10;
    ctx.currentPlayerId = manager.id;
    applyIntervention(ctx, manager.id, 'C', 1);
    applyIntervention(ctx, manager.id, 'Ec', 2);
    c.money += 100;

    const outcome = resolveAnnualClosing(ctx.players, ctx.market);
    assert.equal(outcome.results.filter(entry => entry.objective.fulfilled).length, 2);
    assert.equal(outcome.type, 'winner');
    assert.equal(outcome.reason, 'objective-money');
    assert.equal(outcome.winners[0].id, c.id);
  });
});

describe('Teste C — Intervenções', () => {
  function managerOfC() {
    const ctx = setup();
    const manager = ctx.players[1];
    spaceOf(ctx, 'C').owner = manager.id;
    ctx.currentPlayerId = manager.id;
    return { ctx, manager };
  }

  test('um não gerente não pode modificar fator alheio, mesmo na própria vez', () => {
    const { ctx } = managerOfC();
    const outsider = ctx.players[2];
    ctx.currentPlayerId = outsider.id;
    const result = applyIntervention(ctx, outsider.id, 'C', 1);
    assert.equal(result.ok, false);
    assert.match(result.error, /Somente o gerente/);
    assert.equal(ctx.market.levels.C, 1);
  });

  test('o gerente não intervém fora da própria vez, com ação em andamento ou no Fechamento do Exercício', () => {
    const { ctx, manager } = managerOfC();
    ctx.currentPlayerId = 0;
    assert.match(applyIntervention(ctx, manager.id, 'C', 1).error, /própria vez/);
    ctx.currentPlayerId = manager.id;
    ctx.turnLocked = true;
    assert.match(applyIntervention(ctx, manager.id, 'C', 1).error, /Aguarde/);
    ctx.turnLocked = false;
    manager.finishedYear = true;
    assert.match(applyIntervention(ctx, manager.id, 'C', 1).error, /Fechamento do Exercício/);
    assert.equal(ctx.market.levels.C, 1);
  });

  test('intervenção sem dinheiro ou sem fichas suficientes é rejeitada sem alterar nada', () => {
    const { ctx, manager } = managerOfC();
    manager.money = 799;
    let result = applyIntervention(ctx, manager.id, 'C', 1);
    assert.equal(result.ok, false);
    assert.match(result.error, /Saldo insuficiente/);

    manager.money = 5000;
    manager.fichasDiscreta = 0;
    result = applyIntervention(ctx, manager.id, 'C', 1);
    assert.equal(result.ok, false);
    assert.match(result.error, /Fichas insuficientes/);
    assert.equal(manager.money, 5000);
    assert.equal(ctx.market.levels.C, 1);
  });

  test('nenhuma alteração ultrapassa os níveis 0 e 3', () => {
    const { ctx, manager } = managerOfC();
    manager.fichasDiscreta = 20;
    assert.match(applyIntervention(ctx, manager.id, 'C', 3).error, /Nível fora do intervalo/);
    ctx.market.levels.C = 3;
    assert.match(applyIntervention(ctx, manager.id, 'C', 1).error, /Nível fora do intervalo/);
    ctx.market.levels.C = 0;
    assert.match(applyIntervention(ctx, manager.id, 'C', -1).error, /Nível fora do intervalo/);
    assert.equal(ctx.market.levels.C, 0);
  });

  test('custos: 0→1 igual a 1→2, vários níveis cobram os intermediários e redução custa R$ 400 + 1 ficha sem devolução', () => {
    assert.deepEqual(getInterventionCost('C', 0, 1), getInterventionCost('C', 1, 2));
    const { ctx, manager } = managerOfC();
    manager.money = 2200;
    manager.fichasDiscreta = 3;
    const up = applyIntervention(ctx, manager.id, 'C', 2);
    assert.ok(up.ok, up.error);
    assert.equal(manager.money, 0);
    assert.equal(manager.fichasDiscreta, 0);
    assert.equal(ctx.market.levels.C, 3);
    assert.equal(up.change.fromValue, 3);
    assert.equal(up.change.toValue, 5);

    manager.money = 800;
    manager.fichasDiscreta = 2;
    const down = applyIntervention(ctx, manager.id, 'C', -2);
    assert.ok(down.ok, down.error);
    assert.equal(down.change.direction, 'down');
    assert.equal(manager.money, 0);
    assert.equal(manager.fichasDiscreta, 0);
    assert.equal(ctx.market.levels.C, 1);
  });

  test('fator contínuo consome ficha contínua', () => {
    const ctx = setup();
    const manager = ctx.players[0];
    spaceOf(ctx, 'M').owner = manager.id;
    manager.fichasContinua = 2;
    manager.fichasDiscreta = 2;
    const result = applyIntervention(ctx, manager.id, 'M', 1);
    assert.ok(result.ok, result.error);
    assert.equal(manager.fichasContinua, 0);
    assert.equal(manager.fichasDiscreta, 2);
    assert.equal(manager.money, GAME_CONFIG.startingMoney - 1700);
  });
});

describe('Teste D — Metas', () => {
  test('operador ≥ cumpre na igualdade', () => {
    const market = getInitialMarketState();
    market.levels.C = 3;
    market.levels.Ec = 2;
    const card = calculateObjective(1, market);
    assert.equal(card.result, 180);
    assert.equal(card.fulfilled, true);
  });

  test('operador ≤ cumpre na igualdade e falha acima da meta', () => {
    const market = getInitialMarketState();
    market.levels.I = 0;
    market.levels.S = 2;
    assert.equal(calculateObjective(4, market).result, 90);
    assert.equal(calculateObjective(4, market).fulfilled, true);
    market.external.b = 6.2;
    assertApproximately(calculateObjective(4, market).result, 91);
    assert.equal(calculateObjective(4, market).fulfilled, false);

    const capital = getInitialMarketState();
    capital.levels.Ec = 0;
    capital.levels.Es = 0;
    assertApproximately(calculateObjective(6, capital).result, 600);
    assert.equal(calculateObjective(6, capital).fulfilled, true);
  });

  test('a comparação usa o valor numérico antes do arredondamento de exibição', () => {
    const market = getInitialMarketState();
    market.levels.P = 3;
    market.levels.I = 0;
    market.external.a = 25.0001;
    const card = calculateObjective(5, market);
    assert.ok(card.result < 1300);
    assert.equal(formatObjectiveValue(card, card.result), 'R$ 1.300');
    assert.equal(card.fulfilled, false);
  });
});

describe('Teste E — Mercado', () => {
  test('os quatro fatores externos existem desde o início com os valores-base', () => {
    const market = getInitialMarketState();
    assert.deepEqual(Object.keys(market.external), EXTERNAL_KEYS);
    assert.deepEqual(market.external, { b: 6, a: 20, t: 0.10, j: 0.12 });
    assert.deepEqual(EXTERNAL_KEYS.map(key => formatExternalValue(key, market.external[key])), ['R$ 6,00', 'R$ 20,00', '10%', '12%']);
  });

  test('não existem casas de compra para fatores externos; há exatamente 11 casas de fatores internos', () => {
    const spaces = createBoardSpaces();
    assert.equal(spaces.length, 24);
    const externalNames = EXTERNAL_KEYS.map(key => RESTAURANT_RULESET.external[key].name);
    spaces.forEach(space => {
      assert.ok(!EXTERNAL_KEYS.includes(space.factorKey), `casa ${space.id} usa fator externo`);
      assert.ok(!externalNames.includes(space.name), `casa ${space.id} tem nome de fator externo`);
    });
    const factorKeys = spaces.filter(space => space.factorKey).map(space => space.factorKey).sort();
    assert.deepEqual(factorKeys, Object.keys(RESTAURANT_RULESET.internal).sort());
  });

  test('cada lado do tabuleiro tem uma Sorte ou Revés e um Centro de Observação; a Multa da Vigilância Sanitária substitui a Taxa de Luxo', () => {
    const spaces = createBoardSpaces();
    [[1, 5], [7, 11], [13, 17], [19, 23]].forEach(([first, last]) => {
      const side = spaces.slice(first, last + 1);
      assert.equal(side.filter(space => space.name === 'Sorte ou Revés').length, 1, `lado ${first}-${last}`);
      assert.equal(side.filter(space => space.type === 'station').length, 1, `lado ${first}-${last}`);
    });
    assert.equal(spaces.filter(space => space.name === 'Revisão Operacional' || space.name === 'Taxa de Luxo').length, 0);
    assert.equal(spaces[23].name, 'Multa da Vigilância Sanitária');
    assert.equal(GAME_CONFIG.multaVigilanciaSanitaria, 1000);
  });

  test('um evento altera o indicador e os objetivos dependentes são recalculados', () => {
    let market = getInitialMarketState();
    market = applyFluencyCard(market, 'Combustíveis', 'primeiro');
    assert.equal(market.external.b, 6.6);
    assertApproximately(calculateObjective(4, market).result, 153);
    assert.deepEqual(market.levels, getInitialMarketState().levels);
  });

  test('o novo evento substitui o anterior sem acumular percentuais', () => {
    let market = applyFluencyCard(getInitialMarketState(), 'Combustíveis', 'primeiro');
    market = applyFluencyCard(market, 'Combustíveis', 'segundo');
    assert.equal(market.external.b, 6.9);
    assert.equal(market.previousExternal.b, 6.6);
    assertApproximately(calculateObjective(4, market).result, 154.5);

    market = applyFluencyCard(market, 'Política monetária', 'segundo');
    assert.equal(market.external.b, 6);
    assert.equal(market.external.j, 0.11);
  });

  test('Economia (2º semestre) leva os juros a 13% e Política econômica muda o imposto', () => {
    const economy = applyFluencyCard(getInitialMarketState(), 'Economia', 'segundo');
    assert.equal(economy.external.j, 0.13);
    assert.equal(economy.external.a, 22);
    assertApproximately(calculateObjective(6, economy).result, 1040);

    const tax = applyFluencyCard(getInitialMarketState(), 'Politica economica', 'primeiro');
    assert.equal(tax.external.t, 0.09);
    assertApproximately(calculateObjective(7, tax).result, 6 * 40 * 8 * 0.91);
  });

  test('nove Cartas de Fluência, cada uma com texto e efeito para os dois semestres', () => {
    assert.equal(RESTAURANT_RULESET.fluencyCards.length, 9);
    RESTAURANT_RULESET.fluencyCards.forEach(card => {
      ['first', 'second'].forEach(semester => {
        assert.ok(card[semester].text.length > 10, `${card.name} sem texto`);
        assert.ok(Object.keys({ ...card[semester].percent, ...card[semester].set }).length > 0, `${card.name} sem efeito`);
      });
    });
  });
});

describe('Teste F — Semestres', () => {
  test('só a passagem de todos os jogadores ativos inicia o segundo semestre', () => {
    const { players } = setup();
    players[0].passedFestaJunina = true;
    players[1].passedFestaJunina = true;
    assert.equal(getCurrentSemester(players), 'primeiro');
    players[2].passedFestaJunina = true;
    assert.equal(getCurrentSemester(players), 'segundo');
  });

  test('jogador eliminado que não passou pela Festa Junina não impede o segundo semestre', () => {
    const { players } = setup();
    players[0].passedFestaJunina = true;
    players[1].passedFestaJunina = true;
    players[2].isBankrupt = true;
    assert.equal(getCurrentSemester(players), 'segundo');
  });

  test('basta passar pela Festa Junina, sem parar nela', () => {
    const ctx = setup();
    const player = ctx.players[0];
    player.position = 4;
    for (let i = 0; i < 5; i++) stepPlayerForward(player, ctx.boardSpaces);
    assert.equal(player.position, 9);
    assert.equal(player.passedFestaJunina, true);
  });

  test('a carta ativa não muda retroativamente; o efeito do segundo semestre vale no sorteio seguinte', () => {
    const { players } = setup();
    let market = drawFluencyCard(getInitialMarketState(), players, () => 0);
    assert.equal(market.activeCard.id, 'combustiveis');
    assert.equal(market.activeCard.semester, 'primeiro');
    players.forEach(player => { player.passedFestaJunina = true; });
    assert.equal(market.activeCard.semester, 'primeiro');
    assert.equal(market.external.b, 6.6);
    market = drawFluencyCard(market, players, () => 0);
    assert.equal(market.activeCard.semester, 'segundo');
    assert.equal(market.external.b, 6.9);
  });
});

describe('Teste G — Financeiro', () => {
  test('preços, taxas iniciais e custos de intervenção conferem com a especificação', () => {
    const spaces = createBoardSpaces();
    Object.entries(SPEC).forEach(([key, spec]) => {
      assert.equal(spaces.find(space => space.factorKey === key).price, spec.price, `${key} preço`);
      assert.equal(getVisitFee(key, spec.initialLevel), spec.fee, `${key} taxa inicial`);
      const to2 = getInterventionCost(key, 1, 2);
      const to3 = getInterventionCost(key, 2, 3);
      assert.deepEqual([to2.money, to2.fichas], spec.to2, `${key} 1→2`);
      assert.deepEqual([to3.money, to3.fichas], spec.to3, `${key} 2→3`);
      const down = getInterventionCost(key, 2, 1);
      assert.deepEqual([down.money, down.fichas], [400, 1], `${key} redução`);
    });
  });

  test('taxa de visita: +50% por nível acima do inicial e piso de 50% abaixo dele', () => {
    assert.equal(getVisitFee('M', 2), 350);
    assert.equal(getVisitFee('V', 2), 280);
    assert.equal(getVisitFee('Q', 2), 300);
    assert.equal(getVisitFee('M', 3), 525);
    assert.equal(getVisitFee('C', 2), 525);
    assert.equal(getVisitFee('C', 3), 700);
    assert.equal(getVisitFee('C', 0), 175);
    assert.equal(getVisitFee('M', 1), 175);
    assert.equal(getVisitFee('M', 0), 175);
    const ctx = setup();
    ctx.market.levels.C = 3;
    assert.equal(getSpaceVisitFee(spaceOf(ctx, 'C'), ctx.market), 700);
  });

  test('Centros de Observação com valores na faixa das casas de fatores (R$ 3.000; taxa R$ 300)', () => {
    const ctx = setup();
    const centers = ctx.boardSpaces.filter(space => space.type === 'station');
    assert.equal(centers.length, 4);
    centers.forEach(center => {
      assert.equal(center.price, 3000);
      assert.equal(getSpaceVisitFee(center, ctx.market), 300);
    });
  });

  test('saldo negativo por cobrança obrigatória elimina na hora e libera as gerências sem mudar os fatores', () => {
    const ctx = setup();
    const player = ctx.players[0];
    spaceOf(ctx, 'C').owner = player.id;
    ctx.boardSpaces[8].owner = player.id;
    ctx.market.levels.C = 3;

    player.money = 1000;
    const exact = applyMandatoryCharge(player, GAME_CONFIG.multaVigilanciaSanitaria, ctx.boardSpaces);
    assert.equal(exact.eliminated, false);
    assert.equal(player.money, 0);

    const negative = applyMandatoryCharge(player, GAME_CONFIG.cardFichaPenalty, ctx.boardSpaces);
    assert.equal(negative.eliminated, true);
    assert.equal(player.isBankrupt, true);
    assert.equal(negative.released.length, 2);
    assert.equal(spaceOf(ctx, 'C').owner, null);
    assert.equal(ctx.boardSpaces[8].owner, null);
    assert.equal(ctx.market.levels.C, 3);
  });

  test('aquisição cobra o preço uma única vez e uma gerência não é vendida duas vezes', () => {
    const ctx = setup();
    const [a, b] = ctx.players;
    const space = spaceOf(ctx, 'P');
    assert.ok(purchaseManagement(ctx, a.id, space.id).ok);
    assert.equal(a.money, GAME_CONFIG.startingMoney - 4000);
    const again = purchaseManagement(ctx, b.id, space.id);
    assert.equal(again.ok, false);
    assert.equal(b.money, GAME_CONFIG.startingMoney);
    assert.equal(space.owner, a.id);
  });

  test('balanceamento: o investimento mínimo para cumprir cada carta a partir do estado inicial fica abaixo de R$ 8.000', (t) => {
    const initial = getInitialMarketState();
    RESTAURANT_RULESET.objectiveCards.forEach(card => {
      const internalFactors = card.factors.filter(symbol => RESTAURANT_RULESET.internal[symbol]);
      let best = Infinity;
      const combinations = 4 ** internalFactors.length;
      for (let code = 0; code < combinations; code++) {
        const market = getInitialMarketState();
        let cost = 0;
        let rest = code;
        internalFactors.forEach(symbol => {
          const level = rest % 4;
          rest = Math.floor(rest / 4);
          if (level !== initial.levels[symbol]) cost += getInterventionCost(symbol, initial.levels[symbol], level).money;
          market.levels[symbol] = level;
        });
        if (calculateObjective(card.id, market).fulfilled) best = Math.min(best, cost);
      }
      t.diagnostic(`${card.symbol} (${card.name}): investimento mínimo R$ ${best}`);
      assert.ok(best > 0 && best <= 8000, `${card.symbol}: ${best}`);
    });
  });
});

describe('Teste H — Ano', () => {
  test('quando o último jogador conclui o ano, o fechamento vem antes de qualquer nova Carta de Fluência', () => {
    const { players } = setup();
    players[0].finishedYear = true;
    players[1].finishedYear = true;
    players[2].finishedYear = true;
    const advance = resolveTurnAdvance(players, 2);
    assert.equal(advance.type, 'closeYear');
  });

  test('ciclo comum termina quando todos os ativos jogaram e jogadores concluídos não ganham turnos', () => {
    const { players } = setup();
    players[1].finishedYear = true;
    assert.deepEqual(resolveTurnAdvance(players, 0), { type: 'nextPlayer', nextIndex: 2 });
    assert.deepEqual(resolveTurnAdvance(players, 2), { type: 'cycleEnd', nextIndex: 0 });
  });

  test('cobrança anual de R$ 2.000 só acontece quando não há vencedor, e o imposto t não cobra dinheiro', () => {
    const noWinner = setup();
    noWinner.market = applyFluencyCard(noWinner.market, 'Política econômica', 'segundo');
    assert.equal(noWinner.market.external.t, 0.11);
    assert.ok(noWinner.players.every(player => player.money === GAME_CONFIG.startingMoney));
    const outcome = resolveAnnualClosing(noWinner.players, noWinner.market);
    assert.equal(outcome.type, 'newYear');
    assert.ok(noWinner.players.every(player => player.money === GAME_CONFIG.startingMoney - 2000));

    const withWinner = setup();
    withWinner.market.levels.C = 3;
    withWinner.market.levels.Ec = 2;
    const winnerOutcome = resolveAnnualClosing(withWinner.players, withWinner.market);
    assert.equal(winnerOutcome.type, 'winner');
    assert.equal(winnerOutcome.charged, false);
    assert.ok(withWinner.players.every(player => player.money === GAME_CONFIG.startingMoney));
  });

  test('quem não consegue pagar é eliminado; sobrevivência, ausência de sobreviventes e empate', () => {
    const survivor = setup();
    survivor.players[0].money = 1999;
    survivor.players[1].money = 500;
    assert.equal(resolveAnnualClosing(survivor.players, survivor.market).type, 'survivor');

    const none = setup(2);
    none.players.forEach(player => { player.money = 100; });
    assert.equal(resolveAnnualClosing(none.players, none.market).type, 'noSurvivors');

    const tie = setup();
    tie.players[0].objective = { id: 1 };
    tie.players[1].objective = { id: 1 };
    tie.market.levels.C = 3;
    tie.market.levels.Ec = 2;
    const tieOutcome = resolveAnnualClosing(tie.players, tie.market);
    assert.equal(tieOutcome.type, 'tie');
    assert.equal(tieOutcome.winners.length, 2);
  });

  test('no novo ano o mercado volta à base, o evento termina e os fatores internos mantêm os níveis', () => {
    let market = getInitialMarketState();
    market.levels.C = 3;
    market = applyFluencyCard(market, 'Clima', 'segundo');
    const next = startNewYearMarket(market);
    assert.deepEqual(next.external, { b: 6, a: 20, t: 0.10, j: 0.12 });
    assert.equal(next.activeCard, null);
    assert.equal(next.levels.C, 3);
  });

  test('resumo final: vencedores primeiro, ativos por dinheiro e eliminados por último', () => {
    const ctx = setup(4);
    ctx.players[0].money = 1000;
    ctx.players[1].money = 9000;
    ctx.players[2].isBankrupt = true;
    ctx.players[3].money = 5000;
    ctx.market.levels.C = 3;
    ctx.market.levels.Ec = 2;
    const standings = buildFinalStandings(ctx.players, ctx.market, [0]);
    assert.deepEqual(standings.map(row => row.id), [0, 1, 3, 2]);
    assert.equal(standings[0].winner, true);
    assert.equal(standings[0].objective.resultText, 'CR = 180 pratos por dia');
    assert.equal(standings[0].objective.targetText, 'meta ≥ 180 pratos por dia');
    assert.equal(standings[0].objective.fulfilled, true);
    assert.equal(standings[3].eliminated, true);
  });
});

describe('Teste I — Aquisição', () => {
  test('gerência de fator é adquirida ao parar na casa pelo preço integral, sem fichas e sem mudar o nível', () => {
    const ctx = setup();
    const player = ctx.players[0];
    const space = spaceOf(ctx, 'Ec');
    const result = purchaseManagement(ctx, player.id, space.id);
    assert.ok(result.ok, result.error);
    assert.equal(space.owner, player.id);
    assert.equal(player.money, GAME_CONFIG.startingMoney - 4000);
    assert.equal(player.fichasDiscreta, 0);
    assert.equal(player.fichasContinua, 0);
    assert.equal(ctx.market.levels.Ec, 1);
  });

  test('Centro de Observação também é adquirido pelo preço integral', () => {
    const ctx = setup();
    const station = ctx.boardSpaces[8];
    assert.ok(purchaseManagement(ctx, 0, station.id).ok);
    assert.equal(station.owner, 0);
    assert.equal(ctx.players[0].money, GAME_CONFIG.startingMoney - 3000);
  });

  test('uma gerência adquirida não fica disponível para outro jogador; sem saldo a compra é recusada', () => {
    const ctx = setup();
    const space = spaceOf(ctx, 'S');
    assert.ok(purchaseManagement(ctx, 0, space.id).ok);
    const again = purchaseManagement(ctx, 1, space.id);
    assert.equal(again.ok, false);
    assert.match(again.error, /já possui gerente/);
    assert.equal(ctx.players[1].money, GAME_CONFIG.startingMoney);

    ctx.players[2].money = 2999;
    const poor = purchaseManagement(ctx, 2, spaceOf(ctx, 'Q').id);
    assert.equal(poor.ok, false);
    assert.match(poor.error, /Saldo insuficiente/);
    assert.equal(spaceOf(ctx, 'Q').owner, null);
  });

  test('casas especiais não podem ser adquiridas', () => {
    const ctx = setup();
    [0, 2, 6, 12, 18, 22, 23].forEach(id => {
      assert.equal(purchaseManagement(ctx, 0, id).ok, false, `casa ${id}`);
    });
  });

  test('eliminação libera as gerências sem redefinir o nível do fator', () => {
    const ctx = setup();
    spaceOf(ctx, 'C').owner = 0;
    spaceOf(ctx, 'M').owner = 0;
    ctx.market.levels.C = 3;
    const released = releaseManagements(ctx.boardSpaces, 0);
    assert.equal(released.length, 2);
    assert.equal(spaceOf(ctx, 'C').owner, null);
    assert.equal(ctx.market.levels.C, 3);
  });
});

describe('Teste J — Multiplayer (simulação da lógica do Host; sem conexão P2P)', () => {
  test('clientes que recebem o estado sincronizado calculam as mesmas fórmulas que o Host', () => {
    const host = setup();
    const manager = host.players[1];
    spaceOf(host, 'H').owner = manager.id;
    manager.fichasContinua = 1;
    host.currentPlayerId = manager.id;
    assert.ok(applyIntervention(host, manager.id, 'H', 1).ok);
    host.market = applyFluencyCard(host.market, 'Turismo', 'segundo');

    const payload = JSON.stringify({ players: host.players, marketState: host.market });
    const clientA = JSON.parse(payload);
    const clientB = JSON.parse(payload);
    const hostResults = evaluateAllObjectives(host.market).map(result => result.result);
    assert.deepEqual(evaluateAllObjectives(clientA.marketState).map(result => result.result), hostResults);
    assert.deepEqual(evaluateAllObjectives(clientB.marketState).map(result => result.result), hostResults);
    assert.deepEqual(clientA.players.map(player => player.objective), host.players.map(player => player.objective));
  });

  test('requisições repetidas (mesmo requestId) são descartadas', () => {
    const isDuplicate = createRequestDeduper();
    assert.equal(isDuplicate('peer-1-1'), false);
    assert.equal(isDuplicate('peer-1-1'), true);
    assert.equal(isDuplicate('peer-1-2'), false);
    assert.equal(isDuplicate(undefined), false);
  });

  test('controle de turno: o gerente não intervém na vez de outro jogador', () => {
    const ctx = setup();
    spaceOf(ctx, 'V').owner = 2;
    ctx.currentPlayerId = 0;
    const result = validateIntervention(ctx, 2, 'V', 1);
    assert.equal(result.ok, false);
    assert.match(result.error, /própria vez/);
  });

  test('negociação (troca de gerente) não altera os valores globais', () => {
    const ctx = setup();
    const before = JSON.stringify(ctx.market);
    spaceOf(ctx, 'Q').owner = 0;
    spaceOf(ctx, 'Q').owner = 1;
    assert.equal(JSON.stringify(ctx.market), before);
  });
});
