import { Game } from './game/Game';

const root = document.getElementById('app');
if (!root) throw new Error('#app mount not found');
const game = new Game();
game.init(root);
