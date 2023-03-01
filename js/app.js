/**
 *
 * Manipulating the DOM exercise.
 * Exercise programmatically builds navigation,
 * scrolls to anchors from navigation,
 * and highlights section in viewport upon scrolling.
 *
 * Dependencies: None
 *
 * JS Version: ES2015/ES6
 *
 * JS Standard: ESlint
 *
 */

/**
 * Comments should be present at the beginning of each procedure and class.
 * Great to have comments before crucial code sections within the procedure.
 */

/**
 * Define Global Variables
 *
 */
const button = document.querySelector("button");
const FragmentForSec = document.createDocumentFragment();
const sections = document.querySelectorAll("section");
const FragmentForLi = document.createDocumentFragment();
const ul = document.querySelector("ul");
const Pargraph = document.querySelectorAll(".par"); //to add this to any new section

/**
 * End Global Variables
 * Start Helper Functions
 *
 */

/**
 * End Helper Functions
 * Begin Main Functions
 *
 */

// build the nav

sections.forEach((sec, i) => {
  //creating anchor tags
  const secDataNav = sec.getAttribute("data-nav");
  const anchor = document.createElement("a");
  //give anchors tags some attributes
  anchor.classList.add("menu__link");
  anchor.setAttribute("href", `${secDataNav}`);
  anchor.innerHTML = `Section ${i + 1}`;
  //creating list items tags
  const li = document.createElement("li");
  //give list items tags some attributes
  li.classList.add("navbar__menu");
  li.setAttribute("data-nav", `Section ${i + 1}`);
  //scroll to section assgined to the anchor
  li.addEventListener("click", (evt) => {
    evt.preventDefault();
    sec.scrollIntoView({
      behavior: "smooth",
    });
  });
  li.appendChild(anchor);
  FragmentForLi.appendChild(li);
});
ul.appendChild(FragmentForLi);

// Scroll to anchor ID using scrollTO event
// Add class 'active' to section when near top of viewport

/**
 * End Main Functions
 * Begin Events
 *
 */
// Build menu
let x = sections.length; // intail value to count just after the number of sections already in the page
//button to creat new sections
button.addEventListener("click", () => {
  //creat new section
  const newSection = document.createElement("section");
  newSection.setAttribute("id", `Section${x + 1}`);
  newSection.setAttribute("data-nav", `Section ${x + 1}`);
  const SectionTi = newSection.getAttribute("data-nav");
  //section contant
  newSection.innerHTML = `<div class="landing__container">
          <h2>Section ${x + 1}</h2>
          <p>${Pargraph[0].textContent}</p>
          <p>${Pargraph[1].textContent}</p>
        </div>`;
  FragmentForSec.appendChild(newSection);
  document.querySelector("main").appendChild(FragmentForSec); // adding new section to the <main> tag
  const newLi = document.createElement("li");
  newLi.classList.add("navbar__menu");
  newLi.setAttribute("data-nav", `Section ${x + 1}`);
  const newLink = document.createElement("a");
  newLink.classList.add("menu__link");
  newLink.setAttribute("href", `${SectionTi}`);
  newLink.innerHTML = `Section ${x + 1}`;
  newLi.addEventListener("click", (evt) => {
    evt.preventDefault();
    newSection.scrollIntoView({
      behavior: "smooth",
    });
  });
  newLi.appendChild(newLink);
  FragmentForLi.appendChild(newLi);
  ul.appendChild(FragmentForLi);
  //add active class to the new section and nav bar when it is on view port
  window.addEventListener("scroll", () => {
    const sectionTopNew = newSection.getBoundingClientRect().top;
    if (sectionTopNew >= 0 && sectionTopNew < 250) {
      newSection.classList.add("active_section");
      const sectionData = newSection.getAttribute("data-nav");
      const listData = newLi.getAttribute("data-nav");
      if (listData === sectionData) {
        newLi.classList.add("active_section");
        document.querySelectorAll("li")[3].classList.remove("active_section");
        document.querySelectorAll("li")[0].classList.remove("active_section");
      }
    } else {
      newSection.classList.remove("active_section");
      newLi.classList.remove("active_section");
    }
  });
  x++;
});
ul.appendChild(FragmentForLi);

// Scroll to section on link click

// Set sections as active

window.addEventListener("scroll", () => {
  const listItems = document.querySelectorAll("li");
  sections.forEach((section) => {
    listItems.forEach((exe) => {
      const sectionTop = section.getBoundingClientRect().top;
      const dataList = exe.getAttribute("data-nav");
      const dataSection = section.getAttribute("data-nav");
      if (sectionTop >= 0 && sectionTop <= 250) {
        section.classList.add("active_section");
        if (dataList === dataSection) {
          exe.classList.add("active_section");
        } else if (dataList !== dataSection) {
          exe.classList.remove("active_section");
        }
      } else {
        section.classList.remove("active_section");
      }
    });
  });
});
//responsive nav bar
// add click event to add and remove active class
const Nav = document.querySelector("ul");
const ham = document.querySelector(".ham");
ham.addEventListener("click", () => {
  Nav.classList.toggle("active");
  ham.classList.toggle("active");
});
