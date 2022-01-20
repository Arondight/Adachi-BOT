/* @preserve
/* -----------------------------------------------
/* Author : Vincent Garreau  - vincentgarreau.com
/* MIT license: http://opensource.org/licenses/MIT
/* Demo / Generator : vincentgarreau.com/particles.js
/* GitHub : github.com/VincentGarreau/particles.js
/* How to use? : Check the GitHub README
/* v2.0.0
/* ----------------------------------------------- 
/*
/* Modified: Mark Chen
/*  - stripped code blocks that would never be used
/*    in current project
/*  - rewrote some declaration parts
/* @endpreserve */

class pJS {
  constructor(tag_id, params) {
    const canvas_el = document.querySelector("#" + tag_id + " > .particles-js-canvas-el");

    /* particles.js variables with default values */
    this.pJS = {
      canvas: {
        el: canvas_el,
        w: canvas_el.offsetWidth,
        h: canvas_el.offsetHeight,
      },
      particles: {
        number: {
          value: 400,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#fff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#ff0000",
          },
        },
        opacity: {
          value: 1,
          random: false,
        },
        size: {
          value: 20,
          random: false,
        },
        line_linked: {
          enable: true,
          distance: 100,
          color: "#fff",
          opacity: 1,
          width: 1,
        },
        array: [],
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          resize: true,
        },
      },
      retina_detect: false,
      fn: {
        interact: {},
        modes: {},
        vendors: {},
      },
      tmp: {},
    };

    const pJS = this.pJS;

    /* params settings */
    if (params) {
      Object.deepExtend(pJS, params);
    }

    /* ---------- pJS functions - canvas ------------ */
    pJS.fn.canvasInit = function () {
      pJS.canvas.ctx = pJS.canvas.el.getContext("2d");
    };

    pJS.fn.canvasSize = function () {
      pJS.canvas.el.width = pJS.canvas.w;
      pJS.canvas.el.height = pJS.canvas.h;

      if (pJS && pJS.interactivity.events.resize) {
        window.addEventListener("resize", function () {
          pJS.canvas.el.width = pJS.canvas.w = pJS.canvas.el.offsetWidth;
          pJS.canvas.el.height = pJS.canvas.h = pJS.canvas.el.offsetHeight;

          /* repaint canvas */
          pJS.fn.particlesEmpty();
          pJS.fn.particlesCreate();
          pJS.fn.particlesDraw();
          pJS.fn.vendors.densityAutoParticles();
        });
      }
    };

    pJS.fn.canvasPaint = function () {
      pJS.canvas.ctx.fillRect(0, 0, pJS.canvas.w, pJS.canvas.h);
    };

    pJS.fn.canvasClear = function () {
      pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
    };

    /* --------- pJS functions - particles ----------- */
    pJS.fn.particle = function (color, opacity, position) {
      /* size */
      this.radius = (pJS.particles.size.random ? Math.random() : 1) * pJS.particles.size.value;

      /* position */
      this.x = position ? position.x : Math.random() * pJS.canvas.w;
      this.y = position ? position.y : Math.random() * pJS.canvas.h;

      /* check position  - into the canvas */
      if (this.x > pJS.canvas.w - this.radius * 2) this.x = this.x - this.radius;
      else if (this.x < this.radius * 2) this.x = this.x + this.radius;
      if (this.y > pJS.canvas.h - this.radius * 2) this.y = this.y - this.radius;
      else if (this.y < this.radius * 2) this.y = this.y + this.radius;

      /* color */
      this.color = color;
      this.color.rgb = hexToRgb(this.color.value);

      /* opacity */
      this.opacity = (pJS.particles.opacity.random ? Math.random() : 1) * pJS.particles.opacity.value;

      this.shape = pJS.particles.shape.type;
    };

    pJS.fn.particle.prototype.draw = function () {
      const p = this;
      const radius = p.radius_bubble != undefined ? p.radius_bubble : p.radius;
      const opacity = p.opacity_bubble != undefined ? p.opacity_bubble : p.opacity;
      const color_value = "rgba(" + p.color.rgb.r + "," + p.color.rgb.g + "," + p.color.rgb.b + "," + opacity + ")";

      pJS.canvas.ctx.fillStyle = color_value;
      pJS.canvas.ctx.beginPath();

      pJS.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);

      pJS.canvas.ctx.closePath();

      if (pJS.particles.shape.stroke.width > 0) {
        pJS.canvas.ctx.strokeStyle = pJS.particles.shape.stroke.color;
        pJS.canvas.ctx.lineWidth = pJS.particles.shape.stroke.width;
        pJS.canvas.ctx.stroke();
      }

      pJS.canvas.ctx.fill();
    };

    pJS.fn.particlesCreate = function () {
      for (let i = 0; i < pJS.particles.number.value; i++) {
        pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color, pJS.particles.opacity.value));
      }
    };

    pJS.fn.particlesUpdate = function () {
      for (let i = 0; i < pJS.particles.array.length; i++) {
        /* the particle */
        const p = pJS.particles.array[i];

        /* interaction auto between particles */
        if (pJS.particles.line_linked.enable) {
          for (let j = i + 1; j < pJS.particles.array.length; j++) {
            const p2 = pJS.particles.array[j];

            /* link particles */
            if (pJS.particles.line_linked.enable) {
              pJS.fn.interact.linkParticles(p, p2);
            }
          }
        }
      }
    };

    pJS.fn.particlesDraw = function () {
      /* clear canvas */
      pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);

      /* update each particles param */
      pJS.fn.particlesUpdate();

      /* draw each particle */
      for (let i = 0; i < pJS.particles.array.length; i++) {
        const p = pJS.particles.array[i];
        p.draw();
      }
    };

    pJS.fn.particlesEmpty = function () {
      pJS.particles.array = [];
    };

    pJS.fn.particlesRefresh = function () {
      /* init all */
      pJS.fn.particlesEmpty();
      pJS.fn.canvasClear();

      /* restart */
      pJS.fn.vendors.start();
    };

    /* ---------- pJS functions - particles interaction ------------ */
    pJS.fn.interact.linkParticles = function (p1, p2) {
      const dx = p1.x - p2.x,
        dy = p1.y - p2.y,
        dist = Math.sqrt(dx * dx + dy * dy);

      /* draw a line between p1 and p2 if the distance between them is under the config distance */
      if (dist <= pJS.particles.line_linked.distance) {
        const opacity_line =
          pJS.particles.line_linked.opacity -
          dist / (1 / pJS.particles.line_linked.opacity) / pJS.particles.line_linked.distance;

        if (opacity_line > 0) {
          /* style */
          const color_line = pJS.particles.line_linked.color_rgb_line;
          pJS.canvas.ctx.strokeStyle =
            "rgba(" + color_line.r + "," + color_line.g + "," + color_line.b + "," + opacity_line + ")";
          pJS.canvas.ctx.lineWidth = pJS.particles.line_linked.width;
          //pJS.canvas.ctx.lineCap = 'round'; /* performance issue */
          /* path */
          pJS.canvas.ctx.beginPath();
          pJS.canvas.ctx.moveTo(p1.x, p1.y);
          pJS.canvas.ctx.lineTo(p2.x, p2.y);
          pJS.canvas.ctx.stroke();
          pJS.canvas.ctx.closePath();
        }
      }
    };

    /* ---------- pJS functions - modes events ------------ */
    pJS.fn.modes.pushParticles = function (nb, pos) {
      pJS.tmp.pushing = true;

      for (let i = 0; i < nb; i++) {
        pJS.particles.array.push(
          new pJS.fn.particle(pJS.particles.color, pJS.particles.opacity.value, {
            x: pos ? pos.pos_x : Math.random() * pJS.canvas.w,
            y: pos ? pos.pos_y : Math.random() * pJS.canvas.h,
          })
        );
        if (i == nb - 1) {
          pJS.fn.particlesDraw();
          pJS.tmp.pushing = false;
        }
      }
    };

    pJS.fn.modes.removeParticles = function (nb) {
      pJS.particles.array.splice(0, nb);
    };

    /* ---------- pJS functions - vendors ------------ */
    pJS.fn.vendors.densityAutoParticles = function () {
      if (pJS.particles.number.density.enable) {
        /* calc area */
        let area = (pJS.canvas.el.width * pJS.canvas.el.height) / 1000;


        /* calc number of particles based on density area */
        let nb_particles = (area * pJS.particles.number.value) / pJS.particles.number.density.value_area;

        /* add or remove X particles */
        let missing_particles = pJS.particles.array.length - nb_particles;
        if (missing_particles < 0) pJS.fn.modes.pushParticles(Math.abs(missing_particles));
        else pJS.fn.modes.removeParticles(missing_particles);
      }
    };

    pJS.fn.vendors.checkOverlap = function (p1, position) {
      for (let i = 0; i < pJS.particles.array.length; i++) {
        const p2 = pJS.particles.array[i];

        const dx = p1.x - p2.x,
          dy = p1.y - p2.y,
          dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= p1.radius + p2.radius) {
          p1.x = position ? position.x : Math.random() * pJS.canvas.w;
          p1.y = position ? position.y : Math.random() * pJS.canvas.h;
          pJS.fn.vendors.checkOverlap(p1);
        }
      }
    };

    pJS.fn.vendors.draw = function () {
      pJS.fn.particlesDraw();
    };

    pJS.fn.vendors.checkBeforeDraw = function () {
      pJS.fn.vendors.init();
      pJS.fn.vendors.draw();
    };

    pJS.fn.vendors.init = function () {
      /* init canvas + particles */
      pJS.fn.canvasInit();
      pJS.fn.canvasSize();
      pJS.fn.canvasPaint();
      pJS.fn.particlesCreate();
      pJS.fn.vendors.densityAutoParticles();

      /* particles.line_linked - convert hex colors to rgb */
      pJS.particles.line_linked.color_rgb_line = hexToRgb(pJS.particles.line_linked.color);
    };

    pJS.fn.vendors.start = function () {
      pJS.fn.vendors.checkBeforeDraw();
    };

    /* ---------- pJS - start ------------ */
    pJS.fn.vendors.start();
  }
}

