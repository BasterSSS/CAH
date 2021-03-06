added_decks = [];
min_amount_white_cards = $('#min_amount_white_cards');
white_cards_span = $('#white_cards');
min_amount_black_cards = $('#min_amount_black_cards');
black_cards_span = $('#black_cards');
current_white_cards = $('#current_white_cards');
button = $('#form');
hl = $('#hl').text();
points = $('#round_limit_input');
players = $('#max_players_input');
current_black_cards = $('#current_black_cards');
$(document).ready(function(){
    min_amount_white_cards.html();
    var black_cards_res = players.val() * points.val() - players.val() + 1;
    var white_cards_res = players.val() * 12 + 10;
    min_amount_white_cards.html(white_cards_res);
    min_amount_black_cards.html(black_cards_res);
    
});
$('#form').click(function(event){
    $(this).css('pointer-events', 'none');
    event.preventDefault();
    let points_val = points.val();
    var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() <= 9].filter(Boolean).length==3;
    let players_val = players.val();
    let added_decks_json = JSON.stringify(added_decks);
    let lobby_password = $('#lobby_password_input').val();
    let lobby_title = $('#lobby_title_input').val();
    let afk_time = $('#afk_time_input').val();
    let black_cards_res = players_val * points_val - players_val + 1;
    let white_cards_res = players_val * 12 + 10;
    if(flag && parseInt(min_amount_black_cards.text()) >= black_cards_res && parseInt(min_amount_white_cards.text()) >= white_cards_res){
        $.ajax({
            type: 'post',
            data: {points:points_val, players:players_val, array:added_decks_json, password:lobby_password, title:lobby_title, afk_time:afk_time},
            url: '../phpscripts/create_new_lobby.php',
            success: function(res){
                if(res=="2"){
                    if(hl=="pl") alert("To konto jest już w innym lobby.")
                    if(hl=="en") alert("This account is already in another lobby.")
                    window.location.replace="/Home";
                }
                else if(res!="0"){
                    window.location.replace('/Game='+res);
                    // window.location.replace('/Game='+res);
                }
                
            }
        })
    }
    else{
        window.location.reload();
        alert('Unexpected error, please try again');
    }
    
    
});
$('.add_my_deck_btn').click(function() {
    var added_decks_list = $('#added_decks_list');
    var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() <= 9].filter(Boolean).length==3;
    var deck_id =  $(this).parents().eq(1).siblings().children(".deck_id").text();
    var title =  $(this).parents().eq(1).siblings().children(".deck_title").text();
    var white_cards = $(this).parents().eq(1).siblings().children(".white_cards").text();
    var black_cards = $(this).parents().eq(1).siblings().children(".black_cards").text();

    for(var i =0; i<added_decks.length; i++){   
        if (deck_id == added_decks[i]) return 0;
    }
    added_decks.push(deck_id);
    $(this).css({'pointer-events': 'none', 'opacity': '60%'});   
    added_decks_list.children('#child').css('display', 'none');
    $('#added_decks_table').append(`<tr><td class = "deck_id">${deck_id}</td><td class = "deck_title">${title}</td><td class = "white_cards">${white_cards}</td><td class = "black_cards">${black_cards}</td><td><div id ="delete_added_deck_btn">x</div></td></tr>`);
    var current_black_cards_int = parseInt(current_black_cards.text());
    var current_black_cards_res = parseInt(black_cards) + current_black_cards_int;
    current_black_cards.html(current_black_cards_res);
    var current_white_cards_int = parseInt(current_white_cards.text());
    var current_white_cards_res = parseInt(white_cards) + current_white_cards_int;
    current_white_cards.html(current_white_cards_res);
    if(parseInt(min_amount_white_cards.text()) <= current_white_cards_res) {
        white_cards_span.css('color','green');
    }  
    if(parseInt(min_amount_black_cards.text()) <= current_black_cards_res) {
        black_cards_span.css('color','green');
    } 
    if(!button.is(':disabled')){
        if(!flag || parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
            button.prop('disabled',true);
        }
    }
    if(button.is(':disabled') && flag){
        if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text()) && parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())){
            button.prop('disabled',false);
        }
    }
});
$(document).on('click', '#delete_added_deck_btn', function(){
    var added_decks_list = $('#added_decks_list');
    var deck_id = $(this).parent().siblings('.deck_id').text();
    var white_cards = $(this).parent().siblings('.white_cards').text();
    var black_cards = $(this).parent().siblings('.black_cards').text();
    if($(this).parents().eq(1).siblings().length == 1){
        added_decks_list.children('#child').css('display', '')
    }
    added_decks = $.grep(added_decks, function(value) {
        return value != deck_id;
    });
    deck_button  = $('#'+deck_id);
    if(deck_button.length){
        deck_button.css({'pointer-events':'', 'opacity': '100%'});
    }
    $(this).parents().eq(1).remove();
    var current_black_cards_int = parseInt(current_black_cards.text());
    var current_white_cards_int = parseInt(current_white_cards.text());
    var current_black_cards_res =current_black_cards_int - parseInt(black_cards);
    var current_white_cards_res = current_white_cards_int - parseInt(white_cards);
    current_white_cards.html(current_white_cards_res);
    current_black_cards.html(current_black_cards_res);
    if(parseInt(min_amount_white_cards.text()) > current_white_cards_res) {
        white_cards_span.css('color','red');
    }  
    if(parseInt(min_amount_black_cards.text()) > current_black_cards_res) {
        black_cards_span.css('color','red');
    }
    if(!button.is(':disabled')){
        if(parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
            button.prop('disabled',true);
        }
    }
});
$('#max_players_input').change(function(){
    if(players.val() < 3) players.val(3);
    if(players.val() > 9) players.val(9);
    var black_cards_res = players.val() * points.val() - players.val() + 1;
    var white_cards_res = players.val() * 12 + 10;
    min_amount_black_cards.html(black_cards_res);
    var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() <= 9].filter(Boolean).length==3;
    min_amount_white_cards.html(white_cards_res);
    if(!button.is(':disabled')){
        if(!flag || parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
            button.prop('disabled',true);
        }
    }
    if(button.is(':disabled') && flag){
        if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text()) && parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())){
            button.prop('disabled',false);
        }
    }
    if(parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())) {
        white_cards_span.css('color','red');
    }  
    if(parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text())) {
        black_cards_span.css('color','red');
    }  
    if(parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())) {
        white_cards_span.css('color','green');
    }  
    if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text())) {
        black_cards_span.css('color','green');
    }  
});
points.change(function(){
    if(points.val() < 3) points.val(3);
    if(points.val()>999) points.val(999);
    var black_cards_res = players.val() * points.val() - players.val() + 1;
    var white_cards_res = players.val() * 12 + 10;
    min_amount_black_cards.html(black_cards_res);
    var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() < 9  ].filter(Boolean).length==3;
    min_amount_white_cards.html(white_cards_res);
    if(!button.is(':disabled')){
        if(!flag || parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
            button.prop('disabled',true);
        }
    }
    if(button.is(':disabled') && flag){
        if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text()) && parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())){
            button.prop('disabled',false);
        }
    }
    if(parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())) {
        white_cards_span.css('color','red');
    }  
    if(parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text())) {
        black_cards_span.css('color','red');
    }  
    if(parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())) {
        white_cards_span.css('color','green');
    }  
    if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text())) {
        black_cards_span.css('color','green');
    }     
});
$('#lobby_title_input').change(function(){
    var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() <= 9].filter(Boolean).length==3;
    if(!button.is(':disabled')){
        if(!flag || parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
            button.prop('disabled',true);
        }
    }
    if(button.is(':disabled') && flag){
        if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text()) && parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())){
            button.prop('disabled',false);
        }
    }
});
$('#add_decks_btn').click(function(){
    var input = $("#add_decks_input");
    if(input.val().length == 7){  
        $(this).css('pointer-events', 'none');
        setTimeout(function(){
            $('#add_decks_btn').css('pointer-events', '');
        }, 3000);  
        $.ajax({
            type: 'post',
            data: {code:input.val()},
            async: false,
            url: '../phpscripts/add_deck_to_lobby.php',
            success: function(res){
                array = $.parseJSON(res);
            }
        });
        if(array=="2" || array =="0"){
            input.val('');
            return 0;
        }
        var added_decks_list = $('#added_decks_list');
        var flag = [$('#lobby_title_input').val().length != 0, points.val()>=3, players.val()>=3 && players.val() <= 9 ].filter(Boolean).length==3;
        var deck_id =  array['deck_id'];
        var title =  array['title'];
        var white_cards = array['white_cards'];
        var black_cards = array['black_cards'];
        if(array['author']==1) $('#'+deck_id).css({'pointer-events': 'none', 'opacity': '60%'});
        input.val('');
        for(var i =0; i<added_decks.length; i++){   
            if (deck_id == added_decks[i]) return 0;
        }
        added_decks.push(deck_id);
        added_decks_list.children('#child').css('display', 'none');
        $('#added_decks_table').append(`<tr><td class = "deck_id">${deck_id}</td><td class = "deck_title">${title}</td><td class = "white_cards">${white_cards}</td><td class = "black_cards">${black_cards}</td><td><div id ="delete_added_deck_btn">x</div></td></tr>`);
        var current_black_cards_int = parseInt(current_black_cards.text());
        var current_black_cards_res = parseInt(black_cards) + current_black_cards_int;
        current_black_cards.html(current_black_cards_res);
        var current_white_cards_int = parseInt(current_white_cards.text());
        var current_white_cards_res = parseInt(white_cards) + current_white_cards_int;
        current_white_cards.html(current_white_cards_res);
        if(parseInt(min_amount_white_cards.text()) <= current_white_cards_res) {
            white_cards_span.css('color','green');
        }  
        if(parseInt(min_amount_black_cards.text()) <= current_black_cards_res) {
            black_cards_span.css('color','green');
        } 
        if(!button.is(':disabled')){
            if(!flag || parseInt(min_amount_black_cards.text()) > parseInt(current_black_cards.text()) || parseInt(min_amount_white_cards.text()) > parseInt(current_white_cards.text())){
                button.prop('disabled',true);
            }
        }
        if(button.is(':disabled') && flag){
            if(parseInt(min_amount_black_cards.text()) <= parseInt(current_black_cards.text()) && parseInt(min_amount_white_cards.text()) <= parseInt(current_white_cards.text())){
                button.prop('disabled',false);
            }
        }
    }
});
$('#afk_time_input').change(function(){
    if($(this).val()>999) $(this).val(999);
    if($(this).val()<5) $(this).val(5);
});