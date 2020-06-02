// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
console.log("preload");

window.addEventListener("DOMContentLoaded", () => {
  window.$ = window.jQuery = require("jquery");

  const { ipcRenderer } = require("electron");

  // INIT
  ipcRenderer.send("fetch", "");
  //


  $("#options, #more, #pop").hide();

  $(document).ready(function () {
    // On/off this serv
    $("#serverlist").on("click", ".io", function () {
      let serv = $(this).parent().siblings().find(".name").val();
      let type = $(this).parents().find(".txt-white").attr("title");
      let ip = $(this).parent().parent().find('.ip')
      console.log(serv);

      if ($(this).hasClass("paused")) {
        $(this).toggleClass("paused");
        ipcRenderer.send("stop-serv", serv, type);
        $(ip).toggleClass("green");
      } else {
        $(this).toggleClass("paused");
        ipcRenderer.send("launch-serv", serv, type);
        $(ip).toggleClass("green");
      }
    });
    // Options
    $(".options").on("click", function () {
      $("#pop").hide();
      $(".top").removeClass("active");
      $("#options, .top, #serverlist").toggle();
    });
    // Options - update ip
    $("#ip").on("change", function () {
      ip = $(this).val();
      console.log(ip);
      ipcRenderer.send("update-ip", ip);
    });

    // Delete this serv
    $("#serverlist").on("click", ".del", function () {
      let serv = $(this).parent().siblings().find(".name").val();
      console.log(serv);
      ipcRenderer.send("delete-serv", serv);
    });
    // Update this serv
    $("#serverlist").on("change", "input", function () {
      let id = $(this).parent().parent().attr("id");
      let name = $(this).parent().children(".name").val();
      let path = $(this).parent().children(".path").val();
      let port = $(this).parent().children(".port").val();
      console.log(port);
      ipcRenderer.send("update-serv", id, name, path, port);
    });
    // Visit this serv
    $('.ip').click(function () { 
      let port = $(this).siblings('.port').val();
      ipcRenderer.send("visit-serv", port);
    });
  });

  // Choose serv type + add
  $(".selectserv").click(function () {
    let type = $(this).find(".txt-white").attr("title");
    ipcRenderer.send("choose-servtype", type);
    $("#pop").hide();
    $(".top").removeClass("active");
  });

  // Pop
  $(".top").click(function () {
    $(this).toggleClass("active");
    $("#pop").toggle();
  });
  $(".top").hover(function () {
    $("#plus, #more").toggle();
  });

  // Delete all serv
  $("#del").click(function (e) {
    e.preventDefault();
    ipcRenderer.send("clear-all", "");
  });

  // Render
  ipcRenderer.on("res-fetch", (event, arg, arg1) => {
    let serverlist = arg;
    $("#serverlist").empty();

    if (serverlist) {
      for (let i = 0; i < serverlist.length; i++) {
        const el = serverlist[i];
        let svg;
        //console.log(el);
        if (el.type === "full") {
          svg = `<span style="margin-right: 22px;">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="50px" y="50px" viewBox="0 0 495 495" style="enable-background:new 0 0 495 495;" xml:space="preserve" width="50px" height="50px"><g><g>
            <path d="M459.309,139.668c-5.755-14.947-17.567-26.415-31.989-31.97C419.092,86.29,398.449,72,375.5,72H220.865   c-3.869-4.069-7.874-7.613-12.03-10.634l-18.703-20.041C174.495,24.283,156.625,16,135.5,16h-80C24.897,16,0,40.897,0,71.5v288   c0,22.949,14.29,43.592,35.697,51.82c5.554,14.423,17.021,26.233,31.971,31.988C75.662,464.155,95.875,479,119.5,479h320   c30.603,0,55.5-24.897,55.5-55.5v-232C495,167.875,480.156,147.662,459.309,139.668z M440.452,136.024   c-0.318-0.005-0.633-0.024-0.952-0.024H282.759l-15.865-17H407.5C420.751,119,432.957,125.542,440.452,136.024z M408.448,104.019   c-0.316-0.005-0.631-0.019-0.948-0.019h-152c-0.8,0-1.569,0.128-2.292,0.36c-6.48-6.882-13.34-12.292-20.656-16.236   c0.032-0.374,0.043-0.749,0.019-1.124H375.5C388.752,87,400.954,93.539,408.448,104.019z M15,359.5v-288   C15,49.168,33.168,31,55.5,31h80c15.656,0,28.68,5.582,40.722,17.512C173.375,48.183,170.473,48,167.5,48h-80   C56.897,48,32,72.897,32,103.5v288c0,0.317,0.013,0.632,0.019,0.948C21.539,384.953,15,372.752,15,359.5z M47,391.5v-288   C47,81.168,65.168,63,87.5,63h80c11.679,0,21.893,3.102,31.328,9.628l7.152,7.664C203.851,80.111,201.697,80,199.5,80h-80   C88.897,80,64,104.897,64,135.5v288c0,0.319,0.019,0.634,0.024,0.952C53.542,416.958,47,404.755,47,391.5z M480,423.5   c0,22.332-18.168,40.5-40.5,40.5h-320C97.168,464,79,445.832,79,423.5v-184c0-22.332,18.168-40.5,40.5-40.5h320   c22.332,0,40.5,18.168,40.5,40.5V423.5z M439.5,184h-320c-15.964,0-30.365,6.784-40.5,17.61V135.5C79,113.168,97.168,95,119.5,95   h80c16.92,0,30.768,6.503,43.622,20.512l30.895,33.105c1.418,1.52,3.404,2.383,5.483,2.383h160c22.332,0,40.5,18.168,40.5,40.5   v10.11C469.865,190.784,455.464,184,439.5,184z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
            <path d="M439.5,232h-88c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h88c4.142,0,7.5-3.357,7.5-7.5S443.642,232,439.5,232z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
            <path d="M439.5,264h-88c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h88c4.142,0,7.5-3.357,7.5-7.5S443.642,264,439.5,264z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          </svg>
        </span>`;
        }
        if (el.type === "onefolder") {
          svg = `          <span style="margin-right: 22px;">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 495 495" style="enable-background:new 0 0 495 495;" xml:space="preserve" width="50px" height="50px"><g><g>
            <path d="M439.5,84H234.729L198.09,45.279C182.464,28.269,164.607,20,143.5,20h-88C24.897,20,0,44.897,0,75.5v344   C0,450.103,24.897,475,55.5,475h384c30.603,0,55.5-24.897,55.5-55.5v-280C495,108.897,470.103,84,439.5,84z M480,419.5   c0,22.332-18.168,40.5-40.5,40.5h-384C33.168,460,15,441.832,15,419.5v-232c0-22.332,18.168-40.5,40.5-40.5h384   c22.332,0,40.5,18.168,40.5,40.5V419.5z M439.5,132h-384c-15.964,0-30.365,6.784-40.5,17.61V75.5C15,53.168,33.168,35,55.5,35h88   c16.92,0,30.768,6.503,43.579,20.465c0.026,0.028,0.052,0.057,0.079,0.084l38.895,41.105C227.469,98.151,229.439,99,231.5,99h208   c22.332,0,40.5,18.168,40.5,40.5v10.11C469.865,138.784,455.464,132,439.5,132z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
            <path d="M431.5,180h-104c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h104c4.142,0,7.5-3.357,7.5-7.5S435.642,180,431.5,180z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
            <path d="M431.5,220h-104c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h104c4.142,0,7.5-3.357,7.5-7.5S435.642,220,431.5,220z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          </svg>
        </span>`;
        }
        if (el.type === "onefile") {
          svg = `<span style="margin-right: 22px;">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 511 511" style="enable-background:new 0 0 511 511;" xml:space="preserve" width="50px" height="50px"><g><g>
          <path d="M454.962,110.751c-0.018-0.185-0.05-0.365-0.081-0.545c-0.011-0.06-0.016-0.122-0.028-0.182   c-0.043-0.215-0.098-0.425-0.159-0.632c-0.007-0.025-0.012-0.052-0.02-0.077c-0.065-0.213-0.141-0.421-0.224-0.625   c-0.008-0.021-0.015-0.043-0.023-0.064c-0.081-0.195-0.173-0.384-0.269-0.57c-0.016-0.031-0.029-0.063-0.045-0.094   c-0.093-0.173-0.196-0.339-0.301-0.504c-0.027-0.042-0.049-0.086-0.077-0.127c-0.103-0.154-0.216-0.3-0.33-0.446   c-0.037-0.048-0.07-0.098-0.109-0.145c-0.142-0.173-0.294-0.338-0.451-0.498c-0.015-0.015-0.027-0.031-0.042-0.046l-104-104   c-0.018-0.018-0.038-0.033-0.057-0.051c-0.156-0.153-0.317-0.301-0.486-0.44c-0.055-0.045-0.113-0.083-0.169-0.126   c-0.138-0.107-0.275-0.214-0.42-0.311c-0.051-0.034-0.105-0.062-0.156-0.095c-0.156-0.099-0.312-0.197-0.475-0.284   c-0.036-0.019-0.074-0.035-0.111-0.053c-0.181-0.093-0.365-0.183-0.554-0.262c-0.024-0.01-0.049-0.017-0.074-0.027   c-0.202-0.081-0.406-0.157-0.616-0.221c-0.027-0.008-0.054-0.013-0.081-0.021c-0.206-0.06-0.415-0.115-0.628-0.158   c-0.063-0.013-0.128-0.018-0.192-0.029c-0.177-0.031-0.354-0.062-0.536-0.08C344.001,0.013,343.751,0,343.5,0h-248   C73.72,0,56,17.72,56,39.5v432c0,21.78,17.72,39.5,39.5,39.5h320c21.78,0,39.5-17.72,39.5-39.5v-360   C455,111.249,454.987,110.999,454.962,110.751z M351,25.606L429.394,104H375.5c-13.509,0-24.5-10.99-24.5-24.5V25.606z M415.5,496   h-320C81.991,496,71,485.01,71,471.5v-432C71,25.99,81.991,15,95.5,15H336v64.5c0,21.78,17.72,39.5,39.5,39.5H440v352.5   C440,485.01,429.009,496,415.5,496z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M391.5,248h-48.002c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5H391.5c4.142,0,7.5-3.357,7.5-7.5S395.642,248,391.5,248z   " data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M119.5,263h192.001c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5H119.5c-4.142,0-7.5,3.357-7.5,7.5S115.358,263,119.5,263   z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M391.5,152h-200c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h200c4.142,0,7.5-3.357,7.5-7.5S395.642,152,391.5,152z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M119.5,167h40.003c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5H119.5c-4.142,0-7.5,3.357-7.5,7.5S115.358,167,119.5,167z   " data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M391.5,344h-152c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h152c4.142,0,7.5-3.357,7.5-7.5S395.642,344,391.5,344z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M207.5,344h-88c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h88c4.142,0,7.5-3.357,7.5-7.5S211.642,344,207.5,344z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M391.5,200h-272c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h272c4.142,0,7.5-3.357,7.5-7.5S395.642,200,391.5,200z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
          <path d="M391.5,296h-272c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h272c4.142,0,7.5-3.357,7.5-7.5S395.642,296,391.5,296z" data-original="#000000" class="active-path" data-old_color="#000000" fill="#F1F1F1"/>
        </svg>
        </span>  `;
        }
        $("#serverlist").append(
          '<section class="row ' +
            el.type +
            '" id="' +
            el.name +
            '"> ' +
            svg +
            ' <div class="container-y"><input type="text" class="name row txt-white" value="' +
            el.name +
            '"/> <input type="text" class="path row txt-grey" value="' +
            el.path +
            '"/><a href="#" class="ip">'+arg1+'</a><input type="text" class="port row txt-grey" value="' +
            el.port +
            '"/> </div><div class="container-x"> <button class="io"></button><div class="del"><svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 24 24" width="50%"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="#313131" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div></section>'
        );
      }
    }
  });

});
