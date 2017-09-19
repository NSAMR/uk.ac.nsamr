/*
 * UnderConstructionPage
 * Main backend JS
 * (c) Web factory Ltd, 2015 - 2017
 */


jQuery(document).ready(function($) {
  old_settings = $('#ucp_form *').not('.skip-save').serialize();

  // init tabs
  $('#ucp_tabs').tabs({
    activate: function(event, ui) {
        Cookies.set('ucp_tabs_selected', $('#ucp_tabs').tabs('option', 'active'), { expires: 180 });
    },
    active: $('#ucp_tabs').tabs({ active: Cookies.get('ucp_tabs_selected') })
  }).show();

  // init select2
  $('#whitelisted_users').select2({ 'placeholder': ucp.whitelisted_users_placeholder});

  // autosize textareas
  $.each($('textarea[data-autoresize]'), function() {
    var offset = this.offsetHeight - this.clientHeight;

    var resizeTextarea = function(el) {
        $(el).css('height', 'auto').css('height', el.scrollHeight + offset + 2);
    };
    $(this).on('keyup input click', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
  });

  // maybe init survey dialog
  $('#features-survey-dialog').dialog({'dialogClass': 'wp-dialog ucp-dialog ucp-survey-dialog',
                               'modal': 1,
                               'resizable': false,
                               'zIndex': 9999,
                               'width': 705,
                               'height': 'auto',
                               'show': 'fade',
                               'hide': 'fade',
                               'open': function(event, ui) { ucp_fix_dialog_close(event, ui); },
                               'close': function(event, ui) { },
                               'autoOpen': ucp.open_survey,
                               'closeOnEscape': true
                              });


  // turn questions into checkboxes
  $('.question-wrapper').on('click', function(e) {
    $('.question-wrapper').removeClass('selected');
    $(this).addClass('selected');

    e.preventDefault();
    return false;
  });


  // dismiss survey forever
  $('.dismiss-survey').on('click', function(e) {
    $('#features-survey-dialog').dialog('close');

    $.post(ajaxurl, { survey: $(this).data('survey'),
                      _ajax_nonce: ucp.nonce_dismiss_survey,
                      action: 'ucp_dismiss_survey'
    });

    e.preventDefault();
    return false;
  });


  // submit and hide survey
  $('.submit-survey').on('click', function(e) {
    if ($('.question-wrapper.selected').length != 1) {
      alert('Please choose your preferred autoresponder service.');
      return false;
    }

    answers = '';
    $('.question-wrapper.selected').each(function(i, el) {
      answers += $(el).data('value') + ',';
    });

    $.post(ajaxurl, { survey: $(this).data('survey'),
                      answers: answers,
                      emailme: $('#features-survey-dialog #emailme:checked').val(),
                      custom_answer: '',
                      _ajax_nonce: ucp.nonce_submit_survey,
                      action: 'ucp_submit_survey'
    });

    alert('Thank you for your time! We appriciate your input!');

    $('#features-survey-dialog').dialog('close');
    e.preventDefault();
    return false;
  });

  // send support message
  $('#ucp-send-support-message').on('click', function(e) {
    e.preventDefault();
    button = $(this);

    if ($('#support_email').val().length < 5 || $('#support_email').is(':invalid')) {
      alert('We need your email address, don\'t you think?');
      $('#support_email').select().focus();
      return false;
    }

    if ($('#support_message').val().length < 15) {
      alert('An empty message won\'t do anybody any good.');
      $('#support_message').select().focus();
      return false;
    }

    button.addClass('loading');
    $.post(ajaxurl, { support_email: $('#support_email').val(),
                      support_message: $('#support_message').val(),
                      support_info: $('#support_info:checked').val(),
                      _ajax_nonce: ucp.nonce_submit_support_message,
                      action: 'ucp_submit_support_message'},
    function(data) {
      if (data.success) {
        alert('Message sent! Our agents will get back to you ASAP.');
      } else {
        alert(data.message);
      }
    }).fail(function() {
      alert('Something is not right. Please reload the page and try again');
    }).always(function() {
      button.removeClass('loading');
    });

    return false;
  });

  // select theme via thumb
  $('.ucp-thumb').on('click', function(e) {
    e.preventDefault();

    theme_id = $(this).data('theme-id');
    $('.ucp-thumb').removeClass('active');
    $(this).addClass('active');
    $('#theme_id').val(theme_id);

    return false;
  });


  // init datepicker
  $('.datepicker').AnyTime_picker({ format: "%Y-%m-%d %H:%i", firstDOW: 1, earliest: new Date(), labelTitle: "Select the date &amp; time when construction mode will be disabled" } );


  // reset/clear datepicker
  $('.clear-datepicker').on('click', function(e) {
    e.preventDefault();

    $(this).prevAll('input.datepicker').val('');

    return false;
  });


  // fix when opening datepicker
  $('.show-datepicker').on('click', function(e) {
    e.preventDefault();

    $(this).prevAll('input.datepicker').focus();

    return false;
  });


  // warning if there are unsaved changes when previewing
  $('.settings_page_ucp .wrap').on('click', '#ucp_preview', function(e) {
    if ($('#ucp_form *').not('.skip-save').serialize() != old_settings) {
      if (!confirm('There are unsaved changes that will not be visible in the preview. Please save changes first.\nContinue?')) {
        e.preventDefault();
        return false;
      }
    }

    return true;
  });


  // show all social icons
  $('.settings_page_ucp .wrap').on('click', '#show-social-icons', function(e) {
    $(this).hide();
    $('#ucp-social-icons tr').removeClass('hidden');

    return false;
  });


  // helper for linking anchors in different tabs
  $('.settings_page_ucp .wrap').on('click', '.change_tab', function(e) {
    $('#ucp_tabs').tabs('option', 'active', $(this).data('tab'));

    // get the link anchor and scroll to it
    target = this.href.split('#')[1];
    if (target) {
      $.scrollTo('#' + target, 500, {offset: {top:-50, left:0}});
    }
  });
}); // on ready


function ucp_fix_dialog_close(event, ui) {
  jQuery('.ui-widget-overlay').bind('click', function(){
    jQuery('#' + event.target.id).dialog('close');
  });
} // ucp_fix_dialog_close
