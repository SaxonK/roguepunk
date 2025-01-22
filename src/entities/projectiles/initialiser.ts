import ProjectilePool from "./projectilePool";

const projectilePool = new ProjectilePool({ 
  name: "none",
  damage: 1,
  pierce: 0,
  range: 10,
  speed: 1,
  width: 10,
  height: 2,
  offset: {
    x: 0,
    y: 0
  }
});

export default projectilePool;