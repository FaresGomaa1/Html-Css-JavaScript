# Landing Page Project

## Table of Contents

- [Instructions](#instructions)

## Instructions

The starter project has some HTML and CSS styling to display a static version of the Landing Page project. You'll need to convert this project from a static project to an interactive one. This will require modifying the HTML and CSS files, but primarily the JavaScript file.

To get started, open `js/app.js` and start building out the app's functionality

For specific, detailed instructions, look at the project instructions in the Udacity Classroom.

## Project descritpion

The project is one page divided into 4 sections, nav bar and header

## author

Fares Abdelsttar Selim Sloma

## Tchnology of the project

the project has three tchnology

### html

It is the foundations of the page
I added in Html the sections 4
I added class to the pargraph to be able access them in the JavaScript file

### css

It is the decoration of the page
I added two new class
first called 'active' and it gives color to the background of the section in the viewport
second called 'active-link' and it gives color to the background of the section in the navbar when this section is in the viewport
I also added a button and i gave some styles from web w3school and here is the link https://www.w3schools.com/css/css3_buttons.asp
I made a responsive nav bar list with media query
I added active class to a div to disply nav bar once the div is clicked
I used some syles from w3school web to make the menu icon

### JavaScript

It makes the page interact with the user
I created <li> tags and <a> according to the number of sections in the page and i added classes to each tag
to improve the performance of the page I added all <li> tags to one fragment
so the it like i added one item the DOM tree after it is created and that it more better than i add more than one item to the DOM tree
I made the 'acive' class and the 'active-link' been added dynamically to the section and link are in the viewport and dynamically removed after those are no longer in the viewport
I added a button to create new sections and dynamically add these new sections to nav bar
I used JavaScript to add active class dynamically to a div element I created once it clicked
I added active class by toggle() method to dynamically to add and remove active class by clicking

#### What is new

I made the highlight on small devices is generated from the active rule.
I made the hamburger responsive nav bar a little transparent (translucent)
I made a margin for the nav bar on devices with max-width 280px to make the menu icon accessible

<!-- Finally, it my original work
I have no idea about the code you are comparing to mine
And to me, I see the two codes are different
Perhaps there are some stuffs in common
Like declaring variables, like “can’t I select html tags as someone else has already selected”!!
So, you have to give me different html tags or at least let me create my own html
And for making list items, I used the “forEach” method and the code is being compared to mine used “for of” method
And for the scroll method:
I used the scrollIntoView () method as it is mentioned in the project rubric and it is the one has been taught to me in the webinar project walk through
And I changed the way for setting class for <a> tag
And I added a button (creating new section) to prove that is my original work and I can make changes in it anytime I want
So here is my final product
I just want to let you know
It is all mine
If there is any code has somethings in common with mine, it is only by coincidence
I swear, it is my first time to see the code is being compared to mine
So how come I quotes from it!! -->
