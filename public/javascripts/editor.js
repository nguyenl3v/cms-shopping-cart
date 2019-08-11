(function(){
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }
})();
if($('[data-fancybox]').length){
    $('[data-fancybox]').fancybox();
}
