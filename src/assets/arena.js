
(function() {
    let lastQuery;

    const tooltips = tippy(".one_opponent", {
        placement: "top",
    });

    $(".one_opponent").on("mouseover", function() {
        let query;
        const onclick = $(this).find(".name").attr("onclick");

        if ( onclick ) {
            const result = $(this).find(".name").attr("onclick").match(/\d+/g);

            if ( !result ) {
                return;
            }

            query = `opponentId=${result[0]}`;
        }

        if ( !query ) {
            query = `opponentName=${$(this).find(".name").text().trim()}`;
        }

        if ( lastQuery !== query ) {
            lastQuery = query;
        } else {
            return;
        }

        fetch(`_opponentHistory?${query}`)
            .then(response => response.json())
            .then(opponents => {
                let html = "";

                for ( const opponent of opponents ) {
                    html += moment(opponent.battle.event.date).format("DD/MM - HH:mm") + " - ";

                    if ( opponent.isWin ) {
                        html += "Victoire";
                    } else {
                        html += "Defaite";
                    }

                    html += "<br />";
                }

                if ( opponents.length === 0 ) {
                    html = "Pas d'historique";
                }

                for ( const tooltip of tooltips ) {
                    tooltip.setContent(html);
                }
            })
        ;
    });
})();
