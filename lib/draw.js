export async function draw(imgObjects, client, config) {
    const SNES_GAMES_SAT = 280810779975717;

    const helpers = {
        getQueryParam: (name) => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },
        clear: () => {
            context.clearRect(0, 0, width, height);
        },
        clearLoadedSnesGame: (options = {}) => {
            helpers.setSnesErrorMessage();
            helpers.resetSnesCustomRomInputs();
            rom = null;
            gameButtons.elements.forEach(gb => gb.classList.remove('selected'));
            snesRomDecryptionKeyInput.value = null;
            helpers.hide(snesRomDecryptionKeyInput);
            if (options.skipResetBehavior) {
                return;
            }
            snesStartButton.disabled = true;
            snesLoadedGameInfo.classList.remove('snes-loaded-game');
            snesStartButton.classList.remove('snes-button-loaded');
            snesLoadedGameInfo.innerText = '';
        },
        inscriptionJoin: (inscriptionIds) => {
            return inscriptionJoin(inscriptionIds, {fetch: client.fetch.bind(client)});
        },
        setSnesLoadedGameInfo: (name) => {
            snesLoadedGameInfo.classList.add('snes-loaded-game');
            snesStartButton.classList.add('snes-button-loaded');
            snesLoadedGameInfo.innerText = name;
        },
        setSnesErrorMessage: (message) => {
            const elem = helpers.isSnesCustomRomScreenActive() ? snesCustomRomErrorMessage : snesErrorMessage;
            elem.innerText = message || '';
            if (message) {
                helpers.show(elem);
            } else {
                helpers.hide(elem);
            }
        },
        snesLoadInscriptionsFor: (game) => {
            return helpers.inscriptionJoin(game.inscriptionIds)
                .then((combined) => {
                    rom = {name: game.name, data: combined, base64: false, encrypted: !!game.encrypted};
                    helpers.setSnesLoadedGameInfo(game.name);
                    snesStartButton.disabled = false;
                    if (game.encrypted) {
                        helpers.show(snesRomDecryptionKeyInput);
                    }
                    return combined;
                });
        },
        resetSnesCustomRomInputs: (options) => {
            options = options || {};

            if (!options.skipFileInput) {
                snesCustomRomUploadInput.value = '';
            }

            snesCustomRomInscriptionTextarea.value = '';
            snesCustomRomEncryptedCheckbox.checked = false;
            snesCustomRomEncryptedCheckbox.disabled = true;
            snesCustomRomEncryptedCheckboxLabel.classList.add('disabled');
            snesCustomRomDoneButton.disabled = true;
        },
        fetchSnesGames: async () => {
            const latestInscriptionId = await client.getLatestInscriptionIdForSat(SNES_GAMES_SAT);
            return await client.fetchJsonFor(latestInscriptionId);
        },
        isValidJson: (str) => {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }

            return true;
        },
        isSnesControlsScreenActive: () => {
            return snesMenu.classList.contains('active') && snesControlsWrapper.style.display !== 'none';
        },
        isSnesCustomRomScreenActive: () => {
            return snesMenu.classList.contains('active') && snesCustomRomWrapper.style.display !== 'none';
        },
        showLoader: (message, options = {}) => {
            loaderLabel.innerText = message;
            if (options.progress) {
                helpers.show(progress);
            } else {
                helpers.hide(progress);
            }
            helpers.show(loader);
        },
        showMenu: () => {
            helpers.show(modal);
        },
        hideMenu: () => {
            helpers.goToMenu('main-menu');
            helpers.hide(modal);
            main.appendChild(canvas);

            if (snesGames) {
                helpers.show(snesMenuContainer);
                helpers.hide(snesControlsWrapper);
                helpers.hide(snesCustomRomWrapper);
                onControlSettingsClosed();
            }
        },
        show: (element, display = 'flex') => {
            element.style.display = display;
        },
        hide: (element) => {
            element.style.display = 'none';
        },
        addSticker: (sticker) => {
            activeSticker = sticker;

            helpers.clear();
            helpers.applyBackground();
            drawImages();
        },
        removeSticker: () => {
            activeSticker = null;

            helpers.clear();
            helpers.applyBackground();
            drawImages();
        },
        applyBackground: () => {
            if (helpers.getQueryParam('background') !== 'none') {
                context.fillStyle = bg;
                context.fillRect(0, 0, width, height);
            }
        },
        stopAnimation: () => {
            stopButton.style.display = "none";
            animateSubmitButton.style.display = "block";

            canvas.style.display = 'block';

            if (gifImg) {
                gifImg.style.display = 'none';
            }
        },
        resetAnimation: () => {
            helpers.stopAnimation();
            progress.innerText = '0%';

            if (gifImg) {
                gifImg.remove();
            }

            if (gif) {
                gif.abort();
                gif_is_done = false;
                initGif();
            }
        },
        resizeCanvas: (newWidth, newHeight) => {
            canvas.height = newHeight;
            canvas.width = newWidth;
            canvas.style.maxWidth = newWidth + 'px';

            width = newWidth;
            height = newHeight;

            helpers.clear();
            helpers.applyBackground();

            drawImages();

            if (gif_is_done) {
                helpers.stopAnimation();
            }
        },
        updateAnimation: async (src) => {
            client.fetchJsonFor(src)
                .then((data) => {
                    animationObject = data;
                })
                .catch(err => {
                    throw err
                });
        },
        getCurrentAnimationObject: () => {
            return animationObject;
        },
        goToMenu: (id) => {
            const menus = document.getElementsByClassName('menu');

            menuBackButton.style.display = id === 'main-menu' ? 'none' : 'block';

            for (let i = 0; i < menus.length; i++) {
                menus[i].classList.remove('active');
            }

            document.getElementById(id).classList.add('active');
        },
        createArrowIcon: (id) => {
            return helpers.createElem('img', id, (elem) => {
                elem.src = arrowIconImg;
            });
        },
        createElem: (type, id, callback) => {
            const elem = document.createElement(type);
            if (id) {
                elem.id = id;
            }

            if (callback) {
                callback(elem);
            }

            return elem;
        },
        createButton: (text, onClick, callBack) => {
            const button = document.createElement('button');
            button.innerText = text;
            button.classList.add('button');

            if (callBack) {
                callBack(button);
            }

            if (onClick) {
                button.addEventListener('click', (e) => {
                    onClick(button, e);
                });
            }

            return button;
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
            const gif = document.getElementById('gif');

            if (!gif) return false;

            return gif.style.display === 'block';
        },
        loadJS: (file_url, async = true, callback = () => {
        }) => {
            let scriptEle = document.createElement("script");

            scriptEle.setAttribute("src", file_url);
            scriptEle.setAttribute("type", "text/javascript");
            scriptEle.setAttribute("async", async.toString());

            document.body.appendChild(scriptEle);

            scriptEle.addEventListener("load", callback);

            scriptEle.addEventListener("error", (ev) => {
                console.log("Error on loading file", ev);
            });
        },
        scrollModalToBottom: () => {
            modal.scroll({top: modal.scrollHeight, behavior: "smooth"})
        },
        simpleMarkdown: (mdText) => {
            mdText = mdText.replace(/\r\n/g, '\n');
            mdText = mdText.replace(/\n~~~ *(.*?)\n([\s\S]*?)\n~~~/g, '<pre><code title="$1">$2</code></pre>');
            mdText = mdText.replace(/\n``` *(.*?)\n([\s\S]*?)\n```/g, '<pre><code title="$1">$2</code></pre>');

            var mdHTML = '',
                mdCode = mdText.split('pre>');

            for (var i = 0; i < mdCode.length; i++) {
                if (mdCode[i].substr(-2) === '</') {
                    mdHTML += '<pre>' + mdCode[i] + 'pre>';
                } else {
                    mdHTML += mdCode[i].replace(/(.*)<$/, '$1')
                        .replace(/^##### (.*?)\s*#*$/gm, '<h5>$1</h5>')
                        .replace(/^#### (.*?)\s*#*$/gm, '<h4>$1</h4>')
                        .replace(/^### (.*?)\s*#*$/gm, '<h3>$1</h3>')
                        .replace(/^## (.*?)\s*#*$/gm, '<h2>$1</h2>')
                        .replace(/^# (.*?)\s*#*$/gm, '<h1>$1</h1>')
                        .replace(/^-{3,}|^\_{3,}|^\*{3,}/gm, '<hr/>')
                        .replace(/``(.*?)``/gm, '<code>$1</code>')
                        .replace(/`(.*?)`/gm, '<code>$1</code>')
                        .replace(/^\>> (.*$)/gm, '<blockquote><blockquote>$1</blockquote></blockquote>')
                        .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
                        .replace(/<\/blockquote\>\n<blockquote\>/g, '\n<br>')
                        .replace(/<\/blockquote\>\n<br\><blockquote\>/g, '\n<br>')
                        .replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img alt="$1" src="$2" $3 />')
                        .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" />')
                        .replace(/\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<a href="$2" title="$3">$1</a>')
                        .replace(/<http(.*?)\>/gm, '<a href="http$1">http$1</a>')
                        .replace(/\[(.*?)\]\(\)/gm, '<a href="$1">$1</a>')
                        .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2">$1</a>')
                        .replace(/^[\*|+|-][ |.](.*)/gm, '<ul><li>$1</li></ul>').replace(/<\/ul\>\n<ul\>/g, '\n')
                        .replace(/^\d[ |.](.*)/gm, '<ol><li>$1</li></ol>').replace(/<\/ol\>\n<ol\>/g, '\n')
                        .replace(/\*\*\*(.*)\*\*\*/gm, '<b><em>$1</em></b>')
                        .replace(/\*\*(.*)\*\*/gm, '<b>$1</b>')
                        .replace(/\*([\w \d]*)\*/gm, '<em>$1</em>')
                        .replace(/___(.*)___/gm, '<b><em>$1</em></b>')
                        .replace(/__(.*)__/gm, '<u>$1</u>')
                        .replace(/_([\w \d]*)_/gm, '<em>$1</em>')
                        .replace(/~~(.*)~~/gm, '<del>$1</del>')
                        .replace(/\^\^(.*)\^\^/gm, '<ins>$1</ins>')
                        .replace(/ +\n/g, '\n<br/>')
                        .replace(/\n\s*\n/g, '\n<p>\n')
                        .replace(/^ {4,10}(.*)/gm, '<pre><code>$1</code></pre>')
                        .replace(/^\t(.*)/gm, '<pre><code>$1</code></pre>')
                        .replace(/<\/code\><\/pre\>\n<pre\><code\>/g, '\n')
                        .replace(/\\([`_\\\*\+\-\.\(\)\[\]\{\}])/gm, '$1');
                }
            }

            return mdHTML.trim()
        },
        calculateEaster: (year) => {
            const a = year % 19,
                b = Math.floor(year / 100),
                c = year % 100,
                d = Math.floor(b / 4),
                e = b % 4,
                f = Math.floor((b + 8) / 25),
                g = Math.floor((b - f + 1) / 3),
                h = (19 * a + b - d - g + 15) % 30,
                i = Math.floor(c / 4),
                k = c % 4,
                l = (32 + 2 * e + 2 * i - h - k) % 7,
                m = Math.floor((a + 11 * h + 22 * l) / 451),
                month = Math.floor((h + l - 7 * m + 114) / 31),
                day = ((h + l - 7 * m + 114) % 31) + 1;

            return new Date(year, month - 1, day);
        },
        get_new_moons: (date) => {
            const LUNAR_MONTH = 29.5305888531
            let y = date.getFullYear()
            let m = date.getMonth() + 1
            let d = date.getDate()
            if (m <= 2) {
                y -= 1
                m += 12
            }

            let a = Math.floor(y / 100),
                b = Math.floor(a / 4),
                c = 2 - a + b,
                e = Math.floor(365.25 * (y + 4716)),
                f = Math.floor(30.6001 * (m + 1)),
                julian_day = c + d + e + f - 1524.5,
                days_since_last_new_moon = julian_day - 2451549.5,
                new_moons = days_since_last_new_moon / LUNAR_MONTH,
                days_into_cycle = (new_moons % 1) * LUNAR_MONTH;

            return new_moons
        },
        in_chinese_new_year: (date) => {
            return Math.floor(helpers.get_new_moons(date)) > Math.floor(helpers.get_new_moons(new Date(date.getFullYear(), 0, 20))) ? 1 : 0
        },
        calculateChineseNewYear: (year) => {
            for (let i = 0; i <= 30; ++i) {
                let start = new Date(year, 0, 1)
                start.setDate(21 + i)
                if (helpers.in_chinese_new_year(start)) return start
            }
        },
        isWithinHolidayPeriod: () => {
            const now = new Date();
            const year = now.getFullYear();

            // Define the holidays and key dates
            const holidays = [
                {key: 'new_years_day', month: 0, day: 1, hoursBefore: 32},
                {key: 'chinese_new_year', date: helpers.calculateChineseNewYear(year), hoursBefore: 32},
                {key: 'valentines_day', month: 1, day: 14, hoursBefore: 32},
                {key: 'st_patricks_day', month: 2, day: 17, hoursBefore: 32},
                {key: 'easter_day', date: helpers.calculateEaster(year), hoursBefore: 32},
                {key: 'april_fools_day', month: 3, day: 1, hoursBefore: 2, hoursAfter: 2},
                {key: 'bitcoin_pizza_day', month: 4, day: 22, hoursBefore: 32},
                {key: 'ordinals_birthday', month: 0, day: 20, hoursBefore: 32},
                {key: 'halloween', month: 9, day: 31, hoursBefore: 32},
                {key: 'christmas_day', month: 11, day: 25, hoursBefore: 32}
            ];

            for (let holiday of holidays) {
                const holidayDate = holiday.date || new Date(year, holiday.month, holiday.day);
                const startPeriod = new Date(holidayDate);
                startPeriod.setHours(startPeriod.getHours() - holiday.hoursBefore);

                const endPeriod = new Date(holidayDate);
                if (holiday.hoursAfter) {
                    endPeriod.setHours(endPeriod.getHours() + holiday.hoursAfter);
                } else {
                    endPeriod.setHours(24); // End of the holiday day
                }

                if (now >= startPeriod && now <= endPeriod) {
                    return holiday.key;
                }
            }

            return false;
        }
    };

    const version = '1';

    window[config.project] = {
        applyHoliday: (key) => {
            forcedHolidayKey = key;

            helpers.clear();
            helpers.applyBackground();
            drawImages();
        }
    };

    const closeIconImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzAgMzAiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0xOCAxNSAyOS40IDMuNmMuOC0uOC44LTIuMiAwLTMtLjgtLjgtMi4yLS44LTMgMEwxNSAxMiAzLjcuNmMtLjgtLjgtMi4yLS44LTMgMC0uOC44LS44IDIuMiAwIDNMMTIgMTUgLjYgMjYuNGMtLjguOC0uOCAyLjIgMCAzIC44LjggMi4yLjggMyAwTDE1IDE4bDExLjMgMTEuNGMuOC44IDIuMi44IDMgMCAuOC0uOC44LTIuMiAwLTNMMTggMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+";
    const arrowIconImg = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBkPSJNMTUsMjMuNmMtMC41LDAtMS4xLTAuMi0xLjUtMC42TDAuNiwxMGMtMC44LTAuOC0wLjgtMi4yLDAtM2MwLjgtMC44LDIuMi0wLjgsMywwTDE1LDE4LjVMMjYuNCw3LjEgYzAuOC0wLjgsMi4yLTAuOCwzLDBjMC44LDAuOCwwLjgsMi4yLDAsM0wxNi41LDIyLjlDMTYuMSwyMy4zLDE1LjUsMjMuNiwxNSwyMy42eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K";
    const downloadIconImg = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBkPSJNMTUsMjBjLTAuMywwLTAuNS0wLjEtMC43LTAuM2wtNi42LTYuOWMtMC42LTAuNi0wLjEtMS42LDAuNy0xLjZoMy40VjQuMWMwLTAuOSwwLjctMS42LDEuNi0xLjZoMy4xIGMwLjksMCwxLjYsMC43LDEuNiwxLjZ2Ny4yaDMuNGMwLjgsMCwxLjIsMSwwLjcsMS42bC02LjYsNi45QzE1LjUsMTkuOSwxNS4zLDIwLDE1LDIweiIgZmlsbD0iY3VycmVudENvbG9yIiAvPgoJPHBhdGggZD0iTTI3LjgsMjcuNUgyLjJjLTEuMiwwLTIuMi0xLTIuMi0yLjJ2LTAuNmMwLTEuMiwxLTIuMiwyLjItMi4yaDI1LjZjMS4yLDAsMi4yLDEsMi4yLDIuMnYwLjYgQzMwLDI2LjUsMjksMjcuNSwyNy44LDI3LjV6IiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+Cjwvc3ZnPgo=";
    const menuIconImg = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzAgMzAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMwIDMwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjcuMSwxLjVIMi45QzEuMywxLjUsMCwyLjgsMCw0LjRzMS4zLDIuOSwyLjksMi45aDI0LjJDMjguNyw3LjMsMzAsNiwzMCw0LjRTMjguNywxLjUsMjcuMSwxLjV6IiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjcuMSwxMi4xSDIuOUMxLjMsMTIuMSwwLDEzLjQsMCwxNXMxLjMsMi45LDIuOSwyLjloMjQuMmMxLjYsMCwyLjktMS4zLDIuOS0yLjlTMjguNywxMi4xLDI3LjEsMTIuMXoiIGZpbGw9ImN1cnJlbnRDb2xvciIgLz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNy4xLDIyLjdIMi45QzEuMywyMi43LDAsMjQsMCwyNS42YzAsMS42LDEuMywyLjksMi45LDIuOWgyNC4yYzEuNiwwLDIuOS0xLjMsMi45LTIuOSBDMzAsMjQsMjguNywyMi43LDI3LjEsMjIuN3oiIGZpbGw9ImN1cnJlbnRDb2xvciIgLz4KPC9zdmc+Cg==";
    const iconImg = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyIDBhMTcuOTIgMTcuOTIgMCAwIDEgMTAuNzM5IDMuNTUzQzM0LjE1OSAxLjI1IDM1LjYwNS0uNDczIDM3LjAzLjM1YzEuNDcuODQ4IDEuNjYgMy4zNDcuNTY1IDUuODg1IDIuMi0xLjE3IDMuODE5LTEuNjQyIDQuNjMxLS4yMzUuOTQ3IDEuNjQtLjUxNiA0LjI2Ny0zLjI3NiA1LjkzQTE3Ljk3MiAxNy45NzIgMCAwIDEgNDAgMThhMTcuOTIgMTcuOTIgMCAwIDEtMy40ODMgMTAuNjQ1IDE1LjYgMTUuNiAwIDAgMSAuMzc3LjI3NGwuMDE3LjAxM2EyNS4xMiAyNS4xMiAwIDAgMSAyLjgzNCAyLjQ1OGwuMDE4LjAxOWEyNS4xNTYgMjUuMTU2IDAgMCAxIC41NjMuNTg2bC4wMTguMDJhMjUuMTE3IDI1LjExNyAwIDAgMSAyLjMzNSAyLjkzMmwuMDE5LjAyN2MuMTU4LjIzMy4zMTIuNDY4LjQ2Mi43MDZsLjE5OC4zMTkuMDAzLjAwNi4wODcuMTc3YTIuOTk5IDIuOTk5IDAgMCAxLTEuMjA1IDMuODA3bC0uMTY4LjA5My0uMjQ4LjExMy0uMTYyLjA2OWMtLjIwNi4xNS0uNDI4LjMwMy0uNjY1LjQ1N2wtMTUuMjcxIDcuMDI2YTYuOTY4IDYuOTY4IDAgMCAxLTMuNTI5Ljk1M2wtLjItLjAwNS0uMi4wMDVhNi45NyA2Ljk3IDAgMCAxLTMuMjY2LS44MDdsLS4yNjMtLjE0Ni0xNS4yNy03LjAyNmMtLjIzOC0uMTU0LS40Ni0uMzA2LS42NjctLjQ1OGE1LjE2MiA1LjE2MiAwIDAgMC0uMTYtLjA2OGwtLjI0OS0uMTEzYTMgMyAwIDAgMS0xLjM3My0zLjlsLjA4Ny0uMTc3LjAwMy0uMDA2LjE5OC0uMzJjLjE1LS4yMzcuMzA0LS40NzIuNDYyLS43MDVsLjAxOS0uMDI3YTI1LjA1NyAyNS4wNTcgMCAwIDEgMi4zMzUtMi45MzJsLjAxOC0uMDJhMjUuMTU3IDI1LjE1NyAwIDAgMSAuODYtLjg4MmwuMDE5LS4wMThhMjUuMTUxIDI1LjE1MSAwIDAgMSAyLjUzNi0yLjE2M2wuMDE3LS4wMTMuMTktLjE0LjE4Ny0uMTM0QTE3LjkyIDE3LjkyIDAgMCAxIDQgMThDNCA4LjA1OSAxMi4wNTkgMCAyMiAwem0xMS41MzYgMTFIMTAuNDY0QzkuNTMgMTMuMzA4IDkgMTUuOTMyIDkgMTguNzE0YzAgLjI4OS4wMDYuNTc1LjAxNy44NmwuMDIuNDI2aDI1LjkyNWMuMDI1LS40MjQuMDM4LS44NTMuMDM4LTEuMjg2IDAtMi43ODItLjUyOS01LjQwNi0xLjQ2NC03LjcxNHptLTE0LjEzNyAzLjA1NmEuOTc1Ljk3NSAwIDAgMSAuMzcyLjIxN2MuMS4wOTYuMTcuMjEuMjA1LjMzM2EuNjQuNjQgMCAwIDEtLjAwOC4zNzJjLS4yNDYuNTktLjcxMyAxLjEwMi0xLjMzNSAxLjQ2NEE0LjI1NyA0LjI1NyAwIDAgMSAxNi41IDE3Yy0uNzY1IDAtMS41MS0uMTk1LTIuMTMzLS41NTgtLjYyMi0uMzYyLTEuMDg5LS44NzQtMS4zMzUtMS40NjRhLjY0LjY0IDAgMCAxLS4wMDgtLjM3Mi43MzcuNzM3IDAgMCAxIC4yMDUtLjMzM2MuMS0uMDk2LjIyOC0uMTcuMzcyLS4yMTcuMDk2LS4wMzEuMTk3LS4wNS4yOTktLjA1NWwuMTU0LjAwM2g0Ljg5MmMuMTU0LS4wMTMuMzEuMDA1LjQ1My4wNTJ6bTExIDBhLjk3NS45NzUgMCAwIDEgLjM3Mi4yMTdjLjEuMDk2LjE3LjIxLjIwNS4zMzNhLjY0LjY0IDAgMCAxLS4wMDguMzcyYy0uMjQ2LjU5LS43MTMgMS4xMDItMS4zMzUgMS40NjRBNC4yNTcgNC4yNTcgMCAwIDEgMjcuNSAxN2MtLjc2NSAwLTEuNTEtLjE5NS0yLjEzMy0uNTU4LS42MjItLjM2Mi0xLjA4OS0uODc0LTEuMzM1LTEuNDY0YS42NC42NCAwIDAgMS0uMDA4LS4zNzIuNzM3LjczNyAwIDAgMSAuMjA1LS4zMzNjLjEtLjA5Ni4yMjgtLjE3LjM3Mi0uMjE3LjA5Ni0uMDMxLjE5Ny0uMDUuMjk5LS4wNTVsLjE1NC4wMDNoNC44OTJjLjE1NC0uMDEzLjMxLjAwNS40NTMuMDUyeiIgZmlsbD0iI0ZGRDQwMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+";
    const defaultWidth = 2000;
    const defaultHeight = 2000;

    let activeSticker = null;

    let width = defaultWidth;
    let height = defaultHeight;

    const bg = helpers.getQueryParam('background') ? '#' + helpers.getQueryParam('background') : '#FF5400';
    const style = document.createElement("style");

    let animationObject;

    await helpers.updateAnimation(config.inscription_ids.default_animation);

    let gif;
    let gif_is_done = false;
    let gifData;
    let gifImg;

    style.textContent = `
        body {
            background: ${bg};
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
            border: 4px solid ${bg};
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
            background: ${bg} !important;
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
            background: ${bg};
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

    const main = helpers.createElem('div', 'main');
    document.body.prepend(main);
    const snesCanvas = helpers.createElem('canvas', 'canvas', (elem) => {
        elem.style.display = 'none';
    });
    document.body.append(snesCanvas);

    const dots = helpers.createElem('div', 'loader-dots');

    const progress = helpers.createElem('div', 'loader-progress', (elem) => {
        elem.innerText = '0%';
    });

    const loaderLabel = helpers.createElem('div', 'label');

    const loader = helpers.createElem('div', 'loader', (elem) => {
        helpers.hide(elem);
        elem.appendChild(progress);
        elem.appendChild(loaderLabel);
        elem.appendChild(dots);
    });

    main.appendChild(loader);

    const icon = helpers.createElem('img', 'icon', (elem) => {
        elem.src = iconImg;
    });

    const menuIcon = helpers.createElem('img', 'menu-icon', (elem) => {
        elem.src = menuIconImg;
    });

    const downloadIcon = helpers.createElem('img', 'download-icon', (elem) => {
        elem.src = downloadIconImg;
    });

    const selectIcon = helpers.createElem('img', 'select-icon', (elem) => {
        elem.src = arrowIconImg;
    });

    const footer = helpers.createElem('div', 'footer', (elem) => {
        elem.innerHTML = 'version ' + version;
    });

    const header = helpers.createElem('div', 'header');

    const closeIcon = helpers.createElem('img', 'close-icon', (elem) => {
        elem.src = closeIconImg;
    });

    const closeButton = helpers.createElem('div', 'close-button', (elem) => {
        elem.appendChild(closeIcon);

        elem.addEventListener('click', () => {
            helpers.hideMenu();
        });
    });

    const licenseWrapper = helpers.createElem('div', 'license-wrapper');

    const licenseMenu = helpers.createElem('div', 'license-menu', (elem) => {
        elem.classList.add('menu');
        elem.appendChild(licenseWrapper)
    });

    const licenseButton = helpers.createButton('Read IP Rights', async () => {
        helpers.goToMenu('license-menu');

        if (licenseWrapper.innerHTML.length < 1) {
            helpers.showLoader('Loading License');

            let response = await client.fetch(config.inscription_ids.license);
            helpers.hide(loader);

            let licenseContent = await response.text();

            licenseWrapper.innerHTML = helpers.simpleMarkdown(licenseContent);
        }
    });

    const openMenuButton = helpers.createElem('div', 'open-menu-button', (elem) => {
        elem.classList.add('icon-button');
        elem.appendChild(menuIcon);
        let fontLoaded = false;

        elem.addEventListener('click', () => {
            if (!fontLoaded) {
                const spinner = document.getElementById('pl');

                spinner.classList.add('menu');
                openMenuButton.style.opacity = '0';

                /*
                  The FontStruction Minimal3x5
                  (https://fontstruct.com/fontstructions/show/1194671) by kheftel is licensed under a Creative Commons Attribution license
                  (https://creativecommons.org/licenses/by/3.0/)
                */
                const fontFile = new FontFace(
                    'Minimal3x5',
                    `url(${client.prefixedPathFor('8ebc8f9afd1b9c1b8e17604300d8f5a0cbb909b143f594dd4f57cbd2fdbb7bb2i0')})`
                );

                fontFile.load().then(() => {
                    document.fonts.add(fontFile);
                    fontLoaded = true;
                }).finally(() => {
                    spinner.classList.remove('menu');
                    openMenuButton.style.opacity = '1';
                    helpers.showMenu();
                });
              } else {
                  helpers.showMenu();
              }
        });
    });

    const downloadButton = helpers.createElem('div', 'download-button', (elem) => {
        elem.classList.add('icon-button');
        // elem.appendChild(downloadIcon);

        elem.addEventListener('click', () => {
            let link = document.createElement('a');

            if (helpers.isGifActive()) {
                link.download = 'ninja.gif';
                link.href = gifImg.src;

            } else {
                link.download = 'ninja.png';
                link.href = canvas.toDataURL()
            }

            link.click();
        });
    });

    const stopButton = helpers.createButton(
        'Stop Animation',
        () => {
            helpers.stopAnimation();
            helpers.hideMenu();
        },
        (button) => {
            button.style.display = 'none';
            button.classList.add('primary');
        }
    );

    const resizeButton = helpers.createButton('Resize', () => {
        helpers.goToMenu('resize-menu');
        resizeInput.focus();
        resizeInput.value = width;
    });

    const resizeSubmitButton = helpers.createButton('Resize', () => {
    }, (button) => {
        button.type = 'submit';
        button.classList.add('primary');

        button.addEventListener('click', () => {
            width = resizeInput.value;
            height = resizeInput.value;

            helpers.resizeCanvas(width, height);
            helpers.hideMenu();
        });
    });

    const menuBackButton = helpers.createElem('div', 'menu-back-button', (elem) => {
        elem.appendChild(helpers.createArrowIcon('arrow-icon'));
        elem.style.display = 'none';

        elem.addEventListener('click', () => {
            if (helpers.isSnesCustomRomScreenActive()) {
                helpers.clearLoadedSnesGame();
                helpers.show(snesMenuContainer);
                helpers.hide(snesCustomRomWrapper);
                return;
            } else if (helpers.isSnesControlsScreenActive()) {
                onControlSettingsClosed();
                helpers.show(snesMenuContainer);
                helpers.hide(snesControlsWrapper);
                return;
            }

            helpers.goToMenu('main-menu');
        });
    });

    const canvas = helpers.createElem('canvas', 'ninja-alerts-canvas', (elem) => {
        elem.height = height;
        elem.width = width;
        elem.style.width = '100%';
        elem.style.height = 'auto';
        elem.style.maxWidth = width + 'px';
    });

    const context = canvas.getContext('2d', {willReadFrequently: true});

    const modal = helpers.createElem('div', 'modal', (elem) => {
        elem.addEventListener('mousedown', (e) => {
            if (!e.target.closest('#modal-content')) {
                helpers.hideMenu();
            }
        });
    });

    const modalContent = helpers.createElem('div', 'modal-content');

    const menuContent = helpers.createElem('div', 'menu-content');

    const topNav = helpers.createElem('div', 'top-nav');

    const mainMenu = helpers.createElem('div', 'main-menu', (elem) => {
        elem.classList.add('menu');
        elem.classList.add('active');
    });

    const resizeLabel = helpers.createElem('div', 'resize-label', (elem) => {
        elem.classList.add('label');
        elem.innerText = 'Canvas Size (px)';
    });

    const resizeInput = helpers.createElem('input', 'resize-input', (elem) => {
        elem.classList.add('input');
        elem.type = 'number';
        elem.min = 100;
        elem.step = 1;
        elem.required = true;
        elem.value = defaultWidth;
    });

    const resizeMenu = helpers.createElem('div', 'resize-menu', (elem) => {
        elem.classList.add('menu');
    });

    const stickersMenu = helpers.createElem('div', 'stickers-menu', (elem) => {
        elem.classList.add('menu');
    });

    const stickersLabel = helpers.createElem('div', 'stickers-label', (elem) => {
        elem.classList.add('label');
        elem.innerText = 'Apply your sticker';
    });

    const stickersButtonWrap = helpers.createElem('div', 'stickers-button-wrap');

    const stickersSelect = helpers.createElem('select', 'stickers-select', (elem) => {
        let option = document.createElement("option");

        option.text = 'None';
        option.value = 'none';

        elem.appendChild(option);

        config.inscription_ids.stickers.forEach((sticker, index) => {
            let option = document.createElement("option");

            option.text = sticker.name;
            option.value = index.toString();

            elem.appendChild(option);
        });

        elem.addEventListener('change', (e) => {
            let val = e.target.value;

            if (val === 'none') {
                helpers.removeSticker();
                return;
            }

            helpers.addSticker(config.inscription_ids.stickers[e.target.value]);
        });
    });

    const stickersSubmitButton = helpers.createButton('Apply Sticker', () => {
        helpers.hideMenu();
    }, (button) => {
        button.classList.add('primary');
    });

    const stickersResetButton = helpers.createButton('Reset', () => {
        helpers.removeSticker();
        stickersSelect.selectedIndex = 0;
        helpers.hideMenu();
    });

    const stickersButton = helpers.createButton('Stickers', async () => {
        stickersMenu.appendChild(stickersLabel);
        stickersMenu.appendChild(canvas);
        stickersMenu.appendChild(stickersButtonWrap);

        if (helpers.isGifActive()) {
            helpers.stopAnimation();
        }

        helpers.goToMenu('stickers-menu');
    });

    const resizeForm = helpers.createElem('div', 'resize-form');

    const animateSubmitButton = helpers.createButton('Start', () => {
        animate();
        animateSubmitButton.style.display = "none";

        if (gif_is_done) {
            stopButton.style.display = "block";
        }
    }, (button) => {
        button.classList.add('primary');
    });

    const animateMenu = helpers.createElem('div', 'animate-menu', (elem) => {
        elem.classList.add('menu');
    });

    const loadResourceAsText = async (inscriptionId, onError) => {
        const response = await client.fetch(inscriptionId);
        if (response.ok) {
          return await response.text();
        } else {
          onError();
        }
    }

    let gifBlob, gifWorker;

    const animateButton = helpers.createButton('Animate', () => {
        if (!gifBlob || !gifWorker) {
          let loaded = false;
          setTimeout(() => {
            if (!loaded) { helpers.showLoader('Loading animator'); }
          }, 250);

          new Promise(async (resolve, reject) => {
            const gifText = await loadResourceAsText(config.inscription_ids.gif, () => { reject('gif fetch failed!'); });
            if (!gifText) { return; }
            gifBlob = new Blob([gifText], {type: 'application/javascript'});
            gifWorker = await loadResourceAsText(config.inscription_ids.gif_worker, () => { reject('gif worker fetch failed!'); });
            if (!gifWorker) { return; }
            helpers.loadJS(URL.createObjectURL(gifBlob), true, async () => {
                await initGif();
                resolve();
            });
          }).then(() => {
              helpers.goToMenu('animate-menu');
          }).catch((e) => {
              console.log(e);  // display an error message here like I do with snes load failure?
          }).finally(() => {
              helpers.hide(loader);
              loaded = true;
          });
        } else {
            helpers.goToMenu('animate-menu');
        }

        animationEditor.value = JSON.stringify(helpers.getCurrentAnimationObject(), undefined, 4);
    });


    const animationMenuLabel = helpers.createElem('div', 'animation-label', (elem) => {
        elem.classList.add('label');
        elem.innerText = 'Animate Your Ninja';
    });

    const animationInvalidMessage = helpers.createElem('div', 'animation-invalid', (elem) => {
        elem.classList.add('invalid-message');
        elem.innerText = 'Your animation json is invalid';
    });

    const animateUpdateButton = helpers.createButton('Update Animation', () => {
        animationObject = JSON.parse(animationEditor.value);
        animationMenuButtons.style.display = 'block';
        animationEditWrapper.style.display = 'none';

        helpers.resetAnimation();
    }, (button) => {
        button.classList.add('primary');
    });

    const animationEditor = helpers.createElem('textarea', 'animation-editor', (elem) => {
        elem.placeholder = 'Paste your animation code here';

        elem.addEventListener('input', (e) => {
            const str = e.target.value;
            const isValid = helpers.isValidJson(str);

            animationInvalidMessage.style.display = isValid ? 'none' : 'flex';
            animateUpdateButton.disabled = !isValid;
        });

        elem.addEventListener('keydown', function (e) {
            if (e.key === 'Tab' || e.keyCode === 9) {
                e.preventDefault();

                let start = this.selectionStart;
                let end = this.selectionEnd;

                if (e.shiftKey) {
                    if (start >= 4 && this.value.substring(start - 4, start) === "    ") {
                        this.value = this.value.substring(0, start - 4) + this.value.substring(end);
                        this.selectionStart = this.selectionEnd = start - 4;
                    } else if (start > 0) {
                        this.selectionStart = this.selectionEnd = start - 1;
                    }
                } else {
                    this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + 4;
                }
            }
        });
    });

    const animationMenuButtons = helpers.createElem('div', 'animation-menu-buttons');
    const animationEditWrapper = helpers.createElem('div', 'animation-edit-wrapper');

    const animateEditButton = helpers.createButton('✨ Custom Animation', () => {
        animationMenuButtons.style.display = 'none';
        animationEditWrapper.style.display = 'flex';
    });

    const snesMenu = helpers.createElem('div', 'snes-menu', (elem) => {
        elem.classList.add('menu');
        elem.addEventListener('click', () => {
            onControlSettingsClosed();
        });
    });

    const snesButton = helpers.createButton('Play SNES', async () => {
        if (snesErrorMessage) {
            helpers.setSnesErrorMessage();
        }
        let loaded = false;

        if (!snesGames) {
            setTimeout(() => {
                if (loaded) {
                    return;
                }
                helpers.showLoader('Loading SNES emulator');
                helpers.hide(modal);
            }, 250);
            await setupSnes().catch((errorMessage) => {
                setTimeout(() => {
                    helpers.setSnesErrorMessage(errorMessage);
                    helpers.hide(snesMenuWrapper);
                    helpers.hide(snesLoadedGameInfo);
                    helpers.hide(gameButtonContainer);
                });
            });
        } else {
            helpers.clearLoadedSnesGame();
        }

        helpers.goToMenu('snes-menu');
        helpers.show(modal);
        helpers.show(snesMenuWrapper);
        helpers.show(gameButtonContainer);
        helpers.hide(loader);
        loaded = true;
    });

    header.appendChild(menuBackButton);
    header.appendChild(icon);
    header.appendChild(closeButton);

    menuContent.appendChild(header);

    mainMenu.appendChild(resizeButton);
    mainMenu.appendChild(animateButton);
    mainMenu.appendChild(stickersButton);
    mainMenu.appendChild(snesButton);
    mainMenu.appendChild(licenseButton);

    resizeForm.appendChild(resizeLabel);
    resizeForm.appendChild(resizeInput);
    resizeForm.appendChild(resizeSubmitButton);
    resizeMenu.appendChild(resizeForm);

    stickersButtonWrap.appendChild(selectIcon);
    stickersButtonWrap.appendChild(stickersSelect);
    stickersButtonWrap.appendChild(stickersSubmitButton);
    stickersButtonWrap.appendChild(stickersResetButton);

    stickersMenu.appendChild(stickersButtonWrap);

    animateMenu.appendChild(animationMenuLabel);
    animationMenuButtons.appendChild(animateSubmitButton);
    animationMenuButtons.appendChild(stopButton);
    animationMenuButtons.appendChild(animateEditButton);
    animateMenu.appendChild(animationMenuButtons);

    animationEditWrapper.appendChild(animationEditor);
    animationEditWrapper.appendChild(animationInvalidMessage);
    animationEditWrapper.appendChild(animateUpdateButton);
    animateMenu.appendChild(animationEditWrapper);

    let rom;
    let snesMenuWrapper;
    let snesMenuContainer;
    let snesControlsWrapper;
    let snesControlsButtonWrapper;
    let snesCustomRomWrapper;
    let snesErrorMessage;
    let snesRomDecryptionKeyInput;
    let snesLoadedGameInfo;
    let snesStartButton;
    let snesControlsButton;
    let snesControlsOnePlayerModeButton;
    let snesControlsTwoPlayerModeButton;
    let snesControlsRestoreDefaultsButton;
    let customRom;
    let gameButtonContainer;
    let snesGames;
    let gameButtons;
    let snesControlSections;
    let snesCustomRomUploadInput;
    let snesCustomRomUploadInputLabel;
    let snesCustomRomErrorMessage;
    let snesCustomRomSpan;
    let snesCustomRomInscriptionTextarea;
    let snesCustomRomEncryptedCheckbox;
    let snesCustomRomEncryptedCheckboxLabel;
    let snesCustomRomDoneButton;
    let bootstrap, buildControlSettings, controlModes, isValidRomExtension, insertCartridge, getControlsMode, onControlSettingsClosed, restoreDefaultControls, setControlsMode;
    let decrypt;
    let inscriptionJoin;

    async function setupSnes() {
        ({bootstrap, buildControlSettings, controlModes, isValidRomExtension, insertCartridge, getControlsMode, onControlSettingsClosed, restoreDefaultControls, setControlsMode} = await import(client.prefixedPathFor(config.inscription_ids.emulator_glue)));
        ({decrypt} = await import(client.prefixedPathFor(config.inscription_ids.decrypt)));
        ({inscriptionJoin} = await import(client.prefixedPathFor(config.inscription_ids.inscription_join)));

        snesMenuWrapper = helpers.createElem('div', 'snes-menu-wrapper', (elem) => {
            elem.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        snesMenuContainer = helpers.createElem('div', 'snes-menu-container');

        snesControlsWrapper = helpers.createElem('div', 'snes-controls-wrapper', (elem) => {
            elem.style.display = 'none';
        });

        snesControlsButtonWrapper = helpers.createElem('div', 'snes-controls-button-wrapper');

        snesCustomRomWrapper = helpers.createElem('div', 'snes-custom-rom-wrapper', (elem) => {
            elem.style.display = 'none';
        });

        snesErrorMessage = helpers.createElem('p', null, (elem) => {
            elem.classList.add('snes-error-message');
            helpers.hide(elem);
        });

        snesRomDecryptionKeyInput = helpers.createElem('input', 'snes-rom-decryption-key', (elem) => {
            elem.classList.add('input');
            elem.type = 'input';
            elem.placeholder = 'Enter Decryption Key';
            elem.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            helpers.hide(elem);
        });

        snesLoadedGameInfo = helpers.createElem('div', 'snes-loaded-game-info');

        snesStartButton = helpers.createButton('Start', (button, event) => {
            event.stopPropagation();
            let romData;

            (async () => {
                if (rom.encrypted) {
                    const decrypted = await decrypt(rom.data, snesRomDecryptionKeyInput.value);
                    if (decrypted) {
                        romData = decrypted;
                    } else {
                        helpers.setSnesErrorMessage('Invalid Decryption Key!');
                        return;
                    }
                } else {
                    romData = rom.data;
                }

                insertCartridge(romData, {base64: rom.base64}).then(() => {
                    main.style.display = 'none';
                    snesCanvas.style.display = 'block';
                    document.body.classList.add('snes-active');
                }).catch((e) => {
                    helpers.setSnesErrorMessage('Could not start SNES emulator!');
                    if (window.console) {
                        console.error(e);
                    }
                });
            })();
        }, (button) => {
            button.disabled = true;
        });

        snesControlsButton = helpers.createButton('Configure Controls', (elem, event) => {
            event.stopPropagation();
            helpers.hide(snesMenuContainer);
            helpers.show(snesControlsWrapper);
        });

        snesControlsOnePlayerModeButton = helpers.createButton('1-player mode', (elem) => {
            snesControlsTwoPlayerModeButton.classList.remove('active');
            elem.classList.add('active');
            helpers.hide(snesControlSections.playerTwo);
            setControlsMode(controlModes.ONE_PLAYER);
        }, (elem) => {
            elem.classList.add('snes-control-mode-button');
        });

        snesControlsTwoPlayerModeButton = helpers.createButton('2-player mode', (elem) => {
            snesControlsOnePlayerModeButton.classList.remove('active');
            elem.classList.add('active');
            helpers.show(snesControlSections.playerTwo, 'block');
            setControlsMode(controlModes.TWO_PLAYER);
        }, (elem) => {
            elem.classList.add('snes-control-mode-button');
        });

        snesControlsRestoreDefaultsButton = helpers.createButton('Restore Defaults', (e) => {
            const mode = snesControlsOnePlayerModeButton.classList.contains('active') ? controlModes.ONE_PLAYER : controlModes.TWO_PLAYER;
            restoreDefaultControls(mode);
        });

        customRom = helpers.createElem('div', 'snes-game-custom-rom', (elem) => {
            elem.classList.add('game-button');
            elem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                helpers.clearLoadedSnesGame();
                helpers.setSnesErrorMessage();
                elem.classList.add('selected');
                helpers.resetSnesCustomRomInputs();
                helpers.hide(snesMenuContainer);
                helpers.show(snesCustomRomWrapper);
            });

            const span = helpers.createElem('span');
            const text = 'Play local or inscribed rom';
            span.innerText = text;
            elem.appendChild(span);
            elem.title = text;
        });

        gameButtonContainer = helpers.createElem('div', 'game-button-container', (elem) => {
            elem.appendChild(customRom);
            elem.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        const buildGameButtonElements = async () => {
            snesGames = await helpers.fetchSnesGames();
            gameButtons = {elements: [customRom]};
            snesGames.forEach((game, index) => {
                const gameButton = helpers.createElem('img', `snes-game-${index}`, (gameButton) => {
                    gameButtons.elements.push(gameButton);
                    gameButton.title = game.name;
                    gameButton.src = `data:image/png;base64,${game.image}`;
                    gameButton.classList.add('game-button');

                    gameButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (rom?.name === game.name) {
                            return;
                        }

                        helpers.clearLoadedSnesGame({skipResetBehavior: true});
                        gameButton.classList.add('selected');
                        helpers.snesLoadInscriptionsFor(game);
                        helpers.scrollModalToBottom();
                    });
                });
                gameButtonContainer.appendChild(gameButton);
            });
        }

        snesMenuWrapper.appendChild(snesControlsButton);
        snesMenuWrapper.appendChild(snesRomDecryptionKeyInput);
        snesMenuWrapper.appendChild(snesStartButton);

        snesControlsButtonWrapper.appendChild(snesControlsOnePlayerModeButton);
        snesControlsButtonWrapper.appendChild(snesControlsTwoPlayerModeButton);
        snesControlsWrapper.appendChild(snesControlsButtonWrapper);

        snesCustomRomUploadInput = helpers.createElem('input', 'snes-custom-rom-upload', (elem) => {
            elem.classList.add('button');
            elem.type = 'file';
            elem.addEventListener('change', () => {
                let [file] = elem.files;
                helpers.setSnesErrorMessage();

                if (file && isValidRomExtension(file)) {
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                        rom = {data: reader.result.split(',')[1], base64: true};
                        helpers.setSnesLoadedGameInfo(file.name.split(/\.[^\.]+$/)[0]);
                        snesStartButton.disabled = false;
                        snesCustomRomDoneButton.disabled = false;
                    });

                    reader.readAsDataURL(file);
                    helpers.resetSnesCustomRomInputs({skipFileInput: true});
                } else {
                    helpers.setSnesErrorMessage('File must be an .sfc or .smc!');
                    helpers.resetSnesCustomRomInputs();
                }
            });
        });

        snesCustomRomUploadInputLabel = helpers.createElem('label', 'snes-custom-rom-upload-label', (elem) => {
            elem.innerText = 'Local Filesystem ROM:';
            elem.setAttribute('for', snesCustomRomUploadInput.id);
            elem.appendChild(snesCustomRomUploadInput);
        });

        snesCustomRomErrorMessage = helpers.createElem('p', null, (elem) => {
            elem.classList.add('snes-error-message');
            helpers.hide(elem);
        });

        snesCustomRomSpan = helpers.createElem('span', 'snes-custom-rom-span', (elem) => {
            elem.innerText = '-- OR --';
        });

        snesCustomRomInscriptionTextarea = helpers.createElem('textarea', 'snes-game-inscription-ids', (elem) => {
            elem.setAttribute('placeholder', 'Enter ordered list of inscription ids...');
            elem.addEventListener('input', () => {
                helpers.setSnesErrorMessage();
                snesCustomRomUploadInput.value = '';
                snesCustomRomDoneButton.disabled = !elem.value;
                snesCustomRomEncryptedCheckbox.disabled = !elem.value

                if (elem.value) {
                    snesCustomRomEncryptedCheckboxLabel.classList.remove('disabled');
                } else {
                    snesCustomRomEncryptedCheckboxLabel.classList.add('disabled');
                }
            });
        });

        snesCustomRomEncryptedCheckbox = helpers.createElem('input', 'snes-custom-rom-encrypted', (elem) => {
            elem.type = 'checkbox';
            elem.disabled = true;
            elem.addEventListener('change', (event) => {
                if (!rom) {
                    return;
                }
                rom.encrypted = elem.checked;
            });
        });

        snesCustomRomEncryptedCheckboxLabel = helpers.createElem('label', 'snes-custom-rom-encrypted-label', (elem) => {
            elem.innerText = 'Encrypted:'
            elem.setAttribute('for', snesCustomRomEncryptedCheckbox.id);
            elem.classList.add('disabled');
            elem.appendChild(snesCustomRomEncryptedCheckbox);
        });

        snesCustomRomDoneButton = helpers.createButton('Load Custom Rom', (button, event) => {
            button.disabled = true;

            if (snesCustomRomInscriptionTextarea.value) {
                helpers.showLoader('Loading custom rom inscriptions');
                helpers.hide(modal);
                helpers.snesLoadInscriptionsFor({
                    name: 'custom inscription id(s)',
                    inscriptionIds: snesCustomRomInscriptionTextarea.value.replace(/[^a-z0-9]+/ig, ',').split(','),
                    encrypted: !!snesCustomRomEncryptedCheckbox.checked,
                }).then((blob) => {
                    helpers.hide(snesCustomRomWrapper);
                    helpers.show(snesMenuContainer);
                }).catch((e) => {
                    helpers.setSnesErrorMessage('Failed to fetch inscriptions');
                }).finally(() => {
                    helpers.hide(loader);
                    helpers.show(modal);
                });
            } else {
                helpers.hide(snesCustomRomWrapper);
                helpers.show(snesMenuContainer);
            }
        }, (elem) => {
            elem.disabled = true;
        });

        snesCustomRomWrapper.appendChild(snesCustomRomUploadInputLabel);
        snesCustomRomWrapper.appendChild(snesCustomRomSpan);
        snesCustomRomWrapper.appendChild(snesCustomRomInscriptionTextarea);
        snesCustomRomWrapper.appendChild(snesCustomRomEncryptedCheckboxLabel);
        snesCustomRomWrapper.appendChild(snesCustomRomDoneButton);
        snesCustomRomWrapper.appendChild(snesCustomRomErrorMessage);

        snesMenuContainer.appendChild(snesLoadedGameInfo);
        snesMenuContainer.appendChild(gameButtonContainer);
        snesMenuContainer.appendChild(snesMenuWrapper);
        snesMenuContainer.appendChild(snesErrorMessage);

        snesMenu.appendChild(snesMenuContainer);
        snesMenu.appendChild(snesCustomRomWrapper);
        snesMenu.appendChild(snesControlsWrapper);

        await new Promise((resolve, reject) => {
            bootstrap(snesCanvas, helpers.inscriptionJoin(config.inscription_ids.snes9x_binary)).then(async () => {
                snesControlSections = buildControlSettings(snesControlsWrapper);
                const container = helpers.createElem('div', 'snes-controls-customizable-inputs-container', (elem) => {
                    elem.appendChild(snesControlSections.playerOne);
                    elem.appendChild(snesControlSections.playerTwo);
                });
                snesControlsWrapper.appendChild(container);
                snesControlsWrapper.appendChild(snesControlsRestoreDefaultsButton);
                if (getControlsMode() === controlModes.ONE_PLAYER) {
                    helpers.hide(snesControlSections.playerTwo);
                    snesControlsOnePlayerModeButton.classList.add('active');
                } else {
                    snesControlsTwoPlayerModeButton.classList.add('active');
                }
                helpers.showLoader('Loading SNES game libary');
                await buildGameButtonElements().catch(() => {
                    reject('Could not load game library!');
                });
                resolve();
            }).catch((e) => {
                reject('Could not load SNES Emulator!');
            });
        });
    }

    menuContent.appendChild(mainMenu);
    menuContent.appendChild(resizeMenu);
    menuContent.appendChild(stickersMenu);
    menuContent.appendChild(snesMenu);
    menuContent.appendChild(animateMenu);
    menuContent.appendChild(licenseMenu);

    menuContent.appendChild(footer);
    modalContent.appendChild(menuContent);

    modal.appendChild(modalContent);

    if (!helpers.isInIframe()) {
        topNav.appendChild(downloadButton);
    }

    topNav.appendChild(openMenuButton);

    let images = [];
    let loadCount = 0;

    const fetchPromises = imgObjects.map(obj => client.fetch(obj.id));

    const initGif = async () => {
        const workerBlob = new Blob([gifWorker], {type: 'application/javascript'});

        gif = new GIF({
            workers: 4,
            workerScript: URL.createObjectURL(workerBlob),
            globalPalette: true,
            quality: 10,
            width: 2000,
            height: 2000
        });

        gif.on('progress', function (p) {
            progress.innerText = Math.round(p * 100) + '%';
        });

        gif.on('finished', function (blob) {
            gifData = URL.createObjectURL(blob);

            canvas.style.display = 'none';

            gifImg = document.createElement('img');
            gifImg.src = gifData;
            gifImg.id = 'gif';
            gifImg.style.display = 'block';
            gifImg.style.maxWidth = defaultWidth.toString();
            gifImg.style.maxHeight = defaultHeight.toString();
            main.appendChild(gifImg);

            animateSubmitButton.style.display = 'none';
            stopButton.style.display = 'block';

            helpers.hide(loader);

            clearInterval(loop);
            frame = 0;

            helpers.clear();
            helpers.applyBackground();

            drawImages();
        });
    }

    Promise.all(fetchPromises)
        .then(responses => Promise.all(responses.map(response => response.text())))
        .then(data => {
            imgObjects.forEach((img, index) => {
                let image = new Image();

                if (data[index].includes('<svg version="1.1"')) {
                    img.svg = data[index];
                } else {
                    console.error('Error loading trait: ', img.id);
                    img.svg = '<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve"></svg>';
                }

                for (let i = 0; i < 11; i++) {
                    if (imgObjects[index]['ST' + i]) {
                        img.svg = img.svg.replaceAll(`%%ST${i}%%`, imgObjects[index][`ST${i}`] || 'red');
                    }
                }

                image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(img.svg);
                image.crossOrigin = 'anonymous';

                image.onload = async () => {
                    loadCount++;

                    if (loadCount === imgObjects.length) {
                        main.style.margin = '0px';
                        main.style.padding = '0px';

                        if (helpers.getQueryParam('background') !== 'none') {
                            context.fillStyle = bg;
                            context.fillRect(0, 0, width, height);
                        }

                        drawImages();
                        helpers.hide(loader);
                        main.append(style);
                        main.append(canvas);
                        main.append(modal);
                        main.append(topNav);
                        main.style.overscrollBehavior = 'none';

                        const meta = document.createElement('meta');
                        meta.name = "viewport";
                        meta.content = "width=device-width, initial-scale=1";
                        document.getElementsByTagName('head')[0].appendChild(meta);
                    }
                };

                images.push(image);
            });
        })
        .catch(error => {
            console.error("Error fetching data: ", error);
        });

    let forcedHolidayKey;

    async function drawImages() {
        //const holiday_trait = forcedHolidayKey || helpers.isWithinHolidayPeriod();
        const holiday_trait = false;

        if (activeSticker) {
            let img = new Image();

            img.onload = function () {
                for (let i = 0; i < images.length; i++) {
                    if (holiday_trait && imgObjects[i].holiday_swap) {
                        console.log('Happy Holidays! (' + holiday_trait + ')');
                    } else {
                        context.drawImage(images[i], 0, 0, width, height);
                    }
                }

                context.drawImage(img, 0, 0, width, height);
            };

            const response = await client.fetch(activeSticker.id);
            const svg = await response.text();

            img.src = `data:image/svg+xml;base64,${btoa(svg)}`;

        } else {
            for (let i = 0; i < images.length; i++) {
                if (holiday_trait && imgObjects[i].holiday_swap) {
                    console.log('Happy Holidays! (' + holiday_trait + ')');
                } else {
                    context.drawImage(images[i], 0, 0, width, height);
                }
            }
        }

        if (holiday_trait) {
            const trait_id = config.inscription_ids.holiday_traits[holiday_trait];

            if (trait_id) {
                let img = new Image();

                img.crossOrigin = 'anonymous';

                img.onload = async () => {
                    context.drawImage(img, 0, 0, width, height);

                    if (holiday_trait === "april_fools_day") {
                        document.body.classList.add('april-fools-day');

                        try {
                            const soundResponse = await client.fetch(config.inscription_ids.error_sound);
                            const soundBlob = await soundResponse.blob();
                            const audio = new Audio(URL.createObjectURL(soundBlob));

                            const playOrPauseSound = () => {
                                if (audio.paused) {
                                    audio.play();
                                } else {
                                    audio.pause();
                                    audio.currentTime = 0;
                                }
                            };

                            document.addEventListener('click', playOrPauseSound);
                            document.addEventListener('keydown', playOrPauseSound);

                        } catch (error) {
                            console.error('Error loading or playing the audio:', error);
                        }
                    }
                };

                const response = await client.fetch(trait_id);
                const svg = await response.text();

                img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
            }
        }
    }

    let loop;
    let frame;
    let speed = 1000 * 0.05;

    function animate() {
        frame = 0;

        if (gif_is_done) {
            canvas.style.display = 'none';
            gifImg.style.display = 'block';
            helpers.hideMenu();
            return;
        }

        helpers.removeSticker();

        width = defaultWidth;
        height = defaultHeight;
        helpers.resizeCanvas(defaultWidth, defaultHeight);

        helpers.hideMenu();
        helpers.showLoader('Generating Animation', {progress: true});

        loop = setInterval(() => {
            ++frame;

            console.log("Frame: ", frame);

            helpers.clear();
            helpers.applyBackground();

            const frameObj = animationObject[`frame_${frame}`];

            for (let i = 0; i < images.length; i++) {
                const layers = frameObj['layers'] || {};

                const layerObj = layers[imgObjects[i].type] || layers[`layer_${i + 1}`] || {
                    x: 0,
                    y: 0
                };

                context.drawImage(
                    images[i],
                    layerObj.y || 0,
                    layerObj.x || 0,
                    defaultWidth,
                    defaultHeight
                );
            }

            if (!gif_is_done) {
                gif.addFrame(context, {copy: true, delay: frameObj['duration'] || 50});
            }

            if (frame === Object.keys(animationObject).length) {
                frame = 0;
                console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

                if (!gif_is_done) {
                    gif.render();
                    gif_is_done = true;
                }
            }

        }, speed);
    }
}
