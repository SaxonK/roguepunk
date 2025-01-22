import { Events } from "../types/types";
import EventEmitter from "./eventEmitter";

const eventEmitter = new EventEmitter<Events>();

export default eventEmitter;