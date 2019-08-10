// SUPER GAME ENGINE 3000

const SPIN = new function () {
    let SPIN = this,
        cnv, ctx, width, height, nodes = [], node_count = 0, for_destroy = {},
        down_keys = {}, timer = 0, user_draw;

    let $ = (id) => {return document.getElementById(id)};

    let rect = (x, y, w, h, clr) => {
        ctx.fillStyle = clr;
        ctx.fillRect(x, y, w, h);
    };

    let text = (x, y, clr, text) => {
        ctx.fillStyle = clr;
        ctx.fillText(text, x, y);
    };

    class Node {
        constructor (x, y, w, h, clr, upd) {
            this.id = node_count++;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.clr = clr;
            this.update = upd;
            nodes.push(this);
        }

        _update () {
            if (this.update)
                this.update(this);
        }

        draw () {
            rect(this.x, this.y, this.w, this.h, this.clr);
        }

        destroy () {
            for_destroy[this.id] = this;
        }

        move (x, y) {
            this.x += x;
            this.y += y;
        }

        intersect (node) {
            return !(this.x+this.w < node.x || this.y+this.h < node.y || this.x > node.x+node.w || this.y > node.y+node.h);
        }
    }

    SPIN.create_node = (x, y, w, h, clr, upd) => {
        return new Node(x, y, w, h, clr, upd);
    };

    SPIN.draw_text = (x, y, clr, _text) => {
        text(x, y, clr, _text);
    };







    SPIN.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length-1; i >= 0; i--) {
            if (for_destroy[nodes[i].id]) {
                nodes.splice(i, 1);
                continue;
            }
            nodes[i]._update();
            nodes[i].draw();
        }
        if (user_draw)
            user_draw(SPIN);
        requestAnimationFrame(SPIN.update);
        timer++;
    };

    SPIN.key = (key) => {
        return down_keys[key];
    };

    SPIN.clear_timer = () => {
        timer = 0;
    };

    SPIN.get_timer = () => {
        return timer;
    };

    SPIN.set_draw = (f) => {
        user_draw = f;
    };

    SPIN.start = (W, H) => {
        cnv = $('cnv');
        ctx = cnv.getContext('2d');
        width = W;
        height = H;
        cnv.width = width;
        cnv.height = height;
        ctx.textBaseline = 'top';
        ctx.font = '20px Troika';

        window.addEventListener('keydown', (e) => {
            down_keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            delete down_keys[e.code];
        });

        SPIN.update();
    };
};

window.addEventListener('load', function () {
    SPIN.start(640, 480);

    let enemies = [], score = 0;

    let enemy_ai = (node) => {
        node.y += 0.1;
    };

    let bullet_ai = (node) => {
        node.y -= 5;
        if (node.y+node.h < 0)
            node.destroy();
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (node.intersect(enemies[i])) {
                enemies[i].destroy();
                node.destroy();
                enemies.splice(i, 1);
                score += 1;
                break;
            }
        }
    };

    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 10; i++) {
            enemies.push(SPIN.create_node(30 + (20 + 40) * i, 20 + (20 + 40) * j, 40, 40, '#ff6d5a', enemy_ai));
        }
    }

    let fire = (x, y) => {
        if (SPIN.get_timer() > 10) {
            SPIN.create_node(x, y, 10, 20, '#14ff00', bullet_ai);
            SPIN.clear_timer();
        }
    };

    SPIN.create_node(640/2-25, 480-50-30, 50, 50, '#64c858', (node) => {
        if (SPIN.key('KeyA'))
            node.x -= 1;
        if (SPIN.key('KeyD'))
            node.x += 1;
        if (SPIN.key('Space'))
            fire(node.x+25-5, node.y);
    });

    SPIN.set_draw((s) => {
        s.draw_text(640/2-60, 5, '#8cff00', 'Игровой счет: '+score);
    });
});