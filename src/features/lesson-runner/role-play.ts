import type { RolePlayTurn } from '@/types/domain';

export type RolePlayGraph = readonly RolePlayTurn[];

export function findTurn(graph: RolePlayGraph, turnId: string): RolePlayTurn {
  const turn = graph.find((candidate) => candidate.id === turnId);
  if (!turn) throw new Error(`Unknown role-play turn: ${turnId}`);
  return turn;
}

export function getChoices(graph: RolePlayGraph, promptTurnId: string): RolePlayTurn[] {
  return findTurn(graph, promptTurnId).nextTurnIds.map((id) => findTurn(graph, id));
}

export function resolveChoice(
  graph: RolePlayGraph,
  chosenTurnId: string,
): { chosen: RolePlayTurn; feedback: RolePlayTurn } {
  const chosen = findTurn(graph, chosenTurnId);
  const [feedbackTurnId] = chosen.nextTurnIds;
  if (!feedbackTurnId) {
    throw new Error(`Role-play turn "${chosenTurnId}" has no feedback turn to advance to.`);
  }
  return { chosen, feedback: findTurn(graph, feedbackTurnId) };
}
