(function(){
    function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        var csrftoken = getCookie('csrftoken');

        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });



    $(document).on('click', '.update-button', function(){
        $.ajax({
            url: '',
            method: 'post',
            success: function(data){
                alert("Ok");
            }
        });
    });
    var $tableContainer = $('.dashboard-wrapper');

    var createTop3Table = function(iter, total){
        var table = $('<table></table>').addClass("stats-table");
        var tableHeaders = $('<tr></tr>');
        var nicknameTh = $('<th></th>').text("Ник");
        var dataTh = $('<th></th>').text("Кол-во сообщений");
        tableHeaders.append(nicknameTh);
        tableHeaders.append(dataTh);
        table.append(tableHeaders);
        for(var i = 0; i < 10; i++){
            var tableContent = $("<tr></tr>");
            var nickname = iter[i][0];
            var row = $('<td></td>').text(nickname);
            tableContent.append(row);
            var data = iter[i][1];
            var procent = (data / total * 100).toFixed(2);
            var data_row = $('<td></td>').text(data + "(" + procent + "%)");
            tableContent.append(data_row);
            table.append(tableContent);
        }
        $tableContainer.append(table);
    };

    $(document).on('click', '.go-youtube', function(){
        var video = $(this).text();
         window.open("http://youtube.com/watch?v=" + video, "_target");
    });

    var createYoutubeTable = function(iter){
        var table = $('<table></table>').addClass("stats-table");
        var tableHeaders = $('<tr></tr>');
        var linkTh = $('<th></th>').text("Ссылка");
        var dataTh = $('<th></th>').text("Найдено");
        tableHeaders.append(linkTh);
        tableHeaders.append(dataTh);
        table.append(tableHeaders);
        for(var i = 0; i < 10; i++){
            var tableContent = $("<tr></tr>");
            var nickname = iter[i][0];
            var row = $('<td></td>').text(nickname).addClass("go-youtube");;
            tableContent.append(row);
            var data = iter[i][1];
            var data_row = $('<td></td>').text(data)
            tableContent.append(data_row);
            table.append(tableContent);
        }
        $tableContainer.append(table);
    };

    var createAbusiveTable = function(iter, total){
        var table = $('<table></table>').addClass("stats-table");
        var tableHeaders = $('<tr></tr>');
        var linkTh = $('<th></th>').text("Ник");
        var dataTh = $('<th></th>').text("Кол-во мата");
        tableHeaders.append(linkTh);
        tableHeaders.append(dataTh);
        table.append(tableHeaders);
        for(var i = 0; i < 10; i++){
            var tableContent = $("<tr></tr>");
            var nickname = iter[i][0];
            var row = $('<td></td>').text(nickname);
            tableContent.append(row);
            var data = iter[i][1];
            var procent = (data / total * 100).toFixed(2);
            var data_row = $('<td></td>').text(data + "(" + procent + "%)");
            tableContent.append(data_row);
            table.append(tableContent);
        }
        $tableContainer.append(table);
    };




    $.ajax({
        url: '/get-data/',
        method: 'post',
        success: function(data){
            draw(data);
            createTop3Table(JSON.parse(data.top), data.total);
            createYoutubeTable(JSON.parse(data.common_videos));
            createAbusiveTable(JSON.parse(data.abusive), data.total);
        }

    });
})();