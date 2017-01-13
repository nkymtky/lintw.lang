function cv() {
  function wordBlock(word) {
    return "<div><p class='latin'>" +word.seed+
           "</p><p class='lintwese'>" +word.lintwese+
           "</p><p class='latin'>" +word.latin+ "</p></div>";
  }
  var seedText = document.form1.textarea1.value;
  var words = lintw.lang.getText(seedText);

  var html = "";
  var withDot = "";
  var latinOnly = "";

  for(var i = 0; i < words.length; i++) {

    var word = words[i];
    html += wordBlock(word);
    withDot += word.lintwese;
    latinOnly += word.latin;
  }

  document.getElementById("result1").innerHTML = html;
  document.getElementById("result2").innerHTML = withDot;
  document.getElementById("result3").innerHTML = withDot.replace(/点/g, "");
  document.getElementById("result4").innerHTML = latinOnly;
}
