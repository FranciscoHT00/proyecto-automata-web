var activeWord = "";
var result;

$(document).ready(function () {
  $("#load_btn").on("click", loadWord);

  $("#start_btn").on("click", startValidation);
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
  if (result == false) {
    alert("La palabra no es válida");
  }
}
