/**
 * Coby Chun
 * CSE 154 AE Peter & Kasten
 * 4/25/2024
 *
 * javascript file to adds the behaviors of the set game in set.html. Players may select
 * a desired difficulty and time in the menu. Start the game by pressing the start button.
 * Refresh cards by hitting refresh, select cards with a click, and return to menu with the back to
 * main button. More instructions found in spec
 */

"use strict";
(function() {

  window.addEventListener("load", init);

  let timerId;
  let remainingSeconds;

  const SECOND = 1000;
  const STYLE = ["outline", "solid", "striped"];
  const SHAPE = ["diamond", "oval", "squiggle"];
  const COLOR = ["green", "purple", "red"];
  const COUNT = [1, 2, 3];

  /**
   * sets up necessary functionality when page loads
   */
  function init() {
    id("start-btn").addEventListener("click", startGame);
    id("back-btn").addEventListener("click", toMenu);
    id("refresh-btn").addEventListener("click", generateBoard);
  }

  // REQUIRED FUNCTIONS

  /**
   * Toggles the game between menu and game view
   */
  function toggleViews() {
    id("menu-view").classList.toggle("hidden");
    id("game-view").classList.toggle("hidden");
  }

  /**
   * Generates an array of random card attributes. If isEasy, style can only be solid
   * @param {boolean} isEasy - Boolean representing if the difficulty of the game is easy
   * @returns {Array} - array of length 4 containing random card attributes
   */
  function generateRandomAttributes(isEasy) {
    let style;

    if (isEasy) {
      style = "solid";
    } else {
      style = STYLE[parseInt(Math.random() * 3)];
    }
    let shape = SHAPE[parseInt(Math.random() * 3)];
    let color = COLOR[parseInt(Math.random() * 3)];
    let count = COUNT[parseInt(Math.random() * 3)];

    return [style, shape, color, count];
  }

  /**
   * Creates a unique card with full game functionality (click to select)
   * @param {boolean} isEasy - Boolean representing if the difficulty of the game is easy
   * @returns {object} - DOM element (div) representing a playing card
   */
  function generateUniqueCard(isEasy) {
    let card = gen("div");
    let attrs = generateRandomAttributes(isEasy);
    while (id((attrs[0] + "-" + attrs[1] + "-" + attrs[2] + "-" + attrs[3])) !== null) {
      attrs = generateRandomAttributes(isEasy);
    }
    for (let i = 0; i < attrs[3]; i++) {
      let img = gen("img");
      img.src = "img/" + attrs[0] + "-" + attrs[1] + "-" + attrs[2] + ".png";
      card.append(img);
    }
    card.classList.add("card");
    card.id = (attrs[0] + "-" + attrs[1] + "-" + attrs[2] + "-" + attrs[3]);
    card.addEventListener("click", cardSelected);
    return card;
  }

  /**
   * Starts the game timer, which decrements from the selected time until the timer
   * hits 0
   */
  function startTimer() {
    remainingSeconds = parseInt(qs("select").selectedOptions[0].value);
    id("time").textContent = secToClock();
    timerId = setInterval(advanceTimer, SECOND);
  }

  /**
   * Decrements the game timer, then checks if the timer has hit 00:00. If the timer has hit
   * 00:00, the game is over and the board will be disabled.
   */
  function advanceTimer() {
    remainingSeconds--;
    id("time").textContent = secToClock();
    if (remainingSeconds === 0) {
      disableBoard();
      clearInterval(timerId);
    }
  }

  /**
   * Adds the selected class to the selected card, the checks if a set has been tried yet
   */
  function cardSelected() {
    this.classList.toggle("selected");
    let selected = qsa(".selected");
    if (selected.length === 3) {
      displayText(isASet(selected));
    }
  }

  // ADDITIONAL FUNCTIONS

  /**
   * Switches the view to the game view, grabs the selected starting time, starts the game timer,
   * and generates the board.
   */
  function startGame() {
    startTimer();
    generateBoard();
    toggleViews();
  }

  /**
   * Disables game functionality of the game board. This includes disabling selection of cards,
   * and diabling the refresh button.
   */
  function disableBoard() {
    id("refresh-btn").disabled = true;
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.remove("selected");
      cards[i].removeEventListener("click", cardSelected);
    }
  }

  /**
   * Switches view from game view to menu view, re-enables the game board functionality (in case
   * it was disabled), removes the game timer, resets the selected game time, and resets the
   * previous game's set count to 0.
   */
  function toMenu() {
    toggleViews();
    remainingSeconds = 0;
    clearInterval(timerId);
    id("refresh-btn").disabled = false;
    id("set-count").textContent = 0;
  }

  /**
   * Converts remainingSeconds (in seconds) to MM:SS format (185s to 03:05)
   * @returns {string} - current remainingSeconds in MM:SS format
   */
  function secToClock() {
    const SEC_IN_MIN = 60;
    const DBL_DIGIT = 10;
    let secs = (remainingSeconds % SEC_IN_MIN);
    let mins = parseInt(remainingSeconds / SEC_IN_MIN);

    // Leading 0 if single digit seconds
    if (parseInt(secs / DBL_DIGIT) === 0) {
      secs = "0" + secs;
    }

    // Mins should always have a leading 0 (maximum 5 mins)
    mins = "0" + mins;
    return (mins + ":" + secs);
  }

  /**
   * Generates a fresh game board by first removing the previous board, then
   * checking the difficulty, then generating the appropriate number of unique
   * cards based on that difficulty.
   */
  function generateBoard() {

    // Remove existing cards
    let existingCards = qsa(".card");
    for (let i = 0; i < existingCards.length; i++) {
      id("board").removeChild(existingCards[i]);
    }

    // Add new cards
    let isEasy = (qs("p input").checked === true);
    const EASY_COUNT = 9;
    const STANDARD_COUNT = 12;
    let cards = STANDARD_COUNT;
    if (isEasy) {
      cards = EASY_COUNT;
    }
    for (let i = 0; i < cards; i++) {
      id("board").append(generateUniqueCard(isEasy));
    }
  }

  /**
   * Using isSet, displays temporary text over all selected cards depending on if
   * the cards were a set or not:
   *  - If they were a set, refresh those cards and display "SET!" for 1 second
   *  - If they were NOT a set, display "Not a Set" for 1 second, then redisplay the same cards
   * Also increments the set count and deselects the selected cards before displaying any text.
   * @param {boolean} isSet - states whether the selected 3 cards are a set or not
   */
  function displayText(isSet) {
    if (isSet) {
      id("set-count").textContent++;
      setText();
    } else {
      noSetText();
    }
  }

  /**
   * Refreshes selected cards and displays "SET!" over them for 1 second
   */
  function setText() {
    let selected = qsa(".selected");
    for (let i = 0; i < 3; i++) {

      // Replace set card with new hidden card
      let isEasy = qs("p input").checked === true;
      let newCard = generateUniqueCard(isEasy);
      selected[i].parentElement.replaceChild(newCard, selected[i]);
      newCard.classList.add("hide-imgs");
      let text = gen("p");
      text.textContent = "SET!";
      newCard.append(text);

      // Remove text, unhide images after 1 second
      setTimeout(() => {
        newCard.classList.remove("hide-imgs");
        newCard.removeChild(text);
      }, SECOND);
    }
  }

  /**
   * Displays "Not a Set" over selected cards before unhiding the original cards
   */
  function noSetText() {
    let selected = qsa(".selected");
    for (let i = 0; i < 3; i++) {
      selected[i].classList.add("hide-imgs");
      selected[i].classList.remove("selected");
      let text = gen("p");
      text.textContent = "Not a Set";
      selected[i].append(text);

      // Remove text, unhide images after 1 second
      setTimeout(() => {
        selected[i].removeChild(text);
        selected[i].classList.remove("hide-imgs");
      }, SECOND);
    }
  }

  // PROVIDED FUNCTIONS

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attributes = [];
    for (let i = 0; i < selected.length; i++) {
      attributes.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attributes[0].length; i++) {
      let diff = attributes[0][i] !== attributes[1][i] &&
                attributes[1][i] !== attributes[2][i] &&
                attributes[0][i] !== attributes[2][i];
      let same = attributes[0][i] === attributes[1][i] &&
                    attributes[1][i] === attributes[2][i];
      if (!(same || diff)) {
        return false;
      }
    }
    return true;
  }

  // HELPER FUNCTIONS

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
   * @param {string} id - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
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