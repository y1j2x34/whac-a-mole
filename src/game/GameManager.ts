import { randInt } from '../common/Rand';
import Mouse from './Mouse';

const INITIAL_COUNT_DOWN = 30;
const MOUSE_OFFSET_X = -1;
const MOUSE_OFFSET_Y = -53;

export default class GameManager extends Laya.Script {
    /** @prop {name:containerHoles, tips: "地洞容器", type: Node, default: null} */
    /** @prop {name:lblCountDownValue, tips: "倒计时", type: Node, default: null} */
    /** @prop {name:lblScoreValue, tips: "得分", type: Node, default: null} */
    /** @prop {name:dialogGameOver, tips: "游戏结束对话框", type: Node, default: null} */
    /** @prop {name:lblScoreCurrentValue, tips: "游戏结束对话框——当前分数", type: Node, default: null} */
    /** @prop {name:lblScoreHighestValue, tips: "游戏结束对话框——历史最高", type: Node, default: null} */
    /** @prop {name:containerMouse, tips: "老鼠容器", type: Node, default: null} */
    /** @prop {name:prefabMouse, tips: "老鼠预制体", type: Prefab, default: null} */

    private lblCountDownValue!: Laya.Text;
    private lblScoreValue!: Laya.Text;
    private dialogGameOver!: Laya.Sprite;
    private lblScoreCurrentValue!: Laya.Text;
    private lblScoreHighestValue!: Laya.Text;
    private containerHoles!: Laya.Node;
    private containerMouse!: Laya.Node;
    private prefabMouse!: Laya.Prefab;

    private holes: Array<Laya.Image> = [];
    private arrMouse: Array<Laya.Node> = [];

    private isPlaying: boolean = false;
    private btnPlayAgain!: Laya.Button;

    private nScore = 0;
    private nCountDown = INITIAL_COUNT_DOWN;

    constructor() {
        super();
        debugger;
    }

    onAwake() {
        this.isPlaying = false;
    }

    onStart() {
        this.arrMouse.length = 0;
        this.holes = Array(this.containerHoles.numChildren).fill(0).map((_, index) => this.containerHoles.getChildAt(index) as Laya.Image);
        this.lblCountDownValue.text = this.nCountDown + '';
        this.btnPlayAgain = this.dialogGameOver.getChildByName('btnPlayAgain') as Laya.Button;
        this.btnPlayAgain.on(Laya.Event.MOUSE_DOWN, this, () => {
            this.dialogGameOver.visible = false;
            this.gameStart();
        });
    }

    onDisable() {}

    onUpdate() {}

    gameStart() {
        this.isPlaying = true;
        this.setScore(0);
        this.setCountDown(INITIAL_COUNT_DOWN);

        Laya.timer.loop(1000, this, this.onOneCountDownFrame);
        Laya.timer.once(1000, this, this.onGenerateMouse);
    }
    onGenerateMouse() {
        if(!this.isPlaying) {
            return;
        }
        this.clearMouse();
        const numMouse = randInt(1, 6);
        const holes = this.holes.slice(0).sort(() => {
            return Math.random() < 0.5 ? -1 : 1;
        }).slice(numMouse);
       const mouses = Array(numMouse).fill(0).map((_, i) => {
            return this.prefabMouse.create() as Laya.Image;
        });
        this.arrMouse.push(...mouses);
        mouses.forEach(mouse => {
            this.containerMouse.addChild(mouse);
            const hole = holes.pop();
            mouse.pos(
                hole.x + MOUSE_OFFSET_X,
                hole.y + MOUSE_OFFSET_Y
            );
            const compMouse = mouse.getComponent(Mouse) as Mouse;
            compMouse.show();
        })

        Laya.timer.once(1000, this, this.onGenerateMouse);
    }
    
    onOneCountDownFrame() {
        this.setCountDown(this.nCountDown - 1);
        if(this.nCountDown <= 0) {
            this.gameOver();
        }
    }
    setCountDown(value: number) {
        this.nCountDown = value;
        this.lblCountDownValue.text = value + '';
    }
    setScore(value: number) {
        this.nScore = value;
        this.lblScoreCurrentValue.text = value + '';
    }
    gameOver() {
        this.dialogGameOver.visible = true;
        this.isPlaying = false;
        Laya.timer.clear(this, this.onOneCountDownFrame);
        this.clearMouse();
    }
    clearMouse() {
        this.arrMouse.forEach(it => {
            this.containerMouse.removeChild(it);
        });
        this.arrMouse.length = 0;
    }
}