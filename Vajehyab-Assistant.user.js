// ==UserScript==
// @name            Vajehyab Assistan
// @name:fa      	  دستیار واژه‌یاب
// @version         10
// @namespace       amm1rr
// @author          Amir
// @description     Use the VajehYab.com website as a dictionary. Just double-click or select any text, and the results will appear as a smooth and light pop-up. It is a translator that you can enable/disable by using Ctrl + Alt + Q.
// @description:fa  کلمه انتخاب شده را در سایت واژه‌یاب جستجو و نمایش می‌دهد
// @match           https://twitter.com/*
// @include         *
// @homepage        https://github.com/Amm1rr/Vajehyab-Assistant
// @icon            https://vajehyab.com/assets/icons/180.png
// @source          https://github.com/Amm1rr/Vajehyab-Assistant
// @updateURL       https://github.com/Amm1rr/Vajehyab-Assistant/raw/main/Vajehyab-Assistant.user.js
// @downloadURL     https://github.com/Amm1rr/Vajehyab-Assistant/raw/main/Vajehyab-Assistant.user.js
// @supportURL      https://github.com/Amm1rr/Vajehyab-Assistant/issues
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require         https://code.jquery.com/jquery-3.6.0.slim.min.js
// @resource        https://github.com/Amm1rr/Vajehyab-Assistant/raw/main/ref/style-minimal.min.css
// @grant           GM_xmlhttpRequest
// @grant           GM_getResourceText
// @connect         vajehyab.com
// @license         MIT
// ==/UserScript==

// window.getSelection().toString()

// window.document.body.addEventListener("mouseup", translate, false);
window.document.body.addEventListener("click", translate, false);
window.document.body.addEventListener("keyup", toggleVajehyab, false);
var toggle = true;

// Ctrl + Alt + Q => Toggle Enable\Disable Vajehyab Assistant
function toggleVajehyab(e) {
    if (e.which == 81 && e.altKey && e.ctrlKey) {
        if (toggle) {
            window.document.body.removeEventListener("click", translate, false);
            toggle = false;
        } else {
            window.document.body.addEventListener("click", translate, false);
            toggle = true;
        }
    }
}

function Clean_Result(doc) {
    const parser = new DOMParser();
    const docu = parser.parseFromString(doc, "text/html");

    const headerElement2 = docu.querySelector(".--1gs28b8");
    if (headerElement2) {
        headerElement2.parentNode.removeChild(headerElement2);
    }

    const headerElement = docu.querySelector(".--115001t");
    headerElement.parentNode.removeChild(headerElement);

    const searchBar = docu.querySelectorAll(".--1n141gl");
    searchBar.forEach((bar) => {
        bar.parentNode.removeChild(bar);
    });

    const footerElement = docu.querySelector("footer");
    footerElement.parentNode.removeChild(footerElement);

    const modifiedHTML = docu.documentElement.outerHTML;

    return modifiedHTML;
}

function calculatePosition(x, y, popup) {
    const pos = {};
    const margin = 5;
    const anchor = 10;

    const outerWidth = $(popup).outerWidth();
    const outerHeight = $(popup).outerHeight();

    // show popup to the right of the word if it fits into window this way
    if (x + anchor + outerWidth + margin < $(window).width()) {
        pos.x = x + anchor;
    }
    // show popup to the left of the word if it fits into window this way
    else if (x - anchor - outerWidth - margin > 0) {
        pos.x = x - anchor - outerWidth;
    }
    // show popup at the very left if it is not wider than window
    else if (outerWidth + margin * 2 < $(window).width()) {
        pos.x = margin;
    }
    // resize popup width to fit into window and position it the very left of the window
    else {
        const non_content_x = outerWidth - $(popup).width();

        $(popup).width($(window).width() - margin * 2 - non_content_x);

        pos.x = margin;
    }

    // show popup above the word if it fits into window this way
    if (y - anchor - outerHeight - margin > 0) {
        pos.y = y - anchor - outerHeight;
    }
    // show popup below the word if it fits into window this way
    else if (y + anchor + outerHeight + margin < $(window).height()) {
        pos.y = y + anchor;
    }
    // show popup at the very top of the window
    else {
        pos.y = margin;
    }

    return pos;
}

function PopupsRemover() {
    // remove previous .vajehPopup if exists
    var previous = document.querySelector(".vajehPopup");
    while (previous) {
        document.body.removeChild(previous);
        previous = document.querySelector(".vajehPopup");
    }

    previous = document.querySelector("#vajehiframe");
    while (previous) {
        document.body.removeChild(previous);
        previous = document.querySelector("#vajehiframe");
    }
}

