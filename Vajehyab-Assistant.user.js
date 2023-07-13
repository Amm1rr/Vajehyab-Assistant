// ==UserScript==
// @name            Vajehyab Assistan
// @name:fa      	  دستیار واژه‌یاب
// @version         10
// @namespace       amm1rr
// @author          Amir
// @description     Use the VajehYab.com website as a dictionary. Just double-click or select any text, and the results will appear as a smooth and light pop-up. It is a translator that you can enable/disable by using Ctrl + Alt + Q.
// @description:fa  کلمه انتخاب شده را در سایت واژه‌یاب جستجو و نمایش می‌دهد
// @match           https://twitter.com/*
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

/*
waitForKeyElements (".-cx-PRIVATE-ProfilePage__avatar", visibleCounter);
function visibleCounter(jNode){
    // Custome Code
}
*/

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
  const docu = parser.parseFromString(doc, 'text/html');

  const headerElement2 = docu.querySelector('.--1gs28b8');
  if (headerElement2) {
    headerElement2.parentNode.removeChild(headerElement2);
  }
  
  const headerElement = docu.querySelector('.--115001t');
  headerElement.parentNode.removeChild(headerElement);

  const searchBar = docu.querySelectorAll('.--1n141gl');
  searchBar.forEach((bar) => {
    bar.parentNode.removeChild(bar);
  });

  const footerElement = docu.querySelector('footer');
  footerElement.parentNode.removeChild(footerElement);

  const modifiedHTML = docu.documentElement.outerHTML;

  return modifiedHTML;


  var docword = docu.querySelector("#wordbox");


  if (docword) {
    // docword = doc;
    docword.querySelector("#langs-dropdown").remove();
    docword.querySelector("#langs").remove();

    // var $Word = docword.querySelector("#wordbox > section.word > header > h1");

    var $ManiDic = docword.querySelector(
      "#wordbox > div > section.mean > header > h4"
    );
    // var $Mani = docword.querySelector("#wordbox > div > section.mean > div");

    var $MotaradefDic = docword.querySelector(
      "#wordbox > div > section.motaradef > header > h4"
    );
    // var $Motaradef = docword.querySelector(
    //   "#wordbox > div > section.motaradef > div > p"
    // );

    var $BarabarFarsiDic = docword.querySelector(
      "#wordbox > div > section.sereh > header > h4"
    );
    // var $BarabarFarsi = docword.querySelector(
    //   "#wordbox > div > section.sereh > div > p"
    // );

    var $FelDic = docword.querySelector(
      "#wordbox > div > section.verb > header > h4"
    );
    var $Fel = docword.querySelector("#wordbox > div > section.verb > div > p");

    // var $DicDic = docword.querySelector(
    //   "#wordbox > section.dictionary > header > h4"
    // );
    var $Dic = docword.querySelector("#wordbox > section.dictionary > div > p");

    let NotFoundText = "\n            نتیجه‌ای یافت نگردید.         ";
    // let NotFound2 = "\n                     ";
    let Dic = $Dic.innerHTML;

    if (
      $MotaradefDic == null &&
      $BarabarFarsiDic == null &&
      $ManiDic == null &&
      $FelDic == null &&
      (Dic == NotFoundText ||
      Dic.trim() == "")
    ) {
      return null;
    }

    //-- Remove Button Dictionary Section (Don't need anymore (انگلیسی، ترکی، عربی))
    if (Dic == NotFoundText || Dic.trim() == "") {
      docword.querySelector("#wordbox > section.dictionary").remove();
    }
  }else{
    docword = doc;
  }

  return docword;
}

