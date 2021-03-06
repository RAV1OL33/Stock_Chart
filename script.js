console.log("a");
const database_url =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqM6TY3M2SyIZdO1ZyrKSSCV3f_cunsz1aPlBNd0iiRGm-2tCAUqhFLEmH-S789fmRa7sML71tR_WR/pub?gid=0&single=true&output=csv";

//value containers
var stocks_table = document.getElementById("stocks_table");
var stocks_counter = document.getElementById("stocks_counter");
//var stocks_container = document.getElementById("stocks_container");
var stocks_array_legth = document.getElementById("stocks_array_legth");

//charts
var _dividendChartElement = document.getElementById("dividend_chart");
var _capitalChartElement = document.getElementById("capital_chart");
var _procentChartElement = document.getElementById("procent_chart");
//input containers
var replenishment_period_select = document.getElementById(
  "replenishment_period_select"
);
var replenishment_value_input = document.getElementById(
  "replenishment_value_input"
);
var payment_period_select = document.getElementById("payment_period_select");
var calc_range_select = document.getElementById("calc_range_select");
var inflation_input = document.getElementById("inflation_value");
var capital_input = document.getElementById("capital_input");
var is_deposit_input = document.getElementById("deposit");
var is_tax_checkbox = document.getElementById("is_tax");
var tax_input = document.getElementById("tax_value");

//input values
var replenishment_period = parseInt(replenishment_period_select.value);
var replenishment_value = parseFloat(replenishment_value_input.value);
var inflation_value = 1 - parseFloat(inflation_input.value) / 100;
var payment_period = parseInt(payment_period_select.value);
var tax_value = 1 - parseFloat(tax_input.value) / 100;
var calc_range = parseInt(calc_range_select.value);
var start_capital = parseInt(capital_input.value);

var dividend_capital = 0;
//vars
var stock_array_length = 0;
//options checkboxes
var deposit = is_deposit_input.checked;
var tax_status = is_tax_checkbox.checked;

var years_array = [];
var stocks_array = [];
var active_stocks_array = [];
var active_stocks_indexses_array = [];
//chart options
const options = {
  scales: {
    x: { title: { display: true, text: "????????" } },
    y: { title: { display: true, text: "" } }
  }
};
var chart_labels = [];
//chart containers
var _pureCapitalChart = new Chart(_capitalChartElement, { type: "line" });
var _dividendChart = new Chart(_dividendChartElement, { type: "line" });
var _procentChart = new Chart(_procentChartElement, { type: "line" });

var inflation_colors_array = [
  "#e24848",
  "#FB000D",
  "#BC2F36",
  "#A30008",
  "#FD3F49",
  "#FD7279"
];
var colors_array = [
  "#04819E",
  "#00BF32",
  "#FF7F00",
  "#D50065",
  "#00B454",
  "#1240AB"
];

