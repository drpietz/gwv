import _ from 'lodash';
import Board from './Board';
import GameState from "./GameState";
import Game from "./Game";
import ControlPanel from "./ControlPanel";
import GameInputListener from "./GameInputListener";
import customInput from './customInput';

const game = new Game(new GameState(_.chunk(_.range(1, 17), 4)));
const board = new Board(game.getState());
const controlPanel = new ControlPanel(game);
const gameInputListener = new GameInputListener();

game.onChange(() => {
	board.setState(game.getState())
});

gameInputListener.onTransition(transition => game.transition(transition));
controlPanel.onHint(() => game.hint());
controlPanel.onRestart(() => game.restart());
controlPanel.onInput(() => {
	const currentState = game.getState().getState();
	customInput(currentState).then(field => game.setState(new GameState(field)))
});
