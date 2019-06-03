
(function() {
    let lastId;

    $("#leagues_right").on("mouseover", ".player_block", (function() {
        const id = $(".leagues_table .lead_table_default").attr("sorting_id");

        if ( lastId !== id ) {
            lastId = id;
        } else {
            return;
        }

        fetch(`_opponentHistory?opponentId=${id}`)
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

                tippy(document.querySelector("#leagues_right .player_block"), {
                    content: html,
                    placement: "left",
                });
            })
        ;
    }));
})();
