$('.scroll-accordion').scrollAccordion({
  // htmlContainer: $('.table-wrapper'), // scrolling with a custom container works only if the container has scrolling content
  // animationSpeed: 600,
  // scrollToSelection: false,
  // scrollGap: 100,
  // multiExpanded: true,
  // active: 1,
  expandAllSource: $('#expandCollapse-CJ'),
  // initialAllExpanded: true,
  expandAllBtnContent: [
    {
      tags: ['i', 'span'],
      classNames: ['icon-xs icon-eye-purple mr-sm', ''],
      texts: ['', 'Expand All']
    },
    {
      tags: ['i', 'span'],
      classNames: ['icon-xs icon-eye-off-purple mr-sm', ''],
      texts: ['', 'Collapse All']
    }
  ]
});