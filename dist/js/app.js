document.addEventListener("load", function() {
    document.forms[0].addEventListener("submit", function(e) {
        e.preventDefault();
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                "author": document.forms[0].children.name.value,
                "content": document.forms[0].children.content.value
            }
        }).then(function(response) {
            console.log("Submitted");
        });
    });
});

$('#mobile_active_close').on('click', function(){
    $('#mobile_book_menu_main').fadeOut();
    $('#control_panel').fadeIn();
});
$('#mobile_book_menu').on('click', function(){
    $('#control_panel').fadeOut();
    $('#mobile_book_menu_main').css('display', 'block');
});
