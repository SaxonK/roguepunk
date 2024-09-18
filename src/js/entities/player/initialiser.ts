import { PlayerConfig } from "../../utils/types/interfaces";
import ConfigPlayerDefault from "../../config/player/default.json";
import eventEmitter from "../../utils/events/initialiser";
import LevelSystem from "./levelSystem";
import Player from "./player";
import PlayerConfiguration from "./config";
import PlayerState from "./state";
import projectilePool from "../projectiles/initialiser";
import Stats from "./stats";

const playerConfig = new PlayerConfiguration(ConfigPlayerDefault.config as PlayerConfig);
const playerStats = new Stats(ConfigPlayerDefault.stats);
const levelSystem = new LevelSystem(0.1, eventEmitter);
levelSystem.setStartingExperience(ConfigPlayerDefault.state.startingExperience);
const playerState = new PlayerState(ConfigPlayerDefault.state, levelSystem);

const player: Player = new Player({
  config: playerConfig,
  stats: playerStats,
  state: playerState
}, eventEmitter, projectilePool);

export default player;