function createStocksTable(stocks) {
  let table = document.createElement("tbody");
  let existing_body = document.getElementById("stocks_table_body");
  if (existing_body) existing_body.remove();
  table.id = "stocks_table_body";
  stocks.forEach((stock, index) => {
    console.log(stock);
    table.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td style="width:2%">
          <input id="${
            stock.id
          }" type="checkbox" oninput="updateStocksList(this)"> 
        </td>
        <td style="width: 5%; text-align: end; padding-right: 2px;"> ${
          index + 1
        })</td>
        <td style="width:6%"> ${stock.symbol}</td>
        <td style="width:45%"> ${stock.name}</td>
        <td style="width:10%"> ${stock.years}</td>
        <td style="width:10%"> ${
          Math.round(stock.current_dividend_procent * 10000) / 100
        }%</td>
        <td style="width:10%"> ${Math.round(stock.div_grow * 10000) / 100}%</td>
      </tr>`
    );
  });
  stocks_table.appendChild(table);
  stocks_counter.innerText = `???????????????????????? ??????????: ${stocks.length}`;
  stocks_array_legth.innerText = `?????????? ??????????: ${stocks_array.length}`;
}
function sortTable(field = "id", direction = -1) {
  stocks_array.sort((stock_a, stock_b) => {
    return (stock_b[field] - stock_a[field]) * direction;
  });
  active_stocks_indexses_array = [];
  ShowSelectedStocks(stock_array_length);
}

function parseFields(string, field) {
  let value;
  if (string[0] == '"') {
    string = string.slice(1);
    value = string.substring(0, string.indexOf('"'));
    string = string.slice(string.indexOf('"') + 2);
  } else {
    let indexOf = string.indexOf(",") < 0 ? string.length : string.indexOf(",");
    value = string.substring(0, indexOf);
    string = string.slice(indexOf + 1);
  }
  return { field: field, value: value == "\r" ? "0" : value, string: string };
}
function parseCSV(csv) {
  //console.log(csv)
  let rawData = csv.split("\n");
  //console.log(rawData);
  let result = [];
  rawData.forEach((a, index) => {
    //console.log(index)
    let company = {};
    let response = {};
    company.id = index;

    response = parseFields(a, "symbol");
    company[response.field] = response.value;
    a = response.string;

    response = parseFields(a, "name");
    company[response.field] = response.value;
    a = response.string;

    response = parseFields(a, "years");
    company[response.field] = parseInt(response.value);
    a = response.string;

    response = parseFields(a, "current_dividend_procent");
    company[response.field] =
      parseFloat(response.value.replace(",", ".")) / 100;
    a = response.string;

    response = parseFields(a, "div_grow");
    company[response.field] =
      parseFloat(response.value.replace(",", ".")) / 100;
    a = response.string;

    //console.log(company);
    result.push(company);
  });
  return result;
}
function getData(url) {
  $.ajax(url).done(function (result) {
    stocks_array = parseCSV(result);
    stock_array_length = stocks_array.length;
    console.log("stocks_array[0]");
    console.log(stocks_array[0]);
    sortTable();
    //active_stocks_array = pushSelectedStocks([220,1]);
    //console.log("GetData fired. Response:");
    //console.log(stocks_array)
    //console.log(active_stocks_array);
    //calc();
    //console.log(parseCSV(result))
  });
}
function SelectArrayLength(element) {
  //console.log(element.value)
  let target = document.getElementsByClassName("_variant");
  console.log(target);
  for (let i = 0; i < target.length; i++) {
    console.log(target[i]);
    target[i].className = target[i].className.replace(" _active", "");
  }

  element.className += " _active";
  ShowSelectedStocks(
    element.innerText == "??????"
      ? stocks_array.length
      : parseInt(element.innerText)
  );
}
function ShowSelectedStocks(count = stocks_array.length) {
  stock_array_length = count;
  let stocks = stocks_array.slice(0, stock_array_length);
  createStocksTable([...stocks]);
}
function updateStocksList(stock) {
  if (stock.checked) active_stocks_indexses_array.push(stock.id);
  else
    active_stocks_indexses_array.splice(active_stocks_indexses_array.indexOf(stock.id), 1);
}
function pushSelectedStocks(index_array = active_stocks_indexses_array) {
  let stocks = [];
  index_array.forEach((i) => {
    let stock = { ...stocks_array.find((s) => s.id == i) };
    stock.capital = start_capital;
    stock.capital_w_tax = start_capital;
    stocks.push(stock);
  });
  return stocks;
}
function DrawSelectedStocks() {
  active_stocks_array = pushSelectedStocks();
  calc();
}

getData(database_url);

function calcIncome(index, tax = 1) {
  return (
    (active_stocks_array[index].capital *
      (active_stocks_array[index].current_dividend_procent * tax) *
      payment_period) /
    12
  );
}
function period(is_deposit, stock_index) {
  let div_income = calcIncome(stock_index, tax_value);
  let div_income_w_tax = calcIncome(stock_index);
  let current_period = { is_deposit: is_deposit };
  if (is_deposit) {
    active_stocks_array[stock_index].capital += div_income;
    //active_stocks_array[stock_index].capital = div_income;
    active_stocks_array[stock_index].capital_w_tax += div_income_w_tax;
    //active_stocks_array[stock_index].capital_w_tax = div_income_w_tax;
  }
  current_period.income = div_income;
  current_period.income_w_tax = div_income_w_tax;

  return current_period;
}
function year(c_year) {
  //c_year.procent = current_procent;
  //current_procent += current_procent * yearly_procent_grow;
  active_stocks_array.forEach((s, index) => {
    c_year.stocks[index].procent =
      active_stocks_array[index].current_dividend_procent;
    c_year.stocks[index].procent_with_tax =
      active_stocks_array[index].current_dividend_procent * tax_value;

    active_stocks_array[index].current_dividend_procent +=
      active_stocks_array[index].current_dividend_procent *
      active_stocks_array[index].div_grow;
  });

  years_array.push(c_year);
}

function log_dis() {
  years_array.forEach((y) => {
    console.log("Year: ", y);
    active_stocks_array.forEach((s) => {
      console.log("Stock ->", s);
    });
  });

  console.log(dividend_capital);
  //console.log(stocks_array[0]);
  //console.log(stocks_array[1]);
}

function PureCapitalChart() {
  let chart_options = options;
  chart_options.scales.y.title.text = "??????????????";
  let data = {
    labels: [0].concat(chart_labels),
    datasets: []
  };
  active_stocks_array.forEach((s, index) => {
    let chart_data = [start_capital];
    let tax_chart_data = [start_capital];
    years_array.forEach((y) => {
      let capital = tax_status ? "capital" : "capital_w_tax";
      chart_data.push(y.stocks[index][capital]);
      tax_chart_data.push(y.stocks[index][capital] * inflation_value);
    });
    data.datasets.push({
      label: s.name,
      data: chart_data,
      fill: false,
      borderColor: colors_array[index],
      tension: 0.1
    });
    data.datasets.push({
      label: s.name + " c ???????????? ????????????????",
      data: tax_chart_data,
      fill: false,
      //borderColor: "rgb(226,72,72)",
      borderColor: inflation_colors_array[index],
      tension: 0.1
    });
  });
  _pureCapitalChart.data = data;
  _pureCapitalChart.options = chart_options;
  _pureCapitalChart.update();
}
function DividendChart() {
  let chart_options = options;
  chart_options.scales.y.title.text = "??????????????????";
  let data = {
    labels: chart_labels,
    datasets: []
  };
  active_stocks_array.forEach((s, index) => {
    let chart_data = [];
    years_array.forEach((y) => {
      let sum = 0;
      let income = tax_status ? "income" : "income_w_tax";
      y.stocks[index].payments_array.forEach((p) => (sum += p[income]));
      chart_data.push(sum);
      dividend_capital += sum;
    });
    data.datasets.push({
      label: s.name,
      data: chart_data,
      fill: false,
      borderColor: colors_array[index],
      tension: 0.1
    });
  });
  _dividendChart.data = data;
  _dividendChart.options = chart_options;
  _dividendChart.update();
}
function ProcentChart() {
  let chart_options = options;
  chart_options.scales.y.title.text = "???????????????? %";
  let chart_data = [];
  let data = {
    labels: chart_labels,
    datasets: []
  };
  active_stocks_array.forEach((s, index) => {
    let chart_data = [];
    let procent = tax_status ? "procent_with_tax" : "procent";
    years_array.forEach((y) => chart_data.push(y.stocks[index][procent] * 100));
    data.datasets.push({
      label: s.name,
      data: chart_data,
      fill: false,
      borderColor: colors_array[index],
      tension: 0.1
    });
  });

  _procentChart.data = data;
  _procentChart.options = chart_options;
  _procentChart.update();
}

function updateCharts() {
  deposit = is_deposit_input.checked;
  tax_status = is_tax_checkbox.checked;
  start_capital = parseInt(capital_input.value);
  calc_range = parseInt(calc_range_select.value);
  payment_period = parseInt(payment_period_select.value);
  replenishment_value = parseFloat(replenishment_value_input.value);
  replenishment_period = parseInt(replenishment_period_select.value);
  console.log("stocks_array[0]");
  console.log(stocks_array[0]);
  //calc();
  DrawSelectedStocks();
}
function DrawCharts() {
  PureCapitalChart();
  DividendChart();
  ProcentChart();
}

function calc() {
  for (var y = 1; y < calc_range + 1; y++) {
    let current_year = { date: y, stocks: [] };
    let stocks = [];
    active_stocks_array.forEach((s) => stocks.push({ payments_array: [] }));
    for (let m = 1; m < 13; m++) {
      if (m % payment_period == 0)
        active_stocks_array.forEach((s, index) =>
          stocks[index].payments_array.push(period(deposit, index))
        );
      //current_year.payments_array.push(period(deposit)));

      if (m % replenishment_period == 0)
        active_stocks_array.forEach((s, index) => {
          s.capital += replenishment_value;
          s.capital_w_tax += replenishment_value;
        });
    }
    //console.log(stocks)
    //console.log(active_stocks_array)
    active_stocks_array.forEach((s, index) => {
      stocks[index].capital = s.capital;
      stocks[index].capital_w_tax = s.capital_w_tax;
    });
    current_year.stocks = stocks;
    year(current_year);
  }
  chart_labels = years_array.map((y) => (y = y.date));
  DrawCharts();

  log_dis();
  years_array = [];

  dividend_capital = 0;
  active_stocks_array = pushSelectedStocks();
  /*
  current_capital = start_capital;
  current_procent = start_procent;
  */
}
