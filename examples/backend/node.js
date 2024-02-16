const { resolve4 } = require("dns");
var magicfeedback = require("../../dist/magicfeedback-sdk.node.js");

magicfeedback.init({
    "url": "http://localhost:3000",
    debug: true
});

const answers = [];
answers.push({ id: "rating", value: ["Ok"] });
answers.push({
  id: "improve",
  value: ["Maybe the interface that is a bit slow in my OSX"],
});

magicfeedback
  .send("_ID_", answers, { name: "Fran" })
  .then((res) => {
    //console.log(res);
  });
