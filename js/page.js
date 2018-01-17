  $("#small-nav-dropdown").change(function() {
    window.location = $(this).find("option:selected").val();
  });  