

export default class Mouse extends Laya.Script {
    

    constructor() {
        super();
    }

    onAwake() {
    }

    onStart() {
    }

    onDisable() {}

    onUpdate() {}

    show() {
        const owner = (this.owner as Laya.Image);
        owner.scaleX = 0;
        owner.scaleY = 0;
        const fromY = owner.y + owner.height;
        const toY = owner.y;
        const fromX = owner.x + owner.width / 2;
        const toX = owner.x;

        owner.x = fromX;
        owner.y = fromY;
        Laya.TimeLine.to(owner, {
            scaleY: 1,
            scaleX: 1,
            x: toX,
            y: toY
        }, 200)
        .to(owner, {
            scaleX: 0,
            scaleY: 0,
            x: fromX, 
            y: fromY
        }, 100, null, 500)
        .play(0, false);
    }
    hide() {
        const owner = (this.owner as Laya.Image);
        const toY = owner.y + owner.height;
        const toX = owner.x + owner.width / 2;
        const timeline = Laya.TimeLine.to(owner, {
            scaleY: 0,
            scaleX: 0,
            x: toX,
            y: toY
        }, 200);
        timeline.play(0, false);
        return new Promise(resolve => {
            timeline.once(Laya.Event.COMPLETE, null, resolve);
        });
    }
}