function translate(e) {
    // remove previous .vajehPopup if exists
    PopupsRemover();
    // console.log("translate start");
    var selectObj = document.getSelection();

    // if #text node
    if (selectObj.anchorNode && selectObj.anchorNode.nodeType == 3) {
        //GM_log(selectObj.anchorNode.nodeType.toString());
        var word = selectObj.toString();
        if (word == "") {
            return;
        }
        // linebreak wordwrap, optimize for pdf.js
        word = word.replace("-\n", "");
        // multiline selection, optimize for pdf.js
        word = word.replace("\n", " ");
        //console.log("word:", word);
        var ts = new Date().getTime();
        //console.log("time: ", ts);
        var mx = e.clientX;
        var my = e.clientY;
        GetTranslate(word, ts);
    }

    function getParameter(jsonData, parameter, wrd) {
        let jsdata = JSON.parse(jsonData);
        let data;

        try {
            data = jsdata.props.pageProps.fallback[wrd + ":"].data;
        } catch (error) {
            return undefined;
        }

        if (typeof data === "undefined") {
            return undefined;
        }

        switch (parameter) {
            case "Query":
                return data.Query ? data.Query : undefined;
            case "Id":
                return data.Id ? data.Id : undefined;
            case "Exact": {

                const exact = [];

                if (data.Exact) {
                    for (const doc of data.Exact.Docs) {
                        exact.push(doc);
                    }
                }

                if (exact.length == 0) {

                    const similar = [];
                    if (data.Similar) {
                        for (const doc of data.Similar.Docs) {
                            exact.push(doc);
                        }
                    }
                }

                return exact;
            }
            case "Similar":
                return data.Similar ? data.Similar : undefined;

            // const similar = data.Similar.Docs.map((doc) => ({
            //   dictionary: doc.dictionary,
            //   dictionary_id: doc.dictionary_id,
            //   id: doc.id,
            //   score: doc.score,
            //   slug: doc.slug,
            //   summary: doc.summary,
            //   title: doc.title
            // }));

            case "Text":
                return data.Text ? data.Text : undefined;
            case "Prefix":
                return data.Prefix ? data.Prefix : undefined;
            case "Mlt":
                return data.Mlt ? data.Mlt : undefined;
            case "Spell":
                return data.Spell ? data.Spell : undefined;
            case "Random":
                return data.Random ? data.Random : undefined;
            case "WordBox":
                return data.WordBox ? data.WordBox : undefined;
            default:
                return undefined;
        }
    }

    function popup(mx, my, result, wrd) {
        PopupsRemover();

        /* HTML Parse */
        const parser = new DOMParser();
        const page = parser.parseFromString(result, "text/html");
        const jsontag = page.querySelector("#__NEXT_DATA__");
        const json = jsontag.innerHTML;

        const res = getParameter(json, "Exact", wrd);

        if (
            typeof res === "undefined" ||
            !Array.isArray(res) ||
            res.length < 1 ||
            typeof res[0] === "undefined" ||
            res[0].length < 2
        ) {
            console.log("یافت نشد");
            return;
        }

        // console.log(res);
        // console.log(res[0].title);

        /* HTML Parse */
        var iframe = document.createElement("iframe");
        iframe.src = "about:blank";
        iframe.id = "vajehiframe";

        // main window
        // first insert into dom then there is offsetHeight！IMPORTANT！
        // document.body.appendChild(vajehWindow);
        document.body.appendChild(iframe);

        var html =
            "<html><head><title>واژه‌یاب فارسی</title>" +
            ' </head><body style="padding-bottom: 0px; direction:rtl; padding-right:15px;">';
        for (let i = 0; i < res.length; i++) {
            html += "<header>" + res[i].title + "  |  " + res[i].dictionary + "<hr>";
            html += res[i].summary + "</header><br>";
        }
        html += "</body></html>";

        iframe.srcdoc = html;
        let vajehWindow = iframe;
        vajehWindow.style.color = "blue";
        vajehWindow.style.textAlign = "right";
        vajehWindow.style.display = "block";
        vajehWindow.style.position = "fixed";
        vajehWindow.style.background = "lightblue";
        vajehWindow.style.borderRadius = "5px";
        vajehWindow.style.boxShadow = "0 0 5px 0";
        vajehWindow.style.opacity = "0.9";
        vajehWindow.style.width = "20%";
        vajehWindow.style.overflowWrap = "break-word";
        vajehWindow.style.left = mx - 40 + "px";
        // vajehWindow.style.dir = "rtl";

        var cssstyle = {
            "overflow-y": "scroll",
            height: "60%",
        };
        Object.assign(vajehWindow.style, cssstyle);

        // frames[0].document.querySelector("html").dir = "rtl";
        // document.querySelector("html").dir = "rtl";

        var pos = calculatePosition(mx, my, vajehWindow);

        if (pos.x + 200 + 30 >= window.innerWidth) {
            vajehWindow.style.left =
                parseInt(vajehWindow.style.left) - 200 + "px";
        }
        if (pos.y + vajehWindow.offsetHeight + 30 >= window.innerHeight) {
            vajehWindow.style.bottom = "10px";
        } else {
            vajehWindow.style.top = pos.y + 10 + "px";
        }
        vajehWindow.style.left = parseInt(vajehWindow.style.left) - 200 + "px";
        vajehWindow.style.bottom = "10px";
        //if (mx + 200 + 30 >= window.innerWidth) {
        //vajehWindow.style.left = parseInt(vajehWindow.style.left) - 200 + "px";
        //  console.log("Width Worked");
        //}
        if (my + vajehWindow.offsetHeight + 30 >= window.innerHeight) {
            //vajehWindow.style.bottom = "10px";
            //console.log("Height bottom");
        } else {
            vajehWindow.style.top = my + 15 + "px";
            //console.log("Height top");
        }
        vajehWindow.style.padding = "5px";
        vajehWindow.style.zIndex = "999999";
    }

    function GetTranslate(wrd, ts) {
        // var reqUrl = `https://www.vajehyab.com/?q=${word}&d=en&_=1617191412351&ts=${ts}`;
        // var reqUrl = `https://www.vajehyab.com/?q=${word}&d=en`;
        let trimWord = wrd.trim();
        let reqUrl = `https://vajehyab.com/?q=${trimWord}`;
        //console.log("request url: ", reqUrl);
        let ret = GM.xmlHttpRequest({
            method: "GET",
            url: reqUrl,
            headers: { Accept: "application/json" }, // can be omitted...
            onreadystatechange: function (res) {
                //console.log("Request state changed to: " + res.readyState);
            },
            onload: function (res) {
                let retContent = res.response;
                // console.log(retContent);
                // const parser = new DOMParser();
                // retContent = parser.parseFromString(retContent, 'text/html');
                popup(mx, my, retContent, trimWord);
            },
            onerror: function (res) {
                console.log("error");
            },
        });
    }
}

