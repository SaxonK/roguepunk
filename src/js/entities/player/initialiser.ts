import { PlayerConfig } from "../../utils/types/interfaces";
import AnimationHandler from "../../core/animation/animate";
import ConfigPlayerDefault from "../../config/player/default.json";
import eventEmitter from "../../utils/events/initialiser";
import LevelSystem from "./levelSystem";
import Player from "./player";
import PlayerConfiguration from "./config";
import PlayerState from "./state";
import projectilePool from "../projectiles/initialiser";
import Stats from "./stats";

const startingPosition = {
  x: ConfigPlayerDefault.state.position.x,
  y: ConfigPlayerDefault.state.position.y
};
const playerConfig = new PlayerConfiguration(ConfigPlayerDefault.config as PlayerConfig);
const playerStats = new Stats(ConfigPlayerDefault.stats);
const levelSystem = new LevelSystem(0.1, eventEmitter);
levelSystem.setStartingExperience(ConfigPlayerDefault.state.startingExperience);
const playerState = new PlayerState(ConfigPlayerDefault.state, levelSystem);
const playerObject = {
  config: playerConfig,
  stats: playerStats,
  state: playerState
};
const animationHandler = new AnimationHandler(playerObject.config, startingPosition);

const player: Player = new Player(
  playerObject,
  animationHandler,
  eventEmitter,
  projectilePool
);

export default player;