console.log("Ex1ExtraRobertM");
//enum controls
const directions = {
    LEFT: Symbol('left'),
    UP: Symbol('up'),
    RIGHT: Symbol('right'),
    DOWN: Symbol('down')
};

//player object
const player = {
    name: "Mario",
    health: 2,
    hasPowerUp: true,
    jump: function(direction){
        let movement = "";
        switch(direction)
        {
            case directions.LEFT: 
                movement = "left";
                break;
            case directions.UP:
                movement = "up";
                break;
            case directions.RIGHT:
                movement = "right";
                break;
            case directions.LEFT:
                movement = "left";
                break;
            default:
                movement = "into a coin block";
                break;
        }
        return `${this.name} jumped ${movement}!`;
    }
};

console.log("player's type:", typeof player);
for(property in player) console.log(property);
console.log("\ndirections' type:", typeof directions);
for(dir in directions) console.log(dir);
console.log("\n", player.jump(directions.RIGHT));