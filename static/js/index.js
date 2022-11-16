var activeWord = "";
var currentStep = 0;
var result = [];
var stopPause = false;
var speed = 1000;

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
});

function loadWord() {
  activeWord = $("#input_word").val();

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
    alert("No se ha cargado ninguna palabra.");
  } else {
    stopPause = false;
    $("#load_btn").prop("disabled", true);
    $("#start_btn").prop("disabled", true);
    $("#pause_btn").prop("disabled", false);
    $("#cancel_btn").prop("disabled", false);

    var timeInterval = setInterval(function () {
      var currentNode = result[currentStep][0][0];
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
            } else {
              d.model.set(node.data, "color", "red");
            }
          } else {
            d.model.set(node.data, "color", "lightblue");
          }

          d.links.each((link) => {
            d.model.set(link.data, "color", "#555");
          });
        });
      }, speed * 0.5);

      currentStep++;
      if (currentStep == result.length || stopPause == true) {
        clearInterval(timeInterval);
        return;
      }
    }, speed);
  }
}

function pauseValidation() {
  stopPause = true;
  $("#start_btn").prop("disabled", false);
  $("#pause_btn").prop("disabled", true);
}

function cancelValidation() {
  $("#load_btn").prop("disabled", false);
  $("#start_btn").prop("disabled", false);
  $("#pause_btn").prop("disabled", true);
  $("#cancel_btn").prop("disabled", true);

  stopPause = true;
  setTimeout(function () {
    activeWord = "";
    currentStep = 0;
    result = [];

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
      new go.Shape({ strokeWidth: 3, stroke: "#555" }).bind("stroke", "color")
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
