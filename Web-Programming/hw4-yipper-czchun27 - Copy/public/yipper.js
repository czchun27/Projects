/**
 * Coby Chun
 * CSE 154 AE Peter & Kasten
 * 5/28/2024
 *
 * Client side JS file for yipper. Allows the user to browse a site similar to twitter,
 * but for dogs. Users can like posts, create posts, or view post history for posters.
 */

'use strict';
(function() {

  const IMG_PATH = "img/";
  const HOME_ID = 0;
  const USER_ID = 1;
  const YIP_ID = 2;
  const TO_HOME_TIME = 2000;

  window.addEventListener('load', init);

  /**
   * Initializes the page; Allows the user to navigate the pet simulator and
   * populates the shelter/my pets pages
   */
  function init() {
    loadYips();

    id("search-term").addEventListener("input", enableSearch);
    id("search-btn").addEventListener("click", search);

    id("home-btn").addEventListener("click", () => {
      changeView(HOME_ID);
      showCards();
      id("search-term").value = "";
    });

    id("yip-btn").addEventListener("click", () => {
      changeView(YIP_ID);
      id("search-term").value = "";
    });

    qs("#new form").addEventListener("submit", (evt) => {
      evt.preventDefault();
      addYip();
    });
  }

  /**
   * Fills the homepage with yips from the yips table. Makes a get fetch
   * call to the yipper api to retrieve this information.
   */
  async function loadYips() {
    try {
      let res = await fetch("/yipper/yips");
      await statusCheck(res);
      res = await res.json();
      for (let i = 0; i < res["yips"].length; i++) {
        let yip = res.yips[i];
        appendYip(yip);
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Appends the given yip to the home page
   * @param {object} yip - JSON object referring to a yip; has id, name, yip, hashtag, date, likes
   */
  function appendYip(yip) {
    let main = id("home");
    let card = gen("article");
    let img = gen("img");
    let div = gen("div");
    let name = gen("p");
    let content = gen("p");
    let meta = constructMeta(yip);

    card.classList.add("card");
    card.id = yip.id;
    img.src = getSource(yip.name);
    name.classList.add("individual");
    name.textContent = yip.name;
    content.textContent = yip.yip + " #" + yip.hashtag;

    name.addEventListener("click", () => {
      changeView(USER_ID);
      getUser(yip.name);
      id("search-term").value = "";
    });

    div.appendChild(name);
    div.appendChild(content);
    card.appendChild(img);
    card.appendChild(div);
    card.appendChild(meta);
    main.appendChild(card);
  }

  /**
   * Creates the meta section of the yip card (Displays likes, date for yip card)
   * @param {object} yip - JSON object referring to a yip; has id, name, yip, hashtag, date, likes
   * @returns {object} - HTML element for the meta section of the yip card
   */
  function constructMeta(yip) {
    let meta = gen("div");
    let date = gen("p");
    let likeCon = gen("div");
    let likeImg = gen("img");
    let likes = gen("p");

    meta.classList.add("meta");
    date.textContent = (new Date(yip.date)).toLocaleString();
    likeImg.src = IMG_PATH + "heart.png";
    likeImg.addEventListener("click", () => {
      likePost(yip.id, likes);
    });
    likes.textContent = yip.likes;

    likeCon.appendChild(likeImg);
    likeCon.appendChild(likes);
    meta.appendChild(date);
    meta.appendChild(likeCon);

    return meta;
  }

  /**
   * Converts a username into the trimmed image src
   * @param {string} name - User's name
   * @returns {string} - Image path for user profile picture
   */
  function getSource(name) {
    name = name.replace(/\s+/g, '-').toLowerCase() + ".png";
    return IMG_PATH + name;
  }

  /**
   * Makes a post request to yipper API to add a like to the given post, then
   * updates the post's likes
   * @param {int} postID - ID of yip post
   * @param {object} likesContainer - HTML element for the number of likes for the post
   */
  async function likePost(postID, likesContainer) {
    try {
      let data = new FormData();
      data.append("id", postID);

      let res = await fetch("/yipper/likes", {method: "POST", body: data});
      await statusCheck(res);
      res = await res.text();

      likesContainer.textContent = res;
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Async function that gets the user's information using a get request to yipper.
   * Then updates the user page with that user's information and yips.
   * @param {string} name - Name of user
   */
  async function getUser(name) {
    try {
      clearUser();

      let user = await fetch("/yipper/user/" + name);
      await statusCheck(user);
      user = await user.json();

      updateUser(name, user);
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Updates the user page with the user's yips
   * @param {string} name - User's name
   * @param {object} user - JSON object containing the user's posts
   */
  function updateUser(name, user) {
    let profile = id("user");
    let single = gen("article");
    let header = gen("h2");

    header.textContent = "Yips shared by " + name + ":";
    single.classList.add("single");
    single.appendChild(header);

    for (let i = 0; i < user.length; i++) {
      let yip = gen("p");
      yip.textContent = "Yip #" + (i + 1) + ": " + user[i].yip + " #" + user[i].hashtag;
      single.appendChild(yip);
    }

    profile.appendChild(single);
  }

  /**
   * Removes all elements from the user page
   */
  function clearUser() {
    let single = qs(".single");
    if (single) {
      id("user").removeChild(single);
    }
  }

  /**
   * Enables the search button when the input is not whitespace
   */
  function enableSearch() {
    let bar = id("search-term");
    let trimmed = (bar.value).trim();
    if (trimmed !== "") {
      id("search-btn").disabled = false;
    } else {
      id("search-btn").disabled = true;
    }
  }

  /**
   * Makes a get request to yipper with a query parameter. Then filters the home page
   * based on the results of the search. Search button is disabled until the user searches
   * something else, or leaves the current page.
   */
  async function search() {
    try {
      changeView(HOME_ID);
      let searchTxt = (id("search-term").value).trim();
      let res = await fetch("/yipper/yips?search=" + searchTxt);
      await statusCheck(res);
      res = await res.json();

      hideCards(res["yips"]);

      id("search-btn").disabled = true;
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Adds a yip to the top of the home page based on user input on the yip page.
   * Alao adds the yip data to the yip table.
   */
  async function addYip() {
    try {
      let data = new FormData();
      data.append("name", qs("#name").value);
      data.append("full", qs("#yip").value);

      let res = await fetch("/yipper/new", {method: "POST", body: data});
      await statusCheck(res);
      res = await res.json();

      prependYip(res);

      setTimeout(() => {
        changeView(HOME_ID);
      }, TO_HOME_TIME);
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Adds a yip to the top of the home page (prepend)
   * @param {object} yip - JSON object referring to a yip; has id, name, yip, hashtag, date, likes
   */
  function prependYip(yip) {
    let main = id("home");
    let card = gen("article");
    let img = gen("img");
    let div = gen("div");
    let name = gen("p");
    let content = gen("p");
    let meta = constructMeta(yip);

    card.classList.add("card");
    card.id = yip.id;
    img.src = getSource(yip.name);
    name.classList.add("individual");
    name.textContent = yip.name;
    content.textContent = yip.yip + " #" + yip.hashtag;

    name.addEventListener("click", () => {
      changeView(USER_ID);
      getUser(yip.name);
      id("search-term").value = "";
    });

    div.appendChild(name);
    div.appendChild(content);
    card.appendChild(img);
    card.appendChild(div);
    card.appendChild(meta);
    main.prepend(card);
  }

  /**
   * Changes the view between home (1), user(2), and new yip (3) pages  based
   * on given viewId
   * @param {int} viewId - ID of desired page view
   */
  function changeView(viewId) {
    id("home").classList.add("hidden");
    id("user").classList.add("hidden");
    id("new").classList.add("hidden");
    if (viewId === HOME_ID) {
      id("home").classList.remove("hidden");
    } else if (viewId === USER_ID) {
      id("user").classList.remove("hidden");
    } else {
      id("new").classList.remove("hidden");
    }
  }

  /**
   * Hides all yips on the home page, then unhides any from with matching post id from
   * the given idList
   * @param {object} idList - JSON object containing post id's
   */
  function hideCards(idList) {
    let cards = qsa(".card");

    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.add("hidden");
    }

    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      for (let j = 0; j < idList.length; j++) {
        if (parseInt(card.id) === parseInt(idList[j].id)) {
          card.classList.remove("hidden");
        }
      }
    }
  }

  /**
   * Unhides every yip on the home page
   */
  function showCards() {
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.remove("hidden");
    }
  }

  /**
   * Displays the error page and disables all buttons
   */
  function handleErr() {
    let yipperData = id("yipper-data");
    yipperData.classList.add("hidden");

    let errorView = id("error");
    errorView.classList.remove("hidden");

    let btns = qsa("button");
    for (let i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
    }
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