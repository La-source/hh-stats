"use strict";

const myChart = new Chart(document.getElementById('myChart'), {
    type: 'line',
    options: {
        elements: {
            line: {
                tension: 0,
            },
        },
        scales: {
            yAxes: [
                {
                    id: "value",
                    ticks: {
                        callback: label => numeral(label).format(),
                    },
                },
            ],
        },
        tooltips: {
            callbacks: {
                label: (tooltipItem, data) => {
                    const dataset = data.datasets[tooltipItem.datasetIndex];
                    const previous = dataset.previous[tooltipItem.index];
                    const delta = !previous ? "" : ` (${numeral(tooltipItem.yLabel - previous).format("+0,0")})`;

                    return [
                        `${dataset.label}: ${numeral(tooltipItem.yLabel).format()}${delta}`,
                        `Place: ${numeral(dataset.rank[tooltipItem.index]).format()}`,
                    ];
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    },
});

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";

    for ( let i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function showChart(users, type) {
    let dates = [];
    const datasets = [];

    for ( const user of users ) {
        for ( const rank of user.rankingUser ) {
            dates.push(rank.ranking.date);
        }
    }

    dates = [...new Set(dates)]
        .map(date => moment(date))
        .sort((a, b) => a.diff(b))
    ;

    for ( const user of users ) {
        const dates2 = [...dates];
        const data = [];
        const rank = [];
        const previous = [];
        let previousValue = null;

        for ( const ranking of user.rankingUser ) {
            let date;

            do {
                date = dates2.shift();
                data.push(null);
                previous.push(previousValue);
                rank.push(null);

            } while ( date && moment(ranking.ranking.date).valueOf() !== date.valueOf() );

            data.pop();
            data.push(ranking[type]);
            rank.pop();
            rank.push(ranking[`${type}Ranking`]);

            if ( ranking[type] ) {
                previousValue = ranking[type];
            }
        }

        datasets.push({
            yAxisID: "value",
            data,
            label: user.name,
            fill: false,
            spanGaps: true,
            borderColor: user.color,
            backgroundColor: user.color,
            rank,
            previous,
        });
    }

    myChart.data = {
        labels: dates.map(date => date.format("DD/MM HH\\h")),
        datasets,
    };
    myChart.update();
}

function loadData() {
    return fetch(`_ranking${window.location.search}`)
        .then(result => result.json())
        .then(_users => {
            document.getElementById("users").innerHTML  = _users
                .map(user => `<span class="user" data-id="${user.id}">${user.name}</span>`)
                .join("")
            ;

            for ( const user of _users ) {
                user.color = getRandomColor();
            }

            users = _users;
            showChart(users, type.value);
        })
    ;
}

function addUser(userId) {
    history.pushState(
        {},
        "",
        `chart.html${window.location.search + (window.location.search !== "" ? `&` : "?") + ``}user[]=${userId}`);
    return loadData();
}

function removeUser(userId) {
    history.pushState(
        {},
        "",
        `chart.html${window.location.search.replace(`user[]=${userId}`, "")}`);
    return loadData();
}

let users;
const type = document.getElementById("type");

type.addEventListener("change", () => showChart(users, type.value));

document.querySelector("#users").addEventListener("click", event => {
    if ( event.target.classList.contains('user') ) {
        removeUser(event.target.getAttribute("data-id"));
    }
});

loadData();

new autoComplete({
    data: {
        src: async () => {
            const data = await fetch(`_find?username=${document.getElementById("search_username").value}`)
                .then(source => source.json());

            return data;
        },
        key: ["name"],
        cache: false,
    },
    selector: "#search_username",
    placeHolder: "Username",
    threshold: 0,
    debounce: 100,
    maxResults: Infinity,
    resultsList: {
        render: true,
        container: () => "search_result",
        destination: document.querySelector("#autoComplete"),
        position: "afterend",
        element: "ul",
    },
    noResults: function() {
        const result = document.createElement("li");
        result.setAttribute("class", "no_result");
        result.setAttribute("tabindex", "1");
        result.innerHTML = "No Results";
        document.querySelector("#search_result").appendChild(result);
    },
    onSelection: feedback => {
        document.getElementById("search_username").value = "";
        addUser(feedback.results[feedback.selection.index].id);
    }
});
