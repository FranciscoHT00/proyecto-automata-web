var activeWord = "";
var currentStep = 0;
var result = [];
var stopPause = false;
var speed = 500;

var activeAutomata = "automata_pila";
const activeDiagram = new go.Diagram("graph_container");
activeDiagram.isReadOnly = true;
activeDiagram.layout = new go.GridLayout();
activeDiagram.layout.spacing = go.Size.parse("70");

$(document).ready(function () {
  $("#pause_btn").prop("disabled", true);
  $("#cancel_btn").prop("disabled", true);

  loadDiagram();

  $("#load_btn").on("click", loadWord);

  $("#start_btn").on("click", startValidation);

  $("#pause_btn").on("click", pauseValidation);

  $("#cancel_btn").on("click", cancelValidation);

  $("#speed_input").on("change", updateSpeed);
});

function loadWord() {
  activeWord = $("#input_word").val();
  playMessage("Word loaded.");

  $("#word_container").empty();

  $("#word_container").append(
    '<div class="bg-success m-1 px-4 py-1 border border-1 border-dark" id="letter_0"></div>'
  );
  for (let i = 0; i < activeWord.length; i++) {
    $("#word_container").append(
      '<div class="bg-info m-1 px-4 py-1 border border-1 border-dark" id="letter_' +
        (i + 1) +
        '">' +
        activeWord.charAt(i) +
        "</div>"
    );
  }
  $("#word_container").append(
    '<div class="bg-info m-1 px-4 py-1 border border-1 border-dark" id="letter_' +
      (activeWord.length + 1) +
      '"></div>'
  );

  $.ajax({
    data: {
      word: activeWord,
    },
    type: "POST",
    dataType: "json",
    url: "/validate",
  })
    .done(function (response) {
      result = response;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      alert(errorThrown);
    });
}

function startValidation() {
  console.log(result);

  if (result.length == 0) {
    playMessage("No words have been loaded.");
    alert("No words have been loaded.");
  } else {
    stopPause = false;
    playMessage("Validation Started.");

    $("#load_btn").prop("disabled", true);
    $("#start_btn").prop("disabled", true);
    $("#speed_input").prop("disabled", true);
    $("#pause_btn").prop("disabled", false);
    $("#cancel_btn").prop("disabled", false);

    var last = "p";

    var timeInterval = setInterval(function () {
      if (currentStep == result.length || stopPause == true) {
        clearInterval(timeInterval);
        return;
      }

      if (result[currentStep].length != 0) {
        var currentNode = result[currentStep][0][0];
        last = currentNode;

        updateWord();
        updateStack();
        console.log(result[currentStep]);

        var node = activeDiagram.findNodeForKey(currentNode);

        activeDiagram.commit((d) => {
          d.model.set(node.data, "color", "steelblue");
          if (currentStep != 0) {
            var lastNode = result[currentStep - 1][0][0];

            d.links.each((link) => {
              if (link.data.from == lastNode && link.data.to == currentNode) {
                d.model.set(link.data, "color", "green");
              }
            });
          }
        });

        setTimeout(function () {
          activeDiagram.commit((d) => {
            if (currentStep == result.length) {
              if (node.data.key == "r") {
                d.model.set(node.data, "color", "green");
                playMessage("Word accepted.");
              } else {
                d.model.set(node.data, "color", "red");
                playMessage("Word rejected.");
              }
            } else {
              d.model.set(node.data, "color", "lightblue");
            }

            d.links.each((link) => {
              d.model.set(link.data, "color", "#555");
            });
          });
        }, speed * 0.5);
      } else {
        var node = activeDiagram.findNodeForKey(last);
        activeDiagram.commit((d) => {
          d.model.set(node.data, "color", "red");
          playMessage("Word rejected.");
        });
      }

      currentStep++;
    }, speed);
  }
}

function pauseValidation() {
  playMessage("Pausing.");
  stopPause = true;
  $("#start_btn").prop("disabled", false);
  $("#pause_btn").prop("disabled", true);
  $("#speed_input").prop("disabled", false);
}

function cancelValidation() {
  playMessage("Canceling.");
  $("#load_btn").prop("disabled", false);
  $("#start_btn").prop("disabled", false);
  $("#speed_input").prop("disabled", false);
  $("#pause_btn").prop("disabled", true);
  $("#cancel_btn").prop("disabled", true);

  stopPause = true;
  setTimeout(function () {
    activeWord = "";
    currentStep = 0;
    result = [];

    $("#stack_container").empty();
    $("#word_container").empty();
    $("#word_container").append('<h1 class="text-center">NO ACTIVE WORD</h1>');

    activeDiagram.commit((d) => {
      d.nodes.each((node) => {
        d.model.set(node.data, "color", "lightblue");
        if (node.data.key == "") {
          d.model.set(node.data, "color", "transparent");
        }
      });

      d.links.each((link) => {
        d.model.set(link.data, "color", "#555");
      });
    });
  }, speed * 1.1);
}

function loadDiagram() {
  activeDiagram.nodeTemplate = new go.Node("Auto")
    .add(
      new go.Shape("Circle", { width: 80, height: 80 })
        .bind("fill", "color")
        .bind("strokeWidth", "border")
        .bind("stroke", "borderColor")
    )
    .add(new go.TextBlock({ font: "24px sans-serif" }).bind("text", "key"));

  activeDiagram.linkTemplate = new go.Link()
    .add(
      new go.Shape({ strokeWidth: 5, stroke: "#555" }).bind("stroke", "color")
    )
    .add(new go.Shape({ toArrow: "Standard", stroke: null }))
    .add(
      new go.TextBlock({
        segmentOffset: new go.Point(0, -50),
      }).bind("text", "transitions")
    );

  if (activeAutomata == "automata_pila") {
    activeDiagram.model = new go.GraphLinksModel(
      [
        { key: "", color: "transparent", borderColor: "transparent" },
        { key: "p", color: "lightblue" },
        { key: "q", color: "lightblue" },
        { key: "r", color: "lightblue", border: 5 },
      ],
      [
        { from: "", to: "p" },
        {
          from: "p",
          to: "p",
          transitions:
            "a, A/AA\
            \na, B/BA\
            \na, #/#A\
            \nb, B/BB\
            \nb, A/AB\
            \nb, #/#B",
        },
        {
          from: "p",
          to: "q",
          transitions: "c, #/#\
            \nc, B/B\
            \nc, A/A",
        },
        { from: "q", to: "q", transitions: "b, B/λ\
        \na, A/λ" },
        { from: "q", to: "r", transitions: "λ, #/#" },
      ]
    );
  }
}

function updateSpeed() {
  var speed_input = $("#speed_input").val();

  speed = 2000 / speed_input - 300;
}

function updateStack() {
  var stack = result[currentStep][0][2];

  $("#stack_container").empty();

  stack.forEach((element) => {
    $("#stack_container").append(
      '<div class="bg-info border border-1 border-dark my-1 text-center">' +
        element +
        "</div>"
    );
  });
}

function updateWord() {
  $("#letter_" + currentStep).removeClass("bg-info");
  $("#letter_" + currentStep).addClass("bg-success");

  setTimeout(function () {
    $("#letter_" + (currentStep - 1)).removeClass("bg-success");
    $("#letter_" + (currentStep - 1)).addClass("bg-info");
  }, speed * 0.5);
}

function playMessage(text) {
  var message = new SpeechSynthesisUtterance();
  message.volume = 1;
  message.rate = 1;
  message.pitch = 1;
  message.text = text;
  message.lang = "en-US";

  speechSynthesis.speak(message);
}