/* ---------- global functions - vendors ------------ */

Object.deepExtend = function (destination, source) {
  for (const property in source) {
    if (source[property] && source[property].constructor && source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

function hexToRgb(hex) {
  // By Tim Down - http://stackoverflow.com/a/5624139/3493650
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/* ---------- particles.js functions - start ------------ */

window.pJSDom = [];

window.particlesJS = function (tag_id, params) {
  /* pJS elements */
  const pJS_tag = document.getElementById(tag_id),
    pJS_canvas_class = "particles-js-canvas-el",
    exist_canvas = pJS_tag.getElementsByClassName(pJS_canvas_class);

  /* remove canvas if exists into the pJS target tag */
  if (exist_canvas.length) {
    while (exist_canvas.length > 0) {
      pJS_tag.removeChild(exist_canvas[0]);
    }
  }

  /* create canvas element */
  const canvas_el = document.createElement("canvas");
  canvas_el.className = pJS_canvas_class;

  /* set size canvas */
  canvas_el.style.width = "100%";
  canvas_el.style.height = "100%";

  /* append canvas */
  const canvas = document.getElementById(tag_id).appendChild(canvas_el);

  /* launch particle.js */
  if (canvas != null) {
    window.pJSDom.push(new pJS(tag_id, params));
  }
};

window.particlesJS(
  "particles-js",

  {
    particles: {
      number: {
        value: 29,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
        polygon: {
          nb_sides: 5,
        },
        image: {
          src: "img/github.svg",
          width: 100,
          height: 100,
        },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: false,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 32.06824121731046,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 78.91476416322726,
        color: "#c5c5c5",
        opacity: 0.2966312312601217,
        width: 1,
      },
      move: {
        enable: false,
        speed: 6,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: false,
          mode: "repulse",
        },
        onclick: {
          enable: false,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: false,
  }
);
