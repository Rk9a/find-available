const fs = require("fs");
const path = require("path");

const rawFolder = path.join(__dirname, "data/raw");
const outputFile = path.join(__dirname, "data/classes.json");

const files = fs.readdirSync(rawFolder);

let allData = [];
let totalCount = 0;

files.forEach(file => {
  const filePath = path.join(rawFolder, file);
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (content.data && Array.isArray(content.data)) {
    allData = allData.concat(content.data);
  }

  if (content.totalCount) {
    totalCount = content.totalCount;
  }
});

const merged = {
  success: true,
  totalCount: totalCount,
  data: allData
};

fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));

console.log("Merged successfully!");
console.log("Total merged records:", allData.length);