function MakeVIP(doc) {
    try {
        if (doc != null || doc != undefined) {
            let magicword = doc.getElementById("magicword");
            if (magicword != null && magicword != undefined) {
                magicword.classList.replace("nopremium", "premium");
            }
            let ispre = doc.getElementById("is_premium");
            if (ispre != null && ispre != undefined) {
                ispre.value = "1";
            }

            let isads = doc.getElementsByClassName("vyads");
            if (isads != null && isads != undefined) {
                isads[0].remove();
            }
            let ads = doc.querySelector("#content > div.vyads");
            if (ads != null && ads != undefined) {
                ads.remove();
            }
            let showmorepremiumbtn = doc.querySelector("#wordbox > a");
            if (showmorepremiumbtn != null && showmorepremiumbtn != undefined) {
                showmorepremiumbtn.remove();
            }
        }
        if (window.location.href.indexOf("vajehyab.com") > -1) {
            /* Todo:
                      - It's not optimize and also might not need to use IF condition Is
                  */
            let magicword = document.getElementById("magicword");
            if (magicword == null || magicword == undefined) {
                return;
            }
            magicword.classList.replace("nopremium", "premium");
            document.getElementById("is_premium").value = "1";
            document.getElementsByClassName("vyads")[0].remove;
            document.querySelector("#content > div.vyads").remove;
            let showmorepremiumbtn = document.querySelector("#wordbox > a");
            if (showmorepremiumbtn != null && showmorepremiumbtn != undefined) {
                showmorepremiumbtn.remove();
            }
        }
    } catch (err) {
        if (err != null) {
            console.log(err);
        }
    } finally {
        return doc;
    }
}

function PrintElem_DEBUG(elem) {
    var mywindow = window.open("", "PRINT", "height=400,width=500");

    mywindow.document.write(
        "<html><head><title>" + document.title + "</title>"
    );
    mywindow.document.write("</head><body >");
    mywindow.document.write("<h1>" + document.title + "</h1>");
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}

function printDiv_DEBUG(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}
