$(function() {

    $(document.body).on('click', '.list-item', function(event) {

        event.preventDefault();

        var id = $(this).data('id');

        chrome.bookmarks.getChildren(id.toString(), function(bookmarks) {

            var urls = [];

            bookmarks.forEach(function(child) {
                if(child.url) {
                    urls.push(child.url);
                }
            });

            stepThroughBookmarks(urls, 0);

        });

    });

    chrome.bookmarks.getTree(function(bookmarks) {

        var list = document.getElementById('bookmark-folders');

        list.innerHTML = printList(bookmarks[0].children);

    });

});

function stepThroughBookmarks(urls, index) {

    if(index < urls.length) {
        loadTab(urls[index]).then(function() {
            stepThroughBookmarks(urls, index+1);
        });
    }

}

function loadTab(url) {

    var deferred = Q.defer();

    chrome.tabs.create({ url: url, active: false }, function(tab) {

        chrome.tabs.onUpdated.addListener(function(tabId, info) {
            if(info.status == 'complete' && tabId == tab.id) {
                chrome.tabs.remove(tabId, function() {
                    deferred.resolve();
                });
            }
        });

    });

    return deferred.promise;
}

function printList(bookmarks) {

    var html = '<ul>';

    bookmarks.forEach(function(bookmark) {

        if(bookmark.children) {

            html += '<li><a href="#" class="list-item" data-id="'+ bookmark.id +'">';

            html += bookmark.title;

            html += printList(bookmark.children);

            html += '</a></li>';

        }

    });

    html += '</ul>';

    return html;

}
