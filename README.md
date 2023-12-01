# scrollAccordion 2.0.0

scrollAccordion is a very simple JavaScript plug-in intended to handle annoyingly long content in a more pleasant and user friendly manner.

If your website has a collection of items with very long content, instead of landing in the middle of the newly expanded item and losing track of your position, scrollAccordion will, you guessed it, scroll to the very beginning of each expanded item.

Each call of scrollAccordion creates a separate instance and will work independently of other instances. So, you could set up multiple accordions with their own content, options and toggle buttons and they will not interfere with each other.

<br>

### CDN
If you don't want to download it, you can use my shabby CDNs:
- https://vigorski.github.io/scrollAccordion/scrollAccordion.js
- https://vigorski.github.io/scrollAccordion/scrollAccordion.min.js


### Setup
Using scrollAccordion is very easy.

1. Use CDN or download the regular or minimal version of the plugin and place the file right before the closing body tag.
    ```html
    ...
    <script src="https://vigorski.github.io/scrollAccordion/scrollAccordion.js"></script>
    </body>
    ```
2. Set up the structure. While not too restricted, it still needs to follow some rules. This is the bare minimum necessary for the plugin to work:

    ```html
    <ul class="scroll-accordion">
      <li>
        <div class="scroll-accordion-header">...</div>
        <div class="scroll-accordion-body">...</div>
      </li>
      ...
    </ul>
    ```

    The 'scroll-accordion' class is used only for naming continuity, but is otherwise optional.

    In terms of style, it is not necessary to include anything for the plugin to work, but I recommend you include this one line in order to avoid the jumping of elements during load times while they are being hidden:

    ```css
    .scroll-accordion-body-wrapper { display: none; }
    ```

3. Select the element whos children will be converted into an accordion:
    ```js
    $('.scroll-accordion').scrollAccordion({options});
    ```
4. Sit back and relax.

<br>

### Settings
You can change the behaviour of the accordion with the following optional properties:

Option | Type | Default | Description
------ | ---- | ------- | -----------
htmlContainer | DOM Element | 'html, body' | Select custom container for the accordion. Useful for small overflowing containers where you want the scrolling to be bound to the custom element instead of the body of the document (Always returns a jQuery object).
animationSpeed | number | 300 | Set speed of animation in ms. (Enter 0 if you don't want it animated).
scrollToSelection | boolean | true | Toggle option to follow and scroll to the top of expanded/collapsed item or remain stationary.
scrollGap | number | 10 | Set distance between top border of window and top border of clicked accordion item.
multiExpanded | boolean | false | Toggle expanding multiple items
initialAllExpanded | boolean | false | Toggle whether to load page with all accordion items expanded or not.
expandAllSource | DOM Element | null | Select button switch used to expand/collapse all accordion items from a particular instance.
expandAllBtnContent | Array | null | Set the two states that the 'expandAllSource' target will toggle between. For security reasons, it is not allowed to include a DOM Element. The valid data to be provided is the following: Array of two objects. Each object must have at least a 'tags' property and an optional 'classNames' and 'texts' properties. The value of these properties must be an array with same length as the others. If a property does not need a value in a specific array spot, simply provide an empty string. See demo for a demonstration of this property.
active | number | null | Specify to have an expanded item on page load (starts from 0).

---

<br>

#### Check out the demo:
[https://codepen.io/Vigorski/pen/Pozvgqy](https://codepen.io/Vigorski/pen/Pozvgqy)

<br>

#### Dependencies

jQuery 3.4

<br>


---
#### Author: Igor Veleski

---

#### RC/2.0.0 
##### (Released 17.04.22)


## TODO:
- Put multiple opened items on load
- Add custom classes to header & body
- Add methods (if any changes to existing accordion):
	- destroy
	- instantiate
	- refresh
- Change name of showMultiple
- Add events: 
	- beforeOpen
	- beforeClose
	- onOpen
	- onClose