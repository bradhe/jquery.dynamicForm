(function($) {
  function PagedDialog(elem, options) {
    // Create a local copy of the elem to prevent crappy memory issues.
    var elem = elem;
    
    var settings = {
      pageSelector: null,
      dialogOptions: null
    };
    
    if(options) {
      $.extend(settings, options);
    }
    
    d = {};
    var pages = [];
    var currentPage = -1;
    
    function showPageByNumber(pageNumber) {
      if(pageNumber == currentPage) {
        return;
      }
      
      // Do some bounds checking too, make sure we're not doing anything funky.
      if(pageNumber < 0) {
        throw "Page number must be greater than or equal to 0.";
      }
      else if(pageNumber >= pages.length) {
        throw "Cannot navigate to page " + pageNumber + ". Number of pages in collection: " + pages.length;
      }
      
      $(pages[currentPage]).hide();
      currentPage = pageNumber;
      $(pages[currentPage]).show();
      
      // If the current page is now the last page or the first page disable the prev or next button.
      if(d.prevButton && currentPage == 0) {
        d.prevButton.attr('disabled', true);
      }
      else if(d.prevButton && d.prevButton.is(':disabled')) {
        d.prevButton.removeAttr('disabled');
      }
      
      if(d.nextButton && currentPage >= pages.length-1) {
        d.nextButton.attr('disabled', true);
      }
      else if(d.nextButton && d.nextButton.is(':disabled')) {
        d.nextButton.removeAttr('disabled');
      }
    }
    
    function init() {       
      if(settings.pageSelector) {
        pages = $(elem).find(settings.pageSelector);
      }
      
      // If there are still no pages then we have a fucking problem.
      if(pages.length < 1) {
        throw "No pages found you dumbass!";
      }
      
      currentPage = 0;
      
      // Okay, we want to remove everything from the elem except the first page.
      var hidden = pages.slice(1);
      var l = hidden.length;
      
      for(var i = 0; i < l; i++) {
        $(hidden[i]).hide();
      }
      
      var div = $('<div/>').addClass('ui-paged-dialog');
      div.append(elem);
      
      // We need to create page buttons for all this.
      var pageButtonsDiv = $('<div/>').addClass('buttons');
      for(var i = 0; i < pages.length; i++) {
        var a = $('<a/>').text(i+1).attr('href', 'javascript:void(0);').data('page_number', i);
        a.click(function(e) { return d.onPageNumberClicked(e, $(this).data('page_number')); });
        
        pageButtonsDiv.append(a);
      }
      
      div.append(pageButtonsDiv);
      
      // We need to add NEXT and PREV buttons as well.
      var nextButton = $('<button/>').attr('type', 'button').text('Next');
      var prevButton = $('<button/>').attr('type', 'button').text('Prev');
      nextButton.click(function(e) { return d.onNextClicked(e) });
      prevButton.click(function(e) { return d.onPrevClicked(e) });
      
      // By default the previous button should be hidden.
      prevButton.attr('disabled', true);
      
      pageButtonsDiv.prepend(prevButton);
      pageButtonsDiv.append(nextButton);
      
      // Save this crap for later.
      d.nextButton = nextButton;
      d.prevButton = prevButton;
      
      // Show the dialog now.
      $(div).dialog(settings.dialogOptions);
    }
    
    d.onNextClicked = function(e) {
      showPageByNumber(currentPage + 1);
    };
    
    d.onPrevClicked = function(e) {
      showPageByNumber(currentPage - 1);
    };
    
    d.onPageNumberClicked = function(e, pageNumber) {
      showPageByNumber(pageNumber);
      return false;
    };
    
    init();

    return d;
  }
  
  $.fn.pagedDialog = function(options) {
    var dialogs = [];
    
    this.each(function(i) {
      dialogs.push(new PagedDialog(this, options));
    });
    
    return dialogs;
  };
}(jQuery));
