/**
 * Coby Chun
 * CSE 154 AE Peter & Kasten
 * 5/9/2024
 *
 * JS file for pokedex.html. Allows the user to view a pokedex, select a pokemon, and battle/catch
 * other pokemon. Uses get and post calls to UW pokedex and game APIs.
 */
'use strict';
(function() {

  let guid;
  let pid;

  const DEX_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php";
  const GAME_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
  const IMG_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  const MAX_MOVES = 4;
  const LOW_HP_PERCENT = 20;
  const TO_PERCENT = 100;

  window.addEventListener('load', init);

  /**
   * Initializes the page; Fills the pokedex and adds key event listeners with anonymous fxns
   */
  function init() {
    fillDex();

    id("flee-btn").addEventListener("click", () => {
      makeMove("flee");
    });

    let moves = qsa("#p1 .moves button");
    for (let i = 0; i < moves.length; i++) {
      moves[i].addEventListener('click', () => {
        makeMove(moves[i].children[0].textContent);
      });
    }
  }

  /**
   * Asynchronous function makes a Get call to pokedex API. Fills the pokedex page with icons.
   *  Initially only charmander, squirtle, and bulbasaur are found.
   */
  async function fillDex() {
    try {
      let pokeList = await fetch(DEX_URL + "?pokedex=all");
      statusCheck(pokeList);
      pokeList = await pokeList.text();
      pokeList = pokeList.split("\n");
      for (let i = 0; i < pokeList.length; i++) {
        addIcon(pokeList[i]);
      }
      findPokemon("charmander");
      findPokemon("squirtle");
      findPokemon("bulbasaur");
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Adds the icon of the given pokemon to the pokedex page.
   * @param {string} pokemon - pokemon name in the format Name:shortname from the pokedex API
   */
  function addIcon(pokemon) {
    let shortName = pokemon.split(":")[1];
    let icon = IMG_URL + "sprites/" + shortName + ".png";

    let dex = id("pokedex-view");
    let image = gen("img");
    image.src = icon;
    image.alt = shortName;
    image.classList.add("sprite");

    dex.appendChild(image);
  }

  /**
   * Updates the p1 card for the given pokemon shortname using the pokedex API.
   * @param {string} shortName - The shortname of a pokemon e.g. mr-mime
   */
  async function getPokeInfo(shortName) {
    try {
      let pokeInfo = await fetch(DEX_URL + "?pokemon=" + shortName);
      statusCheck(pokeInfo);
      updateCard(await pokeInfo.json(), 1);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Updates the given player card with the given pokemon information. Used to initially display
   * cards or update card stats during battle.
   * @param {object} pokeInfo - JSON object representing a pokemon via the pokedex or game APIs
   * @param {int} pNum - player number; either 1 (p1) or 2 (p2)
   */
  function updateCard(pokeInfo, pNum) {
    let name = qs("#p" + pNum + " .name");
    let image = qs("#p" + pNum + " .pokepic");
    let type = qs("#p" + pNum + " .type");
    let info = qs("#p" + pNum + " .info");
    let weakness = qs("#p" + pNum + " .weakness");

    name.textContent = pokeInfo.name;
    image.src = IMG_URL + pokeInfo.images["photo"];
    image.alt = pokeInfo.shortname;
    type.src = IMG_URL + pokeInfo.images["typeIcon"];
    type.alt = "type";
    updateHealth(pokeInfo, pNum);
    info.textContent = pokeInfo.info["description"];
    weakness.src = IMG_URL + pokeInfo.images["weaknessIcon"];
    weakness.alt = "weakness";

    assignMoves(pokeInfo, pNum);
  }

  /**
   * Updates the name, icons, damage points of the given pokemons moves for the given
   * players card. If the pokemon has less than 4 moves, any extra move boxes are hidden.
   * @param {object} pokeInfo - JSON object representing a pokemon via the pokedex or game APIs
   * @param {int} pNum - player number; either 1 (p1) or 2 (p2)
   */
  function assignMoves(pokeInfo, pNum) {
    let moveCount = pokeInfo.moves.length;
    let moves = pokeInfo.moves;
    let moveContainers = qsa("#p" + pNum + " .moves button");
    let names = qsa("#p" + pNum + " .move");
    let dp = qsa("#p" + pNum + " .dp");
    let types = qsa("#p" + pNum + " .moves button img");
    for (let i = 0; i < MAX_MOVES; i++) {
      if (moveCount === 0) {
        moveContainers[i].classList.add("hidden");
      } else {
        moveContainers[i].classList.remove("hidden");
        names[i].textContent = moves[i]["name"];
        if (moves[i]["dp"]) {
          dp[i].textContent = moves[i]["dp"] + " DP";
        } else {
          dp[i].textContent = "";
        }
        types[i].src = IMG_URL + "icons/" + moves[i]["type"] + ".jpg";
        moveCount--;
      }
    }
  }

  /**
   * Finds the pokemon in the user's pokedex: removes black silhouete allows it to be
   * selected for play.
   * @param {string} shortName - shortname for a pokemon e.g. mr-mime
   */
  function findPokemon(shortName) {
    let icons = id("pokedex-view").children;
    for (let i = 0; i < icons.length; i++) {
      if (icons[i].alt === shortName) {
        icons[i].classList.add("found");
        icons[i].addEventListener("click", () => {
          getPokeInfo(shortName);
          id("start-btn").classList.remove("hidden");
          id("start-btn").addEventListener("click", initStart);
        });
      }
    }
  }

  /**
   * Updates the healthbar and health value for the given pokemon for the given player.
   * If the pokemon's health drops below 20% of their maximum, healthbar becomes red.
   * @param {object} pokeInfo - JSON object representing a pokemon via the pokedex or game APIs
   * @param {int} pNum - player number; either 1 (p1) or 2 (p2)
   */
  function updateHealth(pokeInfo, pNum) {
    let hpBar = qs("#p" + pNum + " .health-bar");
    let hp = qs("#p" + pNum + " .hp");

    if (pokeInfo["current-hp"] !== undefined) {
      hp.textContent = pokeInfo["current-hp"] + " HP";
      let width = (pokeInfo["current-hp"] / pokeInfo["hp"]) * TO_PERCENT;
      hpBar.setAttribute("style", "width:" + width + "%");
      if (width <= LOW_HP_PERCENT) {
        hpBar.classList.add("low-health");
      } else {
        hpBar.classList.remove("low-health");
      }
    } else {
      hp.textContent = pokeInfo["hp"] + " HP";
      hpBar.setAttribute("style", "width: 100%");
      hpBar.classList.remove("low-health");
    }
  }

  /**
   * Switches from pokedex/selection view to battle view. The user becomes able to use moves
   * or flee
   */
  function initStart() {
    id("pokedex-view").classList.add("hidden");
    id("start-btn").classList.add("hidden");

    id("p2").classList.remove("hidden");
    qs(".hp-info").classList.remove("hidden");
    id("flee-btn").classList.remove("hidden");
    id("results-container").classList.remove("hidden");

    let moves = qsa("#p1 .moves button");
    for (let i = 0; i < moves.length; i++) {
      moves[i].disabled = false;
    }
    qs("header h1").textContent = "Pokemon Battle!";

    startGame();
  }

  /**
   * Async function makes post calls to game API to start the game and update the game state.
   */
  async function startGame() {
    try {
      let shortName = qs("#p1 .pokepic").alt;

      let data = new FormData();
      data.append("startgame", "true");
      data.append("mypokemon", shortName);
      let game = await fetch(GAME_URL, {method: "POST", body: data});
      statusCheck(game);
      game = await game.json();

      guid = game.guid;
      pid = game.pid;
      updateCard(game.p2, 2);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Async function makes post calls to update the game state based on the user's played
   * moves. Displays a loading image while the call is being made, then displays the results.
   * @param {string} moveName - name of move used by p1
   */
  async function makeMove(moveName) {
    try {
      id("p1-turn-results").classList.add("hidden");
      id("p2-turn-results").classList.add("hidden");
      id("loading").classList.remove("hidden");
      let data = new FormData();
      data.append("guid", guid);
      data.append("pid", pid);
      data.append("movename", moveName);
      let game = await fetch(GAME_URL, {method: "POST", body: data});
      statusCheck(game);
      game = await game.json();
      guid = game.guid;
      pid = game.pid;
      updateGame(game);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Updates each player's pokemon card stats, checks whether a win or loss has occurred,
   * and displays the results of the turn
   * @param {object} game - JSON object representing the current game state. Contains results,
   * info on each player's pokemons, game state, player id, etc.
   */
  function updateGame(game) {
    let p1Res = id("p1-turn-results");
    let p2Res = id("p2-turn-results");
    let res = game.results;

    let p1Text = "Player 1 played " + res["p1-move"] + " and " + res["p1-result"];
    let p2Text = "Player 2 played " + res["p2-move"] + " and " + res["p2-result"];

    p1Res.textContent = p1Text;
    p2Res.textContent = p2Text;

    updateCard(game.p1, 1);
    updateCard(game.p2, 2);
    id("loading").classList.add("hidden");
    checkResults(game);
  }

  /**
   * Checks for a win or loss (defeat or flee). If either conditions are met, change header,
   * end the game, and display the results. Otherwise only display results as the game continues.
   * @param {object} game - JSON object representing the current game state. Contains results,
   * info on each player's pokemons, game state, player id, etc.
   */
  function checkResults(game) {
    let lose = game.p1["current-hp"] === 0;
    let flee = game.results["p1-move"] === "flee";
    let win = game.p2["current-hp"] === 0;
    if (flee) {
      id("p1-turn-results").classList.remove("hidden");
      id("p2-turn-results").classList.add("hidden");
      qs("header h1").textContent = "You Lose!";
      endGame();
    } else if (win) {
      id("p1-turn-results").classList.remove("hidden");
      id("p2-turn-results").classList.add("hidden");
      qs("header h1").textContent = "You Won!";
      findPokemon(game.p2["shortname"]);
      endGame();
    } else if (lose) {
      id("p1-turn-results").classList.remove("hidden");
      id("p2-turn-results").classList.remove("hidden");
      qs("header h1").textContent = "You Lost!";
      endGame();
    } else {
      id("p1-turn-results").classList.remove("hidden");
      id("p2-turn-results").classList.remove("hidden");
    }
  }

  /**
   * Disables the user's move buttons and replaces the flee button with a return to pokedex button.
   */
  function endGame() {
    let moves = qsa("#p1 .moves button");
    for (let i = 0; i < moves.length; i++) {
      moves[i].disabled = true;
    }
    id("endgame").classList.remove("hidden");
    id("endgame").addEventListener("click", toMenu);
    id("flee-btn").classList.add("hidden");
  }

  /**
   * Returns to the pokedex/selection screen from the battle screen.
   */
  function toMenu() {
    id("results-container").classList.add("hidden");
    id("p2").classList.add("hidden");
    qs("#p1 .hp-info").classList.add("hidden");
    id("p1-turn-results").classList.add("hidden");
    id("p2-turn-results").classList.add("hidden");
    id("endgame").classList.add("hidden");

    id("start-btn").classList.remove("hidden");
    id("pokedex-view").classList.remove("hidden");

    qs("header h1").textContent = "Your Pokedex";
    let shortName = qs("#p1 .pokepic").alt;
    getPokeInfo(shortName);
  }

  /**
   * Logs an error in the console
   * @param {string} error - Error string
   */
  function handleErr(error) {
    console.error(error);
  }

  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns a new element of the given tag type
   * @param {string} tag - new element tag type
   * @returns {object} - new DOM object of the type tag
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();