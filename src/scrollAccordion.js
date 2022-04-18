/*!
 * scrollAccordion v2.0.0
 * A simple accordion for annoyingly long content
 * https://github.com/Vigorski/scrollAccordion
 * MIT License
 * by Igor Veleski
 */

'use strict';

(function ($) {
	const v = {
		isDefined: function(value) {
			return value !== null && value !== undefined;
		},
		isNumber: function(value){
			return typeof value === 'number' && !isNaN(value);
		},
		isString: function(value) {
			return typeof value === 'string' || value instanceof String;
		},
		isBoolean: function(value){
			return typeof value === 'boolean';
		},
		isObject: function(obj){
			return obj === Object(obj);
		},
		isJqueryElement: function(ele) {
			return typeof ele !== 'undefined' && ele instanceof jQuery;
		},
		isDomElement: function(ele) {
			if (!ele) {
				return false;
			}

			if (
				ele instanceof Node ||
				ele instanceof NodeList ||
				ele instanceof HTMLCollection
			) {
				return true;
			}

			if (v.isObject(document) && ele === document) {
				return true;
			}
		},
		isScriptTag: function(ele) {
			if (ele instanceof HTMLScriptElement) {
				return true;
			}
		},
		isEmpty: function(value) {
			// Null and undefined are empty
			if (!v.isDefined(value)) {
				return true;
			}

			// Using the length property for arrays
			if (Array.isArray(value)) {
				return value.length === 0;
			}
			
			// Not empty if DOM Node
			if (value instanceof Node) {
				return false;
			}

			// Not empty if jQuery object or DOM Element
			if (v.isJqueryElement(value) || v.isDomElement(value)){
				for (const attr of value) {
					return false;
				}
				return true
			}
			
			// Not empty if there is at least one property
			if (v.isObject(value)) {
				for (const attr in value) {
					return false;
				}
				return true;
			}

			return false;
		}
	}

	$.fn.scrollAccordion = function (options = {}) {
		const T_ACCORDION_ACTIVE = "scroll-accordion--active";
		const T_ACCORDION_HEADER = ".scroll-accordion-header-wrapper";
		const T_ACCORDION_HEADER_INNER = ".scroll-accordion-header";
		const T_ACCORDION_BODY = ".scroll-accordion-body-wrapper";
		const T_ACCORDION_BODY_INNER = ".scroll-accordion-body";
		
		const isValid = {
			htmlContainer: false,
			animationSpeed: false,
			scrollToSelection: false,
			scrollGap: false,
			multiExpanded: false,
			expandAllSource: false,
			initialAllExpanded: false,
			expandAllBtnContent: false,
			active: false,
		};

		_validateOptions();

		const setup = {
			accordionHeaders: [],
			activeAccordionItem: null,
			activeAccordionItemPosition: null,
			activeAccordionItemContentHeight: null,
			activeAccordionItemHeaderHeight: null,
			queuedAccordionItemPosition: null,
			scrollToTargetPosition: null,
		};
		
		// VALIDATED OPTIONS
		const accordionOptions = {
			htmlContainer: isValid.htmlContainer ? options.htmlContainer : $("body, html"),
			animationSpeed: isValid.animationSpeed ? options.animationSpeed : 300,
			scrollToSelection: isValid.scrollToSelection ? options.scrollToSelection : true,
			scrollGap: isValid.scrollGap ? options.scrollGap : 10,
			multiExpanded: isValid.multiExpanded ? options.multiExpanded : false,
			expandAllSource: null,
			initialAllExpanded: isValid.initialAllExpanded ? options.initialAllExpanded : false,
			expandAllBtnContent: null,
			active: null,
		};

		_init(this);

		/////////////////////////////////////
		// ACCORDION VALIDATION
		/////////////////////////////////////

		function _validateOptions(_this) {
			// htmlContainer, expandAllSource
			const DOMElementOptions = ['htmlContainer', 'expandAllSource'];
			for(const option of DOMElementOptions) {
				if ( !v.isEmpty(options[option]) ) {
					if (
						!v.isScriptTag(options[option]) &&
						(v.isJqueryElement(options[option]) || v.isDomElement(options[option]) )
					){
						isValid[option] = true;
					} else {
						throw (new Error(
							`Invalid argument '${option}'`,
							{cause: `Function argument '${option}' must be a valid DOM element!`}
						))
					}
				}
			}
			
			// animationSpeed, scrollGap, active
			const numberOptions = ['animationSpeed', 'scrollGap', 'active'];
			for(const option of numberOptions) {
				if ( !v.isEmpty(options[option]) ) {
					if ( v.isNumber(options[option]) && options[option] > 0 ) {
						isValid[option] = true;
					} else {
						throw (new Error(
							`Invalid argument '${option}'`,
							{cause: `Function argument '${option}' must be a valid greater than zero number!`}
						))
					}
				}
			}

			// scrollToSelection, multiExpanded, initialAllExpanded
			const booleanOptions = ['scrollToSelection', 'multiExpanded', 'initialAllExpanded'];
			for(const option of booleanOptions) {
				if ( !v.isEmpty(options[option]) ) {
					if ( v.isBoolean(options[option]) ) {
						isValid[option] = true;
					} else {
						throw (new Error(
							`Invalid argument '${option}'`,
							{cause: `Function argument '${option}' must be a boolean value!`}
						))
					}
				}
			}

			// expandAllBtnContent
			if (!v.isEmpty(options.expandAllBtnContent)) {
				// first check: is array and has exactly 2 items
				if( Array.isArray(options.expandAllBtnContent) && options.expandAllBtnContent.length === 2 ) {
					options.expandAllBtnContent.forEach((item) => {
						// no script tags allowed
						for(let i = 0; i < item.tags.length; i++) {
							if (item.tags[i] === 'script') {
								throw(new Error(
									`Unpermitted node 'script'`,
									{cause: 'Script tags are not allowed!'}
								));
							}
							if (!v.isString(item.tags[i])){
								throw(new Error(
									`Invalid argument value 'expandAllBtnContent[].tags'`,
									{cause: `'tags' property must be a string, albeit empty`}
								));
							}
						}
						
						// next check: all array items inside the object must have the same length
						// structure must be an array with 2 objects which have three keys with arrays as value
						// i.e: [Array] >> 2x {object} >> key: [Array]
						// comparing each array against the first one (which is required)
						if (Object.values(item).every(currentValue => currentValue.length === item.tags.length)){
							isValid.expandAllBtnContent = true;
						} else {
							throw(new Error(
								`Invalid argument 'expandAllBtnContent'`,
								{cause: 'Object properties for expand button must be arrays all of which must have the exact same number of items'}
							));
						}
					});
				} else {
					throw (new Error(
						`Invalid argument 'expandAllBtnContent'`,
						{cause: `Function argument 'expandAllBtnContent' must be an array!`}
					))
				}
			}
		}

		/////////////////////////////////////
		// END OF ACCORDION VALIDATION
		/////////////////////////////////////

		/////////////////////////////////////
		// ACCORDION INITIALIZATION
		/////////////////////////////////////

		function setHeaderAndBody (_this) {
			// wrap immediate header and body of accordion item with another div
			// to prevent margin leaking and wrong expand/collapse animations
			const wrappedHeaders = _this.map(function(i, accordion){
				const firstHeaderChild = $(accordion).children('li').children(T_ACCORDION_HEADER_INNER);
				const firstBodyChild = $(accordion).children('li').children(T_ACCORDION_BODY_INNER);
				
				if (firstBodyChild.length) {
					firstBodyChild.wrap('<div class="scroll-accordion-body-wrapper"/>').parent().css({display: 'none'});
				}
	
				if (firstHeaderChild.length) {
					const wrapHeader = firstHeaderChild.wrap('<div class="scroll-accordion-header-wrapper"/>').parent();
					return [...wrapHeader];
				}
			});

			if (wrappedHeaders.length) {
				setup.accordionHeaders = wrappedHeaders;
			} else {
				throw (new Error(
					'Invalid accordion header elements',
					{cause: `Accordion must have at least one valid header DOM Element`}
				))
			}
		}

		function setBaseContainer() {
			// set a mandatory jQuery object of base or custom container
			if (isValid.htmlContainer) {
				accordionOptions.htmlContainer = v.isJqueryElement(accordionOptions.htmlContainer) ? accordionOptions.htmlContainer : $(accordionOptions.htmlContainer);
			}
		}

		function setActiveItem() {
			if(isValid.active && options.active < setup.accordionHeaders.length) {
				accordionOptions.active = options.active;
			}
		}

		function setExpandAllSource() {
			if (isValid.expandAllSource) {
				accordionOptions.expandAllSource = v.isJqueryElement(options.expandAllSource) ? options.expandAllSource : $(options.expandAllSource)
			}
		}

		function setExpandAllSwitch() {
			if (isValid.expandAllBtnContent) {
				accordionOptions.expandAllBtnContent = options.expandAllBtnContent.map((item) => {
					// construct the expand btn elements
					const currentSetOfBtnElements = [];

					for(let i = 0; i < item.tags.length; i++) {
						const eleTag = item.tags[i].trim();
						if (eleTag.length === 0) continue;
						const eleClass = v.isEmpty(item.classNames) ? '' : item.classNames[i].trim();
						const eleText = v.isEmpty(item.texts) ? '' : item.texts[i].trim();
						const ele = document.createElement(eleTag);

						if (eleClass.length) {
							ele.classList.add(...eleClass.split(' '));
						}
						
						if (eleText.length) {
							const eleTextNode = document.createTextNode(eleText)
							ele.appendChild(eleTextNode);
						}

						currentSetOfBtnElements.push(ele);
					}

					return $(currentSetOfBtnElements);
				});
			}
		}

		function _init(_this)  {
			setHeaderAndBody(_this);
			setBaseContainer();
			setActiveItem();
			setExpandAllSource();
			setExpandAllSwitch();
		}
		
		/////////////////////////////////////
		// END OF ACCORDION INITIALIZATION
		/////////////////////////////////////

		/////////////////////////////////////
		// ACCORDION CONTOLLERS
		/////////////////////////////////////

		function getItemOffset (_this) {
			const itemOffset = $(_this).offset().top;
			// if customContainer > only calculate the offset from parent, else > from top of screen
			if(isValid.htmlContainer) {
				const customHtmlContainerOffset = accordionOptions.htmlContainer.offset().top;
				const customHtmlContainerScroll = accordionOptions.htmlContainer[0].scrollTop;
				return ( itemOffset - customHtmlContainerOffset ) + customHtmlContainerScroll;
			}

			return itemOffset;
		}

		function getQueuedAccItemPosition(_this) {
			const clickedItemOffset = Math.floor( getItemOffset(_this) );
			setup.queuedAccordionItemPosition = clickedItemOffset - accordionOptions.scrollGap;
		}
		
		function getActiveAccItemPosition(_this) {
			if (accordionOptions.multiExpanded) return;

			setup.activeAccordionItem = $(_this).parent().parent().find(`.${T_ACCORDION_ACTIVE}`);
			
			if (setup.activeAccordionItem.length === 0) {
				setup.activeAccordionItemPosition = setup.queuedAccordionItemPosition;
				return;
			}
	
			const activeItemOffset = Math.floor( getItemOffset(setup.activeAccordionItem[0]) );
			setup.activeAccordionItemPosition = activeItemOffset - accordionOptions.scrollGap;
		}

		function getActiveAccItemHeight() {
			if (accordionOptions.multiExpanded) return;

			setup.activeAccordionItemHeaderHeight = Math.floor( setup.activeAccordionItem.children(T_ACCORDION_HEADER).outerHeight() );
			setup.activeAccordionItemContentHeight = Math.floor(
				setup.activeAccordionItem.outerHeight() - setup.activeAccordionItemHeaderHeight 
			);
		}

		function setScrollPosition() {
			if (!accordionOptions.scrollToSelection) return;

			// if clicked item is positioned after currently active item > 
			// remove the height of the active item
			// from the queued scrolling position so the scroll will be correct
			if (setup.queuedAccordionItemPosition > setup.activeAccordionItemPosition) {
				setup.scrollToTargetPosition = setup.queuedAccordionItemPosition - setup.activeAccordionItemContentHeight;
				return;
			}

			setup.scrollToTargetPosition = setup.queuedAccordionItemPosition;
		}

		function toggleAllAccordion() {
			accordionOptions.initialAllExpanded ? collapseAll(setup.accordionHeaders) : expandAll(setup.accordionHeaders);
			
			if(isValid.expandAllBtnContent) {
				accordionOptions.expandAllSource.html(accordionOptions.expandAllBtnContent[accordionOptions.initialAllExpanded ? 1 : 0]);
			}
		}

		function toggleAccordion($accHeader) {
			// remove active accordion item if not multi
			if (
				!accordionOptions.multiExpanded &&
				!v.isEmpty(setup.activeAccordionItem)
			) {
				const sameActiveItem = $accHeader.parent().hasClass(T_ACCORDION_ACTIVE);

				$accHeader
					.parent()
					.parent()
					.children(`.${T_ACCORDION_ACTIVE}`)
					.removeClass(T_ACCORDION_ACTIVE)
					.children(T_ACCORDION_BODY)
					.slideUp(accordionOptions.animationSpeed)

				// skip next step if clicking on already active item
				if (sameActiveItem) return;
			}

			// Toggle single/multi
			$accHeader
				.parent()
				.toggleClass(T_ACCORDION_ACTIVE)
				.children(T_ACCORDION_BODY)
				.slideToggle(accordionOptions.animationSpeed);
		}

		function scrollScreenToPosition() {
			// Set screen at top of opened item
			if (accordionOptions.scrollToSelection) {
				accordionOptions.htmlContainer.animate({
					scrollTop: setup.scrollToTargetPosition
				}, accordionOptions.animationSpeed);
			}
		}

		function collapseAll($accHeader) {
			accordionOptions.expandAllSource.removeClass('expanded-all');
			accordionOptions.initialAllExpanded = false;
			$accHeader
				.parent()
				.removeClass(T_ACCORDION_ACTIVE)
				.children(T_ACCORDION_BODY)
				.slideUp(accordionOptions.animationSpeed);
		}

		function expandAll($accHeader) {
			accordionOptions.expandAllSource.addClass('expanded-all');
			accordionOptions.initialAllExpanded = true;
			$accHeader
				.parent()
				.addClass(T_ACCORDION_ACTIVE)
				.children(T_ACCORDION_BODY)
				.slideDown(accordionOptions.animationSpeed);
		}

		/////////////////////////////////////
		// END OF ACCORDION CONTOLLERS
		/////////////////////////////////////
		
		/////////////////////////////////////
		// ACCORDION EVENTS AND SET INITIAL STATE
		/////////////////////////////////////

		setup.accordionHeaders.on("click", function () {
			// CALCULATE POSITION, PROPORTIONS AND OFFSETS
			getQueuedAccItemPosition(this)
			getActiveAccItemPosition(this);
			getActiveAccItemHeight();
			setScrollPosition();
			toggleAccordion($(this));
			scrollScreenToPosition();
		});

		if (isValid.expandAllSource) {
      accordionOptions.expandAllSource.on("click", function () {
        toggleAllAccordion();
      });
    }

		// Open acc item if active is valid
		if (accordionOptions.active !== null) {
			toggleAccordion($(setup.accordionHeaders[accordionOptions.active]));
			// reset active acc item from options
			accordionOptions.active = null;
		}

		if (accordionOptions.initialAllExpanded) {
			expandAll($(setup.accordionHeaders));
		}

		/////////////////////////////////////
		// END OF ACCORDION EVENTS AND SET INITIAL STATE
		/////////////////////////////////////

		return this;
	}
}(jQuery));