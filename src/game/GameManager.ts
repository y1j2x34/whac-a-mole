
const INITIAL_COUNT_DOWN = 5;

export default class GameManager extends Laya.Script {
    /** @prop {name:lblCountDownValue, tips: "倒计时", type: Node, default: null} */
    /** @prop {name:lblScoreValue, tips: "得分", type: Node, default: null} */
    /** @prop {name:dialogGameOver, tips: "游戏结束对话框", type: Node, default: null} */
    /** @prop {name:lblScoreCurrentValue, tips: "游戏结束对话框——当前分数", type: Node, default: null} */
    /** @prop {name:lblScoreHighestValue, tips: "游戏结束对话框——历史最高", type: Node, default: null} */

    private lblCountDownValue!: Laya.Text;
    private lblScoreValue!: Laya.Text;
    private dialogGameOver!: Laya.Sprite;
    private lblScoreCurrentValue!: Laya.Text;
    private lblScoreHighestValue!: Laya.Text;

    private isPlaying: boolean = false;
    private btnPlayAgain!: Laya.Button;

    private nScore = 0;
    private nCountDown = INITIAL_COUNT_DOWN;

    constructor() {
        super();
    }

    onAwake() {
        this.isPlaying = false;
    }

    onStart() {
        this.lblCountDownValue.text = this.nCountDown + '';
        this.btnPlayAgain = this.dialogGameOver.getChildByName('btnPlayAgain') as Laya.Button;
        this.btnPlayAgain.on(Laya.Event.MOUSE_DOWN, this, () => {
            this.dialogGameOver.visible = false;
            this.gameStart();
        });
        console.log('123456')
    }

    onDisable() {}

    onUpdate() {}

    gameStart() {
        this.isPlaying = true;
        this.setScore(0);
        this.setCountDown(INITIAL_COUNT_DOWN);

        Laya.timer.loop(1000, this, this.onOneCountDownFrame)
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
    }
}