function calculatePosition(x, y, popup) {
  const pos = {};
  const margin = 5;
  const anchor = 10;
  // console.log(popup);
  //const outerWidth = Number(popup.attr("outer-width"));
  //const outerHeight = Number(popup.attr("outer-height"));
  const outerWidth = Number($(popup).outerWidth());
  const outerHeight = Number($(popup).outerHeight());

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
    const non_content_x = outerWidth - Number($(popup).outerWidth());

    $(popup).outerWidth(
      "content-width",
      $(window).width() - margin * 2 - non_content_x
    );

    $(popup).outerWidth("content-height", Number($(popup).outerWidth()) + 4);

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
    translate(word, ts);
  }

  function popup(mx, my, result) {
    PopupsRemover();

    /* HTML Parse */
    const parser = new DOMParser();

    // Implament Result HTMLDocument
    var doc3 = result //parser.parseFromString(result, "text/html");

    //console.log(new XMLSerializer().serializeToString(doc3));
    // var docvip = MakeVIP(doc3);
    var vajehWindow = Clean_Result(doc3);
    // var vajehWindow = docvip

    // console.log("Problem is Here line 220 - " + docvip);
    // console.log(new XMLSerializer().serializeToString(vajehWindow));
    // var vajehWindow = doc3;

    if (!vajehWindow) {
      return;
    }

    // // vajehWindow = doc.documentElement;
    const doc = parser.parseFromString(vajehWindow, 'text/html');
    const rootNode = doc.documentElement;

    console.log(rootNode);
    vajehWindow = rootNode;

    vajehWindow.classList.toggle("vajehPopup");

    /* HTML Parse */
    var iframe = document.createElement("iframe");
    iframe.src = "about:blank";
    iframe.id = "vajehiframe";

    // iframe.srcdoc = result;

    // main window
    // first insert into dom then there is offsetHeight！IMPORTANT！
    // document.body.appendChild(vajehWindow);
    document.body.appendChild(iframe);

    // var fra = document.getElementById("vajehiframe");

    // iframe.contentWindow.document.body.style.background = "red";

    var vajehString = new XMLSerializer().serializeToString(vajehWindow);
    var html =
      "<html><head><title>واژه‌یاب فارسی</title>" +
      // ' <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Soheyl/Vajehyab-Assistant@main/ref/style-minimal.min.css">' +
      " <style>#notfound h3 .word{color:#aaa;font-weight:200}#notfound .addword .word,#spellcheck .addword .word{font-weight:500}#magicword .word,#wordbox .word{border:none}#magicword .word h1,#magicword .word h3,#wordbox .word h1,#wordbox .word h3{display:inline-block}#magicword .word h3,#wordbox .word h3{color:#aaa;font-size:18px}#magicword .word h1,#wordbox .word h1{font-size:25px;margin-bottom:5px;line-height:30px}#magicword section .content,#wordbox section .content{overflow:hidden}#magicword .verb span,#wordbox .verb span{width:75px;display:inline-block}#wordbox .dictionary p{padding-top:5px}#wordbox .more{padding-top:5px;border-top:1px solid #f1f1f1;text-align:center;display:block;color:#aaa;font-size:14px;background:#fafafa;cursor:pointer}#wordbox .more:hover{background:#fdfdfd}#wordbox .more span{display:block;text-align:center;font-size:21px;margin-top:-4px;padding-bottom:1px}#wordbox{border-radius:4px;border:2px solid #f1f1f1;margin-bottom:10px}#magicword section,#wordbox section{padding:19px 15px;border-top:1px solid #f1f1f1}#magicword .mean h3,#wordbox .mean h3{font-size:18px;color:#777;margin-right:5px}#magicword .mean h2,#wordbox .mean h2{color:#aaa;margin-top:10px;font-size:14px}#magicword .mean h2:empty,#wordbox .mean h2:empty{display:none}#magicword section header h4,#wordbox section header h4{border-radius:2px;float:left;font-size:14px;margin-top:-33px;display:inline-block;background-color:#f1f1f1;padding:5px;color:#797979;width:95px;text-align:center;cursor:pointer;font-weight:200;line-height:16px}#magicword section header h4.closed,#magicword section header h4:hover,#wordbox section header h4.closed,#wordbox section header h4:hover{color:#fff;background:#bbb}.gray{color:#999}a,abbr,acronym,address,applet,article,aside,audio,b,big,blockquote,body,canvas,caption,center,cite,code,dd,del,details,dfn,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,html,i,iframe,img,ins,kbd,label,legend,li,mark,menu,nav,object,ol,output,p,pre,q,ruby,s,samp,section,small,span,strike,strong,sub,summary,sup,table,tbody,td,tfoot,th,thead,time,tr,tt,u,ul,var,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:after,blockquote:before,q:after,q:before{content:'';content:none}table{border-collapse:collapse;border-spacing:0}button,h1,h2,h3,h4,h5,h6,html,input,p,select,textarea{font-family:tahoma;font-family:IRANSans,tahoma;font-weight:300;color:#333}:focus{outline:0}*{outline:0;direction:rtl;text-align:right}body,html{direction:ltr}body{padding-bottom:50px;line-height:25px;overflow-x:hidden}strong{font-weight:500}b{font-weight:500}</style>" +
      ' </head><body style="padding-bottom: 0px; direction:rtl;">' +
      vajehString +
      "</body></html>";
    iframe.srcdoc = html;
    vajehWindow = iframe;
    vajehWindow.style.color = "blue";
    vajehWindow.style.textAlign = "right";
    vajehWindow.style.display = "block";
    vajehWindow.style.position = "fixed";
    vajehWindow.style.background = "lightblue";
    vajehWindow.style.borderRadius = "5px";
    vajehWindow.style.boxShadow = "0 0 5px 0";
    vajehWindow.style.opacity = "0.9";
    vajehWindow.style.width = "20%";
    vajehWindow.style.wordWrap = "break-word";
    vajehWindow.style.left = mx - 40 + "px";
    vajehWindow.style.dir = "rtl";

    var cssstyle = {
      "overflow-y": "scroll",
      height: "40%",
    };
    Object.assign(vajehWindow.style, cssstyle);

    // frames[0].document.querySelector("html").dir = "rtl";
    // document.querySelector("html").dir = "rtl";

    var pos = calculatePosition(mx, my, vajehWindow);

    if (pos.x + 200 + 30 >= window.innerWidth) {
      vajehWindow.style.left = parseInt(vajehWindow.style.left) - 200 + "px";
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

    function word() {
      function play(word) {
        //console.log("[DEBUG] PLAYOUND")

        function playSound(buffer) {
          var source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.start(0);
        }

        var context = new AudioContext();
        var soundUrl = `https://dict.youdao.com/dictvoice?type=2&audio=${word}`;
        var p = new Promise(function (resolve, reject) {
          var ret = GM.xmlHttpRequest({
            method: "GET",
            url: soundUrl,
            responseType: "arraybuffer",
            onload: function (res) {
              try {
                context.decodeAudioData(res.response, function (buffer) {
                  resolve(buffer);
                });
              } catch (e) {
                reject(e);
              }
            },
          });
        });
        p.then(playSound, function (e) {
          console.log(e);
        });
      }

      var basic = dictJSON["basic"];
      var header = document.createElement("p");
      // header
      var span = document.createElement("span");
      span.innerHTML = query;
      header.appendChild(span);
      // phonetic if there is
      var phonetic = basic["phonetic"];
      if (phonetic) {
        var phoneticNode = document.createElement("span");
        phoneticNode.innerHTML = "[" + phonetic + "]";
        phoneticNode.style.cursor = "pointer";
        header.appendChild(phoneticNode);
        var playLogo = document.createElement("span");
        header.appendChild(phoneticNode);
        phoneticNode.addEventListener(
          "mouseup",
          function (e) {
            if (e.target === phoneticNode) {
              e.stopPropagation();
              play(query);
            }
          },
          false
        );
      }
      header.style.color = "darkBlue";
      header.style.margin = "0";
      header.style.padding = "0";
      span.style.fontweight = "900";
      span.style.color = "black";

      vajehWindow.appendChild(header);
      var hr = document.createElement("hr");
      hr.style.margin = "0";
      hr.style.padding = "0";
      hr.style.height = "1px";
      hr.style.borderTop = "dashed 1px black";
      vajehWindow.appendChild(hr);
      var ul = document.createElement("ul");
      // ul style
      ul.style.margin = "0";
      ul.style.padding = "0";
      basic["explains"].map(function (trans) {
        var li = document.createElement("li");
        li.style.listStyle = "none";
        li.style.margin = "0";
        li.style.padding = "0";
        li.style.background = "none";
        li.style.color = "inherit";
        li.appendChild(document.createTextNode(trans));
        ul.appendChild(li);
      });
      vajehWindow.appendChild(ul);
    }

    function sentence() {
      var ul = document.createElement("ul");
      // ul style
      ul.style.margin = "0";
      ul.style.padding = "0";
      dictJSON["translation"].map(function (trans) {
        var li = document.createElement("li");
        li.style.listStyle = "none";
        li.style.margin = "0";
        li.style.padding = "0";
        li.style.background = "none";
        li.style.color = "inherit";
        li.appendChild(document.createTextNode(trans));
        ul.appendChild(li);
      });
      vajehWindow.appendChild(ul);
    }
  }

  function translate(word, ts) {
    // var reqUrl = `https://www.vajehyab.com/?q=${word}&d=en&_=1617191412351&ts=${ts}`;
    // var reqUrl = `https://www.vajehyab.com/?q=${word}&d=en`;
    var reqUrl = `https://vajehyab.com/?q=${word}`;
    //console.log("request url: ", reqUrl);
    var ret = GM.xmlHttpRequest({
      method: "GET",
      url: reqUrl,
      headers: { Accept: "application/json" }, // can be omitted...
      onreadystatechange: function (res) {
        //console.log("Request state changed to: " + res.readyState);
      },
      onload: function (res) {
        var retContent = res.response;
        // console.log(retContent);
        // const parser = new DOMParser();
        // retContent = parser.parseFromString(retContent, 'text/html');
        popup(mx, my, retContent);
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
      if (ispre != nul && ispre != undefined) {
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
    if (err != nul) {
      console.log(err);
    }
  } finally {
    return doc;
  }
}

function PrintElem_DEBUG(elem) {
  var mywindow = window.open("", "PRINT", "height=800,width=600");

  mywindow.document.write("<html><head><title>" + document.title + "</title>");
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
