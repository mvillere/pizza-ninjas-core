// SOURCE: https://app.pizzapets.fun/content/24fbdb7b48e092461c1578d2fc2c819524aa25d338bdba3fa30b8c42f02f3c8bi0
// V2 NOTE: This is a reinscription of the draw sat.

export async function draw(a, o, r) {
  const B = 0xff655aca2025;
  const l = {
    getQueryParam: (e) => {
      const t = new URLSearchParams(window.location.search);
      return t.get(e);
    },
    clear: () => {
      y.clearRect(0, 0, c, d);
    },
    clearLoadedSnesGame: (e = {}) => {
      l.setSnesErrorMessage();
      l.resetSnesCustomRomInputs();
      b = null;
      Fe.elements.forEach((e) => e.classList.remove("selected"));
      A.value = null;
      l.hide(A);
      if (e.skipResetBehavior) {
        return;
      }
      S.disabled = true;
      C.classList.remove("snes-loaded-game");
      S.classList.remove("snes-button-loaded");
      C.innerText = "";
    },
    inscriptionJoin: (e) => {
      return pt(e, { fetch: o.fetch.bind(o) });
    },
    setSnesLoadedGameInfo: (e) => {
      C.classList.add("snes-loaded-game");
      S.classList.add("snes-button-loaded");
      C.innerText = e;
    },
    setSnesErrorMessage: (e) => {
      const t = l.isSnesCustomRomScreenActive() ? Xe : Ge;
      t.innerText = e || "";
      if (e) {
        l.show(t);
      } else {
        l.hide(t);
      }
    },
    snesLoadInscriptionsFor: (t) => {
      return l.inscriptionJoin(t.inscriptionIds).then((e) => {
        b = { name: t.name, data: e, base64: false, encrypted: !!t.encrypted };
        l.setSnesLoadedGameInfo(t.name);
        S.disabled = false;
        if (t.encrypted) {
          l.show(A);
        }
        return e;
      });
    },
    resetSnesCustomRomInputs: (e) => {
      e = e || {};
      if (!e.skipFileInput) {
        We.value = "";
      }
      Ke.value = "";
      D.checked = false;
      D.disabled = true;
      et.classList.add("disabled");
      tt.disabled = true;
    },
    fetchSnesGames: async () => {
      const e = await o.getLatestInscriptionIdForSat(B);
      return await o.fetchJsonFor(e);
    },
    isValidJson: (e) => {
      try {
        JSON.parse(e);
      } catch (e) {
        return false;
      }
      return true;
    },
    isSnesControlsScreenActive: () => {
      return x.classList.contains("active") && E.style.display !== "none";
    },
    isSnesCustomRomScreenActive: () => {
      return x.classList.contains("active") && v.style.display !== "none";
    },
    showLoader: (e, t = {}) => {
      X.innerText = e;
      if (t.progress) {
        l.show(V);
      } else {
        l.hide(V);
      }
      l.show(M);
    },
    showMenu: () => {
      l.show(L);
    },
    hideMenu: () => {
      l.goToMenu("main-menu");
      l.hide(L);
      g.appendChild(h);
      if (He) {
        l.show(I);
        l.hide(E);
        l.hide(v);
        rt();
      }
    },
    show: (e, t = "flex") => {
      e.style.display = t;
    },
    hide: (e) => {
      e.style.display = "none";
    },
    addSticker: (e) => {
      U = e;
      l.clear();
      l.applyBackground();
      z();
    },
    removeSticker: () => {
      U = null;
      l.clear();
      l.applyBackground();
      z();
    },
    applyBackground: () => {
      if (l.getQueryParam("background") !== "none") {
        y.fillStyle = p;
        y.fillRect(0, 0, c, d);
      }
    },
    stopAnimation: () => {
      pe.style.display = "none";
      Ae.style.display = "block";
      h.style.display = "block";
      if (t) {
        t.style.display = "none";
      }
    },
    resetAnimation: () => {
      l.stopAnimation();
      V.innerText = "0%";
      if (t) {
        t.remove();
      }
      if (u) {
        u.abort();
        m = false;
        Mt();
      }
    },
    resizeCanvas: (e, t) => {
      h.height = t;
      h.width = e;
      h.style.maxWidth = e + "px";
      c = e;
      d = t;
      l.clear();
      l.applyBackground();
      z();
      if (m) {
        l.stopAnimation();
      }
    },
    updateAnimation: async (e) => {
      o.fetchJsonFor(e)
        .then((e) => {
          Q = e;
        })
        .catch((e) => {
          throw e;
        });
    },
    getCurrentAnimationObject: () => {
      return Q;
    },
    goToMenu: (e) => {
      const t = document.getElementsByClassName("menu");
      ge.style.display = e === "main-menu" ? "none" : "block";
      for (let e = 0; e < t.length; e++) {
        t[e].classList.remove("active");
      }
      document.getElementById(e).classList.add("active");
    },
    createArrowIcon: (e) => {
      return l.createElem("img", e, (e) => {
        e.src = _;
      });
    },
    createElem: (e, t, n) => {
      const i = document.createElement(e);
      if (t) {
        i.id = t;
      }
      if (n) {
        n(i);
      }
      return i;
    },
    createButton: (e, t, n) => {
      const i = document.createElement("button");
      i.innerText = e;
      i.classList.add("button");
      if (n) {
        n(i);
      }
      if (t) {
        i.addEventListener("click", (e) => {
          t(i, e);
        });
      }
      return i;
    },
    isInIframe: () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        console.log("Error checking iframe status:", e);
        console.log("Assuming page is in iframe!");
        return true;
      }
    },
    isGifActive: () => {
      const e = document.getElementById("gif");
      if (!e) return false;
      return e.style.display === "block";
    },
    loadJS: (e, t = true, n = () => {}) => {
      let i = document.createElement("script");
      i.setAttribute("src", e);
      i.setAttribute("type", "text/javascript");
      i.setAttribute("async", t.toString());
      document.body.appendChild(i);
      i.addEventListener("load", n);
      i.addEventListener("error", (e) => {
        console.log("Error on loading file", e);
      });
    },
    scrollModalToBottom: () => {
      L.scroll({ top: L.scrollHeight, behavior: "smooth" });
    },
    simpleMarkdown: (e) => {
      e = e.replace(/\r\n/g, "\n");
      e = e.replace(
        /\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g,
        '<pre><code title="$1">$2</code></pre>'
      );
      e = e.replace(
        /\n``` *(.*?)\n([\s\S]*?)\n```/g,
        '<pre><code title="$1">$2</code></pre>'
      );
      var t = "",
        n = e.split("pre>");
      for (var i = 0; i < n.length; i++) {
        if (n[i].substr(-2) === "</") {
          t += "<pre>" + n[i] + "pre>";
        } else {
          t += n[i]
            .replace(/(.*)<$/, "$1")
            .replace(/^##### (.*?)\s*#*$/gm, "<h5>$1</h5>")
            .replace(/^#### (.*?)\s*#*$/gm, "<h4>$1</h4>")
            .replace(/^### (.*?)\s*#*$/gm, "<h3>$1</h3>")
            .replace(/^## (.*?)\s*#*$/gm, "<h2>$1</h2>")
            .replace(/^# (.*?)\s*#*$/gm, "<h1>$1</h1>")
            .replace(/^-{3,}|^\_{3,}|^\*{3,}/gm, "<hr/>")
            .replace(/``(.*?)``/gm, "<code>$1</code>")
            .replace(/`(.*?)`/gm, "<code>$1</code>")
            .replace(
              /^\>> (.*$)/gm,
              "<blockquote><blockquote>$1</blockquote></blockquote>"
            )
            .replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>")
            .replace(/<\/blockquote\>\n<blockquote\>/g, "\n<br>")
            .replace(/<\/blockquote\>\n<br\><blockquote\>/g, "\n<br>")
            .replace(
              /!\[(.*?)\]\((.*?) "(.*?)"\)/gm,
              '<img alt="$1" src="$2" $3 />'
            )
            .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" />')
            .replace(
              /\[(.*?)\]\((.*?) "(.*?)"\)/gm,
              '<a href="$2" title="$3">$1</a>'
            )
            .replace(/<http(.*?)\>/gm, '<a href="http$1">http$1</a>')
            .replace(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
            .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
            .replace(/^[\*|+|-][ |.](.*)/gm, "<ul><li>$1</li></ul>")
            .replace(/<\/ul\>\n<ul\>/g, "\n")
            .replace(/^\d[ |.](.*)/gm, "<ol><li>$1</li></ol>")
            .replace(/<\/ol\>\n<ol\>/g, "\n")
            .replace(/\*\*\*(.*)\*\*\*/gm, "<b><em>$1</em></b>")
            .replace(/\*\*(.*)\*\*/gm, "<b>$1</b>")
            .replace(/\*([\w \d]*)\*/gm, "<em>$1</em>")
            .replace(/___(.*)___/gm, "<b><em>$1</em></b>")
            .replace(/__(.*)__/gm, "<u>$1</u>")
            .replace(/_([\w \d]*)_/gm, "<em>$1</em>")
            .replace(/~~(.*)~~/gm, "<del>$1</del>")
            .replace(/\^\^(.*)\^\^/gm, "<ins>$1</ins>")
            .replace(/ +\n/g, "\n<br/>")
            .replace(/\n\s*\n/g, "\n<p>\n")
            .replace(/^ {4,10}(.*)/gm, "<pre><code>$1</code></pre>")
            .replace(/^\t(.*)/gm, "<pre><code>$1</code></pre>")
            .replace(/<\/code\><\/pre\>\n<pre\><code\>/g, "\n")
            .replace(/\\([`_\\\*\+\-\.\(\)\[\]\{\}])/gm, "$1");
        }
      }
      return t.trim();
    },
    calculateEaster: (e) => {
      const t = e % 19,
        n = Math.floor(e / 100),
        i = e % 100,
        a = Math.floor(n / 4),
        s = n % 4,
        o = Math.floor((n + 8) / 25),
        r = Math.floor((n - o + 1) / 3),
        l = (19 * t + n - a - r + 15) % 30,
        c = Math.floor(i / 4),
        d = i % 4,
        p = (32 + 2 * s + 2 * c - l - d) % 7,
        u = Math.floor((t + 11 * l + 22 * p) / 451),
        m = Math.floor((l + p - 7 * u + 114) / 31),
        g = ((l + p - 7 * u + 114) % 31) + 1;
      return new Date(e, m - 1, g);
    },
    get_new_moons: (e) => {
      const t = 29.5305888531;
      let n = e.getFullYear();
      let i = e.getMonth() + 1;
      let a = e.getDate();
      if (i <= 2) {
        n -= 1;
        i += 12;
      }
      let s = Math.floor(n / 100),
        o = Math.floor(s / 4),
        r = 2 - s + o,
        l = Math.floor(365.25 * (n + 4716)),
        c = Math.floor(30.6001 * (i + 1)),
        d = r + a + l + c - 1524.5,
        p = d - 2451549.5,
        u = p / t,
        m = (u % 1) * t;
      return u;
    },
    in_chinese_new_year: (e) => {
      return Math.floor(l.get_new_moons(e)) >
        Math.floor(l.get_new_moons(new Date(e.getFullYear(), 0, 20)))
        ? 1
        : 0;
    },
    calculateChineseNewYear: (n) => {
      for (let t = 0; t <= 30; ++t) {
        let e = new Date(n, 0, 1);
        e.setDate(21 + t);
        if (l.in_chinese_new_year(e)) return e;
      }
    },
    isWithinHolidayPeriod: () => {
      const t = new Date();
      const n = t.getFullYear();
      const i = [
        { key: "new_years_day", month: 0, day: 1, hoursBefore: 32 },
        {
          key: "chinese_new_year",
          date: l.calculateChineseNewYear(n),
          hoursBefore: 32,
        },
        { key: "valentines_day", month: 1, day: 14, hoursBefore: 32 },
        { key: "st_patricks_day", month: 2, day: 17, hoursBefore: 32 },
        { key: "easter_day", date: l.calculateEaster(n), hoursBefore: 32 },
        {
          key: "april_fools_day",
          month: 3,
          day: 1,
          hoursBefore: 2,
          hoursAfter: 2,
        },
        { key: "bitcoin_pizza_day", month: 4, day: 22, hoursBefore: 32 },
        { key: "ordinals_birthday", month: 0, day: 20, hoursBefore: 32 },
        { key: "halloween", month: 9, day: 31, hoursBefore: 32 },
        { key: "christmas_day", month: 11, day: 25, hoursBefore: 32 },
      ];
      for (let e of i) {
        const a = e.date || new Date(n, e.month, e.day);
        const s = new Date(a);
        s.setHours(s.getHours() - e.hoursBefore);
        const o = new Date(a);
        if (e.hoursAfter) {
          o.setHours(o.getHours() + e.hoursAfter);
        } else {
          o.setHours(24);
        }
        if (t >= s && t <= o) {
          return e.key;
        }
      }
      return false;
    },
  };
  const Y = "1";
  window[r.project] = {
    applyHoliday: (e) => {
      ht = e;
      l.clear();
      l.applyBackground();
      z();
    },
  };
  const P =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzAgMzAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0xOCAxNSAyOS40IDMuNmMuOC0uOC44LTIuMiAwLTMtLjgtLjgtMi4yLS44LTMgMEwxNSAxMiAzLjcuNmMtLjgtLjgtMi4yLS44LTMgMC0uOC44LS44IDIuMiAwIDNMMTIgMTUgLjYgMjYuNGMtLjguOC0uOCAyLjIgMCAzIC44LjggMi4yLjggMyAwTDE1IDE4bDExLjMgMTEuNGMuOC44IDIuMi44IDMgMCAuOC0uOC44LTIuMiAwLTNMMTggMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+";
  const _ =
    "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBkPSJNMTUsMjMuNmMtMC41LDAtMS4xLTAuMi0xLjUtMC42TDAuNiwxMGMtMC44LTAuOC0wLjgtMi4yLDAtM2MwLjgtMC44LDIuMi0wLjgsMywwTDE1LDE4LjVMMjYuNCw3LjEgYzAuOC0wLjgsMi4yLTAuOCwzLDBjMC44LDAuOCwwLjgsMi4yLDAsM0wxNi41LDIyLjlDMTYuMSwyMy4zLDE1LjUsMjMuNiwxNSwyMy42eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K";
  const G =
    "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBkPSJNMTUsMjBjLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNi42LTYuOWMtMC42LTAuNi0wLjEtMS42LDAuNy0xLjZoMy40VjQuMWMwLTAuOSwwLjctMS42LDEuNi0xLjZoMy4xIGMwLjksMCwxLjYsMC43LDEuNiwxLjZ2Ny4yaDMuNGMwLjgsMCwxLjIsMSwwLjcsMS42bC02LjYsNi45QzE1LjUsMTkuOSwxNS4zLDIwLDE1LDIweiIgZmlsbD0iY3VycmVudENvbG9yIiAvPgoJPHBhdGggZD0iTTI3LjgsMjcuNUgyLjJjLTEuMiwwLTIuMi0xLTIuMi0yLjJ2LTAuNmMwLTEuMiwxLTIuMiwyLjItMi4yaDI1LjZjMS4yLDAsMi4yLDEsMi4yLDIuMnYwLjYgQzMwLDI2LjUsMjksMjcuNSwyNy44LDI3LjV6IiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+Cjwvc3ZnPgo=";
  const $ =
    "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjcuMSwxLjVIMi45QzEuMywxLjUsMCwyLjgsMCw0LjRzMS4zLDIuOSwyLjksMi45aDI0LjJDMjguNyw3LjMsMzAsNiwzMCw0LjRTMjguNywxLjUsMjcuMSwxLjV6IiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjcuMSwxMi4xSDIuOUMxLjMsMTIuMSwwLDEzLjQsMCwxNXMxLjMsMi45LDIuOSwyLjloMjQuMmMxLjYsMCwyLjktMS4zLDIuOS0yLjlTMjguNywxMi4xLDI3LjEsMTIuMXoiIGZpbGw9ImN1cnJlbnRDb2xvciIgLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNy4xLDIyLjdIMi45QzEuMywyMi43LDAsMjQsMCwyNS42YzAsMS42LDEuMywyLjksMi45LDIuOWgyNC4yYzEuNiwwLDIuOS0xLjMsMi45LTIuOSBDMzAsMjQsMjguNywyMi43LDI3LjEsMjIuN3oiIGZpbGw9ImN1cnJlbnRDb2xvciIgLz4KPC9zdmc+Cg==";
  const R =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyIDBhMTcuOTIgMTcuOTIgMCAwIDEgMTAuNzM5IDMuNTUzQzM0LjE1OSAxLjI1IDM1LjYwNS0uNDczIDM3LjAzLjM1YzEuNDcuODQ4IDEuNjYgMy4zNDcuNTY1IDUuODg1IDIuMi0xLjE3IDMuODE5LTEuNjQyIDQuNjMxLS4yMzUuOTQ3IDEuNjQtLjUxNiA0LjI2Ny0zLjI3NiA1LjkzQTE3Ljk3MiAxNy45NzIgMCAwIDEgNDAgMThhMTcuOTIgMTcuOTIgMCAwIDEtMy40ODMgMTAuNjQ1IDE1LjYgMTUuNiAwIDAgMSAuMzc3LjI3NGwuMDE3LjAxM2EyNS4xMiAyNS4xMiAwIDAgMSAyLjgzNCAyLjQ1OGwuMDE4LjAxOWEyNS4xNTYgMjUuMTU2IDAgMCAxIC41NjMuNTg2bC4wMTguMDJhMjUuMTE3IDI1LjExNyAwIDAgMSAyLjMzNSAyLjkzMmwuMDE5LjAyN2MuMTU4LjIzMy4zMTIuNDY4LjQ2Mi43MDZsLjE5OC4zMTkuMDAzLjAwNi4wODcuMTc3YTIuOTk5IDIuOTk5IDAgMCAxLTEuMjA1IDMuODA3bC0uMTY4LjA5My0uMjQ4LjExMy0uMTYyLjA2OWMtLjIwNi4xNS0uNDI4LjMwMy0uNjY1LjQ1N2wtMTUuMjcxIDcuMDI2YTYuOTY4IDYuOTY4IDAgMCAxLTMuNTI5Ljk1M2wtLjItLjAwNS0uMi4wMDVhNi45NyA2Ljk3IDAgMCAxLTMuMjY2LS44MDdsLS4yNjMtLjE0Ni0xNS4yNy03LjAyNmMtLjIzOC0uMTU0LS40Ni0uMzA2LS42NjctLjQ1OGE1LjE2MiA1LjE2MiAwIDAgMC0uMTYtLjA2OGwtLjI0OS0uMTEzYTMgMyAwIDAgMS0xLjM3My0zLjlsLjA4Ny0uMTc3LjAwMy0uMDA2LjE5OC0uMzJjLjE1LS4yMzcuMzA0LS40NzIuNDYyLS43MDVsLjAxOS0uMDI3YTI1LjA1NyAyNS4wNTcgMCAwIDEgMi4zMzUtMi45MzJsLjAxOC0uMDJhMjUuMTU3IDI1LjE1NyAwIDAgMSAuODYtLjg4MmwuMDE5LS4wMThhMjUuMTUxIDI1LjE1MSAwIDAgMSAyLjUzNi0yLjE2M2wuMDE3LS4wMTMuMTktLjE0LjE4Ny0uMTM0QTE3LjkyIDE3LjkyIDAgMCAxIDQgMThDNCA4LjA1OSAxMi4wNTkgMCAyMiAwem0xMS41MzYgMTFIMTAuNDY0QzkuNTMgMTMuMzA4IDkgMTUuOTMyIDkgMTguNzE0YzAgLjI4OS4wMDYuNTc1LjAxNy44NmwuMDIuNDI2aDI1LjkyNWMuMDI1LS40MjQuMDM4LS44NTMuMDM4LTEuMjg2IDAtMi43ODItLjUyOS01LjQwNi0xLjQ2NC03LjcxNHptLTE0LjEzNyAzLjA1NmEuOTc1Ljk3NSAwIDAgMSAuMzcyLjIxN2MuMS4wOTYuMTcuMjEuMjA1LjMzM2EuNjQuNjQgMCAwIDEtLjAwOC4zNzJjLS4yNDYuNTktLjcxMyAxLjEwMi0xLjMzNSAxLjQ2NEE0LjI1NyA0LjI1NyAwIDAgMSAxNi41IDE3Yy0uNzY1IDAtMS41MS0uMTk1LTIuMTMzLS41NTgtLjYyMi0uMzYyLTEuMDg5LS44NzQtMS4zMzUtMS40NjRhLjY0LjY0IDAgMCAxLS4wMDgtLjM3Mi43MzcuNzM3IDAgMCAxIC4yMDUtLjMzM2MuMS0uMDk2LjIyOC0uMTcuMzcyLS4yMTcuMDk2LS4wMzEuMTk3LS4wNS4yOTktLjA1NWwuMTU0LjAwM2g0Ljg5MmMuMTU0LS4wMTMuMzEuMDA1LjQ1My4wNTJ6bTExIDBhLjk3NS45NzUgMCAwIDEgLjM3Mi4yMTdjLjEuMDk2LjE3LjIxLjIwNS4zMzNhLjY0LjY0IDAgMCAxLS4wMDguMzcyYy0uMjQ2LjU5LS43MTMgMS4xMDItMS4zMzUgMS40NjRBNC4yNTcgNC4yNTcgMCAwIDEgMjcuNSAxN2MtLjc2NSAwLTEuNTEtLjE5NS0yLjEzMy0uNTU4LS42MjItLjM2Mi0xLjA4OS0uODc0LTEuMzM1LTEuNDY0YS42NC42NCAwIDAgMS0uMDA4LS4zNzIuNzM3LjczNyAwIDAgMSAuMjA1LS4zMzNjLjEtLjA5Ni4yMjgtLjE3LjM3Mi0uMjE3LjA5Ni0uMDMxLjE5Ny0uMDUuMjk5LS4wNTVsLjE1NC4wMDNoNC44OTJjLjE1NC0uMDEzLjMxLjAwNS40NTMuMDUyeiIgZmlsbD0iI0ZGRDQwMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+";
  const s = 2e3;
  const J = 2e3;
  let U = null;
  let c = s;
  let d = J;
  const p = l.getQueryParam("background")
    ? "#" + l.getQueryParam("background")
    : "#FF5400";
  const Z = document.createElement("style");
  let Q;
  await l.updateAnimation(r.inscription_ids.default_animation);
  let u;
  let m = false;
  let H;
  let t;
  Z.textContent = `
        body {
            background: ${p};
            margin: 0;
            padding: 0;
            user-select: none;
        }

        body.april-fools-day {
            background: #1c00af !important;
        }

        #pl {
            display: none;
        }
        
        #pl.menu {
            display: block;
            z-index: 9999;
            width: 35px;
            height: 35px;
            position: fixed;
            opacity: 0.7;
            top: 20px;
            right: 20px;
            border: 6px solid #000;
            border-bottom-color: transparent;
        }

        body.snes-active {
            background: #000;
        }

        #main {
            height: 100%;
            width: 100%;
            display: flex;
        }

        #main * {
            box-sizing: border-box;
        }

        #main:after {
            content: "";
            position: fixed;
            background: rgba(0, 0, 0, 0.15);
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        button,
        input,
        select,
        body {
            font-family: 'Minimal3x5', sans-serif;
            font-size: 22px;
        }

        input[type="file"] {
            font-family: sans-serif;
            font-size: 16px;
        }

        textarea {
            resize: vertical;
        }

        #gif,
        canvas#ninja-alerts-canvas {
            margin: auto;
        }

        #gif {
            width: 100%;
            height: auto;
            margin: auto;
        }

        select,
        .input {
            width: 100%;
            padding: 15px;
            font-size: 30px;
            font-weight: 700;
            border: none;
            color: #000;
            cursor: pointer;
        }

        select {
            appearance: none;
        }

        textarea:focus,
        .input:focus {
            outline: 2px solid #fb8f01;
            outline-offset: 3px;
        }

        .label {
            color: #fff;
            padding: 20px 20px 10px;
        }

        #top-nav {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            padding: 20px;
            opacity: 0;
            animation: showMenu 0.5s ease-in-out 0.5s forwards;
            animation-delay: 1.5s;
        }

        @media (max-width: 300px) {
            #top-nav {
               display: none;
            }
        }

        #top-nav .icon-button {
            opacity: 0.7;
            margin-left: 20px;
            cursor: pointer;
            user-select: none;
        }

        #top-nav .icon-button:hover {
            opacity: 1;
        }

        #top-nav .icon-button img {
            width: 35px;
            height: 35px;
        }

        @keyframes showMenu {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }

        #modal {
            background: #1e1e1e;
            image-rendering: pixelated;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: none;
            justify-content: center;
            padding: 20px;
            align-items: flex-start;
            background-size: contain;
            overflow: auto;
        }

        #modal-content {
            position: relative;
            width: 100%;
            max-width: 646px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #242729;
            margin: auto;
            z-index: 1000;
        }

        #menu-content {
            position: relative;
            height: 100%;
            width: 100%;
            min-height: 600px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 20px;
        }

        #header {
            padding: 4px;
            width: 100%;
            margin-bottom: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid #3d4347;
            padding-bottom: 21px;
            position: relative;
        }

        #close-button,
        #menu-back-button, #snes-back-button {
            margin-right: auto;
            transform: rotate(90deg);
            cursor: pointer;
            opacity: 0.5;
            height: 25px;
            width: 25px;
            position: absolute;
            top: calc(50% - 22px);
            left: 0;
        }

        #close-button:hover,
        #menu-back-button:hover {
            opacity: 1;
        }

        #close-button img,
        #menu-back-button img {
            width: 25px;
            height: 25px;
        }

        #close-button {
            left: auto;
            right: 10px;
        }

        #icon {
            width: auto;
            height: 50px;
        }

        #menu-content .button {
            position: relative;
            z-index: 2300;
            width: 100%;
            padding: 20px 20px 17px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 7px 0;
            border: none;
            background: #5D5D55;
            max-width: 280px;
            color: #fff;
            cursor: pointer;
        }

        #menu-content .button:hover {
            background: #4B4B45;
        }

        #menu-content .button.primary {
            background: #ff7000;
        }

        #menu-content .button.primary:hover {
            background: #d9660d;
        }

        #menu-content .button:disabled {
            background: #484848 !important;
            color: #777777 !important;
            cursor: not-allowed;
        }

        #menu-content .button:disabled:active {
            transform: none !important;
        }

        .menu {
            display: none;
            flex-direction: column;
            width: 100%;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
        }

        #resize-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            margin: 0;
            align-items: center;
            max-width: 280px;
        }

        #resize-form input {
            margin: 10px 0;
            text-align: center;
        }

        .menu.active {
            display: flex;
        }

        #menu-content button:active {
            transform: translate(2px, 2px);
        }

        #stickers-menu canvas#ninja-alerts-canvas {
            max-width: 280px !important;
            margin: 20px;
        }

        #stickers-button-wrap {
            flex-direction: column;
            width: 100%;
            justify-content: center;
            align-items: center;
            display: flex;
            position: relative;
            max-width: 280px;
        }

        #stickers-button-wrap select {
            max-width: 280px;
            margin-bottom: 10px;
        }

        #select-icon {
            width: 20px;
            height: 20px;
            position: absolute;
            z-index: 9999;
            top: 18px;
            right: 13px;
            user-select: none;
            pointer-events: none;
            filter: invert(1);
        }

        #license-wrapper {
            user-select: text;
        }

        #license-wrapper h1 {
            line-height: 1.2em;
        }

        #license-wrapper h2 {
            line-height: 1.3em;
        }

        #loader-progress {
            margin-bottom: 20px;
            font-size: 40px;
        }

        #loader-dots {
            width: 60px;
            aspect-ratio: 4;
            background: radial-gradient(circle closest-side,#fff 90%,#fff) 0/calc(100%/3) 100% space;
            clip-path: inset(0 100% 0 0);
            animation: l1 1s steps(4) infinite;
            margin-top: 20px;
        }

        @keyframes l1 {to{clip-path: inset(0 -34% 0 0)}}

        #loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            background-color: #1e1e1e;
            color: #fff;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 9000;
        }

        #animation-editor {
            width: 100%;
            min-height: 350px;
            font-size: 15px;
            padding: 20px;
            margin-bottom: 20px;
        }

        #animation-label {
            margin-bottom: 20px;
        }

        #animation-menu-buttons {
            display: flex;
            flex-direction: column;
        }

        #animation-edit-wrapper {
            display: none;
            width: 100%;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        #animation-edit-wrapper .button {
            margin-bottom: 18px;
        }

        #animation-invalid {
            background: #cd3f3f;
            padding: 15px 12px 12px;
            align-items: center;
            justify-content: center;
            color: #fff;
            display: none;
            position: absolute;
            top: -61px;
            width: 100%;
        }

        #snes-menu #game-button-container {
            display: grid !important;
            justify-content: center;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            grid-gap: 10px;
            margin: 30px;
        }

        #snes-menu .game-button {
            display: flex;
            width: 100%;
            height: 100%;
            padding: 8px;
            background: #4d555b;
            cursor: pointer;
            align-self: center;
            justify-self: center;
            opacity: 0.75;
        }

        #snes-game-custom-rom span {
            display: flex;
            align-self: center;
            text-align: center;
            line-height: 1em;
            color: #fff;
        }

        #snes-menu .game-button:hover {
            background: #777f86;
        }

        #snes-menu .game-button.selected {
            border: 4px solid ${p};
        }

        #snes-menu .snes-error-message {
            align-self: center;
            color: red;
            margin: 0 0 10px;
        }

        .game-button.selected:hover {
            background: #fff;
            cursor: default;
        }

        #snes-menu #snes-loaded-game-info {
            text-align: center;
            padding: 15px 8px 13px;
            margin: 20px 0 0;
            color: #fff;
        }

        #snes-menu #snes-loaded-game-info.snes-loaded-game {
            background: #58b55c;
        }

        #snes-menu #snes-loaded-game-info::before {
            content: "Select a game";
        }

        #snes-menu #snes-loaded-game-info.snes-loaded-game::before {
            content: "Loaded game: ";
        }

        #snes-menu-container {
            display: flex;
            flex-direction: column;
            position: relative;
            width: 100%;
        }

        #snes-menu-wrapper {
            display: flex;
            flex-direction: column;
            width: auto;
            margin: 0 auto 20px;
            align-items: center;
        }

        #snes-rom-decryption-key {
            font-size: 24px;
            margin: 10px 0;
            color: #000;
        }

        .snes-button-loaded {
            background: ${p} !important;
        }

        #snes-controls-wrapper {
            color: #fff;
            flex-direction: column;
            width: 100%;
        }

        #snes-controls-wrapper .button {
            display: flex;
            align-self: center;
        }

        #snes-controls-wrapper .snes-control-mode-button {
            margin: 20px 10px 25px;
            max-width: unset;
        }

        #snes-controls-wrapper .snes-control-mode-button:first-child {
            margin-left: 0;
        }

        #snes-controls-wrapper .snes-control-mode-button:last-child {
            margin-right: 0;
        }

        #snes-controls-wrapper .snes-control-mode-button.active {
            background: ${p};
        }

        #snes-controls-wrapper .snes-control-mode-button {
            margin: 20px 10px 25px;
            max-width: unset;
        }

        #snes-custom-rom-wrapper {
            color: #fff;
            width: 100%;
            align-items: center;
            display: flex;
            flex-direction: column;
        }

        #snes-custom-rom-wrapper #snes-custom-rom-upload {
            margin-left: 16px;
        }

        #snes-custom-rom-wrapper span {
            margin: 32px 0;
        }

        #snes-custom-rom-wrapper #snes-game-inscription-ids {
            width: 100%;
            height: 128px;
            background: #222;
            color: #fff;
        }

        #snes-custom-rom-wrapper #snes-custom-rom-encrypted-label {
            align-self: end;
            margin: 8px 0 8px 0;
        }

        #snes-custom-rom-wrapper #snes-custom-rom-encrypted-label.disabled {
            color: #777777 !important;
            cursor: not-allowed;
        }

        #footer {
            color: #ffd400;
            border-top: 1px solid #3d4347;
            width: 100%;
            margin-top: auto;
            padding: 30px 0 10px;
            text-align: center;
        }

        #snes-controls-button-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #snes-controls-wrapper .controls-container {
            margin: 0 0 40px;
            background: #323537;
            width: 50%;
        }

        #snes-controls-wrapper .controls-container.player-2-controls {
            margin-left: 20px;
        }

        #snes-menu {
            margin-bottom: 40px;
        }

        #snes-controls-wrapper .row {
            line-height: 42px;
            padding-left: 14px;
            border-bottom: 1px solid #414446;
        }

        #snes-controls-wrapper .row:last-child {
            border-bottom: 0px solid #414446;
        }

        #snes-controls-wrapper .row.title {
            text-align: center;
            padding: 16px 0;
        }

        #snes-controls-wrapper .control.invisible {
            color: #fff;
        }

        #snes-controls-wrapper .control {
            height: 42px;
            width: 150px;
            margin: 0px;
            cursor: pointer;

            float: right;
            background: #fff;
            border: 0px solid transparent;
            appearance: none;
            -webkit-appearance: none;

            outline: none;
            text-align: center;
            font-family: inherit;
            font-size: inherit;
            color: #000;
        }

        #snes-controls-customizable-inputs-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        #snes-controls-wrapper .control.duplicate {
            color: #fff;
            background: #f00;
        }

        @media (max-width: 569px) {
            #snes-controls-customizable-inputs-container {
                display: block !important;
            }

            #snes-controls-wrapper .controls-container {
                width: 100% !important;
            }

            #snes-controls-wrapper .controls-container.player-2-controls {
                margin-left: 0;
            }
        }

        canvas#canvas {
            width: 100%;
            height: 100%;
        }

        #license-wrapper {
            color: #fff;
            padding: 20px;
            line-height: 1.6;
            font-family: sans-serif;
            font-size: 0.7em;
        }
   `;
  const g = l.createElem("div", "main");
  document.body.prepend(g);
  const F = l.createElem("canvas", "canvas", (e) => {
    e.style.display = "none";
  });
  document.body.append(F);
  const W = l.createElem("div", "loader-dots");
  const V = l.createElem("div", "loader-progress", (e) => {
    e.innerText = "0%";
  });
  const X = l.createElem("div", "label");
  const M = l.createElem("div", "loader", (e) => {
    l.hide(e);
    e.appendChild(V);
    e.appendChild(X);
    e.appendChild(W);
  });
  g.appendChild(M);
  const q = l.createElem("img", "icon", (e) => {
    e.src = R;
  });
  const K = l.createElem("img", "menu-icon", (e) => {
    e.src = $;
  });
  const ee = l.createElem("img", "download-icon", (e) => {
    e.src = G;
  });
  const te = l.createElem("img", "select-icon", (e) => {
    e.src = _;
  });
  const ne = l.createElem("div", "footer", (e) => {
    e.innerHTML = "version " + Y;
  });
  const ie = l.createElem("div", "header");
  const ae = l.createElem("img", "close-icon", (e) => {
    e.src = P;
  });
  const se = l.createElem("div", "close-button", (e) => {
    e.appendChild(ae);
    e.addEventListener("click", () => {
      l.hideMenu();
    });
  });
  const oe = l.createElem("div", "license-wrapper");
  const re = l.createElem("div", "license-menu", (e) => {
    e.classList.add("menu");
    e.appendChild(oe);
  });
  const le = l.createButton("Read IP Rights", async () => {
    l.goToMenu("license-menu");
    if (oe.innerHTML.length < 1) {
      l.showLoader("Loading License");
      let e = await o.fetch(r.inscription_ids.license);
      l.hide(M);
      let t = await e.text();
      oe.innerHTML = l.simpleMarkdown(t);
    }
  });
  const ce = l.createElem("div", "open-menu-button", (e) => {
    e.classList.add("icon-button");
    e.appendChild(K);
    let n = false;
    e.addEventListener("click", () => {
      if (!n) {
        const e = document.getElementById("pl");
        e.classList.add("menu");
        ce.style.opacity = "0";
        const t = new FontFace(
          "Minimal3x5",
          `url(${o.prefixedPathFor(
            "8ebc8f9afd1b9c1b8e17604300d8f5a0cbb909b143f594dd4f57cbd2fdbb7bb2i0"
          )})`
        );
        t.load()
          .then(() => {
            document.fonts.add(t);
            n = true;
          })
          .finally(() => {
            e.classList.remove("menu");
            ce.style.opacity = "1";
            l.showMenu();
          });
      } else {
        l.showMenu();
      }
    });
  });
  const de = l.createElem("div", "download-button", (e) => {
    e.classList.add("icon-button");
    e.appendChild(ee);
    e.addEventListener("click", () => {
      let e = document.createElement("a");
      if (l.isGifActive()) {
        e.download = "ninja.gif";
        e.href = t.src;
      } else {
        e.download = "ninja.png";
        e.href = h.toDataURL();
      }
      e.click();
    });
  });
  const pe = l.createButton(
    "Stop Animation",
    () => {
      l.stopAnimation();
      l.hideMenu();
    },
    (e) => {
      e.style.display = "none";
      e.classList.add("primary");
    }
  );
  const ue = l.createButton("Resize", () => {
    l.goToMenu("resize-menu");
    Le.focus();
    Le.value = c;
  });
  const me = l.createButton(
    "Resize",
    () => {},
    (e) => {
      e.type = "submit";
      e.classList.add("primary");
      e.addEventListener("click", () => {
        c = Le.value;
        d = Le.value;
        l.resizeCanvas(c, d);
        l.hideMenu();
      });
    }
  );
  const ge = l.createElem("div", "menu-back-button", (e) => {
    e.appendChild(l.createArrowIcon("arrow-icon"));
    e.style.display = "none";
    e.addEventListener("click", () => {
      if (l.isSnesCustomRomScreenActive()) {
        l.clearLoadedSnesGame();
        l.show(I);
        l.hide(v);
        return;
      } else if (l.isSnesControlsScreenActive()) {
        rt();
        l.show(I);
        l.hide(E);
        return;
      }
      l.goToMenu("main-menu");
    });
  });
  const h = l.createElem("canvas", "ninja-alerts-canvas", (e) => {
    e.height = d;
    e.width = c;
    e.style.width = "100%";
    e.style.height = "auto";
    e.style.maxWidth = c + "px";
  });
  const y = h.getContext("2d", { willReadFrequently: true });
  const L = l.createElem("div", "modal", (e) => {
    e.addEventListener("mousedown", (e) => {
      if (!e.target.closest("#modal-content")) {
        l.hideMenu();
      }
    });
  });
  const Me = l.createElem("div", "modal-content");
  const e = l.createElem("div", "menu-content");
  const he = l.createElem("div", "top-nav");
  const n = l.createElem("div", "main-menu", (e) => {
    e.classList.add("menu");
    e.classList.add("active");
  });
  const ye = l.createElem("div", "resize-label", (e) => {
    e.classList.add("label");
    e.innerText = "Canvas Size (px)";
  });
  const Le = l.createElem("input", "resize-input", (e) => {
    e.classList.add("input");
    e.type = "number";
    e.min = 100;
    e.step = 1;
    e.required = true;
    e.value = s;
  });
  const we = l.createElem("div", "resize-menu", (e) => {
    e.classList.add("menu");
  });
  const fe = l.createElem("div", "stickers-menu", (e) => {
    e.classList.add("menu");
  });
  const xe = l.createElem("div", "stickers-label", (e) => {
    e.classList.add("label");
    e.innerText = "Apply your sticker";
  });
  const i = l.createElem("div", "stickers-button-wrap");
  const be = l.createElem("select", "stickers-select", (i) => {
    let e = document.createElement("option");
    e.text = "None";
    e.value = "none";
    i.appendChild(e);
    r.inscription_ids.stickers.forEach((e, t) => {
      let n = document.createElement("option");
      n.text = e.name;
      n.value = t.toString();
      i.appendChild(n);
    });
    i.addEventListener("change", (e) => {
      let t = e.target.value;
      if (t === "none") {
        l.removeSticker();
        return;
      }
      l.addSticker(r.inscription_ids.stickers[e.target.value]);
    });
  });
  const je = l.createButton(
    "Apply Sticker",
    () => {
      l.hideMenu();
    },
    (e) => {
      e.classList.add("primary");
    }
  );
  const Ie = l.createButton("Reset", () => {
    l.removeSticker();
    be.selectedIndex = 0;
    l.hideMenu();
  });
  const Ee = l.createButton("Stickers", async () => {
    fe.appendChild(xe);
    fe.appendChild(h);
    fe.appendChild(i);
    if (l.isGifActive()) {
      l.stopAnimation();
    }
    l.goToMenu("stickers-menu");
  });
  const ve = l.createElem("div", "resize-form");
  const Ae = l.createButton(
    "Start",
    () => {
      wt();
      Ae.style.display = "none";
      if (m) {
        pe.style.display = "block";
      }
    },
    (e) => {
      e.classList.add("primary");
    }
  );
  const Ce = l.createElem("div", "animate-menu", (e) => {
    e.classList.add("menu");
  });
  const Se = async (e, t) => {
    const n = await o.fetch(e);
    if (n.ok) {
      return await n.text();
    } else {
      t();
    }
  };
  let Ne, De;
  const Te = l.createButton("Animate", () => {
    if (!Ne || !De) {
      let e = false;
      setTimeout(() => {
        if (!e) {
          l.showLoader("Loading animator");
        }
      }, 250);
      new Promise(async (e, t) => {
        const n = await Se(r.inscription_ids.gif, () => {
          t("gif fetch failed!");
        });
        if (!n) {
          return;
        }
        Ne = new Blob([n], { type: "application/javascript" });
        De = await Se(r.inscription_ids.gif_worker, () => {
          t("gif worker fetch failed!");
        });
        if (!De) {
          return;
        }
        l.loadJS(URL.createObjectURL(Ne), true, async () => {
          await Mt();
          e();
        });
      })
        .then(() => {
          l.goToMenu("animate-menu");
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          l.hide(M);
          e = true;
        });
    } else {
      l.goToMenu("animate-menu");
    }
    Be.value = JSON.stringify(l.getCurrentAnimationObject(), undefined, 4);
  });
  const ke = l.createElem("div", "animation-label", (e) => {
    e.classList.add("label");
    e.innerText = "Animate Your Ninja";
  });
  const ze = l.createElem("div", "animation-invalid", (e) => {
    e.classList.add("invalid-message");
    e.innerText = "Your animation json is invalid";
  });
  const Oe = l.createButton(
    "Update Animation",
    () => {
      Q = JSON.parse(Be.value);
      w.style.display = "block";
      f.style.display = "none";
      l.resetAnimation();
    },
    (e) => {
      e.classList.add("primary");
    }
  );
  const Be = l.createElem("textarea", "animation-editor", (e) => {
    e.placeholder = "Paste your animation code here";
    e.addEventListener("input", (e) => {
      const t = e.target.value;
      const n = l.isValidJson(t);
      ze.style.display = n ? "none" : "flex";
      Oe.disabled = !n;
    });
    e.addEventListener("keydown", function (n) {
      if (n.key === "Tab" || n.keyCode === 9) {
        n.preventDefault();
        let e = this.selectionStart;
        let t = this.selectionEnd;
        if (n.shiftKey) {
          if (e >= 4 && this.value.substring(e - 4, e) === "    ") {
            this.value =
              this.value.substring(0, e - 4) + this.value.substring(t);
            this.selectionStart = this.selectionEnd = e - 4;
          } else if (e > 0) {
            this.selectionStart = this.selectionEnd = e - 1;
          }
        } else {
          this.value =
            this.value.substring(0, e) + "    " + this.value.substring(t);
          this.selectionStart = this.selectionEnd = e + 4;
        }
      }
    });
  });
  const w = l.createElem("div", "animation-menu-buttons");
  const f = l.createElem("div", "animation-edit-wrapper");
  const Ye = l.createButton("âœ¨ Custom Animation", () => {
    w.style.display = "none";
    f.style.display = "flex";
  });
  const x = l.createElem("div", "snes-menu", (e) => {
    e.classList.add("menu");
    e.addEventListener("click", () => {
      rt();
    });
  });
  const Pe = l.createButton("Play SNES", async () => {
    if (Ge) {
      l.setSnesErrorMessage();
    }
    let e = false;
    if (!He) {
      setTimeout(() => {
        if (e) {
          return;
        }
        l.showLoader("Loading SNES emulator");
        l.hide(L);
      }, 250);
      await ut().catch((e) => {
        setTimeout(() => {
          l.setSnesErrorMessage(e);
          l.hide(j);
          l.hide(C);
          l.hide(Qe);
        });
      });
    } else {
      l.clearLoadedSnesGame();
    }
    l.goToMenu("snes-menu");
    l.show(L);
    l.show(j);
    l.show(Qe);
    l.hide(M);
    e = true;
  });
  ie.appendChild(ge);
  ie.appendChild(q);
  ie.appendChild(se);
  e.appendChild(ie);
  n.appendChild(ue);
  n.appendChild(Te);
  n.appendChild(Ee);
  n.appendChild(Pe);
  n.appendChild(le);
  ve.appendChild(ye);
  ve.appendChild(Le);
  ve.appendChild(me);
  we.appendChild(ve);
  i.appendChild(te);
  i.appendChild(be);
  i.appendChild(je);
  i.appendChild(Ie);
  fe.appendChild(i);
  Ce.appendChild(ke);
  w.appendChild(Ae);
  w.appendChild(pe);
  w.appendChild(Ye);
  Ce.appendChild(w);
  f.appendChild(Be);
  f.appendChild(ze);
  f.appendChild(Oe);
  Ce.appendChild(f);
  let b;
  let j;
  let I;
  let E;
  let _e;
  let v;
  let Ge;
  let A;
  let C;
  let S;
  let $e;
  let Re;
  let Je;
  let Ue;
  let Ze;
  let Qe;
  let He;
  let Fe;
  let N;
  let We;
  let Ve;
  let Xe;
  let qe;
  let Ke;
  let D;
  let et;
  let tt;
  let nt, it, T, at, st, ot, rt, lt, ct;
  let dt;
  let pt;
  async function ut() {
    ({
      bootstrap: nt,
      buildControlSettings: it,
      controlModes: T,
      isValidRomExtension: at,
      insertCartridge: st,
      getControlsMode: ot,
      onControlSettingsClosed: rt,
      restoreDefaultControls: lt,
      setControlsMode: ct,
    } = await import(o.prefixedPathFor(r.inscription_ids.emulator_glue)));
    ({ decrypt: dt } = await import(
      o.prefixedPathFor(r.inscription_ids.decrypt)
    ));
    ({ inscriptionJoin: pt } = await import(
      o.prefixedPathFor(r.inscription_ids.inscription_join)
    ));
    j = l.createElem("div", "snes-menu-wrapper", (e) => {
      e.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
    I = l.createElem("div", "snes-menu-container");
    E = l.createElem("div", "snes-controls-wrapper", (e) => {
      e.style.display = "none";
    });
    _e = l.createElem("div", "snes-controls-button-wrapper");
    v = l.createElem("div", "snes-custom-rom-wrapper", (e) => {
      e.style.display = "none";
    });
    Ge = l.createElem("p", null, (e) => {
      e.classList.add("snes-error-message");
      l.hide(e);
    });
    A = l.createElem("input", "snes-rom-decryption-key", (e) => {
      e.classList.add("input");
      e.type = "input";
      e.placeholder = "Enter Decryption Key";
      e.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      l.hide(e);
    });
    C = l.createElem("div", "snes-loaded-game-info");
    S = l.createButton(
      "Start",
      (e, t) => {
        t.stopPropagation();
        let n;
        (async () => {
          if (b.encrypted) {
            const e = await dt(b.data, A.value);
            if (e) {
              n = e;
            } else {
              l.setSnesErrorMessage("Invalid Decryption Key!");
              return;
            }
          } else {
            n = b.data;
          }
          st(n, { base64: b.base64 })
            .then(() => {
              g.style.display = "none";
              F.style.display = "block";
              document.body.classList.add("snes-active");
            })
            .catch((e) => {
              l.setSnesErrorMessage("Could not start SNES emulator!");
              if (window.console) {
                console.error(e);
              }
            });
        })();
      },
      (e) => {
        e.disabled = true;
      }
    );
    $e = l.createButton("Configure Controls", (e, t) => {
      t.stopPropagation();
      l.hide(I);
      l.show(E);
    });
    Re = l.createButton(
      "1-player mode",
      (e) => {
        Je.classList.remove("active");
        e.classList.add("active");
        l.hide(N.playerTwo);
        ct(T.ONE_PLAYER);
      },
      (e) => {
        e.classList.add("snes-control-mode-button");
      }
    );
    Je = l.createButton(
      "2-player mode",
      (e) => {
        Re.classList.remove("active");
        e.classList.add("active");
        l.show(N.playerTwo, "block");
        ct(T.TWO_PLAYER);
      },
      (e) => {
        e.classList.add("snes-control-mode-button");
      }
    );
    Ue = l.createButton("Restore Defaults", (e) => {
      const t = Re.classList.contains("active") ? T.ONE_PLAYER : T.TWO_PLAYER;
      lt(t);
    });
    Ze = l.createElem("div", "snes-game-custom-rom", (t) => {
      t.classList.add("game-button");
      t.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        l.clearLoadedSnesGame();
        l.setSnesErrorMessage();
        t.classList.add("selected");
        l.resetSnesCustomRomInputs();
        l.hide(I);
        l.show(v);
      });
      const e = l.createElem("span");
      const n = "Play local or inscribed rom";
      e.innerText = n;
      t.appendChild(e);
      t.title = n;
    });
    Qe = l.createElem("div", "game-button-container", (e) => {
      e.appendChild(Ze);
      e.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
    const i = async () => {
      He = await l.fetchSnesGames();
      Fe = { elements: [Ze] };
      He.forEach((n, e) => {
        const t = l.createElem("img", `snes-game-${e}`, (t) => {
          Fe.elements.push(t);
          t.title = n.name;
          t.src = `data:image/png;base64,${n.image}`;
          t.classList.add("game-button");
          t.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (b?.name === n.name) {
              return;
            }
            l.clearLoadedSnesGame({ skipResetBehavior: true });
            t.classList.add("selected");
            l.snesLoadInscriptionsFor(n);
            l.scrollModalToBottom();
          });
        });
        Qe.appendChild(t);
      });
    };
    j.appendChild($e);
    j.appendChild(A);
    j.appendChild(S);
    _e.appendChild(Re);
    _e.appendChild(Je);
    E.appendChild(_e);
    We = l.createElem("input", "snes-custom-rom-upload", (n) => {
      n.classList.add("button");
      n.type = "file";
      n.addEventListener("change", () => {
        let [e] = n.files;
        l.setSnesErrorMessage();
        if (e && at(e)) {
          const t = new FileReader();
          t.addEventListener("load", () => {
            b = { data: t.result.split(",")[1], base64: true };
            l.setSnesLoadedGameInfo(e.name.split(/\.[^\.]+$/)[0]);
            S.disabled = false;
            tt.disabled = false;
          });
          t.readAsDataURL(e);
          l.resetSnesCustomRomInputs({ skipFileInput: true });
        } else {
          l.setSnesErrorMessage("File must be an .sfc or .smc!");
          l.resetSnesCustomRomInputs();
        }
      });
    });
    Ve = l.createElem("label", "snes-custom-rom-upload-label", (e) => {
      e.innerText = "Local Filesystem ROM:";
      e.setAttribute("for", We.id);
      e.appendChild(We);
    });
    Xe = l.createElem("p", null, (e) => {
      e.classList.add("snes-error-message");
      l.hide(e);
    });
    qe = l.createElem("span", "snes-custom-rom-span", (e) => {
      e.innerText = "-- OR --";
    });
    Ke = l.createElem("textarea", "snes-game-inscription-ids", (e) => {
      e.setAttribute("placeholder", "Enter ordered list of inscription ids...");
      e.addEventListener("input", () => {
        l.setSnesErrorMessage();
        We.value = "";
        tt.disabled = !e.value;
        D.disabled = !e.value;
        if (e.value) {
          et.classList.remove("disabled");
        } else {
          et.classList.add("disabled");
        }
      });
    });
    D = l.createElem("input", "snes-custom-rom-encrypted", (t) => {
      t.type = "checkbox";
      t.disabled = true;
      t.addEventListener("change", (e) => {
        if (!b) {
          return;
        }
        b.encrypted = t.checked;
      });
    });
    et = l.createElem("label", "snes-custom-rom-encrypted-label", (e) => {
      e.innerText = "Encrypted:";
      e.setAttribute("for", D.id);
      e.classList.add("disabled");
      e.appendChild(D);
    });
    tt = l.createButton(
      "Load Custom Rom",
      (e, t) => {
        e.disabled = true;
        if (Ke.value) {
          l.showLoader("Loading custom rom inscriptions");
          l.hide(L);
          l.snesLoadInscriptionsFor({
            name: "custom inscription id(s)",
            inscriptionIds: Ke.value.replace(/[^a-z0-9]+/gi, ",").split(","),
            encrypted: !!D.checked,
          })
            .then((e) => {
              l.hide(v);
              l.show(I);
            })
            .catch((e) => {
              l.setSnesErrorMessage("Failed to fetch inscriptions");
            })
            .finally(() => {
              l.hide(M);
              l.show(L);
            });
        } else {
          l.hide(v);
          l.show(I);
        }
      },
      (e) => {
        e.disabled = true;
      }
    );
    v.appendChild(Ve);
    v.appendChild(qe);
    v.appendChild(Ke);
    v.appendChild(et);
    v.appendChild(tt);
    v.appendChild(Xe);
    I.appendChild(C);
    I.appendChild(Qe);
    I.appendChild(j);
    I.appendChild(Ge);
    x.appendChild(I);
    x.appendChild(v);
    x.appendChild(E);
    await new Promise((t, n) => {
      nt(F, l.inscriptionJoin(r.inscription_ids.snes9x_binary))
        .then(async () => {
          N = it(E);
          const e = l.createElem(
            "div",
            "snes-controls-customizable-inputs-container",
            (e) => {
              e.appendChild(N.playerOne);
              e.appendChild(N.playerTwo);
            }
          );
          E.appendChild(e);
          E.appendChild(Ue);
          if (ot() === T.ONE_PLAYER) {
            l.hide(N.playerTwo);
            Re.classList.add("active");
          } else {
            Je.classList.add("active");
          }
          l.showLoader("Loading SNES game libary");
          await i().catch(() => {
            n("Could not load game library!");
          });
          t();
        })
        .catch((e) => {
          n("Could not load SNES Emulator!");
        });
    });
  }
  e.appendChild(n);
  e.appendChild(we);
  e.appendChild(fe);
  e.appendChild(x);
  e.appendChild(Ce);
  e.appendChild(re);
  e.appendChild(ne);
  Me.appendChild(e);
  L.appendChild(Me);
  if (!l.isInIframe()) {
    he.appendChild(de);
  }
  he.appendChild(ce);
  let k = [];
  let mt = 0;
  const gt = a.map((e) => o.fetch(e.id));
  const Mt = async () => {
    const e = new Blob([De], { type: "application/javascript" });
    u = new GIF({
      workers: 4,
      workerScript: URL.createObjectURL(e),
      globalPalette: true,
      quality: 10,
      width: 2e3,
      height: 2e3,
    });
    u.on("progress", function (e) {
      V.innerText = Math.round(e * 100) + "%";
    });
    u.on("finished", function (e) {
      H = URL.createObjectURL(e);
      h.style.display = "none";
      t = document.createElement("img");
      t.src = H;
      t.id = "gif";
      t.style.display = "block";
      t.style.maxWidth = s.toString();
      t.style.maxHeight = J.toString();
      g.appendChild(t);
      Ae.style.display = "none";
      pe.style.display = "block";
      l.hide(M);
      clearInterval(yt);
      O = 0;
      l.clear();
      l.applyBackground();
      z();
    });
  };
  Promise.all(gt)
    .then((e) => Promise.all(e.map((e) => e.text())))
    .then((i) => {
      a.forEach((t, n) => {
        let e = new Image();
        if (i[n].includes('<svg version="1.1"')) {
          t.svg = i[n];
        } else {
          console.error("Error loading trait: ", t.id);
          t.svg =
            '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve"></svg>';
        }
        for (let e = 0; e < 11; e++) {
          if (a[n]["ST" + e]) {
            t.svg = t.svg.replaceAll(`%%ST${e}%%`, a[n][`ST${e}`] || "red");
          }
        }
        e.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(t.svg);
        e.crossOrigin = "anonymous";
        e.onload = async () => {
          mt++;
          if (mt === a.length) {
            g.style.margin = "0px";
            g.style.padding = "0px";
            if (l.getQueryParam("background") !== "none") {
              y.fillStyle = p;
              y.fillRect(0, 0, c, d);
            }
            z();
            l.hide(M);
            g.append(Z);
            g.append(h);
            g.append(L);
            g.append(he);
            g.style.overscrollBehavior = "none";
            const e = document.createElement("meta");
            e.name = "viewport";
            e.content = "width=device-width, initial-scale=1";
            document.getElementsByTagName("head")[0].appendChild(e);
          }
        };
        k.push(e);
      });
    })
    .catch((e) => {
      console.error("Error fetching data: ", e);
    });
  let ht;
  async function z() {
    const s = false;
    if (U) {
      let e = new Image();
      e.onload = function () {
        for (let e = 0; e < k.length; e++) {
          if (s && a[e].holiday_swap) {
            console.log("Happy Holidays! (" + s + ")");
          } else {
            y.drawImage(k[e], 0, 0, c, d);
          }
        }
        y.drawImage(e, 0, 0, c, d);
      };
      const t = await o.fetch(U.id);
      const n = await t.text();
      e.src = `data:image/svg+xml;base64,${btoa(n)}`;
    } else {
      for (let e = 0; e < k.length; e++) {
        if (s && a[e].holiday_swap) {
          console.log("Happy Holidays! (" + s + ")");
        } else {
          y.drawImage(k[e], 0, 0, c, d);
        }
      }
    }
    if (s) {
      const e = r.inscription_ids.holiday_traits[s];
      if (e) {
        let a = new Image();
        a.crossOrigin = "anonymous";
        a.onload = async () => {
          y.drawImage(a, 0, 0, c, d);
          if (s === "april_fools_day") {
            document.body.classList.add("april-fools-day");
            try {
              const e = await o.fetch(r.inscription_ids.error_sound);
              const t = await e.blob();
              const n = new Audio(URL.createObjectURL(t));
              const i = () => {
                if (n.paused) {
                  n.play();
                } else {
                  n.pause();
                  n.currentTime = 0;
                }
              };
              document.addEventListener("click", i);
              document.addEventListener("keydown", i);
            } catch (e) {
              console.error("Error loading or playing the audio:", e);
            }
          }
        };
        const t = await o.fetch(e);
        const n = await t.text();
        a.src = `data:image/svg+xml;base64,${btoa(n)}`;
      }
    }
  }
  let yt;
  let O;
  let Lt = 1e3 * 0.05;
  function wt() {
    O = 0;
    if (m) {
      h.style.display = "none";
      t.style.display = "block";
      l.hideMenu();
      return;
    }
    l.removeSticker();
    c = s;
    d = J;
    l.resizeCanvas(s, J);
    l.hideMenu();
    l.showLoader("Generating Animation", { progress: true });
    yt = setInterval(() => {
      ++O;
      console.log("Frame: ", O);
      l.clear();
      l.applyBackground();
      const t = Q[`frame_${O}`];
      for (let e = 0; e < k.length; e++) {
        const n = t["layers"] || {};
        const i = n[a[e].type] || n[`layer_${e + 1}`] || { x: 0, y: 0 };
        y.drawImage(k[e], i.y || 0, i.x || 0, s, J);
      }
      if (!m) {
        u.addFrame(y, { copy: true, delay: t["duration"] || 50 });
      }
      if (O === Object.keys(Q).length) {
        O = 0;
        console.log(
          "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
        );
        if (!m) {
          u.render();
          m = true;
        }
      }
    }, Lt);
  }
}
