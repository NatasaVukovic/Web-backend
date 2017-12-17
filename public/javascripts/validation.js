$('#addReview').submit(function (e) {
    $('.alert.alert-danger').hide();
   /* if(!$('input#name').val() && !$('select#rating').val() && !$('textarea#review').val()) {
        if ($('.alert.alert-danger').length) {
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger" > All fields required, please try again</div>');
        }
        return false;
    }
    if(!$('input#name').val()){
        if($('.alert.alert-danger').length){
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger" > Name field is empty.</div>');
        }
        return false;
    } else if(!$('select#rating').val()){
        if($('.alert.alert-danger').length){
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger" > Rating field is empty</div>');
        }
        return false;
    } else if(!$('textarea#review').val()){
        if($('.alert.alert-danger').length){
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger" > Review field is empty</div>');
        }
        return false;
    }*/
    if(!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()){
        if($('.alert.alert-danger').length){
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger" > All fields required, please try again</div>');
        }
        return false;
    }

})