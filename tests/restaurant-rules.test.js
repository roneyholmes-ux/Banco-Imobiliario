const test = require('node:test');
const assert = require('node:assert/strict');

const game = require('../js/game.js');

const { getInitialMarketState, calculateObjectiveCard, createPlayer, applyFactorDelta, createObjectiveDeck, getActiveExternalCard, applyExternalEvent } = game;

function assertApproximately(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be approximately ${expected}`);
}

test('condições iniciais do restaurante', () => {
  const state = getInitialMarketState();
  assert.equal(state.internal.C, 3);
  assert.equal(state.internal.Ec, 2);
  assert.equal(state.internal.H, 8);
  assert.equal(state.internal.I, 60);
  assert.equal(state.internal.M, 3000);
  assert.equal(state.internal.V, 6);
  assert.equal(state.internal.Q, 3);
  assert.equal(state.external.b, 6);
  assert.equal(state.external.a, 20);
  assert.equal(state.external.t, 0.1);
  assert.equal(state.external.j, 0.12);

  const card1 = calculateObjectiveCard('Cozinha de alto rendimento', state.internal, state.external);
  assert.equal(card1.result, 72);
  assert.equal(card1.fulfilled, false);

  const card2 = calculateObjectiveCard('Salão preparado', state.internal, state.external);
  assert.equal(card2.result, 80);
  assert.equal(card2.fulfilled, false);

  const card3 = calculateObjectiveCard('Marca fortalecida', state.internal, state.external);
  assert.equal(card3.result, 15);
  assert.equal(card3.fulfilled, false);

  const card4 = calculateObjectiveCard('Frete inteligente', state.internal, state.external);
  assert.equal(card4.result, 150);
  assert.equal(card4.fulfilled, false);

  const card5 = calculateObjectiveCard('Margem bruta do lote-padrão', state.internal, state.external);
  assert.equal(card5.result, 800);
  assert.equal(card5.fulfilled, false);

  const card6 = calculateObjectiveCard('Capital enxuto', state.internal, state.external);
  assert.equal(card6.result, 960);
  assert.equal(card6.fulfilled, false);

  const card7 = calculateObjectiveCard('Receita potencial líquida', state.internal, state.external);
  assert.equal(card7.result, 1728);
  assert.equal(card7.fulfilled, false);

  const card8 = calculateObjectiveCard('Atratividade comercial', state.internal, state.external);
  assert.equal(card8.result, 14);
  assert.equal(card8.fulfilled, false);
});

test('interdependência global entre jogadores sem gerências', () => {
  const state = getInitialMarketState();
  const playerA = createPlayer('A');
  const playerB = createPlayer('B');
  const objectiveA = createObjectiveDeck()[0];

  let evaluated = calculateObjectiveCard(objectiveA.name, state.internal, state.external, { playerA, playerB, objective: objectiveA });
  assert.equal(evaluated.fulfilled, false);

  const updated = applyFactorDelta(state, 'Ec', 1, { objectiveDeck: createObjectiveDeck() });
  const after = calculateObjectiveCard(objectiveA.name, updated.internal, updated.external, { playerA, playerB, objective: objectiveA });
  assert.notEqual(after.result, evaluated.result);
});

test('caps e custos de intervenção respeitam os níveis e fichas', () => {
  const state = getInitialMarketState();
  const player = createPlayer('X');
  player.money = 5000;
  player.fichasDiscreta = 3;
  player.fichasContinua = 3;

  const before = state.internal.Ec;
  const after = applyFactorDelta(state, 'Ec', 1, { player, allowInvalidLevels: false });
  assert.equal(after.internal.Ec, before + 1);

  const invalid = applyFactorDelta(state, 'Ec', 10, { player, allowInvalidLevels: false });
  assert.equal(invalid.internal.Ec, state.internal.Ec);
  assert.equal(invalid.error, 'nível fora do intervalo permitido');
});

test('eventos de fluência substituem o efeito anterior sem acumular', () => {
  let market = getInitialMarketState();

  market = applyExternalEvent(market, 'Combustíveis', 'primeiro');
  assertApproximately(market.external.b, 6.6, 1e-9);
  const firstCard = calculateObjectiveCard('Frete inteligente', market.internal, market.external);
  assertApproximately(firstCard.result, 153, 1e-9);

  market = applyExternalEvent(market, 'Combustíveis', 'segundo');
  assertApproximately(market.external.b, 6.9, 1e-9);
  const secondCard = calculateObjectiveCard('Frete inteligente', market.internal, market.external);
  assertApproximately(secondCard.result, 154.5, 1e-9);

  market = applyExternalEvent(market, 'Política monetária', 'segundo');
  assertApproximately(market.external.j, 0.11, 1e-9);
});
