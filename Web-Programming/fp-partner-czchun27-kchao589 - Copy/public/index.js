/**
 * Coby Chun & Kevin Chao
 * 6/4/2024
 * CSE 154
 * Final Project
 *
 * JS FILE FOR The Washington University of Hobby and Leisure's course selection page.
 * Existing users can login and access a variety of features including a course catalog,
 * degree audits, transaction history, and course over view pages.
 */

'use strict';
(function() {

  window.addEventListener('load', init);

  const HOME = 0;
  const MY_COURSES = 1;
  const CATALOG = 2;
  const COURSE_VIEW = 3;
  const CONFIRMATION = 4;
  const TRANSACTION = 5;
  const DEGREE_AUDIT = 6;
  const LOGIN = 7;
  const REQUIRE_LOGIN = 8;
  const ERROR = 9;

  /**
   * Initializes the page
   */
  function init() {
    logout();

    id('login-form').addEventListener('submit', (evt) => {
      evt.preventDefault();
      login();
    });
    id('audit-form').addEventListener('submit', (evt) => {
      evt.preventDefault();
      auditDegree();
    });

    navBtnInit();

    id("search-btn").addEventListener("click", () => {
      search(id("search-term").value);
    });

    let buttons = qsa(".layout-option");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("change", catalogLayout);
    }

    let filters = qsa(".filter");
    for (let i = 0; i < filters.length; i++) {
      filters[i].addEventListener("change", filterCourses);
    }

    id("txn-btn").addEventListener("click", updateTransactions);

    fillCatalog();
  }

  /**
   * Initializes the buttons on the page
   */
  function navBtnInit() {
    id("logout-btn").addEventListener("click", logout);

    id("home-btn").addEventListener("click", () => {
      changeView(HOME);
    });
    id("login-btn").addEventListener("click", () => {
      changeView(LOGIN);
    });
    id("catalog-btn").addEventListener("click", () => {
      loggedInView(CATALOG);
    });
    id("my-courses-btn").addEventListener("click", () => {
      loggedInView(MY_COURSES);
    });
    id("degree-audit-btn").addEventListener("click", () => {
      loggedInView(DEGREE_AUDIT);
      resetAudit();
    });
  }

  /**
   * Async function that populates the catalog page with course entries
   */
  async function fillCatalog() {
    try {
      let courses = await fetch("/courses/get/courselist");
      await statusCheck(courses);
      courses = await courses.json();
      let catalog = id("course-display");
      for (let i = 0; i < courses.length; i++) {
        genCourseEntry(courses[i], catalog);
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Switch the catalog layout from box to list and vice versa
   */
  async function catalogLayout() {
    try {
      let courses = await fetch("/courses/get/courselist");
      await statusCheck(courses);
      courses = await courses.json();
      let catalog = id("course-display");
      let layout = this.value;
      for (let i = 0; i < courses.length; i++) {
        catalog.innerHTML = "";
      }
      if (layout === "list") {
        genCourseList(courses, catalog);
      } else {
        for (let i = 0; i < courses.length; i++) {
          genCourseEntry(courses[i], catalog);
        }
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Filter the course catalog based on user selected inputs
   */
  async function filterCourses() {
    try {
      let filter = this.value;
      let courses = await fetch("/courses/courselist/filter/" + filter);
      await statusCheck(courses);
      courses = await courses.json();
      let catalog = id("course-display");

      let layout = qsa(".layout-option");
      if (layout[0].checked) {
        catalog.innerHTML = "";
        for (let i = 0; i < courses.length; i++) {
          genCourseEntry(courses[i], catalog);
        }
      } else {
        catalog.innerHTML = "";
        genCourseList(courses, catalog);
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Generates a list of all courses
   * @param {object} course - JSON object of all courses
   * @param {object} destination - HTML object for the parent of the course item
   */
  function genCourseList(course, destination) {
    let list = gen("ul");

    for (let i = 0; i < course.length; i++) {
      let courseItem = gen("li");
      courseItem.id = course[i].short;

      let courseName = gen("p");
      courseName.textContent = course[i].name;

      let courseCapacity = gen("h3");
      courseCapacity.textContent = course[i].numStudents + "/" + course[i].capacity;

      courseName.addEventListener("click", () => {
        updateCoursePage(course[i]);
        changeView(COURSE_VIEW);
      });

      courseItem.classList.add("course");
      courseItem.appendChild(courseName);
      courseItem.appendChild(courseCapacity);
      list.appendChild(courseItem);
    }

    destination.appendChild(list);
  }

  /**
   * Generates a course entry in the given destination for the given course
   * @param {object} course - JSON object for a course with course info
   * @param {object} destination - HTML object for the parent of the course item
   */
  function genCourseEntry(course, destination) {
    let sec = gen("section");
    let courseName = gen("p");
    let courseShort = gen("p");
    let courseCapacity = gen("p");

    sec.classList.add("course");
    sec.id = course.short;
    courseName.textContent = course.name;
    courseShort.textContent = course.short;
    courseCapacity.textContent = course.numStudents + "/" + course.capacity;
    courseName.addEventListener("click", () => {
      updateCoursePage(course);
      changeView(COURSE_VIEW);
    });

    sec.appendChild(courseName);
    sec.appendChild(courseShort);
    sec.appendChild(courseCapacity);
    destination.appendChild(sec);
  }

  /**
   * Updates the course page, which displays in depth information about a specific
   * course.
   * @param {object} course - JSON object for a course with course info
   */
  function updateCoursePage(course) {
    let courseView = id("course-view");
    courseView.removeChild(qs("#course-view > section"));
    let page = gen("section");
    let courseName = gen("h2");
    let back = gen("button");
    let action = gen("img");

    determineAction(action, course);

    action.classList.add("action-btn");
    courseName.textContent = course.name;
    back.textContent = "Return to courses";
    back.addEventListener("click", () => {
      changeView(CATALOG);
    });
    page.appendChild(courseName);
    page.appendChild(action);
    page.appendChild(buildCoursePageInfo(course));
    page.appendChild(back);
    courseView.appendChild(page);
  }

  /**
   * Determines whether the course is addable or droppable or neither
   * Plus and Minus img link: https://www.vectorstock.com/royalty-free-vector/plus-and-minus-button-vector-28216892
   * @param {object} action - html image element to be used as an add/drop button
   * @param {object} course - JSON object for a course with course info
   */
  async function determineAction(action, course) {
    try {
      let usrCourses = await getUsrCourses();
      let taken = false;
      let takenCourse;
      for (let i = 0; i < usrCourses.length; i++) {
        if (course.short === usrCourses[i].short) {
          taken = true;
          takenCourse = usrCourses[i];
        }
      }
      if (taken === true) {
        if (takenCourse.status === 0) {
          action.src = "/img/minus.jpg";
          action.addEventListener("click", () => {
            toConfirmation(1, course);
          });
        }
      } else {
        action.src = "/img/plus.jpg";
        action.addEventListener("click", () => {
          toConfirmation(0, course);
        });
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Changes view to a confirmation page to add or drop a course
   * depending on the given actionID. Displays a confirmation code after
   * successful transaction
   * @param {int} actionID - 0 indicates an add, 1 indicates a drop
   * @param {object} course - JSON object for a course with course info
   */
  function toConfirmation(actionID, course) {
    id("confirm-number").classList.add("hidden");
    changeView(CONFIRMATION);
    let title = qs("#confirmation h2");
    let btn = gen("button");
    id("confirmation").removeChild(qs("#confirmation button"));
    if (actionID === 0) {
      title.textContent = "Course Add Confirmation";
      btn.textContent = "Add " + course.name + "?";

      btn.addEventListener("click", () => {
        btn.disabled = true;
        checkAddConditions(course);
      });
    } else {
      title.textContent = "Course Drop Confirmation";
      btn.textContent = "Drop " + course.name + "?";

      btn.addEventListener("click", () => {
        btn.disabled = true;
        dropCourse(course);
      });
    }
    id("confirmation").appendChild(btn);
  }

  /**
   * Displays the confirmation number of the latest transaction on the
   * confirmation page
   */
  async function displayConfirm() {
    try {
      let confirmNotif = id("confirm-number");
      confirmNotif.classList.remove("hidden");
      let userid = await getCurrId();
      let txns = await fetch("/courses/get/transactions/" + userid);
      await statusCheck(txns);
      txns = await txns.json();
      let confirmNum = txns[0].confirmation;
      confirmNotif.textContent = "Success! Confirmation " + confirmNum;
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Builds the bulk of the course page using the given course information
   * @param {object} course - JSON object for a course with course info
   * @returns {object} - html element for the course page info
   */
  function buildCoursePageInfo(course) {
    let info = gen("section");
    let desc = gen("p");
    let prereq = gen("h3");
    let instruct = gen("h3");
    let room = gen("h3");
    let time = gen("h3");
    let capacity = gen("h3");
    let major = gen("h3");
    prereq.textContent = "Prerequisites: " + course.prerequisites;
    desc.textContent = course.courseDesc;
    instruct.textContent = "Instructor: " + course.instructor;
    room.textContent = "Room: " + course.room;
    time.textContent = "Time: " + course.time;
    capacity.textContent = "Students: " + course.numStudents + "/" + course.capacity;
    major.textContent = "Required Major: " + course.major;
    info.appendChild(desc);
    info.appendChild(prereq);
    info.appendChild(instruct);
    info.appendChild(room);
    info.appendChild(time);
    info.appendChild(capacity);
    info.appendChild(major);
    return info;
  }

  /**
   * Filters entries based on a given search term
   * @param {string} searchTerm - Search term to be matched with a course's short name
   */
  async function search(searchTerm) {
    // let searchTerm = id("search-term").value;
    if (searchTerm.trim() !== "") {
      try {
        unhideCatalog();
        let searchList = await fetch("/courses/get/courselist?search=" + searchTerm.trim());
        await statusCheck(searchList);
        searchList = await searchList.json();
        let courses = qsa("#catalog .course");
        for (let i = 0; i < courses.length; i++) {
          let inSearch = false;
          for (let j = 0; j < searchList.length; j++) {
            if (courses[i].id === searchList[j].short) {
              inSearch = true;
            }
          }
          if (!inSearch) {
            courses[i].classList.add("hidden");
          }
        }
      } catch (err) {
        handleErr();
      }
    }
  }

  /**
   * Courses in the catalog that were hidden will be unhidden
   */
  function unhideCatalog() {
    let courses = qsa("#catalog .course");
    for (let i = 0; i < courses.length; i++) {
      courses[i].classList.remove("hidden");
    }
  }

  /**
   * Audits the currently selected degree by displaying the user's progress
   * towards the degree
   */
  async function auditDegree() {
    try {
      resetAudit();
      let major = (new FormData(id("audit-form"))).get("major");
      let userid = await getCurrId();
      let degrees = await fetch("/courses/get/degreereq/" + major);
      await statusCheck(degrees);
      degrees = await degrees.json();
      let courses = await fetch("/courses/get/userCourses/" + userid);
      await statusCheck(courses);
      courses = await courses.json();
      let degreeCourses = (degrees.courselist).split(" ");
      for (let i = 0; i < degreeCourses.length; i++) {
        let status = 0;
        for (let j = 0; j < courses.length; j++) {
          if (degreeCourses[i] === courses[j].short) {
            if (courses[j].status === 1) {
              status = 2;
            } else {
              status = 1;
            }
          }
        }
        addToAudit(degreeCourses[i], status);
      }
    } catch (err) {
      console.error(err);
      handleErr();
    }
  }

  /**
   * Adds the course to one of 3 progress columns: Completed (2), In Progress (1)
   * and Not Started (0)
   * @param {string} courseName - Short name of course
   * @param {int} status - ID for which progress column to put course
   */
  function addToAudit(courseName, status) {
    let auditSec;
    let course = gen("p");
    course.textContent = courseName;
    if (status === 0) {
      auditSec = id("ns");
    } else if (status === 1) {
      auditSec = id("ip");
    } else {
      auditSec = id("comp");
    }
    auditSec.appendChild(course);
  }

  /**
   * Builds the html elements for the degree audit
   */
  function buildAudit() {
    let auditSec = id("degree-progress");
    let comp = gen("section");
    let ch3 = gen("h3");
    let ip = gen("section");
    let ih3 = gen("h3");
    let ns = gen("section");
    let nh3 = gen("h3");
    comp.id = "comp";
    ip.id = "ip";
    ns.id = "ns";
    ch3.textContent = "Completed Courses";
    ih3.textContent = "In Progress Courses";
    nh3.textContent = "Not Started Courses";
    comp.appendChild(ch3);
    ip.appendChild(ih3);
    ns.appendChild(nh3);
    auditSec.appendChild(comp);
    auditSec.appendChild(ip);
    auditSec.appendChild(ns);
  }

  /**
   * Removes existing degree audit elements and builds the base degree audit
   */
  function resetAudit() {
    let auditSec = id("degree-progress");
    let comp = id("comp");
    let ip = id("ip");
    let ns = id("ns");
    auditSec.removeChild(comp);
    auditSec.removeChild(ip);
    auditSec.removeChild(ns);
    buildAudit();
  }

  /**
   * Tries to login the user based on inputs to the login form.
   * Makes a post request
   */
  async function login() {
    try {
      id("login-fail").classList.add("hidden");
      let data = new FormData();
      data.append("user", id("username").value);
      data.append("pass", id("password").value);
      let res = await fetch("/courses/login", {method: "POST", body: data});
      await statusCheck(res);
      res = await res.json();
      id("login-btn").classList.add("hidden");
      id("logout-btn").classList.remove("hidden");
      changeView(HOME);
      fillMyCourses();
    } catch (err) {
      if ((err + "") === "Error: Credentials not found") {
        id("login-fail").classList.remove("hidden");
      } else {
        handleErr();
      }
    }
  }

  /**
   * Updates the my courses page with current and past courses for the user
   */
  async function fillMyCourses() {
    try {
      clearMyCourses();
      id("empty-courses").classList.add("hidden");
      let user = await fetch("/courses/get/user");
      await statusCheck(user);
      user = await user.json();
      let courses = await fetch("/courses/get/userCourses/" + user.id);
      await statusCheck(courses);
      courses = await courses.json();
      for (let i = 0; i < courses.length; i++) {
        let destination;
        if (courses[i].status === 0) {
          destination = id("curr-courses");
        } else {
          destination = id("past-courses");
        }
        let course = await fetch("/courses/get/courselist/" + courses[i].short);
        await statusCheck(course);
        course = await course.json();
        genCourseEntry(course, destination);
      }
    } catch (err) {
      if ((err + "") === "Error: No courses") {
        id("empty-courses").classList.remove("hidden");
      } else {
        handleErr();
      }
    }
  }

  /**
   * Clears all current and past courses from the user's my courses page
   */
  function clearMyCourses() {
    let currCourses = id("curr-courses");
    let pastCourses = id("past-courses");

    let currChilds = qsa("#curr-courses .course");
    let pastChilds = qsa("#past-courses .course");

    for (let i = 0; i < currChilds.length; i++) {
      currCourses.removeChild(currChilds[i]);
    }

    for (let i = 0; i < pastChilds.length; i++) {
      pastCourses.removeChild(pastChilds[i]);
    }
  }

  /**
   * Checks whether the current user can add the course:
   * The user must meet the prerequisite courses, be in the major (optional)
   * the course must have space, and the user must not have taken the
   * course already (completed or IP)
   * @param {object} course - JSON object for a course with course info
   */
  async function checkAddConditions(course) {
    try {
      let user = await fetch("/courses/get/user");
      await statusCheck(user);
      user = await user.json();
      let courses = await fetch("/courses/get/userCourses/" + user.id);
      await statusCheck(courses);
      courses = await courses.json();
      let preReqs = course.prerequisites;

      let courseTaken = checkNotTaken(course, courses);

      let courseMajor = checkMajorReq(course, user);

      let courseCap = checkCourseCap(course);

      if (!courseTaken && checkPrereq(preReqs, courses) && courseMajor && courseCap) {
        addCourse(course, user.id);
      } else {
        missingAddReq();
      }
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Checks if the course has been taken by the user
   * @param {object} course - JSON object for a course with course info
   * @param {object} courses - List of courses, which are JSON objects
   * @returns {boolean} - true if the user hasn't taken the course
   */
  function checkNotTaken(course, courses) {
    let courseTaken = false;
    for (let i = 0; i < courses.length; i++) {
      if (course.short === courses[i].short) {
        courseTaken = true;
      }
    }
    return courseTaken;
  }

  /**
   * Checks if the course is exclusive to a major, and then
   * checks if the user is in that major.
   * @param {object} course - JSON object for a course with course info
   * @param {object} user - JSON object for a user with user info
   * @returns {boolean} - true if the user meets the major requirement
   */
  function checkMajorReq(course, user) {
    let courseMajor = false;
    let req = course.major;
    if (req === "none") {
      courseMajor = true;
    }
    if (req === user.degree) {
      courseMajor = true;
    }
    return courseMajor;
  }

  /**
   * Checks if the course has available seats
   * @param {object} course - JSON object for a course with course info
   * @returns {boolean} - true if the course has space
   */
  function checkCourseCap(course) {
    let cap = course.capacity;
    let students = course.numStudents;
    return (cap !== students);
  }

  /**
   * Checks whether each prerequisite course has been taken by the user
   * @param {object} preReqs - Array of strings representing the short name of courses
   * @param {object} courses - JSON object with a list of courses taken by the user
   * @returns {boolean} - True if the user meets the preReqs, False otherwise
   */
  function checkPrereq(preReqs, courses) {
    let res = false;
    if (preReqs === "none") {
      res = true;
    } else {
      preReqs = preReqs.split(", ");
      let hasAllPrereqs = true;
      for (let i = 0; i < preReqs.length; i++) {
        let hasPrereq = false;
        for (let j = 0; j < courses.length; j++) {
          if (courses[j].short === preReqs[i] && courses[j].status === 1) {
            hasPrereq = true;
          }
        }
        if (!hasPrereq) {
          hasAllPrereqs = false;
        }
      }
      if (hasAllPrereqs) {
        res = true;
      }
    }
    return res;
  }

  /**
   * Async function that adds the given course to the user's mycourses page.
   * Makes a post request
   * @param {object} course - JSON object for a course with course info
   * @param {int} id - User's id number
   */
  async function addCourse(course, id) {
    try {
      let data = new FormData();
      data.append("course", course.short);
      data.append("id", id);
      let result = await fetch("/courses/add", {method: "POST", body: data});
      await statusCheck(result);
      result = await result.text();
      fillMyCourses();
      displayConfirm();
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Removes the course from the user's mycourses schedule.
   * Makes a post call.
   * @param {object} course - JSON object for a course with course info
   */
  async function dropCourse(course) {
    try {
      let userID = await getCurrId();
      let data = new FormData();
      data.append("course", course.short);
      data.append("id", userID);
      let result = await fetch("/courses/remove", {method: "POST", body: data});
      await statusCheck(result);
      result = await result.text();
      fillMyCourses();
      displayConfirm();
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Displays a message that the user is unable to add the course
   * due to missing requirements on the confirmation page
   */
  function missingAddReq() {
    let message = id("confirm-number");
    message.classList.remove("hidden");
    message.textContent = "Failure. User does not meet course requirements or course is full";
  }

  /**
   * Updates the transactions page with the latest transactions for
   * the current user
   */
  async function updateTransactions() {
    try {
      clearTxns();
      let txnPage = id("txn");
      let userId = await getCurrId();
      let txns = await fetch("/courses/get/transactions/" + userId);
      await statusCheck(txns);
      txns = await txns.json();
      for (let i = 0; i < txns.length; i++) {
        txnPage.appendChild(buildTransaction(txns[i]));
      }
      changeView(TRANSACTION);
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Clears the transactions page of all transactions
   */
  function clearTxns() {
    let txnPage = id("txn");
    let txns = qsa(".txn");
    for (let i = 0; i < txns.length; i++) {
      txnPage.removeChild(txns[i]);
    }
  }

  /**
   * Builds a transaction using the given transaction information
   * @param {object} txn - JSON object for a single course transaction
   * @returns {object} - html element for the transaction
   */
  function buildTransaction(txn) {
    let container = gen("article");
    let confirm = gen("p");
    let action = gen("p");
    let course = gen("p");
    let date = gen("p");

    if (txn.action === 0) {
      action.textContent = "Add";
    } else {
      action.textContent = "Drop";
    }
    container.classList.add("txn");
    confirm.textContent = txn.confirmation;
    course.textContent = txn.short;
    date.textContent = txn.date;
    container.appendChild(confirm);
    container.appendChild(action);
    container.appendChild(course);
    container.appendChild(date);
    return container;
  }

  /**
   * Async function returning the current user's id
   * @returns {int} - User's current id
   */
  async function getCurrId() {
    try {
      let user = await fetch("/courses/get/user");
      await statusCheck(user);
      user = await user.json();
      return user.id;
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Async function returning the current user's list of courses
   * @returns {object} - JSON object with a list of courses taken by the user
   */
  async function getUsrCourses() {
    let id = await getCurrId();
    let usrCourses = await fetch("/courses/get/userCourses/" + id);
    await statusCheck(usrCourses);
    usrCourses = await usrCourses.json();
    return usrCourses;
  }

  /**
   * Logs the current user out. Makes a post request
   */
  async function logout() {
    try {
      let res = await fetch("/courses/logout", {method: "POST"});
      await statusCheck(res);
      res = res.text();
      id("login-btn").classList.remove("hidden");
      id("logout-btn").classList.add("hidden");
      changeView(HOME);
    } catch (err) {
      handleErr();
    }
  }

  /**
   * Checks to see if a user is logged in, then changes the view
   * to the desired view. Otherwise tells the user to login
   * @param {int} viewID - ID for the view to be displayed
   */
  async function loggedInView(viewID) {
    try {
      let user = await fetch("/courses/get/user");
      await statusCheck(user);
      user = await user.json();
      changeView(viewID);
    } catch (err) {
      if ((err + "") === "Error: No active user found") {
        changeView(REQUIRE_LOGIN);
      } else {
        handleErr();
      }
    }
  }

  /**
   * Changes the view based on the given view id
   * @param {int} viewID - ID for the view to be displayed
   */
  function changeView(viewID) {
    hideViews();
    if (viewID === HOME) {
      id("home").classList.remove("hidden");
    } else if (viewID === MY_COURSES) {
      id("my-courses").classList.remove("hidden");
    } else if (viewID === CATALOG) {
      id("catalog").classList.remove("hidden");
    } else if (viewID === COURSE_VIEW) {
      id("course-view").classList.remove("hidden");
    } else if (viewID === CONFIRMATION) {
      id("confirmation").classList.remove("hidden");
    } else if (viewID === TRANSACTION) {
      id("txn").classList.remove("hidden");
    } else if (viewID === DEGREE_AUDIT) {
      id("degree-audit").classList.remove("hidden");
    } else if (viewID === LOGIN) {
      id("login").classList.remove("hidden");
    } else if (viewID === REQUIRE_LOGIN) {
      id("require-login").classList.remove("hidden");
    } else {
      id("error").classList.remove("hidden");
    }
  }

  /**
   * Hides all page views
   */
  function hideViews() {
    id("home").classList.add("hidden");
    id("my-courses").classList.add("hidden");
    id("catalog").classList.add("hidden");
    id("course-view").classList.add("hidden");
    id("confirmation").classList.add("hidden");
    id("txn").classList.add("hidden");
    id("degree-audit").classList.add("hidden");
    id("login").classList.add("hidden");
    id("require-login").classList.add("hidden");
    id("error").classList.add("hidden");
  }

  /**
   * Displays the error page and disables all buttons
   */
  function handleErr() {
    changeView(ERROR);
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